import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { MakerCrawler } from "./maker-crawl.ts";
import { listedCards, listedItems, pickItems, productIdOf } from "../lib/category-list.ts";

/**
 * 新しいカテゴリの商品一覧を、楽天のカテゴリのページから作る（API を使わない。2026-09-26）。
 *
 * 楽天の API はアプリ登録にアプリの URL と「許可するWebサイト」が要り、オーナーはドメインを取ってから申請したい。
 * それまでは、公開されているカテゴリのページ（www.rakuten.co.jp/category/<ジャンル>/）を読む。
 * - robots.txt に従う（並べ替えの ?s= は読まない。ranking.rakuten.co.jp は robots.txt が 403 なので使わない）
 * - ホストごとに3秒あける・403 で止める（maker-crawl.ts）
 * - レビュー30件以上・比べる単位になる商品を、レビューの多い順に20まで（lib/category-list.ts）
 * - カードにあるレビューのページの番号（店_商品）も持つので、レビューを読むときに商品ページを開かなくてよい
 *
 * 使い方：node --experimental-strip-types scripts/fetch-category-list.mjs lotion [--pages 1] [--max 20] [--dry-run]
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = path.join(ROOT_DIR, ".cache", "category-pages");

/** ジャンル ID は楽天のランキング・カテゴリのページから調べた。ページの題で名前を確かめる。 */
const GENRES = {
  lotion: { genreId: 216307, expect: "化粧水" },
  // 楽天のランニングのシューズの売り場にはサンダルも並ぶ（HOKA HOPARA 2 など）。ランニングシューズとして比べないので外す
  "running-shoes": { genreId: 565768, expect: "シューズ", exclude: /サンダル|スリッパ/ },
  // docs/10 第5節の「声で決まる」カテゴリ。プロテインはホエイだけ（大豆・カゼインと混ぜると比べにくい）
  protein: { genreId: 567617, expect: "ホエイ" },
  catfood: { genreId: 565724, expect: "キャットフード" },
};

const cachePathFor = (url) => path.join(CACHE_DIR, `${createHash("sha256").update(url).digest("hex").slice(0, 32)}.json`);
async function fileCache() {
  await mkdir(CACHE_DIR, { recursive: true });
  return {
    async get(url) { try { return JSON.parse(await readFile(cachePathFor(url), "utf8")); } catch { return null; } },
    async set(url, entry) { await writeFile(cachePathFor(url), JSON.stringify({ url, ...entry }), "utf8"); },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const categoryId = args.find((v) => !v.startsWith("--") && !/^\d+$/.test(v));
  const num = (flag, fallback) => { const i = args.indexOf(flag); return i >= 0 ? Number(args[i + 1]) : fallback; };
  const pages = num("--pages", 1), max = num("--max", 20);
  const genre = GENRES[categoryId];
  if (!genre) throw new Error(`カテゴリ ${categoryId} のジャンルがありません。使えるもの：${Object.keys(GENRES).join("・")}`);

  const crawler = new MakerCrawler({ cache: await fileCache(), maxRequests: 10, onProgress: (m) => console.log(m) });
  const listed = [];
  for (let page = 1; page <= pages; page += 1) {
    const url = `https://www.rakuten.co.jp/category/${genre.genreId}/${page > 1 ? `?p=${page}` : ""}`;
    const fetched = await crawler.fetchPage(url);
    if (!fetched) break;
    const title = fetched.html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    if (page === 1 && !title.includes(genre.expect)) throw new Error(`ジャンル ${genre.genreId} のページの題が「${title}」でした（「${genre.expect}」のはず）`);
    const cards = listedCards(fetched.html);
    listed.push(...(cards.length ? cards : listedItems(fetched.html)));
    console.log(`${page}ページ目：${cards.length}件（${title.slice(0, 40)}）`);
  }

  const excluded = genre.exclude ? listed.filter((item) => genre.exclude.test(item.name)) : [];
  const { kept, skipped } = pickItems(listed.filter((item) => !excluded.includes(item)), { max });
  for (const item of excluded) skipped.push({ name: item.name, why: "このカテゴリの商品ではない（サンダルなど）" });
  console.log(`\n入れる：${kept.length}商品（レビュー30件以上・多い順）`);
  for (const p of kept) console.log(`  ${String(p.reviewCount).padStart(6)}件 ★${p.rating ?? "-"} ¥${p.price.toLocaleString("ja-JP")} ${p.name.slice(0, 44)}`);
  const why = {};
  for (const s of skipped) why[s.why.replace(/\d+/, "N")] = (why[s.why.replace(/\d+/, "N")] ?? 0) + 1;
  console.log(`外した：${JSON.stringify(why)}`);
  const shops = new Map();
  for (const p of kept) { const shop = p.itemCode.split(":")[0]; shops.set(shop, (shops.get(shop) ?? 0) + 1); }
  const top = [...shops.entries()].sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= Math.ceil(kept.length / 3)) console.log(`注意：1つのお店が${top[1]}商品（${top[0]}）。お店の偏りが大きい（docs/09）`);
  if (args.includes("--dry-run")) return;
  if (!kept.length) {
    // 503（アクセス集中）などで読めなかった。前の一覧を消さない
    console.log("入れる商品が0なので、data/genre-products.json は変えません（ページが読めなかったときは、時間をあけてもう一度）");
    process.exitCode = 1;
    return;
  }

  const file = path.join(ROOT_DIR, "data", "genre-products.json");
  const catalogue = JSON.parse(await readFile(file, "utf8"));
  const products = kept.map((p) => {
    const productId = productIdOf(p.itemCode);
    return {
      id: `ichiba-${categoryId}-${productId}`,
      productId,
      categoryId,
      jan: null,
      name: p.name,
      brand: "",
      model: "",
      price: p.price,
      imageUrl: p.image,
      offerId: `ichiba-${p.itemCode}`,
      productUrl: p.url,
      reviewCount: p.reviewCount,
      reviewAverage: p.rating ?? 0,
      specs: [],
      contextTagIds: [],
      source: "category-page",
      fetchedAt: new Date().toISOString().slice(0, 10),
      itemCode: p.itemCode,
      ...(p.reviewKey ? { reviewKey: p.reviewKey } : {}),
    };
  });
  catalogue.products = [...catalogue.products.filter((p) => p.categoryId !== categoryId), ...products];
  await writeFile(`${file}.tmp`, JSON.stringify(catalogue, null, 2) + "\n", "utf8");
  await rename(`${file}.tmp`, file);
  console.log(`→ data/genre-products.json の ${categoryId} を ${products.length}商品にしました（リクエスト ${crawler.requestsMade}件）`);
}

await main();

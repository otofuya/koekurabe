import { readFile, writeFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * 新しいカテゴリの商品一覧を、楽天市場の商品検索 API（IchibaItem/Search・2026-07-01 版）で作る。
 *
 * イヤホンは「商品価格ナビ」の商品（メーカーの型番ごと）だったが、化粧水やシューズはお店の商品が中心で、
 * 価格ナビではレビューが読めない（docs/09）。そこでお店の商品を、レビューの多い順に取る。
 *
 * - 資格情報：RAKUTEN_APPLICATION_ID と RAKUTEN_ACCESS_KEY（環境変数か .dev.vars）。無ければ止まる
 * - 1秒に1回まで。同じ URL を短い間に何度も呼ぶと、しばらく応答しなくなる（API の説明）
 * - レビューが30件未満の商品は入れない（くわしく読めない）
 * - お試し・サンプル・詰め替えだけの商品は入れない（比べる単位にならない。docs/09 第2節）。外した理由は画面に出す
 * - data/genre-products.json の、そのカテゴリの商品だけを置きかえる（ほかのカテゴリは触らない）
 *
 * 使い方：node --experimental-strip-types scripts/fetch-item-list.mjs lotion [--limit 20] [--dry-run]
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENDPOINT = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701";
const GENRE_ENDPOINT = "https://openapi.rakuten.co.jp/ichibams/api/IchibaGenre/Search/20260701";
const MIN_REVIEWS = 30;
const INTERVAL_MS = 1_100;

/**
 * カテゴリと楽天のジャンル。ジャンル ID は楽天のランキング・カテゴリのページから調べた（2026-09-26）。
 * 走らせるとジャンル API で名前を確かめ、違っていたら止まる。
 */
const GENRES = {
  lotion: { genreId: 216307, expect: "化粧水" },
  "running-shoes": { genreId: 565768, expect: "シューズ" },
};

/** 比べる単位にならない商品（お試し・サンプル・詰め替えだけ）。 */
const NOT_A_UNIT = /お試し|トライアル|サンプル|試供品|ミニサイズ|詰め?替え用?のみ|つめかえ用?のみ/;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function credentials() {
  let vars = {};
  for (const file of [".dev.vars", ".env.local"]) {
    try {
      const text = await readFile(path.join(ROOT_DIR, file), "utf8");
      for (const line of text.split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
        if (m) vars[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch {}
  }
  const applicationId = process.env.RAKUTEN_APPLICATION_ID || vars.RAKUTEN_APPLICATION_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY || vars.RAKUTEN_ACCESS_KEY;
  if (!applicationId || !accessKey) {
    throw new Error("RAKUTEN_APPLICATION_ID と RAKUTEN_ACCESS_KEY が要ります（.dev.vars に書く。docs/13）");
  }
  return { applicationId, accessKey };
}

async function callApi(endpoint, params, creds) {
  const url = new URL(endpoint);
  url.search = new URLSearchParams({ format: "json", formatVersion: "2", applicationId: creds.applicationId, ...params }).toString();
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(url, { headers: { accessKey: creds.accessKey } });
    if (response.status === 429 || response.status >= 500) {
      await sleep(INTERVAL_MS * 3 * attempt);
      continue;
    }
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`楽天 API ${response.status}: ${body.error_description ?? body.error ?? JSON.stringify(body).slice(0, 200)}`);
    return body;
  }
  throw new Error("楽天 API が混んでいて応答しませんでした（429・5xx が3回）。時間をあけて");
}

/** 商品の ID。画面の URL（/reviews/<32桁>）に合わせて、商品コードから作る。 */
const productIdOf = (itemCode) => createHash("md5").update(`ichiba:${itemCode}`).digest("hex");

/** 画像は 128px が返るので、画面に合う大きさを頼む（楽天の画像サーバーの指定）。 */
const largerImage = (url) => (url ? url.replace(/\?_ex=\d+x\d+$/, "?_ex=300x300") : "");

async function main() {
  const args = process.argv.slice(2);
  const categoryId = args.find((value) => !value.startsWith("--"));
  const limitIndex = args.indexOf("--limit");
  const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : 20;
  const dryRun = args.includes("--dry-run");
  const genre = GENRES[categoryId];
  if (!genre) throw new Error(`カテゴリ ${categoryId} のジャンルがありません。使えるもの：${Object.keys(GENRES).join("・")}`);

  const creds = await credentials();

  const genreInfo = await callApi(GENRE_ENDPOINT, { genreId: String(genre.genreId) }, creds);
  const genreName = genreInfo.current?.genreName ?? genreInfo.current?.[0]?.genreName ?? "";
  if (!genreName.includes(genre.expect)) throw new Error(`ジャンル ${genre.genreId} は「${genreName}」でした（「${genre.expect}」のはず）。GENRES を直して`);
  console.log(`ジャンル ${genre.genreId}：${genreName}`);

  const kept = [];
  const skipped = [];
  for (let page = 1; page <= 4 && kept.length < limit; page += 1) {
    await sleep(INTERVAL_MS);
    const body = await callApi(ENDPOINT, { genreId: String(genre.genreId), sort: "-reviewCount", hits: "30", page: String(page), imageFlag: "1", availability: "1" }, creds);
    const items = (body.Items ?? body.items ?? []).map((entry) => entry.Item ?? entry);
    if (!items.length) break;
    for (const item of items) {
      if (kept.length >= limit) break;
      if ((item.reviewCount ?? 0) < MIN_REVIEWS) { skipped.push([item.itemName, `レビュー${item.reviewCount}件`]); continue; }
      if (NOT_A_UNIT.test(item.itemName)) { skipped.push([item.itemName, "お試し・サンプル・詰め替えだけ"]); continue; }
      const productId = productIdOf(item.itemCode);
      if (kept.some((p) => p.productId === productId)) continue;
      kept.push({
        id: `ichiba-${categoryId}-${productId}`,
        productId,
        categoryId,
        jan: null,
        name: item.itemName,
        brand: "",
        model: "",
        price: item.itemPrice,
        imageUrl: largerImage(item.mediumImageUrls?.[0]?.imageUrl ?? item.mediumImageUrls?.[0] ?? ""),
        offerId: `ichiba-${item.itemCode}`,
        productUrl: item.itemUrl,
        reviewCount: item.reviewCount,
        reviewAverage: Number(item.reviewAverage) || 0,
        specs: [],
        contextTagIds: [],
        source: "ichiba-item",
        itemCode: item.itemCode,
        shopName: item.shopName,
      });
    }
  }

  console.log(`入れる：${kept.length}商品（レビュー${MIN_REVIEWS}件以上・多い順）`);
  for (const p of kept) console.log(`  ${String(p.reviewCount).padStart(6)}件 ¥${p.price.toLocaleString("ja-JP")} ${p.name.slice(0, 50)}（${p.shopName}）`);
  if (skipped.length) {
    console.log(`外した：${skipped.length}商品`);
    for (const [name, why] of skipped.slice(0, 20)) console.log(`  ${why}：${name.slice(0, 50)}`);
  }
  const shops = new Map();
  for (const p of kept) shops.set(p.shopName, (shops.get(p.shopName) ?? 0) + 1);
  const top = [...shops.entries()].sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= Math.ceil(kept.length / 3)) console.log(`注意：1つのお店が${top[1]}商品（${top[0]}）。お店の偏りが大きい（docs/09）`);
  if (dryRun) return;

  const file = path.join(ROOT_DIR, "data", "genre-products.json");
  const catalogue = JSON.parse(await readFile(file, "utf8"));
  catalogue.products = [...catalogue.products.filter((p) => p.categoryId !== categoryId), ...kept];
  await writeFile(`${file}.tmp`, JSON.stringify(catalogue, null, 2) + "\n", "utf8");
  await rename(`${file}.tmp`, file);
  console.log(`→ data/genre-products.json の ${categoryId} を ${kept.length}商品にしました`);
}

await main();

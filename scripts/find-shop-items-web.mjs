import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { MakerCrawler } from "./maker-crawl.ts";
import { listedCards } from "../lib/category-list.ts";
import { mentionsJan, MAX_SHOP_ITEMS } from "../lib/shop-match.ts";

/**
 * 商品価格ナビの商品に、お店の商品を JAN で結びつける（楽天の API を使わない版。2026-09-26）。
 *
 * 楽天の API はアプリ登録にサイトの URL が要り、オーナーはドメインを取ってから申請したい。それまでの道：
 * 1. 楽天の検索のページ（search.rakuten.co.jp/search/mall/<JAN>/）を読む（robots.txt に従う。並べ替えの ?s= は使わない）
 * 2. 出てきたお店の商品を、レビューの多い順に5つまで開き、その JAN が書いてあるかを確かめる（lib/shop-match.ts の mentionsJan）
 * 3. 確かめられたものを3つまで data/shop-items.json に（URL・名前・レビュー数・レビューのページの番号）
 * 読むのは fetch-reviews.mjs --shop-items。ホストごとに3秒あける・403 で止める（maker-crawl.ts）。
 *
 * 使い方：node --experimental-strip-types scripts/find-shop-items-web.mjs earbuds [--min 30] [--only 637e1dd6] [--missing]
 *   --missing：前に読めて、今は商品価格ナビで読めない商品だけ（test/data/reviews-<カテゴリ>.json の pages が 0）
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT_DIR, "data", "shop-items.json");
const CACHE_DIR = path.join(ROOT_DIR, ".cache", "search-pages");
const CANDIDATES = 5;

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
  const categoryId = args.find((v) => !v.startsWith("--") && !/^\d+$/.test(v) && !/^[a-f0-9]{4,32}$/.test(v)) ?? "earbuds";
  const num = (flag, fallback) => { const i = args.indexOf(flag); return i >= 0 ? Number(args[i + 1]) : fallback; };
  const min = num("--min", 30);
  const onlyIndex = args.indexOf("--only");
  const only = onlyIndex >= 0 ? args[onlyIndex + 1] : null;

  const catalogue = JSON.parse(await readFile(path.join(ROOT_DIR, "data", "genre-products.json"), "utf8"));
  let products = catalogue.products.filter((p) => p.categoryId === categoryId && p.jan && new URL(p.productUrl).hostname === "product.rakuten.co.jp")
    .filter((p) => (only ? p.productId.startsWith(only) : (p.reviewCount ?? 0) >= min));
  if (args.includes("--missing")) {
    const summary = JSON.parse(await readFile(path.join(ROOT_DIR, "test", "data", `reviews-${categoryId}.json`), "utf8").catch(() => "{\"records\":[]}"));
    const empty = new Set(summary.records.filter((r) => !r.pages).map((r) => r.productId));
    products = products.filter((p) => empty.has(p.productId));
  }
  if (!products.length) throw new Error(`${categoryId}：対象の商品がありません`);
  console.log(`${products.length}商品を探します`);

  const crawler = new MakerCrawler({ cache: await fileCache(), maxRequests: 120, onProgress: (m) => console.log(m) });
  const existing = await readFile(OUTPUT, "utf8").then(JSON.parse).catch(() => ({ categories: {} }));
  const links = { ...(existing.categories?.[categoryId] ?? {}) };
  let found = 0;

  for (const product of products) {
    const search = await crawler.fetchPage(`https://search.rakuten.co.jp/search/mall/${product.jan}/`);
    const candidates = listedCards(search?.html ?? "")
      .filter((c) => c.reviewCount > 0 && c.reviewKey && !/中古|ジャンク|展示品/.test(c.name))
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, CANDIDATES);
    const confirmed = [];
    for (const c of candidates) {
      if (confirmed.length >= MAX_SHOP_ITEMS) break;
      const page = await crawler.fetchPage(c.url);
      if (page && mentionsJan(page.html, product.jan)) {
        confirmed.push({ itemCode: c.itemCode, itemUrl: c.url, shopName: c.itemCode.split(":")[0], itemName: c.name, reviewCount: c.reviewCount, reviewKey: c.reviewKey });
      }
    }
    links[product.productId] = confirmed;
    if (confirmed.length) found += 1;
    console.log(`${product.productId.slice(0, 8)} ${product.name.slice(0, 32)}：候補${candidates.length}・JAN を確かめた${confirmed.length}（レビュー計${confirmed.reduce((s, x) => s + x.reviewCount, 0)}件）`);
  }

  const output = { generatedAt: new Date().toISOString(), categories: { ...(existing.categories ?? {}), [categoryId]: links } };
  await writeFile(`${OUTPUT}.tmp`, JSON.stringify(output, null, 2) + "\n", "utf8");
  await rename(`${OUTPUT}.tmp`, OUTPUT);
  console.log(`\n${products.length}商品中${found}商品にお店の商品を結びつけた → data/shop-items.json（リクエスト ${crawler.requestsMade}件）`);
}

await main();

import { readFile, writeFile, rename } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { rakutenCredentials, callRakuten, itemsOf, ITEM_SEARCH } from "./rakuten-api.mjs";
import { matchByJan } from "../lib/shop-match.ts";

/**
 * 商品価格ナビの商品に、お店の商品を JAN で結びつける（lib/shop-match.ts・docs/02 第13節）。
 *
 * 結果は data/shop-items.json（お店の商品の URL・名前・レビュー数だけ。レビューの本文は入れない）。
 * 読むのは fetch-reviews.mjs の --shop-items。
 *
 * - 対象：楽天のレビューが30件以上ある商品（--min で変える）。--only <商品IDの頭> で1つだけ
 * - 楽天の商品検索を1商品1回（1秒に1回まで）
 *
 * 使い方：node --experimental-strip-types scripts/find-shop-items.mjs earbuds [--min 30] [--only 637e1dd6]
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT_DIR, "data", "shop-items.json");

async function main() {
  const args = process.argv.slice(2);
  const categoryId = args.find((value) => !value.startsWith("--") && !/^\d+$/.test(value) && !/^[a-f0-9]{4,32}$/.test(value)) ?? "earbuds";
  const minIndex = args.indexOf("--min");
  const min = minIndex >= 0 ? Number(args[minIndex + 1]) : 30;
  const onlyIndex = args.indexOf("--only");
  const only = onlyIndex >= 0 ? args[onlyIndex + 1] : null;

  const creds = await rakutenCredentials(ROOT_DIR);
  const catalogue = JSON.parse(await readFile(path.join(ROOT_DIR, "data", "genre-products.json"), "utf8"));
  const products = catalogue.products
    .filter((p) => p.categoryId === categoryId && p.jan && (only ? p.productId.startsWith(only) : (p.reviewCount ?? 0) >= min))
    .filter((p) => new URL(p.productUrl).hostname === "product.rakuten.co.jp");
  if (!products.length) throw new Error(`${categoryId}: 対象の商品がありません（レビュー${min}件以上・JAN あり）`);

  const existing = await readFile(OUTPUT, "utf8").then(JSON.parse).catch(() => ({ categories: {} }));
  const links = { ...(existing.categories?.[categoryId] ?? {}) };
  let found = 0;

  for (const product of products) {
    const body = await callRakuten(ITEM_SEARCH, { keyword: product.jan, field: "0", sort: "-reviewCount", hits: "30", availability: "0" }, creds);
    const matched = matchByJan(itemsOf(body), product.jan);
    links[product.productId] = matched;
    if (matched.length) found += 1;
    const reviews = matched.reduce((sum, item) => sum + item.reviewCount, 0);
    console.log(`${product.productId.slice(0, 8)} ${product.name.slice(0, 36)}：${matched.length}店（レビュー計${reviews}件）${matched.map((m) => m.shopName).join("・")}`);
  }

  const output = { generatedAt: new Date().toISOString(), categories: { ...(existing.categories ?? {}), [categoryId]: links } };
  await writeFile(`${OUTPUT}.tmp`, JSON.stringify(output, null, 2) + "\n", "utf8");
  await rename(`${OUTPUT}.tmp`, OUTPUT);
  console.log(`\n${products.length}商品中${found}商品にお店の商品を結びつけた → data/shop-items.json`);
}

await main();

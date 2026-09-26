import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { MakerCrawler } from "./maker-crawl.ts";
import { savePageText, savePageMeta } from "./page-text.mjs";

/**
 * The other half of the reviews: the ones left on each shop's own listing.
 *
 * The catalogue is built from 商品価格ナビ, whose product page carries a merged view and, for most
 * products, renders its shop list in the browser rather than in the HTML. So the reviews reachable
 * from there are a subset. Every shop that lists the product also has its own review page, and
 * those are a different population of buyers writing about the same thing.
 *
 * **This lifts depth, not breadth.** Measured on the earbuds genre: shop links appear on 26 of 97
 * product pages — the same 26 that already had product-level reviews, because both need the offer
 * list to be server-rendered. Reaching the other 71 needs the Ichiba item search API to enumerate
 * listings, and `RAKUTEN_APPLICATION_ID` is currently blank. When it is set, `shopItemsFromApi`
 * below takes over and breadth follows; until then the page-scraped links are all there is.
 *
 * Usage: node --experimental-strip-types scripts/fetch-shop-reviews.mjs earbuds [--from-cache]
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = path.join(ROOT_DIR, ".cache", "shop-review-pages");
const MAX_REQUESTS_PER_RUN = 600;
/** Shops per product. Past a few it is the same product described by the same buyers. */
const MAX_SHOPS_PER_PRODUCT = 3;
/** Pages per shop listing. The page holds fifteen here, unlike the product page's thirty. */
const MAX_PAGES_PER_SHOP = 6;
const MAX_TEXT_LENGTH = 8_000;

const cachePathFor = (directory, url) =>
  path.join(ROOT_DIR, ".cache", directory, `${createHash("sha256").update(url).digest("hex").slice(0, 32)}.json`);

async function fileCache() {
  await mkdir(CACHE_DIR, { recursive: true });
  return {
    async get(url) { try { return JSON.parse(await readFile(cachePathFor("shop-review-pages", url), "utf8")); } catch { return null; } },
    async set(url, entry) { await writeFile(cachePathFor("shop-review-pages", url), JSON.stringify({ url, ...entry }), "utf8"); },
  };
}

async function cachedHtml(directory, url) {
  try { return JSON.parse(await readFile(cachePathFor(directory, url), "utf8")).html ?? ""; } catch { return ""; }
}

/**
 * `<shopId>_<itemId>` pairs, read out of pages already on disk.
 *
 * The ids appear in the page's embedded state as well as in hrefs, and the state escapes its
 * slashes, so both spellings are matched. Order is preserved and de-duplicated: the first listing
 * a product page names is the one it is actually selling, and the rest tail off into resellers.
 */
const SHOP_ITEM = /review\.rakuten\.co\.jp(?:\\u002F|\/)item(?:\\u002F|\/)1(?:\\u002F|\/)(\d+_\d+)/g;

async function shopItemsFromCache(product) {
  const base = product.productUrl.split("?")[0].replace(/\/$/, "");
  const html = (await cachedHtml("review-pages", `${base}/review/`)) || (await cachedHtml("marketplace-pages", `${base}/`));
  return [...new Set([...html.matchAll(SHOP_ITEM)].map((match) => match[1]))];
}

/**
 * The same list from the Ichiba item search API, which is how breadth arrives.
 *
 * Returns nothing without credentials, which is the current state — kept here so the day the key
 * is filled in, the only change needed is the key. `itemCode` comes back as `shop:code`, and the
 * review path wants `shopId_itemId`, so this is deliberately left for when a real response can be
 * inspected rather than guessed at from the docs.
 */
async function shopItemsFromApi() { return []; }

/** Page one is `1.1`; the first number is the page and the second is the sort order. */
const shopReviewUrl = (shopItem, page) => `https://review.rakuten.co.jp/item/1/${shopItem}/${page}.1/`;

const REVIEW_BODY = /class="review-body--[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };
const decodeEntities = (text) => text.replace(/&(#\d+|[a-z]+);/gi, (whole, name) => {
  if (ENTITIES[name]) return ENTITIES[name];
  return /^#\d+$/.test(name) ? String.fromCodePoint(Number(name.slice(1))) : whole;
});

/** Same extraction as the product pages: the review elements only, never the page around them. */
function reviewProse(html) {
  const bodies = [...html.matchAll(REVIEW_BODY)]
    .map(([, inner]) => decodeEntities(inner.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return bodies.join(" / ").slice(0, MAX_TEXT_LENGTH);
}

async function main() {
  const args = process.argv.slice(2);
  const offline = args.includes("--from-cache");
  const categoryId = args.find((value) => !value.startsWith("--")) ?? "earbuds";

  const catalogue = JSON.parse(await readFile(path.join(ROOT_DIR, "data", "genre-products.json"), "utf8"));
  const products = catalogue.products.filter((item) => item.categoryId === categoryId && item.productUrl);
  if (!products.length) throw new Error(`${categoryId}: 対象商品がありません`);

  const crawler = offline ? null : new MakerCrawler({ cache: await fileCache(), maxRequests: MAX_REQUESTS_PER_RUN, onProgress: (message) => console.log(message) });
  const records = [];
  let withProse = 0; let pagesRead = 0;

  for (const [index, product] of products.entries()) {
    const fromApi = await shopItemsFromApi(product);
    const shopItems = (fromApi.length ? fromApi : await shopItemsFromCache(product)).slice(0, MAX_SHOPS_PER_PRODUCT);
    // Pages are numbered per product, not per shop, so `extract-aspects.mjs` can keep reading
    // `<productId>-p<N>.txt` without knowing that shops exist at all.
    let slot = 0; let characters = 0;

    for (const shopItem of shopItems) {
      for (let page = 1; page <= MAX_PAGES_PER_SHOP; page += 1) {
        const url = shopReviewUrl(shopItem, page);
        const fetched = offline
          ? await cachedHtml("shop-review-pages", url).then((html) => (html ? { html } : null))
          : await crawler.fetchPage(url);
        if (!fetched) break;
        const prose = reviewProse(fetched.html);
        // An empty page means this listing has no more reviews. Asking for the next one is a
        // request to somebody else's server for a page we already know is blank.
        if (prose.length < 20) break;
        slot += 1;
        await savePageText(ROOT_DIR, categoryId, "shop-reviews", `${product.productId}-p${slot}`, prose);
        await savePageMeta(ROOT_DIR, categoryId, "shop-reviews", `${product.productId}-p${slot}`, { sourceUrl: url });
        characters += prose.length; pagesRead += 1;
      }
    }

    if (slot) withProse += 1;
    records.push({ productId: product.productId, shops: shopItems.length, pages: slot, characters });
    if ((index + 1) % 20 === 0) process.stdout.write(`${index + 1}/${products.length}.. `);
  }

  const output = path.join(ROOT_DIR, "test", "data", `shop-reviews-${categoryId}.json`);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify({ generatedAt: new Date().toISOString(), categoryId, records }, null, 2) + "\n", "utf8");
  const source = offline ? "キャッシュから再抽出" : `リクエスト ${crawler.requestsMade}件`;
  console.log(`\n${products.length}件中${withProse}件に店舗レビュー（${pagesRead}ページ）→ ${path.relative(ROOT_DIR, output)}（${source}）`);
}

await main();

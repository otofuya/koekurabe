import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { MakerCrawler } from "./maker-crawl.ts";
import { savePageText, savePageMeta } from "./page-text.mjs";

/**
 * Buyer prose, from the marketplace's own review pages.
 *
 * The catalogue API returns review counts and averages but not a word of what anyone wrote, and a
 * score out of five says nothing the specs do not already say. The sentences do: "電車だと少し
 * 物足りない" and "耳から落ちない" are properties of the product that no attribute table carries.
 *
 * The product page and its review page share a URL stem, so nothing has to be looked up — the
 * review page is the product page plus `review/`, and page two is that plus `2/`. Products with no
 * reviews come back empty and are left that way; `quadrantPoints` in `lib/aspect-model.ts` sets
 * them aside rather than placing them at the origin, because silence is not a balanced opinion.
 *
 * The prose itself is written to `.cache/`, never to the repo. Fetching someone's page to read it
 * and republishing it are different acts, and only the first is in scope here.
 *
 * Usage: node --experimental-strip-types scripts/fetch-reviews.mjs earbuds [--from-cache]
 *
 * `--from-cache` re-reads the pages already on disk and extracts them again without touching the
 * network. Tuning what counts as a review is an iterative job, and the crawler revalidates every
 * URL even on a cache hit, so without this a change to one regular expression means another
 * ninety-seven requests to somebody else's servers for pages we already have.
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = path.join(ROOT_DIR, ".cache", "review-pages");
const MAX_REQUESTS_PER_RUN = 600;
/**
 * How many pages of reviews to take for one product.
 *
 * The page holds thirty, and `numFound` on the page says how many exist, so most products need
 * exactly one request — on the earbuds set only seven of twenty-five carry more than thirty
 * reviews at all. The ceiling is for the handful that do: soundcore Liberty 4 has 1,383, which is
 * forty-seven pages, and nobody needs the four-hundredth opinion about the same earbuds.
 */
const MAX_PAGES_PER_PRODUCT = 10;
const PAGE_SIZE = 30;
/**
 * Enough for one page of reviews. Pages are stored and extracted separately.
 *
 * Whole reviews only: the old version cut the joined text at 8,000 characters, which chopped the last
 * review of a long page in half — and the half still counted as a review read. Now a review that
 * would pass the limit is left out entirely (and counted as skipped), so every review read is whole.
 */
const MAX_TEXT_LENGTH = 16_000;

const cachePathFor = (url) => path.join(CACHE_DIR, `${createHash("sha256").update(url).digest("hex").slice(0, 32)}.json`);

async function fileCache() {
  await mkdir(CACHE_DIR, { recursive: true });
  return {
    async get(url) { try { return JSON.parse(await readFile(cachePathFor(url), "utf8")); } catch { return null; } },
    async set(url, entry) { await writeFile(cachePathFor(url), JSON.stringify({ url, ...entry }), "utf8"); },
  };
}

/** Reads a page straight off disk. Returns null for a URL that was never fetched. */
async function cachedPage(url) {
  try { return { url, html: JSON.parse(await readFile(cachePathFor(url), "utf8")).html ?? "" }; } catch { return null; }
}

/**
 * The review page for a product page.
 *
 * The tracking query is dropped for the same reason the marketplace fetch drops it: it keys the
 * cache on the affiliate link of the moment rather than on the product.
 */
function reviewUrl(productUrl, page = 1) {
  const base = productUrl.split("?")[0];
  const stem = `${base.endsWith("/") ? base : `${base}/`}review/`;
  return page <= 1 ? stem : `${stem}${page}/`;
}

/**
 * お店の商品（item.rakuten.co.jp）のレビューのページ。
 *
 * 商品検索 API は店の番号と商品の番号を返さないので、商品ページを1回読んで取る
 * （"itemInfoSku":{"shopId":"398010",…,"itemId":10007028}）。レビューは
 * review.rakuten.co.jp/item/1/<店>_<商品>/<ページ>.1/ にある。
 */
const ITEM_SKU = /"itemInfoSku":\{[^}]*?"shopId":"?(\d+)"?[^}]*?"itemId":(\d+)/;
const ITEM_QUERY = /shop_id=(\d+)&(?:amp;)?item_id=(\d+)/;

async function reviewPagesFor(product, load) {
  const host = new URL(product.productUrl).hostname;
  if (host === "product.rakuten.co.jp") return { kind: "product", url: (page) => reviewUrl(product.productUrl, page) };
  if (host !== "item.rakuten.co.jp") return null;
  const itemPage = await load(product.productUrl.split("?")[0]);
  const match = itemPage?.html.match(ITEM_SKU) ?? itemPage?.html.match(ITEM_QUERY);
  if (!match) return null;
  const key = `${match[1]}_${match[2]}`;
  return { kind: "item", url: (page) => `https://review.rakuten.co.jp/item/1/${key}/${page}.1/` };
}

/**
 * How many reviews the marketplace says this product has, read off the page it just served.
 *
 * Asking the page rather than the catalogue matters: the catalogue counts every shop's reviews
 * for every listing of the product, while this page shows only the ones it will actually render.
 * Paging to the catalogue's number would fetch empty pages for most of the genre.
 */
function totalReviews(html) {
  const match = html.match(/"reviewInfo"[\s\S]{0,4000}?"pagination":\{[^}]*?"numFound":(\d+)/);
  return match ? Number(match[1]) : null;
}

/**
 * The reviews, and nothing else on the page.
 *
 * The first version of this took the whole readable page and stripped known furniture by name. It
 * did not work: a review page is mostly navigation, shop blurb, points arithmetic and a related-
 * genre rail, all of it identical on every product. Worse, a product with no reviews still yielded
 * two and a half thousand characters of that boilerplate — so the reviewless products would have
 * been handed nearly identical text and clustered together tightly, which is the exact artefact
 * leaving them out is meant to avoid.
 *
 * The reviews themselves sit in their own element, so that is what gets taken. Nothing found means
 * nobody wrote anything, which is a true answer and better than a page's worth of chrome.
 */
const REVIEW_BODY = /class="review-body--[^"]*"[^>]*>([\s\S]*?)<\/div>/g;

function reviewProse(html) {
  const bodies = [...html.matchAll(REVIEW_BODY)]
    .map(([, inner]) => decodeEntities(inner.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const kept = [];
  let length = 0;
  for (const body of bodies) {
    const next = length + (kept.length ? 3 : 0) + body.length;
    if (next > MAX_TEXT_LENGTH) break;
    kept.push(body);
    length = next;
  }
  reviewProse.skipped += bodies.length - kept.length;
  return kept.join(" / ");
}
reviewProse.skipped = 0;

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };
const decodeEntities = (text) => text.replace(/&(#\d+|[a-z]+);/gi, (whole, name) => {
  if (ENTITIES[name]) return ENTITIES[name];
  return /^#\d+$/.test(name) ? String.fromCodePoint(Number(name.slice(1))) : whole;
});

async function main() {
  const args = process.argv.slice(2);
  const offline = args.includes("--from-cache");
  const categoryId = args.find((value) => !value.startsWith("--")) ?? "earbuds";
  const catalogue = JSON.parse(await readFile(path.join(ROOT_DIR, "data", "genre-products.json"), "utf8"));
  const products = catalogue.products.filter((item) => item.categoryId === categoryId && item.productUrl);
  if (!products.length) throw new Error(`${categoryId}: 対象商品がありません`);

  const crawler = offline ? null : new MakerCrawler({ cache: await fileCache(), maxRequests: MAX_REQUESTS_PER_RUN, onProgress: (message) => console.log(message) });
  const records = [];
  let withProse = 0;

  for (const [index, product] of products.entries()) {
    let characters = 0; let pagesRead = 0; let found = null;
    const load = (url) => (offline ? cachedPage(url) : crawler.fetchPage(url));
    const pages = await reviewPagesFor(product, load);
    for (let page = 1; pages && page <= MAX_PAGES_PER_PRODUCT; page += 1) {
      const url = pages.url(page);
      const fetched = await load(url);
      if (!fetched) break;
      // お店の商品は、API が返したその商品のレビュー数で止める（ページの数字は店ぜんたいの件数のことがある）
      if (page === 1) found = pages.kind === "item" ? product.reviewCount ?? null : totalReviews(fetched.html);
      const prose = reviewProse(fetched.html);
      // A page that loaded but says nothing is not a failure; it is a product nobody reviewed.
      if (prose.length < 20) break;
      // Pages are kept apart so extraction can run one page at a time: thirty reviews is a size a
      // model reads accurately, and each quote can be checked against the page it came from.
      await savePageText(ROOT_DIR, categoryId, "reviews", `${product.productId}-p${page}`, prose);
      await savePageMeta(ROOT_DIR, categoryId, "reviews", `${product.productId}-p${page}`, { sourceUrl: url });
      characters += prose.length; pagesRead = page;
      // Nothing left to page to. Asking anyway is a request to somebody else's server for a page
      // we already know is empty.
      if (found !== null && page * PAGE_SIZE >= found) break;
    }
    if (pagesRead) withProse += 1;
    records.push({ productId: product.productId, pages: pagesRead, characters, numFound: found, reviewCount: product.reviewCount ?? 0 });
    if ((index + 1) % 20 === 0) process.stdout.write(`${index + 1}/${products.length}.. `);
  }

  const output = path.join(ROOT_DIR, "test", "data", `reviews-${categoryId}.json`);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify({ generatedAt: new Date().toISOString(), categoryId, records }, null, 2) + "\n", "utf8");
  const coverage = (withProse / products.length * 100).toFixed(0);
  const pages = records.reduce((sum, record) => sum + record.pages, 0);
  const source = offline ? "キャッシュから再抽出" : `リクエスト ${crawler.requestsMade}件`;
  if (reviewProse.skipped) console.log(`長すぎて入れなかったレビュー：${reviewProse.skipped}件（途中で切らずに外した）`);
  console.log(`\n${products.length}件中${withProse}件にレビュー本文（カバレッジ${coverage}%・${pages}ページ）→ ${path.relative(ROOT_DIR, output)}（${source}）`);
}

await main();

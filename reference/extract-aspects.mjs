import { readFile, readdir, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { CATEGORY_DEFINITIONS } from "../lib/category-definitions.ts";
import { verifiedQuotes } from "../lib/aspect-model.ts";
import { generateStructured } from "../lib/gemini.ts";
import { modelFamilyKey, variantFamilyKey } from "../test/product-selection.mjs";
import { PAGE_TEXT_DIR } from "./page-text.mjs";

/**
 * Counting what buyers said, one page of reviews at a time.
 *
 * The output is a tally, not an opinion: "30件のレビューのうち11件が装着感に触れ、うち4件が不満".
 * That distinction is the whole reason this pipeline exists — the spec pipeline it replaces had to
 * mark 87% of its values 推定, because a spec read off a marketing page is somebody's claim about
 * the product, while a count of what reviewers wrote is a fact about the reviews.
 *
 * One page per call. Counts add up across pages, so a product with 300 reviews is ten calls rather
 * than one enormous prompt, and each quote can be checked against the page it came from. Cramming
 * ten pages into one request costs accuracy in both directions: the model loses count, and a quote
 * that was stitched from two different pages becomes impossible to catch.
 *
 * Usage: node --experimental-strip-types scripts/extract-aspects.mjs earbuds [--limit N]
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
/**
 * Flash Lite, and not whatever `.dev.vars` names.
 *
 * The shared variable is set for the spec pipeline, which makes a few dozen calls and wants the
 * stronger model. This one makes a call per page — about a hundred and thirty for the earbuds
 * genre — and the stronger model's free tier allows twenty a day, so inheriting it exhausts the
 * quota a fifth of the way in and the rest of the genre silently comes back empty. Counting
 * sentiment in thirty short reviews is well within Lite; the volume is what matters here.
 */
const MODEL = process.env.ASPECT_EXTRACTION_MODEL || "gemini-3.1-flash-lite";

function readVars(text) {
  return Object.fromEntries(text.split(/\r?\n/).flatMap((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return [];
    const separator = trimmed.indexOf("=");
    return [[trimmed.slice(0, separator).trim(), trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "")]];
  }));
}

/** Write, then move into place, so a reader never catches the file half-written. */
async function writeAtomic(target, contents) {
  const temporary = `${target}.tmp`;
  await writeFile(temporary, contents, "utf8");
  await rename(temporary, target);
}

const schemaFor = (aspects) => ({
  type: "object",
  properties: {
    aspects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          aspect: { type: "string", enum: aspects.map((aspect) => aspect.label) },
          positive: { type: "integer" },
          negative: { type: "integer" },
          quote: { type: "string" },
        },
        required: ["aspect", "positive", "negative", "quote"],
      },
    },
  },
  required: ["aspects"],
});

/**
 * The prompt leans on two things the reviews themselves supply.
 *
 * The separator, so the model can count reviews rather than sentences — without it the counts drift
 * towards "how many times was this mentioned" and stop being comparable between products. And the
 * quote requirement, because a count with no traceable source cannot be checked, and 原則23 already
 * settled that an inferred value without its supporting fragment is thrown away.
 *
 * Negation is called out by name. It is the failure this project has already made twice: a page
 * saying「『マルチポイント対応』は外せません」about a product that does not support it, and a model
 * reading a brand's slogan as a product's feature.
 */
const promptFor = (aspects, text) => `次は1つの商品に対する購入者レビューです。レビューは " / " で区切られています。

各観点について、その観点に言及した**レビューの件数**を、肯定的なものと否定的なものに分けて数えてください。
言及が無い観点は配列に含めないでください。

- 数えた根拠として、本文にそのまま現れる一節を quote に必ず入れてください。複数のレビューをつないだ文は入れないでください
- 否定表現（「〜ない」「〜しにくい」「期待したほどでは」）を見落とさないでください
- 商品説明やショップの宣伝文が混ざっている場合、それは購入者の声ではないので数えないでください

観点: ${aspects.map((aspect) => aspect.label).join("、")}

--- レビュー本文 ---
${text}`;

/**
 * Every page of reviews on disk, grouped by product.
 *
 * Two sources, read the same way. `reviews` is the product page's merged view; `shop-reviews` is
 * what each shop's own listing collected. They are different populations of buyers writing about
 * the same product, counts add, and neither is more authoritative — so they are simply pooled,
 * with the split recorded on the product so a thin result can be traced to a thin source.
 */
const SOURCES = ["reviews", "shop-reviews"];

async function reviewPages(categoryId) {
  const byProduct = new Map();
  for (const source of SOURCES) {
    const directory = path.join(ROOT_DIR, PAGE_TEXT_DIR, categoryId, source);
    const files = await readdir(directory).catch(() => []);
    for (const file of files.filter((name) => name.endsWith(".txt"))) {
      const match = file.match(/^(.*)-p(\d+)\.txt$/);
      if (!match) continue;
      const [, productId, page] = match;
      if (!byProduct.has(productId)) byProduct.set(productId, []);
      byProduct.get(productId).push({ source, page: Number(page), file: path.join(directory, file) });
    }
  }
  for (const pages of byProduct.values()) {
    pages.sort((a, b) => a.source.localeCompare(b.source) || a.page - b.page);
  }
  return byProduct;
}

async function main() {
  const args = process.argv.slice(2);
  const categoryId = args.find((value) => !value.startsWith("--")) ?? "earbuds";
  const limitFlag = args.indexOf("--limit");
  const limit = limitFlag >= 0 ? Number(args[limitFlag + 1]) : Infinity;

  const definition = CATEGORY_DEFINITIONS[categoryId];
  if (!definition?.aspects?.length) throw new Error(`${categoryId}: aspects が定義されていません`);
  const aspects = definition.aspects;
  const byLabel = new Map(aspects.map((aspect) => [aspect.label, aspect.key]));

  const fileVars = readVars(await readFile(path.join(ROOT_DIR, ".dev.vars"), "utf8").catch(() => ""));
  const apiKey = process.env.GEMINI_API_KEY || fileVars.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY が未設定です");
  const extractionModel = MODEL;

  const catalogue = JSON.parse(await readFile(path.join(ROOT_DIR, "data", "genre-products.json"), "utf8"));
  const products = catalogue.products.filter((item) => item.categoryId === categoryId);
  const byProductId = new Map(products.map((item) => [item.productId, item]));

  /*
   * One row per product, not per listing.
   *
   * The same earbuds appear under several colours, and on a chart each colour is a second circle
   * sitting on top of the first — density that is not there, and a neighbour list eaten by one
   * product's palette (原則26). The genre layout already merges them; this reads the same two keys
   * so the two pipelines agree on what counts as one product.
   */
  const familyOf = new Map();
  for (const product of products) {
    const keys = [modelFamilyKey(product), variantFamilyKey(product)].filter(Boolean);
    familyOf.set(product.productId, keys[0] ?? product.productId);
  }
  const canonical = new Map();
  for (const product of products) {
    const family = familyOf.get(product.productId);
    const held = canonical.get(family);
    if (!held || product.price < held.price) canonical.set(family, product);
  }
  const keptIds = new Set([...canonical.values()].map((product) => product.productId));

  const pages = await reviewPages(categoryId);
  const targets = [...pages.keys()].filter((productId) => keptIds.has(productId) && byProductId.has(productId)).slice(0, limit);
  const merged = [...pages.keys()].filter((productId) => !keptIds.has(productId)).length;
  console.log(`${targets.length}商品を抽出します（色違い${merged}件は統合済み・モデル ${extractionModel}）`);

  const records = [];
  let calls = 0; let droppedQuotes = 0; let failures = 0;

  for (const [index, productId] of targets.entries()) {
    const tallies = new Map();
    const sources = {};
    let reviewsRead = 0;

    for (const { file, source } of pages.get(productId)) {
      const text = await readFile(file, "utf8");
      if (text.trim().length < 20) continue;
      calls += 1;
      const result = await generateStructured(promptFor(aspects, text), schemaFor(aspects), { apiKey, extractionModel });
      if (!result?.aspects) { failures += 1; console.log(`  ${path.basename(file)} の抽出に失敗したので飛ばします`); continue; }
      const counted = text.split(" / ").length;
      reviewsRead += counted;
      sources[source] = (sources[source] ?? 0) + counted;

      for (const entry of result.aspects) {
        const key = byLabel.get(entry.aspect);
        if (!key) continue;
        const positive = Math.max(0, Number(entry.positive) || 0);
        const negative = Math.max(0, Number(entry.negative) || 0);
        if (!positive && !negative) continue;
        // 原則23: a quote that is not in the page it claims to come from is discarded, and the
        // count goes with it — a tally nobody can check is worth less than no tally.
        const quotes = verifiedQuotes([entry.quote ?? ""], text);
        if (!quotes.length) { droppedQuotes += 1; continue; }
        const held = tallies.get(key) ?? { key, positive: 0, negative: 0, quotes: [] };
        held.positive += positive; held.negative += negative;
        if (held.quotes.length < 3) held.quotes.push(quotes[0]);
        tallies.set(key, held);
      }
    }

    if (tallies.size) records.push({ productId, reviewsRead, sources, aspects: [...tallies.values()] });
    process.stdout.write(`${index + 1}/${targets.length} `);
  }

  const output = path.join(ROOT_DIR, "data", "genre-aspects.json");
  const existing = await readFile(output, "utf8").then(JSON.parse).catch(() => ({ genres: [] }));
  const genres = [
    ...existing.genres.filter((genre) => genre.categoryId !== categoryId),
    { categoryId, generatedAt: new Date().toISOString(), extractionModel, products: records },
  ].sort((a, b) => a.categoryId.localeCompare(b.categoryId));
  await writeAtomic(output, `${JSON.stringify({ genres }, null, 1)}\n`);

  const mentions = records.reduce((sum, record) => sum + record.aspects.length, 0);
  console.log(`\n${records.length}商品・観点${mentions}件（呼び出し${calls}回・失敗${failures}回・引用が本文に無く捨てた観点${droppedQuotes}件）→ data/genre-aspects.json`);
}

await main();

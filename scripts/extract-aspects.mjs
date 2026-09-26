import { readFile, readdir, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { CATEGORY_DEFINITIONS } from "../lib/category-definitions.ts";
import { verifiedQuotes } from "../lib/aspect-model.ts";
import { generateStructured, GeminiQuotaError } from "./gemini.ts";
import { createQuota, QuotaStop, DEFAULT_DAILY_LIMIT } from "./gemini-quota.mjs";
import { deduplicateReviews } from "../lib/review-dedup.ts";
import { checkProductInvariants, validateBatchResponse } from "../lib/extraction-invariants.ts";
import { aggregateTallies } from "../lib/quote-provenance.ts";
import { aggregateFits, checkFits } from "../lib/fit-model.ts";
import { toRow, checkRows } from "../lib/voice-model.ts";
import { schemaFor, promptFor, formatBatch } from "./extract-prompt.mjs";
import { PAGE_TEXT_DIR, loadPageMeta } from "./page-text.mjs";

/**
 * Classifying what buyers said, one review at a time.
 *
 * Each review is individually classified by Gemini — which aspects it mentions and whether
 * the sentiment is positive or negative. The code then counts. Each review contributes at
 * most one positive and one negative per aspect, so the invariants are:
 *   positive <= reviewsRead   AND   negative <= reviewsRead
 * (positive + negative may exceed reviewsRead because a single review can be both).
 *
 * Before classification, reviews from the product page and shop pages are deduplicated by
 * normalized text hash across sources. Within the same source, identical text is kept
 * (different reviewers may write the same thing).
 *
 * Usage: node --experimental-strip-types scripts/extract-aspects.mjs earbuds [--limit N]
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// UMA-FREE の表（model_tiers.ts）：3.5-flash-lite は 1分15回・1日500回・1分25万トークン。
// 前の 3.1-flash-lite は、表で1分250トークンとされていて、1回数千トークンのこの抽出では止まる（2026-09-26 に替えた）
const MODEL = "gemini-3.5-flash-lite";
const BATCH_SIZE = 30;

function readVars(text) {
  return Object.fromEntries(text.split(/\r?\n/).flatMap((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return [];
    const separator = trimmed.indexOf("=");
    return [[trimmed.slice(0, separator).trim(), trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "")]];
  }));
}

async function writeAtomic(target, contents) {
  const temporary = `${target}.tmp`;
  await writeFile(temporary, contents, "utf8");
  await rename(temporary, target);
}

// ── Reading page text files, grouped by product ─────────────────────────────

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
  return byProduct;
}

// ── Color-variant merging ───────────────────────────────────────────────────

let familyKeyFunctions = null;

async function loadFamilyKeys() {
  if (familyKeyFunctions) return familyKeyFunctions;
  try {
    const mod = await import("../test/product-selection.mjs");
    familyKeyFunctions = { modelFamilyKey: mod.modelFamilyKey, variantFamilyKey: mod.variantFamilyKey };
  } catch {
    // 色違いを1つにまとめる仕組みは、まだ無い（docs/02・未解決）。黙って進めず、そう書く
    console.warn("注意：色違いの統合はしていません（test/product-selection.mjs がありません）。色違いは別の商品として数えます。");
    familyKeyFunctions = { modelFamilyKey: () => null, variantFamilyKey: () => null };
  }
  return familyKeyFunctions;
}

function canonicalProducts(products) {
  const { modelFamilyKey, variantFamilyKey } = familyKeyFunctions;
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
  return new Set([...canonical.values()].map((p) => p.productId));
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const categoryId = args.find((value) => !value.startsWith("--")) ?? "earbuds";
  const limitFlag = args.indexOf("--limit");
  const limit = limitFlag >= 0 ? Number(args[limitFlag + 1]) : Infinity;
  const strict = !args.includes("--no-strict");

  const definition = CATEGORY_DEFINITIONS[categoryId];
  if (!definition?.aspects?.length) throw new Error(`${categoryId}: aspects が定義されていません`);
  const aspects = definition.aspects;
  const byLabel = new Map(aspects.map((a) => [a.label, a.key]));
  const fits = definition.fits ?? [];
  const byFitLabel = new Map(fits.map((f) => [f.label, f.key]));

  const fileVars = readVars(await readFile(path.join(ROOT_DIR, ".dev.vars"), "utf8").catch(() => ""));
  const apiKey = process.env.GEMINI_API_KEY || fileVars.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY が未設定です");

  const catalogue = JSON.parse(await readFile(path.join(ROOT_DIR, "data", "genre-products.json"), "utf8"));
  const products = catalogue.products.filter((item) => item.categoryId === categoryId);
  const byProductId = new Map(products.map((item) => [item.productId, item]));

  await loadFamilyKeys();
  const keptIds = canonicalProducts(products);

  const pages = await reviewPages(categoryId);
  const targets = [...pages.keys()]
    .filter((productId) => keptIds.has(productId) && byProductId.has(productId))
    .slice(0, limit);
  const merged = [...pages.keys()].filter((productId) => !keptIds.has(productId)).length;

  // --resume：同じモデルで抽出済みの商品は飛ばす（1日の上限で止まった続きから）
  if (args.includes("--resume")) {
    const done = new Set((await readFile(path.join(ROOT_DIR, "data", "genre-aspects.json"), "utf8").then(JSON.parse).catch(() => ({ genres: [] })))
      .genres.find((genre) => genre.categoryId === categoryId)?.products.filter((p) => p.extractionModel === MODEL).map((p) => p.productId) ?? []);
    const before = targets.length;
    targets.splice(0, targets.length, ...targets.filter((productId) => !done.has(productId)));
    console.log(`--resume：抽出済みの${before - targets.length}商品を飛ばします`);
  }
  const limitIndex = args.indexOf("--daily-limit");
  // 0 も上限として扱う（0 を「指定なし」と取りちがえて、実際に呼んでしまったことがある。2026-09-26）
  const limitRaw = limitIndex >= 0 ? args[limitIndex + 1] : process.env.GEMINI_DAILY_LIMIT;
  const dailyLimit = limitRaw !== undefined && limitRaw !== "" && Number.isFinite(Number(limitRaw)) ? Number(limitRaw) : DEFAULT_DAILY_LIMIT;
  const quota = await createQuota({ rootDir: ROOT_DIR, model: MODEL, dailyLimit });
  let stopped = null;
  console.log(`${targets.length}商品を抽出します（色違い${merged}件は統合済み・モデル ${MODEL}・今日の使用 ${quota.used()}／上限 ${quota.limit}回）`);

  const records = [];
  let calls = 0;
  let droppedQuotes = 0;
  let batchFailures = 0;
  let totalDupsRemoved = 0;
  let totalMissing = 0;
  const fatalErrors = [];

  for (const [index, productId] of targets.entries()) {
    // ── Step 1: Read all page text and deduplicate ──
    const rawPages = [];
    for (const { file, source, page } of pages.get(productId)) {
      const text = await readFile(file, "utf8");
      if (text.trim().length < 20) continue;
      const fileKey = path.basename(file, ".txt");
      const meta = await loadPageMeta(ROOT_DIR, categoryId, source, fileKey);
      if (!meta?.sourceUrl) {
        const msg = `${productId.slice(0, 8)} ${source}/p${page}: .meta.json がないか sourceUrl が未設定です`;
        if (strict) { fatalErrors.push(msg); continue; }
        console.log(`  ⚠ ${msg}（--no-strict のため続行）`);
      }
      rawPages.push({ source, page, text, sourceUrl: meta?.sourceUrl ?? "", ...(Array.isArray(meta?.reviews) ? { meta: meta.reviews } : {}) });
    }

    const dedup = deduplicateReviews(rawPages);
    totalDupsRemoved += dedup.duplicatesRemoved;
    if (!dedup.reviews.length) {
      process.stdout.write(`${index + 1}/${targets.length} `);
      continue;
    }

    // ── Step 2: Batch unique reviews and classify with Gemini ──
    const reviewMap = new Map(dedup.reviews.map((r) => [r.index, { text: r.text, sourceUrl: r.sourceUrl, classifications: [], fits: [], meta: r.meta }]));
    let productClassified = 0;
    let productBatchFailed = false;

    for (let batchStart = 0; batchStart < dedup.reviews.length; batchStart += BATCH_SIZE) {
      const batch = dedup.reviews.slice(batchStart, batchStart + BATCH_SIZE)
        .map((r, i) => ({ ...r, batchIndex: i + 1 }));
      const prompt = promptFor(aspects, formatBatch(batch), fits);
      let result;
      try {
        await quota.reserve();
        calls += 1;
        result = await generateStructured(prompt, schemaFor(aspects, fits), { apiKey, extractionModel: MODEL, stopOn429: true, onUsage: (tokens) => { quota.addTokens(tokens); } });
      } catch (error) {
        if (!(error instanceof QuotaStop || error instanceof GeminiQuotaError)) throw error;
        // 枠で止まった商品は途中なので書かない。ここまでに終わった商品は書く
        stopped = error.message;
        break;
      }
      if (!result?.reviews) {
        batchFailures += 1;
        productBatchFailed = true;
        const msg = `${productId.slice(0, 8)} バッチ${Math.floor(batchStart / BATCH_SIZE) + 1} の抽出に失敗`;
        console.log(`  ${msg}`);
        fatalErrors.push(msg);
        continue;
      }

      const returned = result.reviews.map((r) => r.index);
      const expected = batch.map((r) => r.batchIndex);
      const validation = validateBatchResponse(returned, expected);
      if (validation.problems.length > 0) {
        const msg = `${productId.slice(0, 8)} バッチ${Math.floor(batchStart / BATCH_SIZE) + 1}: ${validation.problems.join("; ")}`;
        console.log(`  ${msg}`);
        fatalErrors.push(msg);
        batchFailures += 1;
        productBatchFailed = true;
        totalMissing += validation.missingCount;
        continue;
      }
      productClassified += validation.classifiedCount;

      for (const reviewResult of result.reviews) {
        const batchIdx = reviewResult.index;
        const review = batch.find((r) => r.batchIndex === batchIdx);
        if (!review) continue;
        const entry = reviewMap.get(review.index);
        if (!entry) continue;

        for (const tag of reviewResult.aspects ?? []) {
          const key = byLabel.get(tag.aspect);
          if (!key) continue;

          const quotes = verifiedQuotes([tag.quote ?? ""], entry.text);
          if (!quotes.length) { droppedQuotes += 1; continue; }

          entry.classifications.push({ key, polarity: tag.polarity, quote: quotes[0] });
        }

        for (const tag of reviewResult.fits ?? []) {
          const key = byFitLabel.get(tag.aspect);
          if (!key) continue;
          const quotes = verifiedQuotes([tag.quote ?? ""], entry.text);
          if (!quotes.length) { droppedQuotes += 1; continue; }
          entry.fits.push({ key, direction: tag.direction, quote: quotes[0] });
        }
      }
    }

    if (stopped) break;

    // ── Step 3: Completeness check ──
    const reviewsRead = dedup.reviews.length;
    if (productBatchFailed && strict) {
      fatalErrors.push(`${productId}: API失敗により分類が不完全（${productClassified}/${reviewsRead}件）`);
    } else if (productClassified < reviewsRead && strict) {
      fatalErrors.push(`${productId}: 分類が不完全（${productClassified}/${reviewsRead}件、${reviewsRead - productClassified}件未返却）`);
    }

    // ── Step 4: Aggregate per-review classifications into aspect tallies ──
    const aspectList = aggregateTallies([...reviewMap.values()]);
    const fitList = fits.length ? aggregateFits([...reviewMap.values()]) : null;
    // レビュー1件ごとの記録（★・投稿月・年代・性別と、数えた観点）。本文と番号は入れない（lib/voice-model.ts）
    const rows = [...reviewMap.values()].map((entry) => toRow(entry.meta, entry.classifications, entry.fits));
    for (const message of checkRows(rows, dedup.reviews.length, aspectList)) fatalErrors.push(`${productId}: ${message}`);
    for (const message of fitList ? checkFits(fitList, dedup.reviews.length, new Set(fits.map((f) => f.key))) : []) {
      fatalErrors.push(`${productId}: ${message}`);
    }

    // ── Step 5: Invariant check (shared module) ──
    const violations = checkProductInvariants(productId, reviewsRead, aspectList);
    if (violations.length > 0) {
      for (const v of violations) {
        const msg = `${v.productId} / ${v.aspect}: ${v.message}`;
        console.log(`\n  ⚠ ${msg}`);
        fatalErrors.push(msg);
      }
      if (!strict) console.log("  (--no-strict のため続行)");
    }

    // Keep record even when aspects is empty: "read but no aspects found" is distinct from "not read"
    records.push({
      productId,
      reviewsRead,
      classifiedCount: productClassified,
      sources: dedup.sources,
      dedup: { totalBeforeDedup: dedup.totalBeforeDedup, duplicatesRemoved: dedup.duplicatesRemoved },
      aspects: aspectList,
      ...(fitList ? { fits: fitList } : {}),
      rows,
      extractionModel: MODEL,
      extractedAt: new Date().toISOString(),
    });
    process.stdout.write(`${index + 1}/${targets.length} `);
  }

  // ── Final gate ──
  if (strict && fatalErrors.length > 0) {
    console.error(`\n\n抽出失敗（strict モード）: ${fatalErrors.length}件のエラー`);
    for (const e of fatalErrors) console.error(`  ${e}`);
    console.error("\n既存の genre-aspects.json は変更しません。");
    process.exit(1);
  }

  if (stopped && !records.length) {
    console.log(`\n止めました：${stopped}\n終わった商品が無いので、genre-aspects.json は変えていません`);
    return;
  }

  const output = path.join(ROOT_DIR, "data", "genre-aspects.json");
  const existing = await readFile(output, "utf8").then(JSON.parse).catch(() => ({ genres: [] }));

  // 前の抽出を残す（2026-09-26）。楽天の商品価格ナビは、前は読めたレビューを出さなくなった商品がある
  // （soundcore Liberty 4：前は303件、今は0件）。読み直せなかった・前より少なくしか読めなかった商品は、
  // 前の件数を残す（分母が大きいほうが、引用の向きより大事）。--replace-all で前のものを捨てる。
  const previous = existing.genres.find((genre) => genre.categoryId === categoryId);
  if (previous && !args.includes("--replace-all")) {
    const fresh = new Map(records.map((record) => [record.productId, record]));
    const carried = [];
    for (const old of previous.products) {
      const now = fresh.get(old.productId);
      if (now && now.reviewsRead >= old.reviewsRead) continue;
      carried.push(`${old.productId.slice(0, 8)}（前${old.reviewsRead}件・今${now?.reviewsRead ?? 0}件）`);
      const kept = { ...old, carriedOverFrom: old.carriedOverFrom ?? previous.generatedAt };
      if (now) records[records.indexOf(now)] = kept;
      else records.push(kept);
    }
    if (carried.length) console.log(`\n前の抽出を残した商品：${carried.length}件 ${carried.join("・")}`);
  }

  const genres = [
    ...existing.genres.filter((genre) => genre.categoryId !== categoryId),
    { categoryId, generatedAt: new Date().toISOString(), extractionModel: MODEL, products: records },
  ].sort((a, b) => a.categoryId.localeCompare(b.categoryId));
  await writeAtomic(output, `${JSON.stringify({ genres }, null, 1)}\n`);

  const mentions = records.reduce((sum, r) => sum + r.aspects.length, 0);
  const totalReviews = records.reduce((sum, r) => sum + r.reviewsRead, 0);
  const totalClassified = records.reduce((sum, r) => sum + r.classifiedCount, 0);
  console.log(`\n${records.length}商品・観点${mentions}件・レビュー${totalReviews}件（分類${totalClassified}件・重複除去${totalDupsRemoved}件・呼び出し${calls}回・失敗${batchFailures}回・未返却${totalMissing}件・引用不一致${droppedQuotes}件）→ data/genre-aspects.json`);
  if (strict) console.log("不変条件チェック: 全商品通過");
  console.log(`Gemini：今日の使用 ${quota.used()}／上限 ${quota.limit}回`);
  if (stopped) console.log(`\n止めました：${stopped}\n終わった商品は書きました。続きは --resume で（抽出済みの商品を飛ばす）`);
}

await main();

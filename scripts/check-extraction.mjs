import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { CATEGORY_DEFINITIONS } from "../lib/category-definitions.ts";
import { deduplicateReviews } from "../lib/review-dedup.ts";
import { generateStructured, GeminiQuotaError } from "./gemini.ts";
import { createQuota, QuotaStop } from "./gemini-quota.mjs";
import { schemaFor, promptFor, formatBatch } from "./extract-prompt.mjs";
import { PAGE_TEXT_DIR, loadPageMeta } from "./page-text.mjs";

/**
 * 確かさを測る（オーナーの答え：足す。2026-09-26）。
 *
 * 抽出（gemini-3.5-flash-lite）の分け方を、強いモデル（gemini-3.6-flash・1日20回まで）で一部だけ見直して、合っていた割合を出す。
 * DMM の記事の「安いモデルで全件、強いモデルで難しいものだけ」の形。
 *
 * - 見直すレビュー：★と向きが食い違うもの（★1〜2 なのに よかった だけ、★5 なのに 残念だった だけ）を先に、残りは無作為
 * - くらべるのは、観点ごとの よかった／残念だった の組。強いモデルを正しいと仮に置いた一致の割合（強いモデルも間違える）
 * - 結果は .cache/checks/ に置き、要点を画面に出す
 *
 * 使い方：node --experimental-strip-types scripts/check-extraction.mjs earbuds [--calls 2]
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STRONG_MODEL = "gemini-3.6-flash";
const STRONG_DAILY_LIMIT = 5;
const BATCH = 30;
const SOURCES = ["reviews", "shop-reviews"];

async function productReviews(categoryId, productId) {
  const rawPages = [];
  for (const source of SOURCES) {
    const directory = path.join(ROOT_DIR, PAGE_TEXT_DIR, categoryId, source);
    for (const file of (await readdir(directory).catch(() => [])).filter((f) => f.startsWith(`${productId}-p`) && f.endsWith(".txt"))) {
      const text = await readFile(path.join(directory, file), "utf8");
      if (text.trim().length < 20) continue;
      const key = path.basename(file, ".txt");
      const meta = await loadPageMeta(ROOT_DIR, categoryId, source, key);
      rawPages.push({ source, page: Number(key.split("-p").pop()), text, sourceUrl: meta?.sourceUrl ?? "", ...(Array.isArray(meta?.reviews) ? { meta: meta.reviews } : {}) });
    }
  }
  return deduplicateReviews(rawPages).reviews;
}

// 毎回同じものを選ぶための、種つきの乱数
function seeded(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

const labelSet = (p, n) => new Set([...p.map((k) => `${k}:+`), ...n.map((k) => `${k}:-`)]);

async function main() {
  const args = process.argv.slice(2);
  const categoryId = args.find((v) => !v.startsWith("--") && !/^\d+$/.test(v)) ?? "earbuds";
  const callsIndex = args.indexOf("--calls");
  const calls = Math.min(STRONG_DAILY_LIMIT, callsIndex >= 0 ? Number(args[callsIndex + 1]) : 2);
  const definition = CATEGORY_DEFINITIONS[categoryId];
  const byLabel = new Map(definition.aspects.map((a) => [a.label, a.key]));

  const vars = Object.fromEntries((await readFile(path.join(ROOT_DIR, ".dev.vars"), "utf8").catch(() => "")).split(/\r?\n/).map((l) => l.split("=")).filter((x) => x.length >= 2).map(([k, ...v]) => [k.trim(), v.join("=").trim()]));
  const apiKey = process.env.GEMINI_API_KEY || vars.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY が未設定です");

  const data = JSON.parse(await readFile(path.join(ROOT_DIR, "data", "genre-aspects.json"), "utf8"));
  const genre = data.genres.find((g) => g.categoryId === categoryId);
  const pool = [];
  for (const product of genre.products.filter((p) => Array.isArray(p.rows) && p.rows.length)) {
    const reviews = await productReviews(categoryId, product.productId);
    if (reviews.length !== product.rows.length) { console.log(`  ${product.productId.slice(0, 8)}：本文と記録の数が合わないので飛ばす（${reviews.length}・${product.rows.length}）`); continue; }
    reviews.forEach((review, i) => {
      const row = product.rows[i];
      const mismatch = (row.r != null && row.r <= 2 && !row.n.length && row.p.length) || (row.r === 5 && !row.p.length && row.n.length);
      pool.push({ productId: product.productId, text: review.text, row, mismatch: !!mismatch });
    });
  }
  const rand = seeded(20260926);
  const shuffled = pool.map((x) => [rand(), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);
  const size = calls * BATCH;
  const mismatches = shuffled.filter((x) => x.mismatch).slice(0, Math.floor(size / 2));
  const picked = [...mismatches, ...shuffled.filter((x) => !x.mismatch).slice(0, size - mismatches.length)];
  console.log(`見直す：${picked.length}件（★と向きが食い違う${mismatches.length}件・無作為${picked.length - mismatches.length}件／記録のあるレビュー${pool.length}件・食い違い ${pool.filter((x) => x.mismatch).length}件）`);

  const quota = await createQuota({ rootDir: ROOT_DIR, model: STRONG_MODEL, dailyLimit: STRONG_DAILY_LIMIT, minIntervalMs: 13_000 });
  const results = [];
  // --reuse <file>：前に強いモデルが付けた答えを使い、同じレビューで今の分け方をくらべる（強いモデルを呼ばない）
  const reuseIndex = args.indexOf("--reuse");
  if (reuseIndex >= 0) {
    const before = JSON.parse(await readFile(path.resolve(ROOT_DIR, args[reuseIndex + 1]), "utf8"));
    for (const old of before.items) {
      const now = pool.find((x) => x.productId === old.productId && x.text === old.text);
      if (!now) continue;
      results.push({ ...now, strong: new Set(old.strong), lite: labelSet(now.row.p, now.row.n), mismatch: old.mismatch });
    }
    console.log(`前の答えを使う：${results.length}／${before.items.length}件（強いモデルは呼ばない）`);
    picked.length = 0;
  }
  for (let start = 0; start < picked.length; start += BATCH) {
    const batch = picked.slice(start, start + BATCH).map((x, i) => ({ ...x, batchIndex: i + 1 }));
    let result;
    try {
      await quota.reserve();
      result = await generateStructured(promptFor(definition.aspects, formatBatch(batch)), schemaFor(definition.aspects), { apiKey, extractionModel: STRONG_MODEL, stopOn429: true, onUsage: (t) => { quota.addTokens(t); } });
    } catch (error) {
      if (error instanceof QuotaStop || error instanceof GeminiQuotaError) { console.log(`止めました：${error.message}`); break; }
      throw error;
    }
    for (const r of result?.reviews ?? []) {
      const item = batch.find((b) => b.batchIndex === r.index);
      if (!item) continue;
      const strongP = [], strongN = [];
      for (const tag of r.aspects ?? []) {
        const key = byLabel.get(tag.aspect);
        if (key) (tag.polarity === "positive" ? strongP : strongN).push(key);
      }
      results.push({ ...item, strong: labelSet(strongP, strongN), lite: labelSet(item.row.p, item.row.n) });
    }
  }

  const summarize = (list) => {
    let agree = 0, liteOnly = 0, strongOnly = 0, exact = 0;
    for (const x of list) {
      const both = [...x.lite].filter((l) => x.strong.has(l)).length;
      agree += both; liteOnly += x.lite.size - both; strongOnly += x.strong.size - both;
      if (both === x.lite.size && both === x.strong.size) exact += 1;
    }
    return { reviews: list.length, exact, agree, liteOnly, strongOnly, precision: agree / (agree + liteOnly || 1), recall: agree / (agree + strongOnly || 1) };
  };
  const all = summarize(results), mis = summarize(results.filter((x) => x.mismatch)), rnd = summarize(results.filter((x) => !x.mismatch));
  const pct = (x) => `${Math.round(x * 100)}%`;
  for (const [name, s] of [["ぜんぶ", all], ["無作為", rnd], ["★と食い違い", mis]]) {
    console.log(`${name}：${s.reviews}件・分け方がまったく同じ ${s.exact}件（${pct(s.exact / (s.reviews || 1))}）・観点の一致 ${s.agree}・軽いモデルだけ ${s.liteOnly}・強いモデルだけ ${s.strongOnly}（合っていた割合 ${pct(s.precision)}・拾えていた割合 ${pct(s.recall)}）`);
  }
  const out = path.join(ROOT_DIR, ".cache", "checks", `${categoryId}-${new Date().toISOString().slice(0, 10)}${reuseIndex >= 0 ? "-reuse" : ""}.json`);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify({ model: STRONG_MODEL, summary: { all, random: rnd, mismatch: mis }, items: results.map((x) => ({ productId: x.productId, text: x.text, star: x.row.r, lite: [...x.lite], strong: [...x.strong], mismatch: x.mismatch })) }, null, 1));
  console.log(`→ ${path.relative(ROOT_DIR, out)}`);
}

await main();

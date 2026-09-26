import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { CATEGORY_DEFINITIONS } from "../lib/category-definitions.ts";
import { splitReviews } from "../lib/review-dedup.ts";
import { verifiedQuotes } from "../lib/aspect-model.ts";
import { generateStructured, GeminiQuotaError } from "./gemini.ts";
import { createQuota, QuotaStop } from "./gemini-quota.mjs";
import { PAGE_TEXT_DIR } from "./page-text.mjs";

/**
 * 観点を AI に提案させる（オーナーの答え：足す。2026-09-26）。決めるのは人（観点は人手で書く、という決まりは変えない）。
 *
 * そのカテゴリのレビューを200件ほど無作為に読ませ、買う前に知りたい観点の候補を出させる。
 * - 良し悪しで数える観点（よかった／残念だった の言葉つき）と、好みの向きで数える観点（ちょうどよさ）に分ける
 * - 候補ごとに、ふれていたレビューの一節を2つ付けさせ、原文にあるかを確かめる（無いものは「確かめられない」と書く）
 * - ブランド名・シリーズ名・「満足」のような何にでも付く言葉は観点にしない（前身で、自動で見つけるとブランド名が観点になった）
 * 結果は .cache/suggestions/ に置き、今の定義と並べて出す。Gemini は1回。
 *
 * 使い方：node --experimental-strip-types scripts/suggest-aspects.mjs earbuds [--sample 200]
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODEL = "gemini-3.5-flash-lite";

const schema = {
  type: "object",
  properties: {
    polar: { type: "array", items: { type: "object", properties: {
      word: { type: "string" }, label: { type: "string" }, positivePole: { type: "string" }, negativePole: { type: "string" },
      share: { type: "string" }, examples: { type: "array", items: { type: "string" } },
    }, required: ["word", "label", "positivePole", "negativePole", "share", "examples"] } },
    fits: { type: "array", items: { type: "object", properties: {
      word: { type: "string" }, label: { type: "string" }, low: { type: "string" }, just: { type: "string" }, high: { type: "string" },
      share: { type: "string" }, examples: { type: "array", items: { type: "string" } },
    }, required: ["word", "label", "low", "just", "high", "share", "examples"] } },
  },
  required: ["polar", "fits"],
};

const prompt = (label, reviews) => `次は「${label}」を買った人のレビューです（無作為に選んだ${reviews.length}件）。

これから買う人が「自分に合うか」「ダメな理由がないか」を知るための観点を、レビューに実際に書かれていることから選んでください。

- 良し悪しで数えられる観点（polar）を8〜12個。positivePole と negativePole は、レビューの言葉に近い短い言い方で
- 良し悪しではなく好みの向きの観点（fits）があれば0〜3個（例：サイズが小さめ｜ちょうど｜大きめ、使用感がさっぱり｜しっとり）
- word は画面に出す日常の言葉（6文字以内）。label は分類に使う少し正確な言い方
- share は、このレビューの中でふれていた割合の見立て（「多い」「ふつう」「少ない」）
- examples は、その観点にふれたレビューの本文から、そのまま抜き出した一節を2つ
- ブランド名・シリーズ名・型番・「満足」「最高」のように何にでも付く言葉は、観点にしない
- 配送・梱包・お店の対応は、商品そのものの観点ではないので入れない

--- レビュー ---
${reviews.map((r, i) => `[${i + 1}] ${r}`).join("\n")}`;

function seeded(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

async function main() {
  const args = process.argv.slice(2);
  const categoryId = args.find((v) => !v.startsWith("--") && !/^\d+$/.test(v)) ?? "earbuds";
  const sampleIndex = args.indexOf("--sample");
  const sample = sampleIndex >= 0 ? Number(args[sampleIndex + 1]) : 200;
  const label = CATEGORY_DEFINITIONS[categoryId]?.label ?? categoryId;

  const vars = Object.fromEntries((await readFile(path.join(ROOT_DIR, ".dev.vars"), "utf8").catch(() => "")).split(/\r?\n/).map((l) => l.split("=")).filter((x) => x.length >= 2).map(([k, ...v]) => [k.trim(), v.join("=").trim()]));
  const apiKey = process.env.GEMINI_API_KEY || vars.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY が未設定です");

  const texts = [];
  for (const source of ["reviews", "shop-reviews"]) {
    const dir = path.join(ROOT_DIR, PAGE_TEXT_DIR, categoryId, source);
    for (const f of (await readdir(dir).catch(() => [])).filter((n) => n.endsWith(".txt"))) {
      for (const r of splitReviews(await readFile(path.join(dir, f), "utf8"))) if (r.length >= 15) texts.push(r);
    }
  }
  if (!texts.length) throw new Error(`${categoryId}：読んだレビューがありません（先に fetch-reviews）`);
  const rand = seeded(20260926);
  const picked = texts.map((t) => [rand(), t]).sort((a, b) => a[0] - b[0]).slice(0, sample).map(([, t]) => t.slice(0, 220));
  const joined = picked.join("\n");

  const quota = await createQuota({ rootDir: ROOT_DIR, model: MODEL, dailyLimit: 300 });
  let result;
  try {
    await quota.reserve();
    result = await generateStructured(prompt(label, picked), schema, { apiKey, extractionModel: MODEL, stopOn429: true, onUsage: (t) => { quota.addTokens(t); } });
  } catch (error) {
    if (error instanceof QuotaStop || error instanceof GeminiQuotaError) { console.log(`止めました：${error.message}`); return; }
    throw error;
  }
  if (!result) throw new Error("提案が返ってきませんでした");

  const check = (list) => list.map((a) => ({ ...a, examples: a.examples.map((e) => ({ text: e, found: verifiedQuotes([e], joined).length > 0 })) }));
  const out = { categoryId, model: MODEL, sampled: picked.length, from: texts.length, polar: check(result.polar ?? []), fits: check(result.fits ?? []) };
  const file = path.join(ROOT_DIR, ".cache", "suggestions", `${categoryId}-${new Date().toISOString().slice(0, 10)}.json`);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(out, null, 1));

  const current = CATEGORY_DEFINITIONS[categoryId];
  console.log(`${label}：${texts.length}件から${picked.length}件を読ませた（Gemini 1回）`);
  console.log(`\n今の定義：${current ? current.aspects.map((a) => a.word ?? a.label).join("・") : "なし"}${current?.fits?.length ? `／好み：${current.fits.map((f) => f.word ?? f.label).join("・")}` : ""}`);
  console.log("\nAI の提案（良し悪し）");
  for (const a of out.polar) console.log(`  ${a.word}（${a.label}）${a.positivePole}｜${a.negativePole}・${a.share}・例 ${a.examples.filter((e) => e.found).length}/${a.examples.length} 件が原文どおり`);
  console.log("AI の提案（好みの向き）");
  for (const a of out.fits) console.log(`  ${a.word}（${a.label}）${a.low}｜${a.just}｜${a.high}・${a.share}`);
  console.log(`→ ${path.relative(ROOT_DIR, file)}`);
}

await main();

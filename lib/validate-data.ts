import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { checkGenreInvariants, validateGenreStructure } from "./extraction-invariants.ts";
import { CATEGORY_DEFINITIONS } from "./category-definitions.ts";
import { checkPublishability } from "./aspect-model.ts";
import { checkFits } from "./fit-model.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const raw = await readFile(path.join(ROOT, "data", "genre-aspects.json"), "utf8");
const data = JSON.parse(raw);

if (!Array.isArray(data?.genres)) {
  console.error("data.genres が配列ではありません");
  process.exit(1);
}

let totalViolations = 0;
const structuralErrors: string[] = [];

for (const genre of data.genres) {
  const categoryDef = CATEGORY_DEFINITIONS[genre?.categoryId];
  const knownKeys = categoryDef
    ? new Set(categoryDef.aspects.map((a) => a.key))
    : undefined;

  const structErrors = validateGenreStructure(genre, knownKeys);
  for (const e of structErrors) structuralErrors.push(`${e.path}: ${e.message}`);
  // ちょうどよさ（fits）。無い商品（前のデータ）はそのまま通る
  const knownFitKeys = categoryDef ? new Set((categoryDef.fits ?? []).map((f) => f.key)) : undefined;
  for (const p of genre.products ?? []) {
    for (const e of checkFits(p?.fits, p?.reviewsRead ?? 0, knownFitKeys)) {
      structErrors.push({ path: `${genre.categoryId}/${p?.productId}`, message: e });
      structuralErrors.push(`${genre.categoryId}/${p?.productId}: ${e}`);
    }
  }

  if (structErrors.length > 0) continue;

  const violations = checkGenreInvariants(genre.products);
  if (violations.length > 0) {
    console.error(`\n${genre.categoryId}: ${violations.length}件の不変条件違反`);
    for (const v of violations) {
      console.error(`  ${v.productId} / ${v.aspect}: ${v.message}`);
    }
    totalViolations += violations.length;
  }

  if (categoryDef) {
    const aspectProducts = genre.products
      .filter((p: any) => p.aspects?.length > 0)
      .map((p: any) => ({ id: p.productId, reviewsRead: p.reviewsRead, aspects: p.aspects }));
    const pub = checkPublishability(aspectProducts, categoryDef.aspects);
    if (!pub.publishable) {
      console.warn(`\n${genre.categoryId}: 公開条件を満たしていません（リンクは生成されません）`);
      for (const b of pub.blockers) console.warn(`  ${b}`);
    }
  }
}

if (structuralErrors.length > 0) {
  console.error(`\n構造検証エラー: ${structuralErrors.length}件`);
  for (const e of structuralErrors) console.error(`  ${e}`);
}

const errorCount = totalViolations + structuralErrors.length;
if (errorCount > 0) {
  console.error(`\n合計 ${errorCount} 件の違反。このデータでは公開できません。`);
  process.exit(1);
} else {
  console.log("validate:data — 全商品が不変条件を満たしています");
}

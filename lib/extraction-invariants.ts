/**
 * Invariants that must hold after extraction. If any fails, the data is not publishable.
 *
 * These exist because the old pipeline let Gemini return aggregate counts directly, and
 * positive=6 from reviewsRead=4 slipped through. With per-review extraction, M > N is
 * structurally impossible — but the check stays as a safety net: if the counting code is
 * ever wrong, the build fails rather than publishing a lie.
 */

export type AspectTally = {
  key: string;
  positive: number;
  negative: number;
};

export type Violation = {
  productId: string;
  aspect: string;
  message: string;
};

export function checkProductInvariants(
  productId: string,
  reviewsRead: number,
  aspects: readonly AspectTally[],
): Violation[] {
  const violations: Violation[] = [];
  for (const aspect of aspects) {
    if (aspect.positive > reviewsRead) {
      violations.push({
        productId,
        aspect: aspect.key,
        message: `positive ${aspect.positive} > reviewsRead ${reviewsRead}`,
      });
    }
    if (aspect.negative > reviewsRead) {
      violations.push({
        productId,
        aspect: aspect.key,
        message: `negative ${aspect.negative} > reviewsRead ${reviewsRead}`,
      });
    }
    if (aspect.positive < 0 || aspect.negative < 0) {
      violations.push({
        productId,
        aspect: aspect.key,
        message: `negative count: positive=${aspect.positive} negative=${aspect.negative}`,
      });
    }
  }
  return violations;
}

export type BatchValidation = {
  problems: string[];
  classifiedCount: number;
  missingCount: number;
};

/**
 * Check whether a Gemini batch response returned every expected index exactly once.
 *
 * Returns problems for out-of-range indices, duplicates, and missing indices.
 * Any non-empty problems list means the batch is unreliable — in strict mode the
 * extraction fails, in non-strict the batch is skipped.
 */
export function validateBatchResponse(
  returnedIndices: readonly number[],
  expectedIndices: readonly number[],
): BatchValidation {
  const expected = new Set(expectedIndices);
  const returned = new Set<number>();
  const problems: string[] = [];

  for (const idx of returnedIndices) {
    if (!expected.has(idx)) {
      problems.push(`範囲外のindex ${idx}`);
      continue;
    }
    if (returned.has(idx)) {
      problems.push(`重複index ${idx}`);
      continue;
    }
    returned.add(idx);
  }

  const missing = [...expected].filter((i) => !returned.has(i));
  if (missing.length > 0) problems.push(`未返却index: ${missing.join(", ")}`);

  return { problems, classifiedCount: returned.size, missingCount: missing.length };
}

export function checkGenreInvariants(
  products: readonly { productId: string; reviewsRead: number; aspects: readonly AspectTally[] }[],
): Violation[] {
  return products.flatMap((p) => checkProductInvariants(p.productId, p.reviewsRead, p.aspects));
}

// ── Structural validation ─────────────────────────────────────────────────

export type StructuralError = {
  path: string;
  message: string;
};

/**
 * Validate the structure of a genre object from genre-aspects.json.
 *
 * Catches missing/null/wrong-type fields that `checkGenreInvariants` assumes are
 * already correct. Without this gate, a truncated JSON or a pipeline bug that drops
 * `products` would pass validation silently — and then crash the data-loader at
 * runtime when it iterates `genre.products` without a fallback.
 */
export function validateGenreStructure(
  genre: any,
  knownAspectKeys?: ReadonlySet<string>,
): StructuralError[] {
  const errors: StructuralError[] = [];

  if (typeof genre?.categoryId !== "string" || genre.categoryId === "") {
    errors.push({ path: "(root)", message: "categoryId が空でない文字列ではありません" });
    return errors;
  }
  const cid: string = genre.categoryId;

  if (!Array.isArray(genre.products)) {
    errors.push({ path: cid, message: "products が配列ではありません" });
    return errors;
  }

  const seenIds = new Set<string>();

  for (const product of genre.products) {
    if (typeof product?.productId !== "string" || product.productId === "") {
      errors.push({ path: cid, message: "productId が空でない文字列ではありません" });
      continue;
    }
    const pid: string = product.productId;
    const pp = `${cid}/${pid}`;

    if (seenIds.has(pid)) {
      errors.push({ path: pp, message: "productId が重複しています" });
    }
    seenIds.add(pid);

    if (!Number.isInteger(product.reviewsRead) || product.reviewsRead < 0) {
      errors.push({ path: pp, message: `reviewsRead が非負整数ではありません（${product.reviewsRead}）` });
    }

    if ("classifiedCount" in product) {
      if (!Number.isInteger(product.classifiedCount) || product.classifiedCount < 0) {
        errors.push({ path: pp, message: `classifiedCount が非負整数ではありません（${product.classifiedCount}）` });
      } else if (product.classifiedCount !== product.reviewsRead) {
        errors.push({ path: pp, message: `classifiedCount(${product.classifiedCount}) ≠ reviewsRead(${product.reviewsRead}) — 抽出が不完全です` });
      }
    }

    if (!Array.isArray(product.aspects)) {
      errors.push({ path: pp, message: "aspects が配列ではありません" });
      continue;
    }

    const seenKeys = new Set<string>();
    for (const aspect of product.aspects) {
      if (typeof aspect?.key !== "string" || aspect.key === "") {
        errors.push({ path: pp, message: "aspect.key が空でない文字列ではありません" });
        continue;
      }
      const ap = `${pp}/${aspect.key}`;

      if (seenKeys.has(aspect.key)) {
        errors.push({ path: ap, message: "aspect.key が重複しています" });
      }
      seenKeys.add(aspect.key);

      if (knownAspectKeys && !knownAspectKeys.has(aspect.key)) {
        errors.push({ path: ap, message: "未知の観点キーです" });
      }

      if (!Number.isInteger(aspect.positive) || aspect.positive < 0) {
        errors.push({ path: ap, message: `positive が非負整数ではありません（${aspect.positive}）` });
      }
      if (!Number.isInteger(aspect.negative) || aspect.negative < 0) {
        errors.push({ path: ap, message: `negative が非負整数ではありません（${aspect.negative}）` });
      }

      // ── Quote validation ──
      if (!Array.isArray(aspect.quotes)) {
        errors.push({ path: ap, message: "quotes が配列ではありません" });
      } else {
        const mentionCount = (aspect.positive ?? 0) + (aspect.negative ?? 0);
        if (mentionCount > 0 && aspect.quotes.length === 0) {
          errors.push({ path: ap, message: "言及があるのに引用が0件です" });
        }

        // 向きの付いた引用（2026-09-26 以降の抽出）。付いているなら全部に付いていて、件数のある側には引用がある
        const sided = aspect.quotes.filter((q: { polarity?: unknown }) => q && typeof q === "object" && "polarity" in q);
        if (sided.length && sided.length !== aspect.quotes.length) {
          errors.push({ path: ap, message: "向きの付いた引用と付いていない引用が混ざっています" });
        }
        if (sided.length) {
          if ((aspect.positive ?? 0) > 0 && !sided.some((q: { polarity?: unknown }) => q.polarity === "positive")) {
            errors.push({ path: ap, message: "よかったの件数があるのに、よかった側の引用がありません" });
          }
          if ((aspect.negative ?? 0) > 0 && !sided.some((q: { polarity?: unknown }) => q.polarity === "negative")) {
            errors.push({ path: ap, message: "残念だったの件数があるのに、残念だった側の引用がありません" });
          }
        }

        const seenTexts = new Set<string>();
        for (const [qi, quote] of aspect.quotes.entries()) {
          const qp = `${ap}/quotes[${qi}]`;

          if (typeof quote !== "object" || quote === null) {
            errors.push({ path: qp, message: "引用がオブジェクトではありません" });
            continue;
          }

          if ("polarity" in quote && quote.polarity !== "positive" && quote.polarity !== "negative") {
            errors.push({ path: qp, message: `polarity が positive / negative ではありません（${quote.polarity}）` });
          }

          // 同じ文でも、別のレビューで逆の側に数えられたものは別の引用として持つ
          const textKey = `${quote.polarity ?? ""}:${quote.text}`;
          if (typeof quote.text !== "string" || quote.text.trim().length < 6) {
            errors.push({ path: qp, message: "text が6文字未満または未設定です" });
          } else if (seenTexts.has(textKey)) {
            errors.push({ path: qp, message: "text が同一 tally 内で重複しています" });
          } else {
            seenTexts.add(textKey);
          }

          if (typeof quote.reviewUrl !== "string" || quote.reviewUrl === "") {
            errors.push({ path: qp, message: "reviewUrl が未設定です" });
          } else {
            const valid = validateReviewUrl(quote.reviewUrl);
            if (valid) errors.push({ path: qp, message: valid });
          }
        }
      }
    }
  }

  return errors;
}

function validateReviewUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return `reviewUrl が有効なURLではありません（${raw}）`;
  }
  if (url.protocol !== "https:") {
    return `reviewUrl が https ではありません（${url.protocol}）`;
  }
  if (url.hostname === "product.rakuten.co.jp") {
    if (!url.pathname.includes("/review/")) {
      return `product.rakuten.co.jp のパスに /review/ が含まれていません（${url.pathname}）`;
    }
    return null;
  }
  if (url.hostname === "review.rakuten.co.jp") {
    if (!url.pathname.includes("/item/1/")) {
      return `review.rakuten.co.jp のパスに /item/1/ が含まれていません（${url.pathname}）`;
    }
    return null;
  }
  return `reviewUrl のホストが想定外です（${url.hostname}）`;
}

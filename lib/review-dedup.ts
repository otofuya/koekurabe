import { createHash } from "node:crypto";
import type { StructuredReview } from "./review-json.ts";

/** レビュー1件ごとのデータ（★・日付・年代・性別など。lib/review-json.ts）。本文は含まない。 */
export type ReviewMeta = Omit<StructuredReview, "body">;

export type RawPage = {
  source: string;
  page: number;
  text: string;
  sourceUrl: string;
  /** 本文の並び（" / " で分けた順）と同じ並びの、レビューごとのデータ。数が合わないときは使わない。 */
  meta?: readonly ReviewMeta[];
};

export type UniqueReview = {
  index: number;
  text: string;
  hash: string;
  source: string;
  page: number;
  sourceUrl: string;
  meta?: ReviewMeta;
};

export type DeduplicationResult = {
  reviews: UniqueReview[];
  sources: Record<string, number>;
  duplicatesRemoved: number;
  totalBeforeDedup: number;
};

export function splitReviews(pageText: string): string[] {
  return pageText.split(" / ").map((r) => r.trim()).filter((r) => r.length > 0);
}

export function normalizeForDedup(text: string): string {
  return text.normalize("NFKC").replace(/\s+/g, " ").trim();
}

export function reviewHash(normalizedText: string): string {
  return createHash("sha256").update(normalizedText).digest("hex").slice(0, 16);
}

/**
 * Deduplicate reviews across sources for one product.
 *
 * The "reviews" source (product page) is processed first so it wins when the same text
 * appears in both sources. Measured on the earbuds set: 19 of 24 products have identical
 * counts between reviews and shop-reviews, and the texts are the same population fetched
 * from two URLs. Without this, the pipeline double-counts every review those 19 products have.
 *
 * Within the same source, identical text is kept: different buyers may independently write
 * "良かったです" or other short reviews.
 *
 * Cross-source dedup is count-aware: if the primary source has N copies and the secondary
 * has M, only min(N, M) are removed from the secondary — the excess M − N copies are kept
 * as distinct reviewers. Without this, reviews=1 + shop=2 incorrectly collapses to 1.
 */
export function deduplicateReviews(pages: readonly RawPage[]): DeduplicationResult {
  const sorted = [...pages].sort((a, b) => {
    if (a.source === "reviews" && b.source !== "reviews") return -1;
    if (a.source !== "reviews" && b.source === "reviews") return 1;
    return a.page - b.page;
  });

  type Entry = { text: string; hash: string; source: string; page: number; sourceUrl: string; meta?: ReviewMeta };
  const entries: Entry[] = [];
  let totalBeforeDedup = 0;
  const hashSourceCounts = new Map<string, Map<string, number>>();

  for (const rawPage of sorted) {
    const individuals = splitReviews(rawPage.text);
    totalBeforeDedup += individuals.length;
    const aligned = rawPage.meta && rawPage.meta.length === individuals.length ? rawPage.meta : null;
    for (const [position, text] of individuals.entries()) {
      const normalized = normalizeForDedup(text);
      const hash = reviewHash(normalized);
      entries.push({ text, hash, source: rawPage.source, page: rawPage.page, sourceUrl: rawPage.sourceUrl, meta: aligned?.[position] });
      if (!hashSourceCounts.has(hash)) hashSourceCounts.set(hash, new Map());
      const sc = hashSourceCounts.get(hash)!;
      sc.set(rawPage.source, (sc.get(rawPage.source) ?? 0) + 1);
    }
  }

  // For each hash appearing in multiple sources, compute how many the secondary
  // source may keep: max(0, secondaryCount − primaryCount).
  const secondaryQuotas = new Map<string, Map<string, number>>();
  for (const [hash, sourceCounts] of hashSourceCounts) {
    const sourceEntries = [...sourceCounts.entries()];
    if (sourceEntries.length < 2) continue;
    const primaryCount = sourceEntries[0][1];
    const quotas = new Map<string, number>();
    for (let i = 1; i < sourceEntries.length; i++) {
      quotas.set(sourceEntries[i][0], Math.max(0, sourceEntries[i][1] - primaryCount));
    }
    secondaryQuotas.set(hash, quotas);
  }

  const emitted = new Map<string, Map<string, number>>();
  const reviews: UniqueReview[] = [];
  const sources: Record<string, number> = {};
  let index = 0;

  for (const entry of entries) {
    const quotas = secondaryQuotas.get(entry.hash);
    if (quotas) {
      const allowed = quotas.get(entry.source);
      if (allowed !== undefined) {
        if (!emitted.has(entry.hash)) emitted.set(entry.hash, new Map());
        const ec = emitted.get(entry.hash)!;
        const already = ec.get(entry.source) ?? 0;
        if (already >= allowed) continue;
        ec.set(entry.source, already + 1);
      }
    }

    reviews.push({ index, text: entry.text, hash: entry.hash, source: entry.source, page: entry.page, sourceUrl: entry.sourceUrl, ...(entry.meta ? { meta: entry.meta } : {}) });
    sources[entry.source] = (sources[entry.source] ?? 0) + 1;
    index += 1;
  }

  return { reviews, sources, duplicatesRemoved: totalBeforeDedup - reviews.length, totalBeforeDedup };
}

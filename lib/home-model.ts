import type { AspectProduct } from "./aspect-model.ts";
import type { AspectDefinition } from "./category-definitions.ts";
import { verdict } from "./aspect-model.ts";
import type { JoinedProduct } from "./types.ts";

export type FeaturedProduct = {
  product: JoinedProduct;
  totalMentions: number;
  praised: { label: string; positive: number }[];
  blamed: { label: string; negative: number }[];
  reviewsRead: number;
};

export function selectFeatured(
  joined: JoinedProduct[],
  definitions: readonly AspectDefinition[],
  limit = 8,
): FeaturedProduct[] {
  const candidates: { product: JoinedProduct; totalMentions: number; ap: AspectProduct }[] = [];

  for (const p of joined) {
    if (!p.aspects || p.reviewsRead === null) continue;
    const ap: AspectProduct = { id: p.productId, reviewsRead: p.reviewsRead, aspects: p.aspects };
    let total = 0;
    for (const a of p.aspects) total += a.positive + a.negative;
    if (total === 0) continue;
    candidates.push({ product: p, totalMentions: total, ap });
  }

  candidates.sort(
    (a, b) =>
      b.totalMentions - a.totalMentions ||
      a.product.name.localeCompare(b.product.name, "ja-JP") ||
      a.product.productId.localeCompare(b.product.productId),
  );

  return candidates.slice(0, limit).map(({ product, totalMentions, ap }) => {
    const v = verdict(ap, definitions);
    return {
      product,
      totalMentions,
      praised: v.praised.slice(0, 2).map((l) => ({ label: l.label, positive: l.positive })),
      blamed: v.blamed.slice(0, 2).map((l) => ({ label: l.label, negative: l.negative })),
      reviewsRead: ap.reviewsRead,
    };
  });
}

export function normalizeQuery(q: string): string {
  return q.normalize("NFKC").toLocaleLowerCase("ja-JP").trim();
}

export function searchProducts(
  products: JoinedProduct[],
  rawQuery: string,
  limit = 10,
): JoinedProduct[] {
  const q = normalizeQuery(rawQuery);
  if (!q) return [];
  return products
    .filter((p) => {
      const name = normalizeQuery(p.name);
      const brand = normalizeQuery(p.brand);
      return name.includes(q) || brand.includes(q);
    })
    .slice(0, limit);
}

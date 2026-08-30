import type { AspectProduct, VerdictLine } from "./aspect-model.ts";
import type { AspectDefinition } from "./category-definitions.ts";
import { verdict } from "./aspect-model.ts";
import type { JoinedProduct } from "./types.ts";

export type ListStatus = "analyzed" | "unread";
export type ListSortKey = "mentions" | "price" | "reviews-read";

export type ListCard = {
  product: JoinedProduct;
  status: ListStatus;
  praised: VerdictLine[];
  blamed: VerdictLine[];
  reviewsRead: number | null;
  totalMentions: number;
};

export function buildListCards(
  joined: readonly JoinedProduct[],
  definitions: readonly AspectDefinition[],
): ListCard[] {
  return joined.map((p) => {
    if (p.aspects !== null && p.reviewsRead !== null) {
      const ap: AspectProduct = {
        id: p.productId,
        reviewsRead: p.reviewsRead,
        aspects: p.aspects,
      };
      let totalMentions = 0;
      for (const a of p.aspects) totalMentions += a.positive + a.negative;
      const v = verdict(ap, definitions);
      return {
        product: p,
        status: "analyzed" as const,
        praised: v.praised.slice(0, 2),
        blamed: v.blamed.slice(0, 2),
        reviewsRead: p.reviewsRead,
        totalMentions,
      };
    }
    return {
      product: p,
      status: "unread" as const,
      praised: [],
      blamed: [],
      reviewsRead: null,
      totalMentions: 0,
    };
  });
}

export function sortListCards(
  cards: readonly ListCard[],
  sortKey: ListSortKey,
): ListCard[] {
  return [...cards].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "analyzed" ? -1 : 1;
    }

    switch (sortKey) {
      case "mentions":
        if (a.status === "analyzed") {
          if (a.totalMentions !== b.totalMentions)
            return b.totalMentions - a.totalMentions;
        } else {
          if (a.product.price !== b.product.price)
            return a.product.price - b.product.price;
        }
        break;
      case "price":
        if (a.product.price !== b.product.price)
          return a.product.price - b.product.price;
        break;
      case "reviews-read":
        if (a.status === "analyzed") {
          const aRead = a.reviewsRead ?? 0;
          const bRead = b.reviewsRead ?? 0;
          if (aRead !== bRead) return bRead - aRead;
        }
        break;
    }

    const nameCompare = a.product.name.localeCompare(b.product.name, "ja-JP");
    if (nameCompare !== 0) return nameCompare;
    return a.product.productId.localeCompare(b.product.productId);
  });
}

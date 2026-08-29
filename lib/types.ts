import type { AspectTally } from "./aspect-model.ts";

export type JoinedProduct = {
  productId: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  reviewCount: number;
  reviewAverage: number;
  reviewsRead: number | null;
  aspects: AspectTally[] | null;
};

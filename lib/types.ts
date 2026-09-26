import type { AspectTally } from "./aspect-model.ts";
import type { FitTally } from "./fit-model.ts";

export type Spec = {
  key: string;
  label: string;
  value: number | boolean | string;
  displayValue: string;
  unit: string | null;
  provenance: "ec_api" | "official" | "llm_inferred";
};

export type JoinedProduct = {
  productId: string;
  name: string;
  brand: string;
  model: string | null;
  price: number;
  imageUrl: string;
  productUrl: string;
  reviewCount: number;
  reviewAverage: number;
  reviewsRead: number | null;
  aspects: AspectTally[] | null;
  /** ちょうどよさ（小さめ・ちょうど・大きめ）。前のデータや、その観点が無いカテゴリでは null。 */
  fits?: FitTally[] | null;
  specs: Spec[];
};

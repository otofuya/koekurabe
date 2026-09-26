import type { AspectProduct, AspectTally } from "./aspect-model.ts";
import type { FitTally } from "./fit-model.ts";
import type { VoiceRow } from "./voice-model.ts";
import type { JoinedProduct, Spec } from "./types.ts";
import productsJson from "../data/genre-products.json";
import aspectsJson from "../data/genre-aspects.json";

type RawProduct = (typeof productsJson)["products"][number];

const VALID_PROVENANCE = new Set(["ec_api", "official", "llm_inferred"]);

function parseSpecs(raw: RawProduct): Spec[] {
  const arr = (raw as Record<string, unknown>).specs;
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(
      (s): s is Spec =>
        s != null &&
        typeof s === "object" &&
        typeof (s as Spec).key === "string" &&
        VALID_PROVENANCE.has((s as Spec).provenance) &&
        // 販売ページから、値の代わりにお店の URL が入ってきたことがある（Bluetooth の欄に URL）。仕様ではないので出さない
        !/https?:\/\/|www\./i.test(String((s as Spec).displayValue)),
    )
    .map((s) => {
      if (s.unit && !s.displayValue.includes(s.unit)) {
        return { ...s, displayValue: s.displayValue + s.unit };
      }
      return s;
    });
}

type RawAspectProduct = (typeof aspectsJson)["genres"][number]["products"][number];

export function loadGenre(categoryId: string) {
  const products = productsJson.products.filter(
    (p) => p.categoryId === categoryId,
  );
  const genre = aspectsJson.genres.find((g) => g.categoryId === categoryId);
  const aspectMap = new Map<string, RawAspectProduct>();
  if (genre) {
    for (const ap of genre.products) {
      aspectMap.set(ap.productId, ap);
    }
  }

  const joined: JoinedProduct[] = products.map((p) => {
    const asp = aspectMap.get(p.productId);
    return {
      productId: p.productId,
      name: p.name,
      brand: p.brand,
      model: p.model,
      price: p.price,
      imageUrl: p.imageUrl,
      productUrl: p.productUrl,
      reviewCount: p.reviewCount,
      reviewAverage: p.reviewAverage,
      reviewsRead: asp ? asp.reviewsRead : null,
      // JSON からは polarity がただの文字列として型づけされる。値は validate:data が確かめている
      aspects: asp ? (asp.aspects as AspectTally[]) : null,
      fits: ((asp as { fits?: FitTally[] } | undefined)?.fits as FitTally[] | undefined) ?? null,
      rows: ((asp as { rows?: VoiceRow[] } | undefined)?.rows as VoiceRow[] | undefined) ?? null,
      specs: parseSpecs(p),
    };
  });

  const aspectProducts: AspectProduct[] = joined.flatMap((p) =>
    p.aspects
      ? [{ id: p.productId, reviewsRead: p.reviewsRead!, aspects: p.aspects }]
      : [],
  );

  return {
    joined,
    aspectProducts,
    totalProducts: products.length,
    // 値段・★を取った日。カテゴリのページから取った商品は fetchedAt を持つ（2026-09-26〜）。無ければ一覧全体の日
    generatedAt: products.map((p) => (p as { fetchedAt?: string }).fetchedAt).filter((d): d is string => !!d).sort().pop() ?? productsJson.generatedAt,
  };
}

export type GenreData = ReturnType<typeof loadGenre> & { categoryId: string };

export function loadAllGenres(): GenreData[] {
  const categoryIds = [...new Set(productsJson.products.map((p) => p.categoryId))];
  return categoryIds.map((categoryId) => ({
    categoryId,
    ...loadGenre(categoryId),
  }));
}

export function loadProduct(productId: string) {
  const raw = productsJson.products.find((p) => p.productId === productId);
  if (!raw) return null;
  const genre = loadGenre(raw.categoryId);
  const product = genre.joined.find((p) => p.productId === productId)!;
  return { product, ...genre, categoryId: raw.categoryId };
}

import type { AspectProduct } from "./aspect-model.ts";
import type { JoinedProduct, Spec } from "./types.ts";
import productsJson from "../data/genre-products.json";
import aspectsJson from "../data/genre-aspects.json";

type RawProduct = (typeof productsJson)["products"][number];

const VALID_PROVENANCE = new Set(["ec_api", "official", "llm_inferred"]);

function parseSpecs(raw: RawProduct): Spec[] {
  const arr = (raw as Record<string, unknown>).specs;
  if (!Array.isArray(arr)) return [];
  return arr.filter(
    (s): s is Spec =>
      s != null &&
      typeof s === "object" &&
      typeof (s as Spec).key === "string" &&
      VALID_PROVENANCE.has((s as Spec).provenance),
  );
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
      aspects: asp ? asp.aspects : null,
      specs: parseSpecs(p),
    };
  });

  const aspectProducts: AspectProduct[] = joined.flatMap((p) =>
    p.aspects
      ? [{ id: p.productId, reviewsRead: p.reviewsRead!, aspects: p.aspects }]
      : [],
  );

  return { joined, aspectProducts, totalProducts: products.length };
}

export function loadProduct(productId: string) {
  const raw = productsJson.products.find((p) => p.productId === productId);
  if (!raw) return null;
  const genre = loadGenre(raw.categoryId);
  const product = genre.joined.find((p) => p.productId === productId)!;
  return { product, ...genre, categoryId: raw.categoryId };
}

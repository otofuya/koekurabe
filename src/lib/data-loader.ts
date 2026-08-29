import type { AspectProduct } from "@ref/aspect-model.ts";
import type { JoinedProduct } from "./types.ts";
import productsJson from "../../data/genre-products.json";
import aspectsJson from "../../data/genre-aspects.json";

type RawProduct = (typeof productsJson)["products"][number];
type RawGenre = (typeof aspectsJson)["genres"][number];
type RawAspectProduct = RawGenre["products"][number];

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
    };
  });

  const aspectProducts: AspectProduct[] = joined.flatMap((p) =>
    p.aspects
      ? [{ id: p.productId, reviewsRead: p.reviewsRead!, aspects: p.aspects }]
      : [],
  );

  return { joined, aspectProducts, totalProducts: products.length };
}

import { loadGenre } from "@lib/data-loader.ts";
import { offerableAxes, coverageOf } from "@lib/aspect-model.ts";
import type { AspectProduct } from "@lib/aspect-model.ts";
import { CATEGORY_DEFINITIONS, aspectsFor, fitsFor, wordOf } from "@lib/category-definitions.ts";
import type { JoinedProduct } from "@lib/types.ts";
import type { Priced } from "@lib/nakami-model.ts";
import { READ_ENOUGH } from "@lib/nakami-model.ts";
import productsJson from "../../data/genre-products.json";

/** カテゴリ1つぶんの、画面が使う形。読み込みは1回だけ。 */
export type Genre = ReturnType<typeof build>;

function build(categoryId: string) {
  const loaded = loadGenre(categoryId);
  const defs = aspectsFor(categoryId);
  const order = defs.map((d) => d.key);
  const words = new Map(defs.map((d) => [d.key, wordOf(d)]));
  const fitDefs = fitsFor(categoryId);
  const byId = new Map(loaded.joined.map((p) => [p.productId, p]));
  const analysed: AspectProduct[] = loaded.aspectProducts;
  const pool: Priced[] = analysed.map((a) => ({ ...a, price: byId.get(a.id)!.price }));
  const axes = offerableAxes(analysed, defs);
  return {
    id: categoryId,
    label: CATEGORY_DEFINITIONS[categoryId]?.label ?? categoryId,
    joined: loaded.joined,
    byId,
    analysed,
    pool,
    order,
    word: (key: string) => words.get(key) ?? key,
    /** その観点と同じことを言う仕様のキー（公式・販売ページ）。 */
    specKeys: (key: string) => defs.find((d) => d.key === key)?.specKeys ?? [],
    /** ちょうどよさの観点（小さめ・ちょうど・大きめ）。定義の順。 */
    fits: fitDefs,
    axes,
    offerable: axes.filter((a) => a.offerable).map((a) => a.key),
    defaultKey: CATEGORY_DEFINITIONS[categoryId]?.defaultAxes?.[0] ?? axes.find((a) => a.offerable)?.key ?? order[0],
    coverage: coverageOf(loaded.totalProducts, analysed),
    /** くわしく読めた（30件以上）商品の数。 */
    readEnough: analysed.filter((a) => a.reviewsRead >= READ_ENOUGH).length,
    generatedAt: loaded.generatedAt,
  };
}

const cache = new Map<string, Genre>();
export function genre(categoryId: string): Genre | null {
  if (!CATEGORY_DEFINITIONS[categoryId] && !productsJson.products.some((p) => p.categoryId === categoryId)) return null;
  if (!cache.has(categoryId)) cache.set(categoryId, build(categoryId));
  return cache.get(categoryId)!;
}

export const categoryIds = () => [...new Set(productsJson.products.map((p) => p.categoryId))];

export function findProduct(id: string): { product: JoinedProduct; genre: Genre } | null {
  const raw = productsJson.products.find((p) => p.productId === id);
  if (!raw) return null;
  const g = genre(raw.categoryId)!;
  return { product: g.byId.get(id)!, genre: g };
}

export const asAspect = (p: JoinedProduct): AspectProduct | null =>
  p.aspects && p.reviewsRead ? { id: p.productId, reviewsRead: p.reviewsRead, aspects: p.aspects } : null;

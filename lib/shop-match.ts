/**
 * 商品価格ナビの商品（メーカーの型番ごと）に、お店の商品を結びつける（docs/02 第13節）。
 *
 * 商品価格ナビのレビュー一覧が、お店のレビューをまとめて出さなくなった商品がある（soundcore Liberty 4 など）。
 * そこで楽天の商品検索を JAN（バーコードの番号）で引き、その番号を商品名か説明に書いているお店の商品だけを使う。
 * JAN は色ごとに違うので、色違いが混ざらない。名前だけで結びつけることはしない（別の商品が混ざる）。
 */

export type ShopItemCandidate = {
  itemCode: string;
  itemName: string;
  itemCaption?: string;
  catchcopy?: string;
  itemUrl: string;
  shopName: string;
  reviewCount: number;
};

export type ShopItemLink = Pick<ShopItemCandidate, "itemCode" | "itemUrl" | "shopName" | "itemName" | "reviewCount">;

/** 1商品に結びつけるお店の商品の数。レビューの多い順。 */
export const MAX_SHOP_ITEMS = 3;

/** 中古はお店の状態のレビューが混ざるので使わない。 */
const USED = /中古|ジャンク|展示品/;

const normalize = (s: string) => s.normalize("NFKC");

/** その JAN を、ほかの数字とつながらない形で書いているか（4571411204302 が 145714112043021 の一部に見えないように）。 */
export function mentionsJan(text: string, jan: string) {
  if (!/^\d{8,14}$/.test(jan)) return false;
  return new RegExp(`(^|\\D)${jan}(\\D|$)`).test(normalize(text));
}

export function matchByJan(items: readonly ShopItemCandidate[], jan: string, max = MAX_SHOP_ITEMS): ShopItemLink[] {
  const seen = new Set<string>();
  return items
    .filter((item) => item.reviewCount > 0)
    .filter((item) => !USED.test(normalize(item.itemName)))
    .filter((item) => mentionsJan(`${item.itemName} ${item.catchcopy ?? ""} ${item.itemCaption ?? ""}`, jan))
    .filter((item) => (seen.has(item.itemCode) ? false : (seen.add(item.itemCode), true)))
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, max)
    .map(({ itemCode, itemUrl, shopName, itemName, reviewCount }) => ({ itemCode, itemUrl, shopName, itemName, reviewCount }));
}

import { createHash } from "node:crypto";

/**
 * 楽天のカテゴリのページ（www.rakuten.co.jp/category/<ジャンル>/）から、商品の一覧を読む（2026-09-26）。
 *
 * 楽天の API はアプリ登録にアプリの URL と「許可するWebサイト」が要る。オーナーは、ドメインを取ってから
 * 申請したい（2026-09-26）。それまでは、公開されているカテゴリのページを robots.txt に従って読む。
 * ページには schema.org の ItemList（商品名・画像・値段・★の平均・レビュー数・URL）が入っている。
 *
 * - 並びは楽天の標準（並べ替えの ?s= は robots.txt で読まないことになっている）。読んだあとでレビュー数の多い順にする
 * - お試し・サンプル・詰め替えだけ・まとめ売り（2個セットなど）は、比べる単位にならないので外す（理由を残す）
 */

export type ListedItem = {
  name: string;
  image: string;
  price: number;
  rating: number | null;
  reviewCount: number;
  /** item.rakuten.co.jp/<店>/<商品>/（問い合わせの文字は外す） */
  url: string;
  /** "<店>:<商品>"（API の itemCode と同じ形） */
  itemCode: string;
  /** レビューのページの番号（"<店の番号>_<商品の番号>"）。カードにレビューへのリンクがあるときだけ。 */
  reviewKey?: string;
};

/** 比べる単位にならない商品。 */
export const NOT_A_UNIT = /お試し|トライアル|サンプル|試供品|ミニサイズ|詰め?替え用?のみ|つめかえ用?のみ|\d+\s*(個|本|足|袋|箱)\s*セット|まとめ買い/;

function ldBlocks(html: string): unknown[] {
  const out: unknown[] = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { out.push(JSON.parse(m[1])); } catch { /* 読めないものは飛ばす */ }
  }
  return out;
}

export function listedItems(html: string): ListedItem[] {
  const items: ListedItem[] = [];
  for (const block of ldBlocks(html)) {
    const b = block as { "@type"?: string; itemListElement?: { item?: Record<string, unknown> }[] };
    if (b["@type"] !== "ItemList" || !Array.isArray(b.itemListElement)) continue;
    for (const element of b.itemListElement) {
      const it = element.item as { name?: string; image?: string[] | string; offers?: { price?: number }; aggregateRating?: { ratingValue?: number; reviewCount?: number }; url?: string } | undefined;
      if (!it?.url || !it.name) continue;
      let url: URL;
      try { url = new URL(it.url); } catch { continue; }
      const parts = url.pathname.split("/").filter(Boolean);
      if (url.hostname !== "item.rakuten.co.jp" || parts.length < 2) continue;
      items.push({
        name: it.name,
        image: Array.isArray(it.image) ? it.image[0] ?? "" : it.image ?? "",
        price: Number(it.offers?.price) || 0,
        rating: typeof it.aggregateRating?.ratingValue === "number" ? it.aggregateRating.ratingValue : null,
        reviewCount: Number(it.aggregateRating?.reviewCount) || 0,
        url: `https://item.rakuten.co.jp/${parts[0]}/${parts[1]}/`,
        itemCode: `${parts[0]}:${parts[1]}`,
      });
    }
  }
  return items;
}

const decode = (s: string) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
  .replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/**
 * 検索結果のカード（data-track-card="search"）から読む。1ページに45件ほど（ItemList は10件だけ）。
 * カードには、商品名・URL・値段・★の平均・（2,697件）・レビューのページへのリンクがある。広告の枠は読まない。
 */
export function listedCards(html: string): ListedItem[] {
  const starts: number[] = [];
  for (let i = html.indexOf('data-track-card="search"'); i >= 0; i = html.indexOf('data-track-card="search"', i + 1)) starts.push(i);
  const items: ListedItem[] = [];
  starts.forEach((start, n) => {
    const card = html.slice(start, starts[n + 1] ?? start + 20_000);
    const heading = card.match(/<h2[^>]*>[\s\S]*?<\/h2>/);
    const anchor = heading?.[0].match(/<a\b[^>]*>/)?.[0];
    const title = anchor?.match(/title="([^"]*)"/)?.[1];
    const href = anchor?.match(/href="(https:\/\/item\.rakuten\.co\.jp\/[^"]+)"/)?.[1];
    if (!title || !href) return;
    let url: URL;
    try { url = new URL(decode(href)); } catch { return; }
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return;
    const text = card.replace(/<[^>]+>/g, "|").replace(/\|+/g, "|");
    const stars = text.match(/\|(\d\.\d{1,2})\|\(([\d,]+)件\)/);
    const price = card.match(/data-track-price="(\d+)"/);
    const image = card.match(/<img[^>]*src="([^"]+)"/);
    const review = card.match(/review\.rakuten\.co\.jp\/item\/1\/(\d+_\d+)\//);
    items.push({
      name: decode(title),
      image: image ? decode(image[1]) : "",
      price: price ? Number(price[1]) : 0,
      rating: stars ? Number(stars[1]) : null,
      reviewCount: stars ? Number(stars[2].replace(/,/g, "")) : 0,
      url: `https://item.rakuten.co.jp/${parts[0]}/${parts[1]}/`,
      itemCode: `${parts[0]}:${parts[1]}`,
      ...(review ? { reviewKey: review[1] } : {}),
    });
  });
  return items;
}

export type Picked = { kept: ListedItem[]; skipped: { name: string; why: string }[] };

/** レビューが min 件以上・比べる単位になる商品を、レビューの多い順に max まで。同じ商品コードは1つ。 */
export function pickItems(items: readonly ListedItem[], { min = 30, max = 20 } = {}): Picked {
  const seen = new Set<string>();
  const kept: ListedItem[] = [];
  const skipped: Picked["skipped"] = [];
  for (const item of [...items].sort((a, b) => b.reviewCount - a.reviewCount)) {
    if (seen.has(item.itemCode)) continue;
    seen.add(item.itemCode);
    if (item.reviewCount < min) { skipped.push({ name: item.name, why: `レビュー${item.reviewCount}件` }); continue; }
    if (NOT_A_UNIT.test(item.name.normalize("NFKC"))) { skipped.push({ name: item.name, why: "お試し・詰め替え・まとめ売り" }); continue; }
    if (kept.length >= max) { skipped.push({ name: item.name, why: `${max}商品を超えた` }); continue; }
    kept.push(item);
  }
  return { kept, skipped };
}

/** 画面の URL（/reviews/<32桁>）に合わせた商品の ID。API で作るときと同じ（scripts/fetch-item-list.mjs）。 */
export const productIdOf = (itemCode: string) => createHash("md5").update(`ichiba:${itemCode}`).digest("hex");

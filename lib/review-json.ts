/**
 * 楽天のレビューページに入っている、レビュー1件ごとのデータを読む（2026-09-26 に見つけた）。
 *
 * 本文だけでなく、そのレビューの★・投稿日・買った色・年代・性別（お店のページでは使い道｜誰に｜回数も）が
 * ページの中のデータにある。前は本文だけを HTML から取り、残りを捨てていた。
 *
 * - 商品価格ナビ（product.rakuten.co.jp/…/review/）："reviewInfo":{"reviews":[{evaluation, review, reg_time, item_sku_info, age, sex, …}]}
 * - お店の商品（review.rakuten.co.jp/item/1/…）："seo":{"itemReviewList":[{rating, title, body, postDate, ageRange, sex, codes, key, …}]}
 *
 * ニックネームは持ち出さない。レビューの識別には、ページが持つ番号をそのまま使う（公開しない .cache の中だけ）。
 */

export type StructuredReview = {
  /** 重複を外すための番号（ページの番号。無ければ null）。 */
  id: string | null;
  /** そのレビューの★（1〜5）。 */
  rating: number | null;
  /** 投稿日（YYYY-MM-DD）。 */
  date: string | null;
  /** 買った色など（商品価格ナビだけ）。 */
  sku: string | null;
  /** 年代（10・20・…）。答えていなければ null。 */
  age: number | null;
  sex: "male" | "female" | null;
  /** 本人が選んだ欄（使い道｜誰に｜はじめて・リピート）。お店のページだけ。 */
  codes: string[];
  /** 見出し（お店のページだけ）。 */
  title: string | null;
  body: string;
};

/** "[" から始まる JSON の配列を、文字列の中の括弧に惑わされずに切り出す。 */
export function sliceJsonArray(text: string, start: number): string | null {
  if (text[start] !== "[") return null;
  let depth = 0;
  let inString = false;
  for (let i = start; i < text.length; i += 1) {
    const c = text[i];
    if (inString) {
      if (c === "\\") i += 1;
      else if (c === "\"") inString = false;
      continue;
    }
    if (c === "\"") inString = true;
    else if (c === "[" || c === "{") depth += 1;
    else if (c === "]" || c === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function arrayAfter(html: string, marker: string): unknown[] | null {
  const at = html.indexOf(marker);
  if (at < 0) return null;
  const raw = sliceJsonArray(html, at + marker.length);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

const clean = (s: unknown) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim() : "");
const dateOf = (s: unknown) => {
  const m = typeof s === "string" ? s.match(/(\d{4})[-/](\d{2})[-/](\d{2})/) : null;
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
};
const ratingOf = (n: unknown) => (typeof n === "number" && n >= 1 && n <= 5 ? n : null);
const ageOf = (n: unknown) => {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? Math.floor(v / 10) * 10 : null;
};
const sexOf = (s: unknown): StructuredReview["sex"] => (s === 1 || s === "female" ? "female" : s === 0 || s === "male" ? "male" : null);

/**
 * ページのレビューを、ページに並んだ順で返す。データが見つからなければ null（呼ぶ側は HTML の本文に戻る）。
 *
 * 商品価格ナビの sex：0 は男性（お店のページで "male" と書いてある同じレビュー2件で確かめた。2026-09-26）。
 * 1 は女性と見る（直接は未確認。イヤホン643件で 0 が299・1 が337・-1 が7）。-1 は答えていない。
 */
export function structuredReviews(html: string): StructuredReview[] | null {
  const priceNavi = arrayAfter(html, "\"reviewInfo\":{\"reviews\":");
  if (priceNavi) {
    return priceNavi.map((r) => {
      const x = r as Record<string, unknown>;
      return {
        id: typeof x.encryptedEasyId === "string" ? `${x.encryptedEasyId}:${x.reg_time ?? ""}` : null,
        rating: ratingOf(x.evaluation),
        date: dateOf(x.reg_time),
        sku: clean(x.item_sku_info) || null,
        age: ageOf(x.age),
        sex: sexOf(x.sex),
        codes: [],
        title: null,
        body: clean(x.review),
      };
    }).filter((r) => r.body);
  }
  const shop = arrayAfter(html, "\"seo\":{\"itemReviewList\":");
  if (shop) {
    return shop.map((r) => {
      const x = r as Record<string, unknown>;
      return {
        id: typeof x.key === "string" ? x.key : null,
        rating: ratingOf(x.rating),
        date: dateOf(x.postDate),
        sku: null,
        age: ageOf(x.ageRange),
        sex: sexOf(x.sex),
        codes: Array.isArray(x.codes) ? x.codes.filter((c): c is string => typeof c === "string") : [],
        title: clean(x.title) || null,
        body: clean(x.body),
      };
    }).filter((r) => r.body);
  }
  return null;
}

import { h } from "./dom.ts";
import type { JoinedProduct } from "@lib/types.ts";
import type { Genre } from "./data.ts";
import { filterRows, tallyRows, tallyFitRows, monthsAgo } from "@lib/voice-model.ts";
import { READ_ENOUGH } from "@lib/nakami-model.ts";
import type { RowFilter } from "@lib/voice-model.ts";
import { who } from "./store.ts";
import type { Who } from "./store.ts";

/**
 * 誰の声で数えるか（オーナーの答え：似た人の声・最近の声を足す。2026-09-26）。
 * 年代と性別は、レビューの人が楽天で自分で選んだ欄。AI の推測ではない。
 * 絞ると分母も絞ったレビューの数になる。30件に届かないときは「まだ少ない」と書く（中身カードと同じ境目）。
 */
const AGE_LABEL: Record<NonNullable<Who["age"]>, string> = { u29: "〜20代", "30": "30代", "40": "40代", o50: "50代〜" };
// 並びは明示する（オブジェクトのキーは "30"・"40" のような数字が先に並んでしまう）
const AGE_ORDER: NonNullable<Who["age"]>[] = ["u29", "30", "40", "o50"];
const SEX_LABEL = { f: "女性", m: "男性" } as const;

export const isActive = (w: Who) => w.recent || !!w.sex || !!w.age;

export function whoFilter(w: Who, today = new Date()): RowFilter {
  const range = w.age === "u29" ? [null, 29] : w.age === "o50" ? [50, null] : w.age ? [Number(w.age), Number(w.age) + 9] : [null, null];
  return { sex: w.sex, ageFrom: range[0], ageTo: range[1], since: w.recent ? monthsAgo(today, 12) : null };
}

export function whoLabel(w: Who) {
  return [w.recent ? "最近1年" : "", w.age ? AGE_LABEL[w.age] : "", w.sex ? SEX_LABEL[w.sex] : ""].filter(Boolean).join("・");
}

export type View = { product: JoinedProduct; active: boolean; available: boolean; small: boolean };

/** 条件で数え直した商品。引用はもとのまま（向きごとの原文は、条件で変わらない）。 */
export function viewFor(p: JoinedProduct, g: Genre, w: Who): View {
  const available = !!p.rows?.length;
  if (!isActive(w) || !available) return { product: p, active: false, available, small: false };
  const rows = filterRows(p.rows!, whoFilter(w));
  const quotesOf = (key: string) => p.aspects?.find((t) => t.key === key)?.quotes ?? [];
  const fitQuotesOf = (key: string) => p.fits?.find((t) => t.key === key)?.quotes ?? [];
  const product: JoinedProduct = {
    ...p,
    reviewsRead: rows.length,
    aspects: tallyRows(rows, g.order).map((t) => ({ ...t, quotes: quotesOf(t.key) })),
    fits: g.fits.length ? tallyFitRows(rows, g.fits.map((f) => f.key)).map((t) => ({ ...t, quotes: fitQuotesOf(t.key) })) : p.fits,
  };
  // 中身カードの「30件より少ないので目安として」と同じ境目にする（言うことを1つにそろえる）
  return { product, active: true, available, small: rows.length < READ_ENOUGH };
}

/** 条件のチップ。押すと who が変わり、どの商品でも同じ条件で数える。 */
export function whoBar(p: JoinedProduct, view: View) {
  const w = who.get();
  const chip = (label: string, on: boolean, next: Who) =>
    h("button", { type: "button", class: "chip chip--s", role: "switch", "aria-checked": String(on), onclick: () => who.set(next) }, label);
  const status = !view.available
    ? "この商品は、まだ年代・性別・時期で絞れません（前の読み取りの数です）"
    : view.active
      // 30件未満のときの注意は中身カードが書くので、ここでは色だけ変える（同じことを2回書かない）
      ? `${whoLabel(w)}のレビュー ${view.product.reviewsRead}件で数えています（ぜんぶで${p.reviewsRead}件）`
      : `ぜんぶのレビュー ${p.reviewsRead}件で数えています`;
  return h("section", { class: "whobar", "aria-label": "誰の声で数えるか" },
    h("div", { class: "whobar__chips" },
      chip("ぜんぶ", !isActive(w), { recent: false, sex: null, age: null }),
      chip("最近1年", w.recent, { ...w, recent: !w.recent }),
      (["f", "m"] as const).map((s) => chip(SEX_LABEL[s], w.sex === s, { ...w, sex: w.sex === s ? null : s })),
      AGE_ORDER.map((a) => chip(AGE_LABEL[a], w.age === a, { ...w, age: w.age === a ? null : a }))),
    h("p", { class: `whobar__status${view.small ? " is-small" : ""}` }, status));
}

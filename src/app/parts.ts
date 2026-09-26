import { h, icon, yen } from "./dom.ts";
import type { Child } from "./dom.ts";
import type { JoinedProduct } from "@lib/types.ts";
import { nakami, evidenceOf, allLines, displayName, READ_ENOUGH } from "@lib/nakami-model.ts";
import type { NakamiLine } from "@lib/nakami-model.ts";
import { asAspect } from "./data.ts";
import type { Genre } from "./data.ts";
import { hasAds, shopUrl } from "./site.ts";
import { fitSummaries, FIT_DIRECTIONS } from "@lib/fit-model.ts";
import type { FitDefinition, FitSummary, FitTally } from "@lib/fit-model.ts";

export const nameOf = (p: JoinedProduct) => displayName(p.name);
export const productHref = (id: string, key?: string | null) => `/reviews/${id}${key ? `?k=${key}` : ""}`;
export const categoryHref = (g: Genre, key?: string | null) => `/compare/${g.id}${key ? `?k=${key}` : ""}`;

/** 商品画像。丸いタイルの上に（設計原則15：画像が主役）。 */
export function productImage(p: JoinedProduct, size: number, { eager = false, transition = false } = {}) {
  const img = h("img", {
    src: p.imageUrl, alt: "", width: size, height: size, loading: eager ? "eager" : "lazy", decoding: "async",
    class: "pimg__img",
  });
  const wrap = h("span", { class: "pimg", style: { width: `${size}px`, height: `${size}px` } }, img);
  if (transition) wrap.style.setProperty("view-transition-name", `p-${p.productId.slice(0, 12)}`);
  return wrap;
}

/** ★ と件数。楽天の値なので印は付けない（事実）。 */
export const starText = (p: JoinedProduct) => (p.reviewCount ? `★${p.reviewAverage.toFixed(2)}` : "★なし");
export function starLine(p: JoinedProduct) {
  return h("span", { class: "star" }, h("b", null, starText(p)), p.reviewCount ? h("span", { class: "star__n" }, `（${p.reviewCount.toLocaleString("ja-JP")}件）`) : null);
}

/** 読んだ件数を全長にした帯。よかった＝青、残念だった＝赤。 */
export function bar(count: number, read: number, side: "good" | "bad") {
  const pct = read ? Math.max(count ? 2 : 0, (count / read) * 100) : 0;
  return h("span", { class: `bar bar--${side}`, "aria-hidden": "true" }, h("span", { class: "bar__fill", style: { width: `${pct}%` } }));
}

export const sideWord = (side: "good" | "bad") => (side === "good" ? "よかった" : "残念だった");
const dot = (side: "good" | "bad") => h("span", { class: `dot dot--${side}`, "aria-hidden": "true" });

type Pick = (key: string, from: HTMLElement) => void;

function column(side: "good" | "bad", lines: NakamiLine[], read: number, g: Genre, onPick?: Pick, concernKeys: readonly string[] = []) {
  const rows: Child[] = lines.length
    ? lines.map((line) => {
      const inner = [
        h("span", { class: "row__top" },
          h("span", { class: "row__word" }, concernKeys.includes(line.key) ? h("span", { class: "row__pin", title: "気にしていること" }, icon("pin", 12, 2.2)) : null, g.word(line.key)),
          h("span", { class: `row__n row__n--${side}` }, line.count)),
        bar(line.count, read, side),
      ];
      return onPick
        ? h("button", { type: "button", class: "row", onclick: (e: Event) => onPick(line.key, e.currentTarget as HTMLElement), "aria-label": `${g.word(line.key)}：${sideWord(side)} ${line.count}件（${read}件中）。押すと、買った人のひとことと乗り換え先` }, inner)
        : h("div", { class: "row" }, inner);
    })
    : [h("p", { class: "col__none" }, side === "good" ? "まだ書かれていません" : "まだ書かれていません")];
  return h("div", { class: `col col--${side}` },
    h("h3", { class: "col__head" }, dot(side), sideWord(side), h("small", null, `${read}件中`)),
    rows);
}

/**
 * ★が開いて、中身が左右に出るカード。左はいつも「よかった」、右はいつも「残念だった」。
 * まだ読んでいない商品は、読んでいないと書く（設計原則2）。
 */
export function nakamiCard(p: JoinedProduct, g: Genre, { onPick, rows = 3, concernKeys = [] as readonly string[], compact = false } = {} as { onPick?: Pick; rows?: number; concernKeys?: readonly string[]; compact?: boolean }) {
  const ap = asAspect(p);
  const evidence = evidenceOf(p.reviewsRead);
  const top = h("div", { class: "nk__top" },
    h("span", { class: "nk__star" }, h("span", { class: "nk__mark", "aria-hidden": "true" }, "★"), p.reviewCount ? p.reviewAverage.toFixed(2) : "—"),
    h("span", { class: "nk__cap" }, p.reviewCount ? ["楽天の★", h("br"), `レビュー${p.reviewCount.toLocaleString("ja-JP")}件の平均`] : "楽天のレビューはまだありません"));
  const open = h("div", { class: "nk__open", "aria-hidden": "true" }, h("span", null, "の中身"));
  if (!ap) {
    return h("section", { class: `nk nk--empty${compact ? " nk--compact" : ""}`, "aria-label": "★の中身" }, top, open,
      h("p", { class: "nk__empty" }, p.reviewCount ? "この商品のレビューは、まだ読んでいません。" : "レビューが無いので、中身はありません。"));
  }
  const { good, bad } = nakami(ap, g.order, rows);
  return h("section", { class: `nk${compact ? " nk--compact" : ""}`, "aria-label": `★の中身：${ap.reviewsRead}件のレビューから` }, top, open,
    h("div", { class: "nk__cols" }, column("good", good, ap.reviewsRead, g, onPick, concernKeys), column("bad", bad, ap.reviewsRead, g, onPick, concernKeys)),
    evidence === "thin" ? h("p", { class: "nk__thin" }, `読めたのは${ap.reviewsRead}件。${READ_ENOUGH}件より少ないので、目安として見てください`) : null,
    compact ? null : h("p", { class: "nk__foot" }, `${ap.reviewsRead}件のレビューを AI が1件ずつ分類し、コードが数えました`));
}

/** ぜんぶの項目：左によかった、右に残念だった（中央から外へ伸びる）。 */
export function allList(p: JoinedProduct, g: Genre, onPick?: Pick, concernKeys: readonly string[] = []) {
  const ap = asAspect(p);
  if (!ap) return null;
  const lines = allLines(ap, g.order);
  const max = Math.max(1, ...lines.flatMap((l) => [l.positive, l.negative]));
  return h("ul", { class: "all" }, lines.map((line) => h("li", null,
    h("button", { type: "button", class: "all__row", onclick: (e: Event) => onPick?.(line.key, e.currentTarget as HTMLElement), "aria-label": `${g.word(line.key)}：よかった ${line.positive}件・残念だった ${line.negative}件（${ap.reviewsRead}件中）` },
      h("span", { class: "all__n all__n--good" }, line.positive),
      h("span", { class: "all__bar all__bar--good" }, h("span", { style: { width: `${(line.positive / max) * 100}%` } })),
      h("span", { class: "all__word" }, concernKeys.includes(line.key) ? icon("pin", 11, 2.2) : null, g.word(line.key)),
      h("span", { class: "all__bar all__bar--bad" }, h("span", { style: { width: `${(line.negative / max) * 100}%` } })),
      h("span", { class: "all__n all__n--bad" }, line.negative)))));
}

/** 商品の小さなカード（一覧・乗り換え・さがす）。 */
export function productRow(p: JoinedProduct, extra: Child, { href = productHref(p.productId), dim = false, size = 56 } = {}) {
  return h("a", { class: `prow${dim ? " prow--dim" : ""}`, href },
    productImage(p, size),
    h("span", { class: "prow__body" },
      h("span", { class: "prow__name" }, nameOf(p)),
      h("span", { class: "prow__meta" }, h("span", { class: "num" }, yen(p.price)), " ・ ", starLine(p)),
      extra));
}

/**
 * ちょうどよさの帯（lib/fit-model.ts）。左が low、まん中が just、右が high。
 * 好みなので赤と青は使わない。両端は同じ灰色で、まん中（ちょうど）だけ濃くする。幅は、ふれた件数を全体にした割合。
 */
export function fitStrip(def: FitDefinition, s: FitSummary, { compact = false } = {}) {
  // 狭いところ（くらべる）では、最初の言葉だけ（小さめ・きつい → 小さめ）
  const short = (s: string) => (compact ? s.split("・")[0] : s);
  const labels = { low: short(def.low), just: short(def.just), high: short(def.high) };
  return h("div", { class: `fit${compact ? " fit--compact" : ""}` },
    compact ? null : h("div", { class: "fit__top" }, h("b", { class: "fit__word" }, def.word ?? def.label), h("span", { class: "fit__read" }, `ふれた${s.talked}件（${s.read}件中）`)),
    h("span", { class: "fit__bar", role: "img", "aria-label": FIT_DIRECTIONS.map((d) => `${labels[d]} ${s.counts[d]}件`).join("、") },
      FIT_DIRECTIONS.map((d) => h("span", { class: `fit__seg fit__seg--${d}`, style: { width: `${(s.shares[d] * 100).toFixed(1)}%` } }))),
    h("div", { class: "fit__labels" }, FIT_DIRECTIONS.map((d) => h("span", { class: `fit__l fit__l--${d}` }, h("span", null, labels[d]), h("b", { class: "num" }, s.counts[d])))),
    compact ? h("span", { class: "fit__read" }, `ふれた${s.talked}件（${s.read}件中）`) : null);
}

/** 商品ページのちょうどよさ。ふれた声が無ければ出さない。 */
export function fitBlock(p: JoinedProduct, g: Genre) {
  if (!g.fits.length || !p.reviewsRead) return null;
  const list = fitSummaries(p.fits, p.reviewsRead, g.fits.map((f) => f.key));
  if (!list.length) return null;
  return h("section", { class: "block" },
    sectionTitle("ちょうどよさ", "好みの向きを数えています"),
    list.map((s) => {
      const def = g.fits.find((f) => f.key === s.key)!;
      const tally = p.fits!.find((t) => t.key === s.key)!;
      return h("div", { class: "fitbox" }, fitStrip(def, s), fitQuotes(def, tally));
    }));
}

function fitQuotes(def: FitDefinition, tally: FitTally) {
  if (!tally.quotes.length) return null;
  const labels = { low: def.low, just: def.just, high: def.high };
  return h("details", { class: "fitq" },
    h("summary", null, "買った人のひとこと"),
    FIT_DIRECTIONS.map((d) => {
      const list = tally.quotes.filter((q) => q.direction === d);
      return list.length ? h("div", { class: "qside" }, h("p", { class: "qside__l" }, labels[d]),
        h("ul", { class: "quotes" }, list.map((q) => h("li", null, h("q", null, q.text), " ", h("a", { href: q.reviewUrl, target: "_blank", rel: "noopener", class: "src" }, "出典"))))) : null;
    }));
}

/** 読めた量の小さな印。 */
export function evidenceTag(p: JoinedProduct) {
  const e = evidenceOf(p.reviewsRead);
  if (e === "enough") return h("span", { class: "tag" }, `${p.reviewsRead}件を読んだ`);
  if (e === "thin") return h("span", { class: "tag tag--thin" }, `読めたのは${p.reviewsRead}件（まだ少ない）`);
  return h("span", { class: "tag tag--none" }, "まだ読んでいない");
}

/**
 * 楽天へのリンク。アフィリエイトの ID があるときは広告なので「PR」の印を付け、rel も sponsored にする
 * （景品表示法のステマ規制。広告だと分かるように）。ID が無いときは、ふつうのリンク。
 */
export function shopLink(p: JoinedProduct, cls: string, ...children: Child[]) {
  const ad = hasAds();
  return h("a", { class: cls, href: shopUrl(p.productUrl), target: "_blank", rel: ad ? "sponsored noopener" : "nofollow noopener", "data-native": "" },
    ...children, ad ? h("span", { class: "pr", "aria-label": "広告" }, "PR") : null, icon("out", 16));
}

/** 広告のリンクがあるページの上に出す一文。ID が無いときは出さない。 */
export function adNotice() {
  return hasAds() ? h("p", { class: "adnote" }, "このページには広告（楽天のリンク）があります。件数と並びは、広告と関係なく数えています。") : null;
}

export function sectionTitle(text: string, sub?: Child) {
  return h("div", { class: "stitle" }, h("h2", null, text), sub ? h("span", { class: "stitle__sub" }, sub) : null);
}

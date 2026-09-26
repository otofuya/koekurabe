import type { AspectProduct, AspectTally } from "./aspect-model.ts";

/**
 * ★の中身。
 *
 * 商品の★を開いて「よかった」「残念だった」を件数で見せ、気になる残念が少ない商品へ
 * 乗り換えさせる。その判断はすべてここに置く（docs/11 第6節・docs/12）。
 *
 * 件数は AI がレビューを1件ずつ分類したものをコードが数えた値。ここで作る文は
 * 件数から組み立てる定型文だけで、AI に書かせた文は置かない（設計原則5）。
 */

/** これ以上読めた商品を「くわしく読めた」とする。割合がぶれにくくなる目安（docs/11）。 */
export const READ_ENOUGH = 30;
/** ふれた声（よかった＋残念だった）がこれ未満の商品は並べない。沈黙は「残念が少ない」ではない。 */
export const TALKED_MIN = 3;
/** 並べる順だけに使う割合の縮め方。読んだ件数が少ない商品を端に寄せない。表示は元の件数。 */
export const PRIOR_WEIGHT = 20;
/** 「同じくらいの値段」。 */
export const PRICE_BAND = [0.6, 1.4] as const;
/** 乗り換え先は、並べる順の値が今の商品のこの倍率以下（3分の1以上少ない）。仮置き。検証で決める。 */
export const FEWER_RATIO = 2 / 3;
/** くらべるで「同じくらい」とする残念の割合の差（3ポイント）。 */
export const SAME_GAP = 0.03;

export type Evidence = "unread" | "thin" | "enough";

/** 読めた量の段階。null はまだ読んでいない。 */
export function evidenceOf(reviewsRead: number | null): Evidence {
  if (!reviewsRead) return "unread";
  return reviewsRead < READ_ENOUGH ? "thin" : "enough";
}

const tallyOf = (product: AspectProduct, key: string): AspectTally | undefined =>
  product.aspects.find((tally) => tally.key === key);
const positiveOf = (product: AspectProduct, key: string) => tallyOf(product, key)?.positive ?? 0;
const negativeOf = (product: AspectProduct, key: string) => tallyOf(product, key)?.negative ?? 0;

export function talked(product: AspectProduct, key: string) {
  return positiveOf(product, key) + negativeOf(product, key) >= TALKED_MIN;
}

/** 1つの観点の、1つの側（よかった／残念だった）。 */
export type NakamiLine = { key: string; count: number; read: number };

/**
 * 中身カードの左右。よかった・残念だった それぞれ多い順に n 個。
 *
 * 同じ観点が両方に入ってよい（ノイキャン 32｜11）。それが「合う人と合わない人がいる」という情報になる。
 * 同じ件数のときは、観点の定義の順で並べる（毎回同じ並びになるように）。
 */
export function nakami(product: AspectProduct, order: readonly string[], n = 3) {
  const rank = (key: string) => {
    const index = order.indexOf(key);
    return index < 0 ? order.length : index;
  };
  const side = (pick: (key: string) => number): NakamiLine[] =>
    product.aspects
      .map((tally) => ({ key: tally.key, count: pick(tally.key), read: product.reviewsRead }))
      .filter((line) => line.count > 0)
      .sort((a, b) => b.count - a.count || rank(a.key) - rank(b.key))
      .slice(0, n);
  return {
    good: side((key) => positiveOf(product, key)),
    bad: side((key) => negativeOf(product, key)),
  };
}

export type AllLine = { key: string; positive: number; negative: number };

/** 声があった観点をすべて、ふれた声の多い順に。無いものは出さない。 */
export function allLines(product: AspectProduct, order: readonly string[]): AllLine[] {
  return order
    .map((key) => ({ key, positive: positiveOf(product, key), negative: negativeOf(product, key) }))
    .filter((line) => line.positive + line.negative > 0)
    .sort((a, b) => (b.positive + b.negative) - (a.positive + a.negative) || order.indexOf(a.key) - order.indexOf(b.key));
}

/** 知っている観点を先に（覚えた順のまま）、残りはもとの順。 */
export function concernsFirst<T extends { key: string }>(lines: readonly T[], concerns: readonly string[]): T[] {
  const pinned = concerns.flatMap((key) => lines.filter((line) => line.key === key));
  return [...pinned, ...lines.filter((line) => !concerns.includes(line.key))];
}

/* ── 残念が少ない順 ─────────────────────────────────────────────── */

/** その観点の、カテゴリ全体の残念の割合（読んだ件数で重みづけ）。 */
export function priorBadRate(products: readonly AspectProduct[], key: string) {
  let negative = 0, read = 0;
  for (const product of products) {
    if (!product.reviewsRead) continue;
    negative += negativeOf(product, key);
    read += product.reviewsRead;
  }
  return read ? negative / read : 0;
}

/** 並べる順に使う残念の割合。件数の少ない商品はカテゴリ全体の割合に寄る。 */
export function orderRate(product: AspectProduct, key: string, prior: number) {
  return (negativeOf(product, key) + PRIOR_WEIGHT * prior) / (product.reviewsRead + PRIOR_WEIGHT);
}

export type RankedByBad = { id: string; rate: number; positive: number; negative: number; read: number };

/**
 * 「残念が少ない順」。ふれた声が少ない商品は並べず quiet へ（最下位にしない。設計原則10）。
 * 同じ値なら、読んだ件数の多い商品が先。
 */
export function fewestBad(products: readonly AspectProduct[], key: string) {
  const prior = priorBadRate(products, key);
  const ranked: RankedByBad[] = [];
  const quiet: string[] = [];
  for (const product of products) {
    if (!talked(product, key)) { quiet.push(product.id); continue; }
    ranked.push({ id: product.id, rate: orderRate(product, key, prior), positive: positiveOf(product, key), negative: negativeOf(product, key), read: product.reviewsRead });
  }
  ranked.sort((a, b) => a.rate - b.rate || b.read - a.read);
  return { ranked, quiet };
}

export type Priced = AspectProduct & { price: number };

export type SwitchResult =
  | { status: "found"; targets: RankedByBad[]; band: [number, number] }
  | { status: "none"; band: [number, number] }
  | { status: "thin" }
  | { status: "quiet" };

/**
 * 気になる残念が、はっきり少ない商品（同じくらいの値段）。
 * 今の商品を読んだ量が少ないとき・その観点にふれた声が少ないときは、乗り換え先を出さない（理由を返す）。
 */
export function switchTargets(target: Priced, pool: readonly Priced[], key: string): SwitchResult {
  if (target.reviewsRead < READ_ENOUGH) return { status: "thin" };
  if (!talked(target, key)) return { status: "quiet" };
  const band: [number, number] = [Math.round(target.price * PRICE_BAND[0]), Math.round(target.price * PRICE_BAND[1])];
  const prior = priorBadRate(pool, key);
  const own = orderRate(target, key, prior);
  const targets = pool
    .filter((candidate) => candidate.id !== target.id
      && candidate.reviewsRead >= READ_ENOUGH
      && candidate.price >= band[0] && candidate.price <= band[1]
      && talked(candidate, key)
      && orderRate(candidate, key, prior) <= own * FEWER_RATIO)
    .map((candidate) => ({ id: candidate.id, rate: orderRate(candidate, key, prior), positive: positiveOf(candidate, key), negative: negativeOf(candidate, key), read: candidate.reviewsRead }))
    .sort((a, b) => a.rate - b.rate || b.read - a.read);
  return targets.length ? { status: "found", targets, band } : { status: "none", band };
}

/* ── くらべる ─────────────────────────────────────────────────── */

export type Side = { positive: number; negative: number; read: number };
export type CompareRow = { key: string; a: Side; b: Side; gap: number; fewerBad: "a" | "b" | null };

/**
 * 2つの商品を観点ごとに。両方でふれた声が3件以上の観点だけ比べる。
 * gap は残念の割合の差（a − b）。SAME_GAP 未満は「同じくらい」。
 */
export function compareProducts(a: AspectProduct, b: AspectProduct, order: readonly string[]) {
  const side = (product: AspectProduct, key: string): Side => ({ positive: positiveOf(product, key), negative: negativeOf(product, key), read: product.reviewsRead });
  const rows: CompareRow[] = [];
  const onlyA: string[] = [], onlyB: string[] = [];
  for (const key of order) {
    const inA = talked(a, key), inB = talked(b, key);
    if (inA && inB) {
      const gap = negativeOf(a, key) / a.reviewsRead - negativeOf(b, key) / b.reviewsRead;
      rows.push({ key, a: side(a, key), b: side(b, key), gap, fewerBad: Math.abs(gap) < SAME_GAP ? null : gap > 0 ? "b" : "a" });
    } else if (inA) onlyA.push(key);
    else if (inB) onlyB.push(key);
  }
  const differ = rows.filter((row) => row.fewerBad).sort((x, y) => Math.abs(y.gap) - Math.abs(x.gap));
  const same = rows.filter((row) => !row.fewerBad);
  return { differ, same, onlyA, onlyB };
}

export type Named = { name: string; star: number };

/**
 * くらべる画面の1行目。件数から作る定型文。
 * ★の差と、残念の差がいちばん大きい観点を並べる。★と同じ向きなら「も」、逆なら「でも」。
 */
export function compareLead(a: Named, b: Named, top: CompareRow | undefined, word: (key: string) => string) {
  const starText = a.star === b.star
    ? `★は同じ（${a.star.toFixed(2)}）。`
    : `★は ${a.star > b.star ? a.name : b.name} が上（${Math.max(a.star, b.star).toFixed(2)}・${Math.min(a.star, b.star).toFixed(2)}）。`;
  if (!top || !top.fewerBad) return `${starText}残念の数に、はっきりした差はありません。`;
  const fewer = top.fewerBad === "a" ? { p: a, s: top.a } : { p: b, s: top.b };
  const more = top.fewerBad === "a" ? { p: b, s: top.b } : { p: a, s: top.a };
  const sameWay = a.star !== b.star && (a.star > b.star) === (top.fewerBad === "a");
  const detail = `「${word(top.key)}」の残念は ${fewer.p.name} が少ない（${fewer.s.read}件中${fewer.s.negative}件・${more.s.read}件中${more.s.negative}件）。`;
  return a.star === b.star ? `${starText}${detail}` : `${starText}${sameWay ? "" : "でも"}${detail}`;
}

/* ── さがす ─────────────────────────────────────────────────── */

export type ParsedQuery =
  | { kind: "product"; id: string }
  | { kind: "other-url" }
  | { kind: "text"; q: string }
  | { kind: "empty" };

/**
 * 検索窓に入ったもの。楽天の商品価格ナビの URL（/product/-/32桁/）と、このサイトの商品の URL は商品として開く。
 * ほかの URL（お店の商品ページなど）は、今は商品に結びつけられない。
 */
export function parseQuery(input: string): ParsedQuery {
  const text = input.trim();
  if (!text) return { kind: "empty" };
  const product = text.match(/product\.rakuten\.co\.jp\/product\/-\/([a-f0-9]{32})/i) ?? text.match(/\/reviews\/([a-f0-9]{32})/i);
  if (product) return { kind: "product", id: product[1].toLowerCase() };
  if (/^https?:\/\//i.test(text)) return { kind: "other-url" };
  return { kind: "text", q: text };
}

/**
 * 楽天の商品名から、画面の見出しに使う短い名前を作る。
 * カテゴリ名（完全ワイヤレスイヤホン 等）と「｜カタカナ読み」を外すだけ。元の名前は画面に小さく残す。
 */
export function displayName(name: string) {
  const cleaned = name
    .normalize("NFKC")
    // お店の商品名に付く宣伝（【公式】【送料無料】＼新発売／［クーポン］など）を外す（2026-09-26・化粧水から）
    .replace(/【[^】]*】|＼[^／]*／|\\[^/]*\/|［[^］]*］|\[[^\]]*\]|≪[^≫]*≫|《[^》]*》/g, " ")
    .replace(/送料無料|楽天\d+位|ポイント\d+倍|\d+%OFF|クーポン(配布|利用)?/g, " ")
    .replace(/(^|\s)公式(?=\s|$)/g, " ")
    // ■生活応援キャンペーン実施中■ ★ポイント20倍★ ◆最大3000円CP◆ のような、記号で囲んだ宣伝
    .replace(/([■◆★☆◇●])[^■◆★☆◇●]{1,40}\1/g, " ")
    .replace(/｜[^\s]+/g, "")
    .replace(/\|[^\s]+/g, "")
    .replace(/(完全|フル)?ワイヤレス(Bluetooth)?イヤホン/g, "")
    .replace(/オープンイヤー型|開放型|ノイズキャンセリング機能搭載|左右分離|\(1個\)/g, "")
    .replace(/(^|\s)(イヤホン|ワイヤレス)(?=\s|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ");
  // 先頭がブランド名の繰り返し（BOSE Bose …）なら1つにする
  const deduped = words.filter((word, i) => i === 0 || word.toLowerCase() !== words[i - 1].toLowerCase());
  // 末尾の「 /カナル型 /Bluetooth対応」のような仕様の札は外す（前に空白があるものだけ。WF-C710N/L の / は残す）
  const short = deduped.join(" ").replace(/(\s+\/[^/]*)+$/, "").trim();
  if (!short) return name;
  // 長すぎる名前（検索向けに言葉を並べたもの）だけ、見た目の幅で30字ぶんまでで、言葉の切れ目で止める。
  // 半角の英数字は全角の半分ほどの幅として数える。元の名前は画面に小さく残す
  const width = (s: string) => [...s].reduce((sum, c) => sum + (c.charCodeAt(0) < 0x2e80 ? 0.55 : 1), 0);
  // 型番が末尾にあるふつうの名前（Panasonic … RZ-S50W-W）は切らない。34字ぶんを超えるものだけ切る
  if (width(short) <= 34) return short;
  let cut = "";
  for (const c of short) {
    if (width(cut + c) > 29) break;
    cut += c;
  }
  const space = cut.lastIndexOf(" ");
  return `${space >= cut.length / 2 ? cut.slice(0, space) : cut}…`;
}

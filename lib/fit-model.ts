/**
 * ちょうどよさ（docs/09 第5節・2026-09-26 にオーナーが「足す」と答えた）。
 *
 * サイズ感（小さめ・ちょうど・大きめ）や使用感（さっぱり・しっとり）は、良し悪しではなく好み。
 * 「よかった／残念だった」で数えると、小さめも大きめも「残念」に入り、向きが消える。
 * そこで3つの区間で数える。赤と青は使わない（どちらの端も「悪い」ではない）。
 *
 * よかった／残念だった の観点（AspectTally）とは別の配列に持つ。今までの判断（並べる・乗り換え・くらべる）は
 * 良し悪しの観点だけで動き、ちょうどよさは混ざらない。
 *
 * 件数は AI がレビューを1件ずつ分けたものをコードが数えた値。1件のレビューは、1つの観点で1つの向きだけに数える。
 * 「やや小さめ寄り」のような言葉は付けない（区切りの値を決める根拠がまだ無い）。件数だけを出す。
 */

export type FitDirection = "low" | "just" | "high";
export const FIT_DIRECTIONS: readonly FitDirection[] = ["low", "just", "high"];

export type FitDefinition = {
  key: string;
  /** 抽出プロンプトに渡す名前。 */
  label: string;
  /** 画面に出す言葉。無ければ label。 */
  word?: string;
  /** 3つの区間の言葉。low と high は好みの両端で、どちらも「悪い」ではない。 */
  low: string;
  just: string;
  high: string;
};

export type FitQuote = { text: string; reviewUrl: string; direction: FitDirection };

export type FitTally = {
  key: string;
  low: number;
  just: number;
  high: number;
  quotes: FitQuote[];
};

export type FitClassification = { key: string; direction: FitDirection; quote: string };

export type FitReview = { sourceUrl: string; fits: FitClassification[] };

/** 引用は区間ごとに2件まで。 */
export const MAX_FIT_QUOTES_PER_DIRECTION = 2;

/**
 * レビューごとの分け方を、観点ごとの件数にまとめる。
 * 1件のレビューが同じ観点で2つの向きを言っていたら、最初の1つだけを数える（件数が読んだ件数を超えないように）。
 */
export function aggregateFits(reviews: readonly FitReview[]): FitTally[] {
  const tallies = new Map<string, FitTally>();
  for (const review of reviews) {
    const seen = new Set<string>();
    for (const c of review.fits) {
      if (seen.has(c.key) || !FIT_DIRECTIONS.includes(c.direction)) continue;
      seen.add(c.key);
      const tally = tallies.get(c.key) ?? { key: c.key, low: 0, just: 0, high: 0, quotes: [] };
      tally[c.direction] += 1;
      const same = tally.quotes.filter((q) => q.direction === c.direction);
      if (same.length < MAX_FIT_QUOTES_PER_DIRECTION && !same.some((q) => q.text === c.quote)) {
        tally.quotes.push({ text: c.quote, reviewUrl: review.sourceUrl, direction: c.direction });
      }
      tallies.set(c.key, tally);
    }
  }
  return [...tallies.values()];
}

export type FitSummary = {
  key: string;
  /** ふれた件数（3つの合計）。 */
  talked: number;
  /** 分母。読んだレビューの件数。 */
  read: number;
  counts: Record<FitDirection, number>;
  /** 帯の幅。ふれた件数を全体にした割合（0〜1）。ふれた件数が0なら全部0。 */
  shares: Record<FitDirection, number>;
};

export function fitSummary(tally: FitTally, reviewsRead: number): FitSummary {
  const talked = tally.low + tally.just + tally.high;
  const share = (n: number) => (talked ? n / talked : 0);
  return {
    key: tally.key,
    talked,
    read: reviewsRead,
    counts: { low: tally.low, just: tally.just, high: tally.high },
    shares: { low: share(tally.low), just: share(tally.just), high: share(tally.high) },
  };
}

/** 定義の順に、声があったものだけ。 */
export function fitSummaries(fits: readonly FitTally[] | null | undefined, reviewsRead: number, order: readonly string[]): FitSummary[] {
  if (!fits?.length) return [];
  return order
    .map((key) => fits.find((t) => t.key === key))
    .filter((t): t is FitTally => !!t && t.low + t.just + t.high > 0)
    .map((t) => fitSummary(t, reviewsRead));
}

/** データの検査。件数・向き・引用。validate:data と抽出の両方で使う。 */
export function checkFits(fits: unknown, reviewsRead: number, knownKeys?: ReadonlySet<string>): string[] {
  if (fits === undefined) return [];
  if (!Array.isArray(fits)) return ["fits が配列ではありません"];
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const t of fits as FitTally[]) {
    const at = `fits/${t?.key ?? "?"}`;
    if (typeof t?.key !== "string" || !t.key) { errors.push("fits の key が空です"); continue; }
    if (seen.has(t.key)) errors.push(`${at}: key が重複しています`);
    seen.add(t.key);
    if (knownKeys && !knownKeys.has(t.key)) errors.push(`${at}: 未知のちょうどよさの観点です`);
    for (const d of FIT_DIRECTIONS) {
      const n = t[d];
      if (!Number.isInteger(n) || n < 0) errors.push(`${at}: ${d} が非負整数ではありません（${n}）`);
    }
    const talked = (t.low ?? 0) + (t.just ?? 0) + (t.high ?? 0);
    // 1件のレビューは1つの向きにしか数えないので、合計も読んだ件数を超えない
    if (talked > reviewsRead) errors.push(`${at}: ふれた件数 ${talked} が読んだ件数 ${reviewsRead} を超えています`);
    if (!Array.isArray(t.quotes)) { errors.push(`${at}: quotes が配列ではありません`); continue; }
    for (const q of t.quotes) {
      if (!FIT_DIRECTIONS.includes(q?.direction)) errors.push(`${at}: 引用の direction がおかしい（${q?.direction}）`);
      if (typeof q?.text !== "string" || q.text.trim().length < 6) errors.push(`${at}: 引用が6文字未満です`);
      if (typeof q?.reviewUrl !== "string" || !q.reviewUrl.startsWith("https://")) errors.push(`${at}: 引用の出典がありません`);
    }
    for (const d of FIT_DIRECTIONS) {
      if ((t[d] ?? 0) > 0 && !t.quotes.some((q) => q?.direction === d)) errors.push(`${at}: ${d} の件数があるのに、その向きの引用がありません`);
    }
  }
  return errors;
}

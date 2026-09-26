import type { FitDirection } from "./fit-model.ts";

/**
 * レビュー1件ごとの記録（2026-09-26・オーナーの答え：進め方 A）。
 *
 * 楽天のレビューページにある、そのレビューの★・投稿月・年代・性別と、AI がそのレビューを数えた観点だけを持つ。
 * 本文・ニックネーム・レビューの番号は持たない（公開リポジトリに入るため）。
 *
 * これがあると、同じ数え方のまま
 *  - 似た人（年代・性別）や最近（1年以内）のレビューだけで数え直せる
 *  - 「その残念があったレビューの★」と「ほかのレビューの★」をくらべられる（★を下げている残念）
 * 件数はいつも、絞ったあとのレビューの数を分母にする（設計原則1）。
 */
export type VoiceRow = {
  /** そのレビューの★（1〜5）。 */
  r: number | null;
  /** 投稿月（YYYY-MM）。 */
  d: string | null;
  /** 年代（10・20・…）。 */
  a: number | null;
  /** 性別。 */
  s: "m" | "f" | null;
  /** よかった に数えた観点。 */
  p: string[];
  /** 残念だった に数えた観点。 */
  n: string[];
  /** ちょうどよさ（観点 → 向き）。 */
  f?: Record<string, FitDirection>;
};

type MetaLike = { rating: number | null; date: string | null; age: number | null; sex: "male" | "female" | null } | undefined;

/** 1件のレビューの分け方から記録を作る。同じ観点・同じ向きは1つにまとめる（数え方と同じ）。 */
export function toRow(
  meta: MetaLike,
  classifications: readonly { key: string; polarity: "positive" | "negative" }[],
  fits: readonly { key: string; direction: FitDirection }[] = [],
): VoiceRow {
  const p = [...new Set(classifications.filter((c) => c.polarity === "positive").map((c) => c.key))];
  const n = [...new Set(classifications.filter((c) => c.polarity === "negative").map((c) => c.key))];
  const f: Record<string, FitDirection> = {};
  for (const fit of fits) if (!(fit.key in f)) f[fit.key] = fit.direction;
  return {
    r: meta?.rating ?? null,
    d: meta?.date ? meta.date.slice(0, 7) : null,
    a: meta?.age ?? null,
    s: meta?.sex === "male" ? "m" : meta?.sex === "female" ? "f" : null,
    p,
    n,
    ...(Object.keys(f).length ? { f } : {}),
  };
}

export type RowFilter = {
  sex?: "m" | "f" | null;
  /** 年代の範囲（両端を含む）。 */
  ageFrom?: number | null;
  ageTo?: number | null;
  /** この月（YYYY-MM）以降。 */
  since?: string | null;
};

/** 絞り込み。答えていない人（年代や性別が無い）は、その条件で絞るときは外す。 */
export function filterRows(rows: readonly VoiceRow[], filter: RowFilter): VoiceRow[] {
  return rows.filter((row) => {
    if (filter.sex && row.s !== filter.sex) return false;
    if (filter.ageFrom != null && (row.a == null || row.a < filter.ageFrom)) return false;
    if (filter.ageTo != null && (row.a == null || row.a > filter.ageTo)) return false;
    if (filter.since && (!row.d || row.d < filter.since)) return false;
    return true;
  });
}

/** 記録から、観点ごとの よかった・残念だった を数える（AspectTally と同じ形。引用は持たない）。 */
export function tallyRows(rows: readonly VoiceRow[], order: readonly string[]) {
  return order
    .map((key) => ({
      key,
      positive: rows.filter((row) => row.p.includes(key)).length,
      negative: rows.filter((row) => row.n.includes(key)).length,
      quotes: [],
    }))
    .filter((t) => t.positive + t.negative > 0);
}

/** 記録から、ちょうどよさを数える（FitTally と同じ形。引用は持たない）。 */
export function tallyFitRows(rows: readonly VoiceRow[], keys: readonly string[]) {
  return keys
    .map((key) => ({
      key,
      low: rows.filter((row) => row.f?.[key] === "low").length,
      just: rows.filter((row) => row.f?.[key] === "just").length,
      high: rows.filter((row) => row.f?.[key] === "high").length,
      quotes: [],
    }))
    .filter((t) => t.low + t.just + t.high > 0);
}

/** 今日から n か月前の月（YYYY-MM）。「最近1年」は monthsAgo(today, 12)。 */
export function monthsAgo(today: Date, months: number) {
  const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - months, 1));
  return d.toISOString().slice(0, 7);
}

/** ★を下げている残念：その残念があったレビューが、この件数以上（★のあるもの）ある観点だけ。 */
export const IMPACT_MIN = 5;

export type Impact = {
  key: string;
  /** その残念があったレビュー（★のあるもの）。 */
  with: { count: number; avg: number };
  /** それ以外のレビュー（★のあるもの）。 */
  without: { count: number; avg: number };
  /** ★の平均の差（without − with）。大きいほど、その残念がある人の★が低い。 */
  gap: number;
};

const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

/**
 * 観点ごとに、その残念があったレビューの★の平均と、ほかのレビューの★の平均をくらべる。
 * 差の大きい順。「★を下げた原因」とは言わない（同じレビューにほかの不満があることもある）。並べるのは平均の差だけ。
 */
export function starImpact(rows: readonly VoiceRow[], order: readonly string[], min = IMPACT_MIN): Impact[] {
  const rated = rows.filter((row) => row.r != null);
  return order
    .map((key) => {
      const withIt = rated.filter((row) => row.n.includes(key)).map((row) => row.r!);
      const rest = rated.filter((row) => !row.n.includes(key)).map((row) => row.r!);
      if (withIt.length < min || !rest.length) return null;
      const w = avg(withIt), o = avg(rest);
      return { key, with: { count: withIt.length, avg: w }, without: { count: rest.length, avg: o }, gap: o - w };
    })
    .filter((x): x is Impact => !!x && x.gap > 0)
    .sort((a, b) => b.gap - a.gap || a.key.localeCompare(b.key));
}

/** 記録と、観点ごとの件数が食い違っていないか（validate:data と抽出で使う）。 */
export function checkRows(rows: unknown, reviewsRead: number, aspects: readonly { key: string; positive: number; negative: number }[]): string[] {
  if (rows === undefined) return [];
  if (!Array.isArray(rows)) return ["rows が配列ではありません"];
  const errors: string[] = [];
  if (rows.length !== reviewsRead) errors.push(`rows が ${rows.length}件で、読んだ件数 ${reviewsRead} と合いません`);
  const list = rows as VoiceRow[];
  for (const t of aspects) {
    const p = list.filter((row) => row.p?.includes(t.key)).length;
    const n = list.filter((row) => row.n?.includes(t.key)).length;
    if (p !== t.positive || n !== t.negative) errors.push(`${t.key}: rows からは ${p}｜${n}、件数は ${t.positive}｜${t.negative}`);
  }
  for (const row of list) {
    if (row.r != null && !(Number.isInteger(row.r) && row.r >= 1 && row.r <= 5)) { errors.push(`rows の★がおかしい（${row.r}）`); break; }
  }
  return errors;
}

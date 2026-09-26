import type { Quote } from "./aspect-model.ts";

export type Classification = {
  key: string;
  polarity: "positive" | "negative";
  quote: string;
};

export type ClassifiedReview = {
  text: string;
  sourceUrl: string;
  classifications: Classification[];
};

export type TallyWithQuotes = {
  key: string;
  positive: number;
  negative: number;
  quotes: Quote[];
};

/**
 * 引用は、よかった・残念だった それぞれ3件まで。
 * 1つの枠を両方で取り合うと、先に来た側だけになる（Liberty 4 のノイキャンは残念14件なのに引用が3件ともよかった側だった）。
 */
export const MAX_QUOTES_PER_SIDE = 3;

export function aggregateTallies(reviews: ClassifiedReview[]): TallyWithQuotes[] {
  const tallies = new Map<string, TallyWithQuotes>();

  for (const review of reviews) {
    const seen = new Set<string>();
    for (const c of review.classifications) {
      const dedupKey = `${c.key}:${c.polarity}`;
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);

      const tally = tallies.get(c.key) ?? { key: c.key, positive: 0, negative: 0, quotes: [] };
      if (c.polarity === "positive") tally.positive += 1;
      else tally.negative += 1;
      const sameSide = tally.quotes.filter((q) => q.polarity === c.polarity);
      if (sameSide.length < MAX_QUOTES_PER_SIDE && !sameSide.some((q) => q.text === c.quote)) {
        tally.quotes.push({ text: c.quote, reviewUrl: review.sourceUrl, polarity: c.polarity });
      }
      tallies.set(c.key, tally);
    }
  }

  return [...tallies.values()];
}

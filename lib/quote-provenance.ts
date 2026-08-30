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

const MAX_QUOTES_PER_TALLY = 3;

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
      if (tally.quotes.length < MAX_QUOTES_PER_TALLY && !tally.quotes.some((q) => q.text === c.quote)) {
        tally.quotes.push({ text: c.quote, reviewUrl: review.sourceUrl });
      }
      tallies.set(c.key, tally);
    }
  }

  return [...tallies.values()];
}

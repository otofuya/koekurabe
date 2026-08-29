import type { AspectDefinition } from "./category-definitions.ts";

/**
 * Turning what buyers wrote into two axes.
 *
 * Everything the chart decides lives here as a pure function, because every one of these decisions
 * was wrong the first time it was written and the tests are what keep them right.
 *
 * The counts themselves are not estimates. "30件のレビューのうち11件が装着感に触れ、うち4件が不満"
 * is a tally of what people wrote, which is why nothing in this file carries a `provenance` or
 * needs a 推定 badge — the whole 87%-estimated problem of the spec pipeline simply does not arise.
 */

/** One aspect as counted for one product. */
export type AspectTally = {
  key: string;
  positive: number;
  negative: number;
  /** Verbatim fragments from the reviews, already checked against the source text. */
  quotes: string[];
};

export type AspectProduct = {
  id: string;
  /** How many reviews were read to produce these tallies. The denominator, always shown. */
  reviewsRead: number;
  aspects: AspectTally[];
};

/**
 * How much a single mention is discounted.
 *
 * Four. With no shrinkage at all, one lone positive mention scores +1.00 — the maximum — so the
 * products nobody has written about end up further out than the products eleven people agreed on.
 * The chart then reads exactly backwards. Measured on the earbuds set: SHOKZ OpenFit (one mention)
 * sat outside SONY WF-C710N (eleven), and the same happened at the other end with WF-1000XM5.
 *
 * With four, a lone mention reaches ±0.20 and eleven-to-one reaches ±0.60, so **evidence is what
 * pushes a product outwards**. That property is worth more than the exact constant: it means the
 * middle of the chart is where "nobody has said much yet" lives, and a reader can see that without
 * being told.
 */
export const SHRINKAGE = 4;

/**
 * Where one product sits on one aspect, between −1 and +1.
 *
 * Zero means either "opinion is evenly split" or "barely anyone mentioned it". Those two are not
 * the same thing, which is why `reviewsRead` and the raw counts travel alongside the score
 * everywhere it is shown, and why a product with no mention at all is never given a score.
 */
export function shrunkScore(positive: number, negative: number, k = SHRINKAGE) {
  const total = positive + negative;
  return total ? (positive - negative) / (total + k) : 0;
}

const tallyOf = (product: AspectProduct, key: string) => product.aspects.find((item) => item.key === key);

function hasMention(product: AspectProduct, key: string) {
  const tally = tallyOf(product, key);
  return Boolean(tally && tally.positive + tally.negative > 0);
}

/** Products in the genre that mentioned this aspect at all. */
export const mentionCount = (products: readonly AspectProduct[], key: string) =>
  products.filter((product) => hasMention(product, key)).length;

/**
 * A product needs this many mentions before its opinion is measured for spread.
 *
 * One mention is always unanimous, so it always reads as ±1.00 — the widest possible opinion,
 * from the thinnest possible evidence. Left in, it inflates the spread of exactly the aspects
 * nobody discusses: 通話品質 measured 0.80 on the real set from two products holding one mention
 * each, which would have ranked it above ノイズキャンセリング.
 */
export const MINIMUM_MENTIONS_TO_MEASURE = 2;
/** Fewer than this many measurable products and the spread is an accident of who wrote twice. */
export const MINIMUM_MEASURED_PRODUCTS = 6;

/** Products whose opinion on this aspect is firm enough to be measured. */
export const measuredCount = (products: readonly AspectProduct[], key: string) => measuredNets(products, key).length;

/**
 * Raw sentiment, not the shrunk score, and only from products that said it more than once.
 *
 * The two numbers answer different questions and must not share a formula. **Position** asks how
 * confident we are, so it shrinks towards the middle when the evidence is thin. **Spread** asks
 * whether products disagree at all, and shrinking flattens exactly the signal it needs: on the
 * real set, shrinking compressed every aspect into 0.17–0.32 and let 音質 — approved by all twenty
 * products — sit mid-table, because its sheer volume of mentions pushed its scores outward too.
 * Unshrunk, 音質 falls to 0.27 against 0.49 and 0.66 for 装着感 and ANC, which is the truth.
 */
function measuredNets(products: readonly AspectProduct[], key: string) {
  return products.flatMap((product) => {
    const tally = tallyOf(product, key);
    if (!tally) return [];
    const total = tally.positive + tally.negative;
    if (total < MINIMUM_MENTIONS_TO_MEASURE) return [];
    return [(tally.positive - tally.negative) / total];
  });
}

/**
 * How far apart this aspect pushes the products: the spread of their opinions.
 *
 * This decides whether an aspect can be an axis, and it is deliberately not "how often is it
 * mentioned". 音質 is mentioned by every product in the earbuds set, seven times each — and
 * separates nothing, because everyone says the sound is good. Ordering by mentions puts it first;
 * ordering by spread puts it last, which is the truth.
 *
 * The same failure had already happened on the spec side: 防水 cleared the coverage gate at 58%
 * while holding 55 yeses and a single no. Coverage was never the right question.
 */
export function separation(products: readonly AspectProduct[], key: string) {
  const nets = measuredNets(products, key);
  if (nets.length < 3) return 0;
  const mean = nets.reduce((sum, value) => sum + value, 0) / nets.length;
  return Math.sqrt(nets.reduce((sum, value) => sum + (value - mean) ** 2, 0) / nets.length);
}

/** Below this many products discussing it, an axis is describing a handful of listings, not a genre. */
export const MINIMUM_MENTIONING_PRODUCTS = 8;
/** Below this spread, every product lands in the same place and the axis draws a clump. */
export const MINIMUM_SEPARATION = .35;

export type OfferableAxis = AspectDefinition & {
  /** How many products in the genre said anything about it. */
  products: number;
  /** How many said it more than once, which is what the spread was measured from. */
  measured: number;
  separation: number;
  offerable: boolean;
  /** Why it cannot be offered, in the words the picker shows. Null when it can. */
  blockedBecause: string | null;
};

/**
 * Every aspect, with the verdict on whether it can carry an axis and why not when it cannot.
 *
 * The blocked ones are returned rather than filtered away on purpose: the picker draws them greyed
 * out with the reason attached, so somebody wondering why they cannot compare by sound quality
 * gets an answer instead of an absence. A screen that shows its own limits is trusted further
 * than one that quietly offers less.
 */
export function offerableAxes(products: readonly AspectProduct[], definitions: readonly AspectDefinition[]): OfferableAxis[] {
  return definitions.map((definition) => {
    const count = mentionCount(products, definition.key);
    const measured = measuredCount(products, definition.key);
    const spread = separation(products, definition.key);
    const blockedBecause = count < MINIMUM_MENTIONING_PRODUCTS
      ? `${count}商品しか語っていません`
      : measured < MINIMUM_MEASURED_PRODUCTS
        ? `${count}商品が言及していますが、複数回書かれた商品が${measured}件しかありません`
        : spread < MINIMUM_SEPARATION
          ? `${count}商品が言及していますが、評価がほぼ揃うため並べても差が出ません`
          : null;
    return {
      ...definition, products: count, measured,
      separation: Math.round(spread * 1000) / 1000,
      offerable: !blockedBecause, blockedBecause,
    };
  });
}

export type AxisPair = {
  x: OfferableAxis;
  y: OfferableAxis;
  /** Products that said something about both. Only these can be placed. */
  both: number;
  score: number;
};

/**
 * The pairs worth offering, best first.
 *
 * Ranked by the two axes' spread, then by how many products can actually be drawn. A pair that
 * separates beautifully but places six products is a worse first impression than one that
 * separates well and places twelve.
 */
export function axisPairs(axes: readonly OfferableAxis[], products: readonly AspectProduct[], minimumBoth = 6): AxisPair[] {
  const usable = axes.filter((axis) => axis.offerable);
  const pairs: AxisPair[] = [];
  for (let a = 0; a < usable.length; a += 1) {
    for (let b = a + 1; b < usable.length; b += 1) {
      const x = usable[a], y = usable[b];
      const both = products.filter((product) => hasMention(product, x.key) && hasMention(product, y.key)).length;
      if (both < minimumBoth) continue;
      pairs.push({ x, y, both, score: Math.round((x.separation + y.separation) / 2 * 1000) / 1000 });
    }
  }
  return pairs.sort((first, second) => (second.score - first.score) || (second.both - first.both));
}


export type QuadrantPoint = {
  id: string;
  /** −1..+1 on each axis. */
  x: number;
  y: number;
  /** Mentions behind the position, summed across both axes. Drives how large the circle is drawn. */
  weight: number;
  xTally: AspectTally;
  yTally: AspectTally;
};

/**
 * Placing the products, and setting aside the ones that cannot be placed.
 *
 * A product nobody has discussed on either axis is **not** put at the origin. The origin means
 * "opinion is balanced", and silence is not balance — the same distinction 原則25 draws between
 * 非対応 and 掲載なし, and the same mistake it forbids. They come back in `unspoken` so the screen
 * can name them and their count, rather than drawing them as a claim nobody made.
 */
export function quadrantPoints(products: readonly AspectProduct[], xKey: string, yKey: string) {
  const points: QuadrantPoint[] = [];
  const unspoken: string[] = [];
  for (const product of products) {
    const xTally = tallyOf(product, xKey);
    const yTally = tallyOf(product, yKey);
    if (!xTally || !yTally || !hasMention(product, xKey) || !hasMention(product, yKey)) {
      unspoken.push(product.id);
      continue;
    }
    points.push({
      id: product.id,
      x: shrunkScore(xTally.positive, xTally.negative),
      y: shrunkScore(yTally.positive, yTally.negative),
      weight: xTally.positive + xTally.negative + yTally.positive + yTally.negative,
      xTally, yTally,
    });
  }
  return { points, unspoken };
}

/**
 * A quote is kept only if it appears in the reviews it claims to come from.
 *
 * The extraction stitches fragments from separate reviews into one string often enough to matter —
 * 17 of 138 on the first run, all on one product. A stitched quote reads as one person's sentence
 * and is not, so it goes. 原則23 already required this for inferred specs; the same rule applies
 * with more force here, because a quote is the only way a reader can check a count.
 */
export function verifiedQuotes(quotes: readonly string[], sourceText: string) {
  return quotes.map((quote) => quote.trim()).filter((quote) => quote.length >= 6 && sourceText.includes(quote));
}

/* ── reading the tallies out loud ─────────────────────────────────────────── */

export type RankedProduct = { id: string; score: number; tally: AspectTally };

/**
 * One aspect, every product that has an opinion on it, best first.
 *
 * The products nobody discussed come back separately rather than at the bottom. Ranked last they
 * would read as "worst", when what they are is unmeasured — the same distinction 原則25 draws
 * between 非対応 and 掲載なし, and the same one `quadrantPoints` keeps on the chart.
 */
export function aspectRanking(products: readonly AspectProduct[], key: string) {
  const ranked: RankedProduct[] = [];
  const unspoken: string[] = [];
  for (const product of products) {
    const tally = product.aspects.find((item) => item.key === key);
    if (!tally || tally.positive + tally.negative === 0) { unspoken.push(product.id); continue; }
    ranked.push({ id: product.id, score: shrunkScore(tally.positive, tally.negative), tally });
  }
  // Ties broken by evidence: between two products at +0.50, the one eleven buyers agreed on is a
  // firmer answer than the one four did, and should be read first.
  ranked.sort((first, second) =>
    (second.score - first.score)
    || ((second.tally.positive + second.tally.negative) - (first.tally.positive + first.tally.negative)));
  return { ranked, unspoken };
}

export type VerdictLine = { key: string; label: string; positive: number; negative: number; total: number };

/**
 * What this product is praised and blamed for, as counts.
 *
 * Deliberately not a sentence written by a model. The site's whole claim is that its numbers are
 * tallies a reader can check, and a generated summary sitting beside them would be the one thing
 * on the page nobody could verify — 原則1 permits explaining, and still forbids asserting things
 * the catalogue never said.
 *
 * `praised` and `blamed` can name the same aspect. A product whose fit is 10 for and 8 against is
 * genuinely both, and flattening that to one verdict would hide the most useful thing about it.
 */
export function verdict(product: AspectProduct, definitions: readonly AspectDefinition[], minimum = 2) {
  const labels = new Map(definitions.map((definition) => [definition.key, definition.label]));
  const lines: VerdictLine[] = product.aspects.flatMap((tally) => {
    const label = labels.get(tally.key);
    const total = tally.positive + tally.negative;
    return label && total >= minimum ? [{ key: tally.key, label, positive: tally.positive, negative: tally.negative, total }] : [];
  });
  return {
    praised: lines.filter((line) => line.positive > line.negative).sort((a, b) => b.positive - a.positive),
    blamed: lines.filter((line) => line.negative > 0).sort((a, b) => b.negative - a.negative),
  };
}

export type Coverage = { total: number; analysed: number; reviewsRead: number; share: number };

/**
 * How much of the genre has actually been read.
 *
 * Shown on every screen that lists products, never as a footnote. A comparison site that quietly
 * covers a quarter of its own catalogue leaves the visitor to wonder whether the missing product
 * is missing or simply absent, and that doubt costs more than the gap does.
 */
export function coverageOf(totalProducts: number, analysed: readonly AspectProduct[]): Coverage {
  const reviewsRead = analysed.reduce((sum, product) => sum + product.reviewsRead, 0);
  return {
    total: totalProducts,
    analysed: analysed.length,
    reviewsRead,
    share: totalProducts ? analysed.length / totalProducts : 0,
  };
}

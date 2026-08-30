import assert from "node:assert/strict";
import test from "node:test";
import {
  MINIMUM_MENTIONING_PRODUCTS, aspectRanking, axisPairs, coverageOf, mentionCount, offerableAxes,
  quadrantPoints, separation, shrunkScore, verdict, verifiedQuotes, checkPublishability,
  resolveDefaultAxes, type AspectProduct,
} from "./aspect-model.ts";
import type { AspectDefinition } from "./category-definitions.ts";

const pole = (key: string, label: string): AspectDefinition =>
  ({ key, label, positivePole: `${label}が良い`, negativePole: `${label}に不満` });

const DEFINITIONS = [pole("fit", "装着感"), pole("anc", "ノイズキャンセリング"), pole("sound", "音質"), pole("calls", "通話品質")];

/** A product with the tallies named, and nothing else the model does not read. */
const product = (id: string, tallies: Record<string, [number, number]>, reviewsRead = 30): AspectProduct => ({
  id, reviewsRead,
  aspects: Object.entries(tallies).map(([key, [positive, negative]]) => ({ key, positive, negative, quotes: [] })),
});

/**
 * A genre shaped like the real one: 装着感 and ANC divide the products, 音質 is mentioned by
 * everyone and approved by everyone, 通話品質 is barely discussed.
 */
const genre = () => [
  product("c710n", { fit: [3, 4], anc: [10, 1], sound: [11, 1] }),
  product("n10pro", { fit: [3, 8], anc: [0, 6], sound: [14, 0] }),
  product("ultraopen", { fit: [10, 2], anc: [0, 2], sound: [13, 0] }),
  product("liberty4", { fit: [4, 0], anc: [3, 0], sound: [13, 1] }),
  product("qc2", { fit: [4, 0], anc: [6, 2], sound: [10, 0] }),
  product("airpro3", { fit: [4, 0], anc: [7, 3], sound: [9, 1] }),
  product("ept21s", { fit: [2, 1], anc: [0, 1], sound: [9, 0], calls: [1, 0] }),
  product("linkbuds", { fit: [3, 1], anc: [1, 0], sound: [3, 0] }),
  product("xm5", { fit: [0, 1], anc: [1, 1], sound: [2, 0] }),
  product("openfit", { fit: [1, 0], anc: [1, 1], sound: [3, 0], calls: [1, 0] }),
  // Discussed, but only ever for their sound. They cannot be placed on a 装着感 × ANC chart.
  product("noble", { sound: [2, 0] }),
  product("acoustune", { sound: [3, 0] }),
];

test("a single mention lands near the middle, not at the edge", () => {
  // Without shrinkage this is +1.00 — the maximum — so the product nobody discussed would be drawn
  // further out than one eleven people agreed about. Measured on the real set before the fix.
  assert.equal(shrunkScore(1, 0), .2);
  assert.equal(shrunkScore(0, 1), -.2);
});

test("evidence is what pushes a product outwards", () => {
  const lonely = Math.abs(shrunkScore(1, 0));
  const argued = Math.abs(shrunkScore(10, 1));
  const settled = Math.abs(shrunkScore(10, 0));
  assert.ok(argued > lonely, "eleven mentions must outrank one");
  assert.ok(settled > argued, "unanimous outranks contested at the same volume");
});

test("no mention scores zero rather than dividing by nothing", () => {
  assert.equal(shrunkScore(0, 0), 0);
});

test("an aspect everyone approves of separates nothing", () => {
  const products = genre();
  // 音質 is the most-discussed aspect in the genre and the least useful axis in it.
  assert.ok(mentionCount(products, "sound") > mentionCount(products, "anc"));
  assert.ok(separation(products, "sound") < separation(products, "anc"),
    "sound quality is mentioned more and separates less");
});

test("the axis gate drops the crowd-pleaser and the barely-discussed alike", () => {
  const axes = offerableAxes(genre(), DEFINITIONS);
  const byKey = new Map(axes.map((axis) => [axis.key, axis]));

  assert.equal(byKey.get("fit")?.offerable, true);
  assert.equal(byKey.get("anc")?.offerable, true);

  const sound = byKey.get("sound")!;
  assert.equal(sound.offerable, false, "everyone approves of it, so it draws a clump");
  assert.match(sound.blockedBecause!, /差が出ません/);

  const calls = byKey.get("calls")!;
  assert.equal(calls.offerable, false);
  assert.match(calls.blockedBecause!, /商品しか語っていません/);
});

test("a blocked axis still says why, so the picker can show it greyed out", () => {
  const axes = offerableAxes(genre(), DEFINITIONS);
  // Nothing is filtered away: a screen that shows its own limits beats one that quietly offers less.
  assert.equal(axes.length, DEFINITIONS.length);
  assert.ok(axes.every((axis) => axis.offerable === (axis.blockedBecause === null)));
});

test("an aspect nobody discusses cannot reach the gate however split it looks", () => {
  const products = [product("a", { calls: [3, 0] }), product("b", { calls: [0, 3] }), product("c", { calls: [2, 1] })];
  const axes = offerableAxes(products, [pole("calls", "通話品質")]);
  assert.ok(3 < MINIMUM_MENTIONING_PRODUCTS);
  assert.equal(axes[0].offerable, false);
});

test("pairs are ranked by how far they spread the products", () => {
  const pairs = axisPairs(offerableAxes(genre(), DEFINITIONS), genre());
  assert.ok(pairs.length >= 1);
  assert.deepEqual([pairs[0].x.key, pairs[0].y.key].sort(), ["anc", "fit"]);
  assert.ok(pairs.every((pair) => pair.x.offerable && pair.y.offerable), "a blocked axis never reaches a pair");
  assert.equal(pairs[0].both, 10);
});

test("silence is not the origin", () => {
  // noble and acoustune were reviewed, but never about fit or noise cancelling. Placing them at
  // (0,0) would claim opinion was balanced, when in fact nobody expressed one.
  const { points, unspoken } = quadrantPoints(genre(), "fit", "anc");
  assert.equal(points.length, 10);
  assert.deepEqual(unspoken, ["noble", "acoustune"]);
  assert.ok(!points.some((point) => point.id === "noble"));
});

test("a product that mentions only one of the two axes is also set aside", () => {
  const products = [...genre(), product("halfway", { fit: [5, 1] })];
  const { points, unspoken } = quadrantPoints(products, "fit", "anc");
  assert.ok(unspoken.includes("halfway"));
  assert.equal(points.length, 10);
});

test("the placed products carry the counts that put them there", () => {
  const { points } = quadrantPoints(genre(), "fit", "anc");
  const c710n = points.find((point) => point.id === "c710n")!;
  assert.deepEqual([c710n.xTally.positive, c710n.xTally.negative], [3, 4]);
  assert.deepEqual([c710n.yTally.positive, c710n.yTally.negative], [10, 1]);
  // 7 fit mentions + 11 ANC mentions. The circle is drawn from this, so evidence reads as size.
  assert.equal(c710n.weight, 18);
});

test("the real genre puts the contested product left and the quiet one in the middle", () => {
  const { points } = quadrantPoints(genre(), "fit", "anc");
  const at = (id: string) => points.find((point) => point.id === id)!;
  assert.ok(at("n10pro").x < at("c710n").x, "3/8 sits left of 3/4");
  assert.ok(at("n10pro").y < at("c710n").y, "0/6 sits below 10/1");
  assert.ok(at("ultraopen").x > at("c710n").x, "10/2 sits right of 3/4");
  // One mention each way: pulled to the middle rather than thrown to a corner.
  assert.ok(Math.abs(at("openfit").x) < Math.abs(at("ultraopen").x));
  assert.ok(Math.abs(at("xm5").x) < Math.abs(at("n10pro").x));
});

test("a quote survives only if it is in the text it claims to come from", () => {
  const source = "音質は良いです。 / 私の右耳にフィットしないので、じっとしてても度々落とすことです。";
  const kept = verifiedQuotes([
    "音質は良いです。",
    // Stitched from two separate reviews: reads as one sentence, was never written as one.
    "音質は良いです。私の右耳にフィットしない",
    "  私の右耳にフィットしない  ",
    "短い",
  ], source);
  assert.deepEqual(kept, ["音質は良いです。", "私の右耳にフィットしない"]);
});

/* --- reading the tallies out loud ------------------------------------------------------ */

test("a ranking sets aside the products nobody discussed", () => {
  const { ranked, unspoken } = aspectRanking(genre(), "fit");
  // noble and acoustune were reviewed, but never about fit. Last place would read as "worst";
  // what they are is unmeasured.
  assert.deepEqual(unspoken, ["noble", "acoustune"]);
  assert.equal(ranked.length, 10);
  assert.ok(!ranked.some((entry) => entry.id === "noble"));
});

test("the ranking puts the best first and the contested last", () => {
  const { ranked } = aspectRanking(genre(), "fit");
  assert.equal(ranked[0].id, "ultraopen", "10 for and 2 against leads");
  assert.equal(ranked.at(-1)!.id, "n10pro", "3 for and 8 against trails");
});

test("evidence breaks a tie in the ranking", () => {
  const products = [
    product("thin", { fit: [2, 0] }),
    product("thick", { fit: [8, 0] }),
  ];
  const { ranked } = aspectRanking(products, "fit");
  // Both are unanimous; the one eight buyers agreed on is the firmer answer.
  assert.ok(ranked[0].score > ranked[1].score);
  assert.equal(ranked[0].id, "thick");
});

test("a verdict is built from counts, never from prose", () => {
  const { praised, blamed } = verdict(genre()[0], DEFINITIONS);
  const named = (list: readonly { key: string }[]) => list.map((line) => line.key);
  assert.deepEqual(named(praised), ["sound", "anc"], "11/1 and 10/1 are praise");
  // Fit is 3 for and 4 against, so it is blamed — and 音質 is blamed too, on its single complaint.
  assert.ok(named(blamed).includes("fit"));
  assert.ok(praised.every((line) => line.positive > line.negative));
});

test("an aspect can be praised and blamed at once", () => {
  const divisive = product("divisive", { fit: [10, 8] });
  const { praised, blamed } = verdict(divisive, DEFINITIONS);
  // Ten buyers liked the fit and eight did not. Flattening that to one verdict would hide the
  // most useful thing about the product.
  assert.deepEqual(praised.map((line) => line.key), ["fit"]);
  assert.deepEqual(blamed.map((line) => line.key), ["fit"]);
});

test("a single mention is too thin for a verdict", () => {
  const { praised, blamed } = verdict(product("quiet", { fit: [1, 0] }), DEFINITIONS);
  assert.equal(praised.length, 0);
  assert.equal(blamed.length, 0);
});

test("coverage reports the denominator, not just the share", () => {
  const analysed = genre();
  const coverage = coverageOf(97, analysed);
  assert.equal(coverage.total, 97);
  assert.equal(coverage.analysed, 12);
  assert.equal(coverage.reviewsRead, 12 * 30);
  assert.ok(Math.abs(coverage.share - 12 / 97) < 1e-9);
});

test("coverage of an empty genre does not divide by zero", () => {
  assert.equal(coverageOf(0, []).share, 0);
});

// ── checkPublishability ────────────────────────────────────────────────────

test("a well-populated genre is publishable", () => {
  const result = checkPublishability(genre(), DEFINITIONS);
  assert.equal(result.publishable, true);
  assert.ok(result.offerableCount >= 2);
  assert.ok(result.validPairCount >= 1);
  assert.equal(result.blockers.length, 0);
});

test("a genre with only one offerable axis is not publishable", () => {
  const sparse = [
    product("a", { fit: [3, 4], sound: [11, 1] }),
    product("b", { fit: [3, 8], sound: [14, 0] }),
    product("c", { fit: [10, 2], sound: [13, 0] }),
    product("d", { fit: [4, 0], sound: [13, 1] }),
    product("e", { fit: [4, 0], sound: [10, 0] }),
    product("f", { fit: [4, 0], sound: [9, 1] }),
    product("g", { fit: [2, 1], sound: [9, 0] }),
    product("h", { fit: [3, 1], sound: [3, 0] }),
  ];
  const result = checkPublishability(sparse, DEFINITIONS);
  assert.equal(result.publishable, false);
  assert.ok(result.blockers.length > 0);
});

// ── resolveDefaultAxes ─────────────────────────────────────────────────────

test("resolveDefaultAxes returns preferred axes when they form a valid pair", () => {
  const resolved = resolveDefaultAxes(genre(), DEFINITIONS, ["fit", "anc"]);
  assert.deepEqual(resolved, ["fit", "anc"]);
});

test("resolveDefaultAxes falls back when preferred axes are not a valid pair", () => {
  const resolved = resolveDefaultAxes(genre(), DEFINITIONS, ["calls", "sound"]);
  assert.notEqual(resolved, null);
  assert.notDeepEqual(resolved, ["calls", "sound"]);
});

test("resolveDefaultAxes returns null when no valid pairs exist", () => {
  const tiny = [product("a", { fit: [1, 0] }), product("b", { sound: [1, 0] })];
  const resolved = resolveDefaultAxes(tiny, DEFINITIONS);
  assert.equal(resolved, null);
});

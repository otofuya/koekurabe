import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aggregateFits, fitSummary, fitSummaries, checkFits, MAX_FIT_QUOTES_PER_DIRECTION } from "./fit-model.ts";
import type { FitReview, FitDirection } from "./fit-model.ts";

const URL = "https://review.rakuten.co.jp/item/1/1_2/1.1/";
const review = (direction: FitDirection, quote: string, key = "size"): FitReview => ({ sourceUrl: URL, fits: [{ key, direction, quote }] });

describe("aggregateFits", () => {
  it("3つの区間に数える", () => {
    const [t] = aggregateFits([review("low", "少し小さめでした"), review("just", "サイズはぴったりでした"), review("just", "いつものサイズでちょうど"), review("high", "大きめなので中敷きを入れた")]);
    assert.deepEqual([t.low, t.just, t.high], [1, 2, 1]);
  });
  it("1件のレビューは、同じ観点で1つの向きだけ（読んだ件数を超えない）", () => {
    const [t] = aggregateFits([{ sourceUrl: URL, fits: [{ key: "size", direction: "low", quote: "つま先が少しきつい" }, { key: "size", direction: "just", quote: "幅はちょうどいい感じ" }] }]);
    assert.equal(t.low + t.just + t.high, 1);
    assert.equal(t.low, 1);
  });
  it("引用は区間ごとに2件まで。数えた向きが付く", () => {
    const many = Array.from({ length: 5 }, (_, i) => review("low", `小さめでした、その${i}`));
    const [t] = aggregateFits([...many, review("high", "大きめでした、ゆるい")]);
    assert.equal(t.low, 5);
    assert.equal(t.quotes.filter((q) => q.direction === "low").length, MAX_FIT_QUOTES_PER_DIRECTION);
    assert.deepEqual(t.quotes.find((q) => q.direction === "high"), { text: "大きめでした、ゆるい", reviewUrl: URL, direction: "high" });
  });
  it("知らない向きは数えない", () => {
    const [t] = aggregateFits([review("just", "ちょうどよかったです"), { sourceUrl: URL, fits: [{ key: "size", direction: "tight" as FitDirection, quote: "きつかったです" }] }]);
    assert.equal(t.low + t.just + t.high, 1);
  });
});

describe("fitSummary", () => {
  it("帯の幅は、ふれた件数を全体にした割合。分母は読んだ件数", () => {
    const s = fitSummary({ key: "size", low: 12, just: 30, high: 6, quotes: [] }, 90);
    assert.equal(s.talked, 48);
    assert.equal(s.read, 90);
    assert.equal(s.shares.just, 30 / 48);
    assert.equal(s.shares.low + s.shares.just + s.shares.high, 1);
  });
  it("ふれた声が無ければ幅は0（割り算しない）", () => {
    const s = fitSummary({ key: "size", low: 0, just: 0, high: 0, quotes: [] }, 40);
    assert.deepEqual(s.shares, { low: 0, just: 0, high: 0 });
  });
  it("fitSummaries：定義の順・声のあるものだけ・データが無ければ空", () => {
    const fits = [{ key: "b", low: 1, just: 0, high: 0, quotes: [] }, { key: "a", low: 0, just: 2, high: 0, quotes: [] }, { key: "c", low: 0, just: 0, high: 0, quotes: [] }];
    assert.deepEqual(fitSummaries(fits, 30, ["a", "b", "c"]).map((s) => s.key), ["a", "b"]);
    assert.deepEqual(fitSummaries(null, 30, ["a"]), []);
    assert.deepEqual(fitSummaries(undefined, 30, ["a"]), []);
  });
});

describe("checkFits", () => {
  const ok = { key: "size", low: 1, just: 1, high: 0, quotes: [{ text: "少し小さめでした", reviewUrl: URL, direction: "low" }, { text: "ちょうどよいサイズ", reviewUrl: URL, direction: "just" }] };
  it("正しいデータは通る。fits が無い（前のデータ）のも通る", () => {
    assert.deepEqual(checkFits([ok], 10, new Set(["size"])), []);
    assert.deepEqual(checkFits(undefined, 10), []);
  });
  it("合計が読んだ件数を超える", () => {
    assert.ok(checkFits([{ ...ok, just: 20 }], 10).some((e) => /超えています/.test(e)));
  });
  it("件数のある向きに引用が無い", () => {
    assert.ok(checkFits([{ ...ok, high: 2 }], 10).some((e) => /high の件数があるのに/.test(e)));
  });
  it("向き・未知の観点・負の数", () => {
    assert.ok(checkFits([{ ...ok, quotes: [{ ...ok.quotes[0], direction: "tight" }, ok.quotes[1]] }], 10).some((e) => /direction/.test(e)));
    assert.ok(checkFits([ok], 10, new Set(["other"])).some((e) => /未知/.test(e)));
    assert.ok(checkFits([{ ...ok, low: -1 }], 10).some((e) => /非負整数/.test(e)));
  });
});

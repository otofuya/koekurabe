import assert from "node:assert/strict";
import test from "node:test";
import { deduplicateReviews, type RawPage } from "./review-dedup.ts";
import { verifiedQuotes } from "./aspect-model.ts";
import { aggregateTallies, type ClassifiedReview } from "./quote-provenance.ts";

const PRODUCT_URL = "https://product.rakuten.co.jp/product/-/abc/review/";
const PRODUCT_URL_P2 = "https://product.rakuten.co.jp/product/-/abc/review/2/";
const SHOP_URL = "https://review.rakuten.co.jp/item/1/789_012/1.1/";

test("product review sourceUrl reaches the final Quote", () => {
  const pages: RawPage[] = [
    { source: "reviews", page: 1, sourceUrl: PRODUCT_URL, text: "音質は良いです。低音がしっかり出ていて満足です。" },
  ];
  const dedup = deduplicateReviews(pages);
  assert.equal(dedup.reviews[0].sourceUrl, PRODUCT_URL);

  const reviews: ClassifiedReview[] = dedup.reviews.map((r) => ({
    text: r.text,
    sourceUrl: r.sourceUrl,
    classifications: [{ key: "sound", polarity: "positive", quote: "低音がしっかり出ていて満足です。" }],
  }));
  const tallies = aggregateTallies(reviews);
  assert.equal(tallies[0].quotes[0].reviewUrl, PRODUCT_URL);
});

test("shop review sourceUrl reaches the final Quote", () => {
  const pages: RawPage[] = [
    { source: "shop-reviews", page: 1, sourceUrl: SHOP_URL, text: "装着感がとても良いです。長時間つけても疲れません。" },
  ];
  const dedup = deduplicateReviews(pages);
  assert.equal(dedup.reviews[0].sourceUrl, SHOP_URL);

  const reviews: ClassifiedReview[] = dedup.reviews.map((r) => ({
    text: r.text,
    sourceUrl: r.sourceUrl,
    classifications: [{ key: "fit", polarity: "positive", quote: "装着感がとても良いです。" }],
  }));
  const tallies = aggregateTallies(reviews);
  assert.equal(tallies[0].quotes[0].reviewUrl, SHOP_URL);
});

test("deduplicated review's URL does not leak into surviving review's quote", () => {
  const pages: RawPage[] = [
    { source: "reviews", page: 1, sourceUrl: PRODUCT_URL, text: "音質は良いです。低音がしっかり出ていて満足です。" },
    { source: "shop-reviews", page: 1, sourceUrl: SHOP_URL, text: "音質は良いです。低音がしっかり出ていて満足です。" },
  ];
  const dedup = deduplicateReviews(pages);
  assert.equal(dedup.reviews.length, 1);
  assert.equal(dedup.reviews[0].sourceUrl, PRODUCT_URL, "reviews source wins dedup");

  const reviews: ClassifiedReview[] = dedup.reviews.map((r) => ({
    text: r.text,
    sourceUrl: r.sourceUrl,
    classifications: [{ key: "sound", polarity: "positive", quote: "低音がしっかり出ていて満足です。" }],
  }));
  const tallies = aggregateTallies(reviews);
  assert.equal(tallies[0].quotes[0].reviewUrl, PRODUCT_URL, "shop URL must not appear");
});

test("quotes from different pages keep their respective URLs", () => {
  const pages: RawPage[] = [
    { source: "reviews", page: 1, sourceUrl: PRODUCT_URL, text: "音質は最高です。" },
    { source: "reviews", page: 2, sourceUrl: PRODUCT_URL_P2, text: "装着感が悪いです。耳から落ちます。" },
  ];
  const dedup = deduplicateReviews(pages);
  assert.equal(dedup.reviews.length, 2);

  const reviews: ClassifiedReview[] = [
    { text: dedup.reviews[0].text, sourceUrl: dedup.reviews[0].sourceUrl, classifications: [
      { key: "sound", polarity: "positive", quote: "音質は最高です。" },
    ] },
    { text: dedup.reviews[1].text, sourceUrl: dedup.reviews[1].sourceUrl, classifications: [
      { key: "fit", polarity: "negative", quote: "装着感が悪いです。耳から落ちます。" },
    ] },
  ];
  const tallies = aggregateTallies(reviews);
  const soundTally = tallies.find((t) => t.key === "sound");
  const fitTally = tallies.find((t) => t.key === "fit");
  assert.equal(soundTally?.quotes[0].reviewUrl, PRODUCT_URL);
  assert.equal(fitTally?.quotes[0].reviewUrl, PRODUCT_URL_P2);
});

test("verifiedQuotes filters text without affecting URL propagation", () => {
  const sourceText = "音質は良いです。低音がしっかり出ていて満足です。";
  const kept = verifiedQuotes(["低音がしっかり出ていて満足です。", "存在しない引用テキスト"], sourceText);
  assert.deepEqual(kept, ["低音がしっかり出ていて満足です。"]);

  const reviews: ClassifiedReview[] = [{
    text: sourceText,
    sourceUrl: PRODUCT_URL,
    classifications: kept.map((q) => ({ key: "sound", polarity: "positive" as const, quote: q })),
  }];
  const tallies = aggregateTallies(reviews);
  assert.equal(tallies[0].quotes.length, 1);
  assert.equal(tallies[0].quotes[0].text, "低音がしっかり出ていて満足です。");
  assert.equal(tallies[0].quotes[0].reviewUrl, PRODUCT_URL);
});

// ── 引用の向き（2026-09-26） ────────────────────────────────────────

const review = (text: string, polarity: "positive" | "negative", quote = text, key = "anc"): ClassifiedReview =>
  ({ text, sourceUrl: PRODUCT_URL, classifications: [{ key, polarity, quote }] });

test("引用に、数えた側（よかった／残念だった）が付く", () => {
  const tallies = aggregateTallies([review("ノイキャンがよく効く。", "positive"), review("ノイキャンが弱い気がする。", "negative")]);
  assert.deepEqual(tallies[0].quotes.map((q) => [q.text, q.polarity]), [
    ["ノイキャンがよく効く。", "positive"],
    ["ノイキャンが弱い気がする。", "negative"],
  ]);
});

test("引用は側ごとに3件まで。先に来たよかったが、残念の枠を取らない", () => {
  const good = Array.from({ length: 5 }, (_, i) => review(`ノイキャンがよく効く、その${i}。`, "positive"));
  const bad = Array.from({ length: 4 }, (_, i) => review(`ノイキャンが弱い、その${i}。`, "negative"));
  const [tally] = aggregateTallies([...good, ...bad]);
  assert.equal(tally.positive, 5);
  assert.equal(tally.negative, 4);
  assert.equal(tally.quotes.filter((q) => q.polarity === "positive").length, 3);
  assert.equal(tally.quotes.filter((q) => q.polarity === "negative").length, 3);
});

test("件数のある側には、必ず引用がある", () => {
  const reviews = [
    ...Array.from({ length: 6 }, (_, i) => review(`よく効く${i}です。`, "positive")),
    review("まったく効かないです。", "negative"),
  ];
  const [tally] = aggregateTallies(reviews);
  assert.ok(tally.quotes.some((q) => q.polarity === "negative"));
});

test("同じ文が同じ側で2回出ても、引用は1つ", () => {
  const [tally] = aggregateTallies([review("よく効くと思います。", "positive"), review("よく効くと思います。", "positive")]);
  assert.equal(tally.positive, 2);
  assert.equal(tally.quotes.length, 1);
});

// ── 短い引用を一文に広げる（2026-09-26） ─────────────────────────────

import { expandQuote } from "./aspect-model.ts";

test("原文にある短い一節は、そのまわりの一文に広げる（原文どおりのまま）", () => {
  const text = "予想した通り、履きやすく歩きやすい最高のシューズです。 サイズもぴったりでした。";
  assert.equal(expandQuote("履きやすく", text), "予想した通り、履きやすく歩きやすい最高のシューズです。");
  assert.ok(text.includes(expandQuote("履きやすく", text)));
  assert.deepEqual(verifiedQuotes(["軽くて"], "軽くて理想のシューズです。サイズもぴったりでした。"), ["軽くて理想のシューズです。"]);
});

test("一文が長すぎるときは、読点や空白までの節にする", () => {
  const text = `届いた直後は失敗したかと不安がよぎったがこの3日間履いた感想は、通気性あり、履き心地も大変良いし${"とても".repeat(20)}満足です`;
  assert.equal(expandQuote("通気性あり", text), "通気性あり");
  assert.deepEqual(verifiedQuotes(["通気性あり"], text), [], "節も短すぎれば、今までどおり落とす");
});

test("原文に無い短い一節は広げない（照合で落ちる）", () => {
  assert.equal(expandQuote("軽い", "重たいです。"), "軽い");
  assert.deepEqual(verifiedQuotes(["軽い"], "重たいです。"), []);
});

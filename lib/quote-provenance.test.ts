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

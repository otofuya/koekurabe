import assert from "node:assert/strict";
import test from "node:test";
import {
  splitReviews, normalizeForDedup, reviewHash, deduplicateReviews,
  type RawPage,
} from "./review-dedup.ts";

test("splitReviews splits by the separator and trims", () => {
  assert.deepEqual(
    splitReviews("音質は良い。 / 装着感が悪い / "),
    ["音質は良い。", "装着感が悪い"],
  );
});

test("splitReviews returns empty for blank text", () => {
  assert.deepEqual(splitReviews(""), []);
  assert.deepEqual(splitReviews("   "), []);
});

test("normalizeForDedup collapses whitespace and normalizes unicode", () => {
  assert.equal(normalizeForDedup("  音質は  良い  "), "音質は 良い");
  assert.equal(normalizeForDedup("ＡＢＣ"), "ABC");
});

test("identical reviews produce the same hash", () => {
  const a = reviewHash(normalizeForDedup("音質は良いです。"));
  const b = reviewHash(normalizeForDedup("音質は良いです。"));
  assert.equal(a, b);
});

test("different reviews produce different hashes", () => {
  const a = reviewHash(normalizeForDedup("音質は良いです。"));
  const b = reviewHash(normalizeForDedup("装着感が悪いです。"));
  assert.notEqual(a, b);
});

test("deduplicateReviews removes exact duplicates across sources", () => {
  const pages: RawPage[] = [
    { source: "reviews", page: 1, sourceUrl: "https://product.rakuten.co.jp/product/-/test/review/", text: "音質は良い。 / 装着感が悪い" },
    { source: "shop-reviews", page: 1, sourceUrl: "https://review.rakuten.co.jp/item/1/123_456/1.1/", text: "音質は良い。 / バッテリーが持つ" },
  ];
  const result = deduplicateReviews(pages);
  assert.equal(result.reviews.length, 3);
  assert.equal(result.duplicatesRemoved, 1);
  assert.equal(result.totalBeforeDedup, 4);
  assert.equal(result.sources["reviews"], 2);
  assert.equal(result.sources["shop-reviews"], 1);
});

test("deduplicateReviews prefers reviews source over shop-reviews", () => {
  const pages: RawPage[] = [
    { source: "shop-reviews", page: 1, sourceUrl: "https://review.rakuten.co.jp/item/1/123_456/1.1/", text: "共通のレビュー" },
    { source: "reviews", page: 1, sourceUrl: "https://product.rakuten.co.jp/product/-/test/review/", text: "共通のレビュー" },
  ];
  const result = deduplicateReviews(pages);
  assert.equal(result.reviews.length, 1);
  assert.equal(result.reviews[0].source, "reviews");
});

test("complete overlap is caught — the 19/24 scenario", () => {
  const shared = Array.from({ length: 30 }, (_, i) => `レビュー${i + 1}の本文`).join(" / ");
  const pages: RawPage[] = [
    { source: "reviews", page: 1, sourceUrl: "https://product.rakuten.co.jp/product/-/test/review/", text: shared },
    { source: "shop-reviews", page: 1, sourceUrl: "https://review.rakuten.co.jp/item/1/123_456/1.1/", text: shared },
  ];
  const result = deduplicateReviews(pages);
  assert.equal(result.reviews.length, 30);
  assert.equal(result.duplicatesRemoved, 30);
  assert.equal(result.totalBeforeDedup, 60);
  assert.equal(result.sources["reviews"], 30);
  assert.equal(result.sources["shop-reviews"], undefined);
});

test("multi-page deduplication across sources", () => {
  const pages: RawPage[] = [
    { source: "reviews", page: 1, sourceUrl: "https://product.rakuten.co.jp/product/-/test/review/", text: "レビューA / レビューB" },
    { source: "reviews", page: 2, sourceUrl: "https://product.rakuten.co.jp/product/-/test/review/2/", text: "レビューC / レビューD" },
    { source: "shop-reviews", page: 1, sourceUrl: "https://review.rakuten.co.jp/item/1/123_456/1.1/", text: "レビューB / レビューE" },
    { source: "shop-reviews", page: 2, sourceUrl: "https://review.rakuten.co.jp/item/1/123_456/2.1/", text: "レビューC / レビューF" },
  ];
  const result = deduplicateReviews(pages);
  assert.equal(result.reviews.length, 6, "A,B,C,D from reviews + E,F from shop");
  assert.equal(result.duplicatesRemoved, 2);
  assert.equal(result.sources["reviews"], 4);
  assert.equal(result.sources["shop-reviews"], 2);
});

test("reviews are indexed sequentially after dedup", () => {
  const pages: RawPage[] = [
    { source: "reviews", page: 1, sourceUrl: "https://product.rakuten.co.jp/product/-/test/review/", text: "A / B / C" },
    { source: "shop-reviews", page: 1, sourceUrl: "https://review.rakuten.co.jp/item/1/123_456/1.1/", text: "B / D" },
  ];
  const result = deduplicateReviews(pages);
  const indices = result.reviews.map((r) => r.index);
  assert.deepEqual(indices, [0, 1, 2, 3]);
});

test("whitespace-only difference is treated as the same review", () => {
  const pages: RawPage[] = [
    { source: "reviews", page: 1, sourceUrl: "https://product.rakuten.co.jp/product/-/test/review/", text: "音質  は  良い。" },
    { source: "shop-reviews", page: 1, sourceUrl: "https://review.rakuten.co.jp/item/1/123_456/1.1/", text: "音質 は 良い。" },
  ];
  const result = deduplicateReviews(pages);
  assert.equal(result.reviews.length, 1);
});

test("same-source identical text is kept (different reviewers)", () => {
  const pages: RawPage[] = [
    { source: "reviews", page: 1, sourceUrl: "https://product.rakuten.co.jp/product/-/test/review/", text: "良かったです / 良かったです / 満足です" },
  ];
  const result = deduplicateReviews(pages);
  assert.equal(result.reviews.length, 3, "both '良かったです' kept — same source, different buyers");
  assert.equal(result.duplicatesRemoved, 0);
});

test("same text from same source on different pages is kept", () => {
  const pages: RawPage[] = [
    { source: "reviews", page: 1, sourceUrl: "https://product.rakuten.co.jp/product/-/test/review/", text: "良かったです" },
    { source: "reviews", page: 2, sourceUrl: "https://product.rakuten.co.jp/product/-/test/review/2/", text: "良かったです" },
  ];
  const result = deduplicateReviews(pages);
  assert.equal(result.reviews.length, 2);
});

test("same text across sources is deduplicated even when repeated in same source", () => {
  const pages: RawPage[] = [
    { source: "reviews", page: 1, sourceUrl: "https://product.rakuten.co.jp/product/-/test/review/", text: "良かったです / 良かったです" },
    { source: "shop-reviews", page: 1, sourceUrl: "https://review.rakuten.co.jp/item/1/123_456/1.1/", text: "良かったです" },
  ];
  const result = deduplicateReviews(pages);
  assert.equal(result.reviews.length, 2, "2 from reviews kept, 1 from shop-reviews deduped");
  assert.equal(result.duplicatesRemoved, 1);
  assert.equal(result.sources["reviews"], 2);
});

test("asymmetric counts across sources: excess in secondary is kept", () => {
  const pages: RawPage[] = [
    { source: "reviews", page: 1, sourceUrl: "https://product.rakuten.co.jp/product/-/test/review/", text: "良かったです" },
    { source: "shop-reviews", page: 1, sourceUrl: "https://review.rakuten.co.jp/item/1/123_456/1.1/", text: "良かったです / 良かったです" },
  ];
  const result = deduplicateReviews(pages);
  assert.equal(result.reviews.length, 2, "1 from reviews + 1 excess from shop-reviews");
  assert.equal(result.duplicatesRemoved, 1);
  assert.equal(result.sources["reviews"], 1);
  assert.equal(result.sources["shop-reviews"], 1);
});

test("asymmetric counts: primary has more copies than secondary", () => {
  const pages: RawPage[] = [
    { source: "reviews", page: 1, sourceUrl: "https://product.rakuten.co.jp/product/-/test/review/", text: "良かったです / 良かったです / 良かったです" },
    { source: "shop-reviews", page: 1, sourceUrl: "https://review.rakuten.co.jp/item/1/123_456/1.1/", text: "良かったです / 良かったです" },
  ];
  const result = deduplicateReviews(pages);
  assert.equal(result.reviews.length, 3, "3 from reviews, 0 from shop (all are duplicates of primary)");
  assert.equal(result.duplicatesRemoved, 2);
  assert.equal(result.sources["reviews"], 3);
  assert.equal(result.sources["shop-reviews"], undefined);
});

test("empty pages contribute nothing", () => {
  const pages: RawPage[] = [
    { source: "reviews", page: 1, sourceUrl: "https://product.rakuten.co.jp/product/-/test/review/", text: "" },
    { source: "shop-reviews", page: 1, sourceUrl: "https://review.rakuten.co.jp/item/1/123_456/1.1/", text: "  " },
  ];
  const result = deduplicateReviews(pages);
  assert.equal(result.reviews.length, 0);
  assert.equal(result.totalBeforeDedup, 0);
  assert.equal(result.duplicatesRemoved, 0);
});

test("sourceUrl is preserved through deduplication", () => {
  const reviewsUrl = "https://product.rakuten.co.jp/product/-/abc/review/";
  const shopUrl = "https://review.rakuten.co.jp/item/1/789_012/1.1/";
  const pages: RawPage[] = [
    { source: "reviews", page: 1, sourceUrl: reviewsUrl, text: "製品レビュー" },
    { source: "shop-reviews", page: 1, sourceUrl: shopUrl, text: "店舗だけのレビュー" },
  ];
  const result = deduplicateReviews(pages);
  assert.equal(result.reviews.length, 2);
  const productReview = result.reviews.find((r) => r.text === "製品レビュー");
  const shopReview = result.reviews.find((r) => r.text === "店舗だけのレビュー");
  assert.equal(productReview?.sourceUrl, reviewsUrl);
  assert.equal(shopReview?.sourceUrl, shopUrl);
});

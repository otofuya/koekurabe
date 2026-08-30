import assert from "node:assert/strict";
import test from "node:test";
import {
  checkProductInvariants, checkGenreInvariants, validateBatchResponse,
  validateGenreStructure,
} from "./extraction-invariants.ts";

test("valid tallies produce no violations", () => {
  const violations = checkProductInvariants("test", 30, [
    { key: "sound", positive: 20, negative: 5 },
    { key: "fit", positive: 10, negative: 10 },
  ]);
  assert.equal(violations.length, 0);
});

test("positive > reviewsRead is caught", () => {
  const violations = checkProductInvariants("test", 4, [
    { key: "sound", positive: 6, negative: 0 },
  ]);
  assert.equal(violations.length, 1);
  assert.match(violations[0].message, /positive 6 > reviewsRead 4/);
});

test("negative > reviewsRead is caught", () => {
  const violations = checkProductInvariants("test", 10, [
    { key: "fit", positive: 3, negative: 12 },
  ]);
  assert.equal(violations.length, 1);
  assert.match(violations[0].message, /negative 12 > reviewsRead 10/);
});

test("both positive and negative can be <= reviewsRead even if sum exceeds it", () => {
  // A review can mention fit positively AND negatively, so positive + negative > reviewsRead
  // is allowed. What's not allowed is either count individually exceeding reviewsRead.
  const violations = checkProductInvariants("test", 10, [
    { key: "fit", positive: 8, negative: 7 },
  ]);
  assert.equal(violations.length, 0);
});

test("negative count values are caught", () => {
  const violations = checkProductInvariants("test", 10, [
    { key: "sound", positive: -1, negative: 3 },
  ]);
  assert.equal(violations.length, 1);
  assert.match(violations[0].message, /negative count/);
});

test("genre-level check aggregates violations across products", () => {
  const violations = checkGenreInvariants([
    { productId: "a", reviewsRead: 4, aspects: [{ key: "sound", positive: 6, negative: 0 }] },
    { productId: "b", reviewsRead: 10, aspects: [{ key: "fit", positive: 3, negative: 2 }] },
    { productId: "c", reviewsRead: 5, aspects: [{ key: "anc", positive: 2, negative: 8 }] },
  ]);
  assert.equal(violations.length, 2);
  assert.equal(violations[0].productId, "a");
  assert.equal(violations[1].productId, "c");
});

test("the real M>N case from the earbuds data would be caught", () => {
  // Product 78177f27: reviewsRead=4, sound positive=6
  const violations = checkProductInvariants("78177f27", 4, [
    { key: "sound", positive: 6, negative: 0 },
  ]);
  assert.equal(violations.length, 1);
});

// ── validateBatchResponse ─────────────────────────────────────────────────

test("validateBatchResponse: all indices returned correctly", () => {
  const result = validateBatchResponse([1, 2, 3], [1, 2, 3]);
  assert.equal(result.problems.length, 0);
  assert.equal(result.classifiedCount, 3);
  assert.equal(result.missingCount, 0);
});

test("validateBatchResponse: missing indices detected", () => {
  const result = validateBatchResponse([1, 3], [1, 2, 3]);
  assert.equal(result.classifiedCount, 2);
  assert.equal(result.missingCount, 1);
  assert.ok(result.problems.some((p) => /未返却/.test(p)));
});

test("validateBatchResponse: out-of-range index detected", () => {
  const result = validateBatchResponse([1, 2, 5], [1, 2, 3]);
  assert.ok(result.problems.some((p) => /範囲外/.test(p)));
  assert.ok(result.problems.some((p) => /未返却/.test(p)));
  assert.equal(result.classifiedCount, 2);
  assert.equal(result.missingCount, 1);
});

test("validateBatchResponse: duplicate index detected", () => {
  const result = validateBatchResponse([1, 2, 2, 3], [1, 2, 3]);
  assert.ok(result.problems.some((p) => /重複/.test(p)));
  assert.equal(result.classifiedCount, 3);
  assert.equal(result.missingCount, 0);
});

test("validateBatchResponse: duplicates and out-of-range mask a missing index", () => {
  const result = validateBatchResponse([1, 2, 4, 2], [1, 2, 3]);
  assert.equal(result.classifiedCount, 2);
  assert.equal(result.missingCount, 1);
  assert.ok(result.problems.some((p) => /範囲外/.test(p)));
  assert.ok(result.problems.some((p) => /重複/.test(p)));
  assert.ok(result.problems.some((p) => /未返却/.test(p)));
});

// ── validateGenreStructure ────────────────────────────────────────────────

const validQuote = { text: "音質は良いです。低音がしっかり出る", reviewUrl: "https://product.rakuten.co.jp/product/-/abc/review/" };
const validShopQuote = { text: "装着感がとても良いです。長時間つけても疲れない", reviewUrl: "https://review.rakuten.co.jp/item/1/123_456/1.1/" };

test("validateGenreStructure: valid genre passes", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 10, classifiedCount: 10, aspects: [{ key: "sound", positive: 5, negative: 2, quotes: [validQuote] }] }],
  }, new Set(["sound"]));
  assert.equal(errors.length, 0);
});

test("validateGenreStructure: missing products array", () => {
  const errors = validateGenreStructure({ categoryId: "test" });
  assert.ok(errors.some((e) => /products/.test(e.message)));
});

test("validateGenreStructure: missing categoryId", () => {
  const errors = validateGenreStructure({ products: [] });
  assert.ok(errors.some((e) => /categoryId/.test(e.message)));
});

test("validateGenreStructure: empty categoryId", () => {
  const errors = validateGenreStructure({ categoryId: "", products: [] });
  assert.ok(errors.some((e) => /categoryId/.test(e.message)));
});

test("validateGenreStructure: missing productId", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ reviewsRead: 10, aspects: [] }],
  });
  assert.ok(errors.some((e) => /productId/.test(e.message)));
});

test("validateGenreStructure: duplicate productId", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [
      { productId: "a", reviewsRead: 10, aspects: [] },
      { productId: "a", reviewsRead: 5, aspects: [] },
    ],
  });
  assert.ok(errors.some((e) => /重複/.test(e.message)));
});

test("validateGenreStructure: aspects not array", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 10 }],
  });
  assert.ok(errors.some((e) => /aspects.*配列/.test(e.message)));
});

test("validateGenreStructure: unknown aspect key", () => {
  const errors = validateGenreStructure(
    { categoryId: "test", products: [{ productId: "a", reviewsRead: 10, aspects: [{ key: "unknown", positive: 1, negative: 0, quotes: [validQuote] }] }] },
    new Set(["sound", "fit"]),
  );
  assert.ok(errors.some((e) => /未知/.test(e.message)));
});

test("validateGenreStructure: duplicate aspect key", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 10, aspects: [
      { key: "sound", positive: 1, negative: 0, quotes: [validQuote] },
      { key: "sound", positive: 2, negative: 0, quotes: [validQuote] },
    ] }],
  });
  assert.ok(errors.some((e) => /aspect.*重複/.test(e.message)));
});

test("validateGenreStructure: incomplete classifiedCount", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 10, classifiedCount: 8, aspects: [] }],
  });
  assert.ok(errors.some((e) => /classifiedCount/.test(e.message)));
});

test("validateGenreStructure: non-integer reviewsRead", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 3.5, aspects: [] }],
  });
  assert.ok(errors.some((e) => /reviewsRead/.test(e.message)));
});

test("validateGenreStructure: negative positive count", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 10, aspects: [{ key: "sound", positive: -1, negative: 0, quotes: [] }] }],
  });
  assert.ok(errors.some((e) => /positive.*非負整数/.test(e.message)));
});

test("per-review extraction structurally prevents M>N", () => {
  // Simulate per-review counting: 4 reviews, each contributes at most 1 positive per aspect
  const reviewsRead = 4;
  const reviewClassifications = [
    { sound: "positive" },
    { sound: "positive" },
    { sound: "positive" },
    { sound: "positive", fit: "negative" },
  ];
  const positive = reviewClassifications.filter((r) => r.sound === "positive").length;
  const negative = reviewClassifications.filter((r) => r.sound === "negative").length;
  assert.ok(positive <= reviewsRead, "per-review counting cannot exceed reviewsRead");
  assert.ok(negative <= reviewsRead);
  const violations = checkProductInvariants("structured", reviewsRead, [
    { key: "sound", positive, negative },
  ]);
  assert.equal(violations.length, 0);
});

// ── Quote validation ──────────────────────────────────────────────────────

test("validateGenreStructure: valid product review quote passes", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 10, aspects: [
      { key: "sound", positive: 3, negative: 1, quotes: [validQuote] },
    ] }],
  });
  assert.equal(errors.length, 0);
});

test("validateGenreStructure: valid shop review quote passes", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 10, aspects: [
      { key: "fit", positive: 2, negative: 0, quotes: [validShopQuote] },
    ] }],
  });
  assert.equal(errors.length, 0);
});

test("validateGenreStructure: non-zero tally with no quotes is caught", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 10, aspects: [
      { key: "sound", positive: 3, negative: 0, quotes: [] },
    ] }],
  });
  assert.ok(errors.some((e) => /引用が0件/.test(e.message)));
});

test("validateGenreStructure: zero tally with no quotes is fine", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 10, aspects: [
      { key: "sound", positive: 0, negative: 0, quotes: [] },
    ] }],
  });
  assert.equal(errors.length, 0);
});

test("validateGenreStructure: quote with http URL is rejected", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 10, aspects: [
      { key: "sound", positive: 1, negative: 0, quotes: [{ text: "音質は良いです。低音がしっかり", reviewUrl: "http://product.rakuten.co.jp/product/-/abc/review/" }] },
    ] }],
  });
  assert.ok(errors.some((e) => /https/.test(e.message)));
});

test("validateGenreStructure: quote with unknown host is rejected", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 10, aspects: [
      { key: "sound", positive: 1, negative: 0, quotes: [{ text: "音質は良いです。低音がしっかり", reviewUrl: "https://example.com/review/" }] },
    ] }],
  });
  assert.ok(errors.some((e) => /ホスト.*想定外/.test(e.message)));
});

test("validateGenreStructure: product.rakuten.co.jp without /review/ is rejected", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 10, aspects: [
      { key: "sound", positive: 1, negative: 0, quotes: [{ text: "音質は良いです。低音がしっかり", reviewUrl: "https://product.rakuten.co.jp/product/-/abc/" }] },
    ] }],
  });
  assert.ok(errors.some((e) => /\/review\//.test(e.message)));
});

test("validateGenreStructure: review.rakuten.co.jp without /item/1/ is rejected", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 10, aspects: [
      { key: "sound", positive: 1, negative: 0, quotes: [{ text: "音質は良いです。低音がしっかり", reviewUrl: "https://review.rakuten.co.jp/shop/123/" }] },
    ] }],
  });
  assert.ok(errors.some((e) => /\/item\/1\//.test(e.message)));
});

test("validateGenreStructure: quote text too short is rejected", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 10, aspects: [
      { key: "sound", positive: 1, negative: 0, quotes: [{ text: "短い", reviewUrl: "https://product.rakuten.co.jp/product/-/abc/review/" }] },
    ] }],
  });
  assert.ok(errors.some((e) => /6文字未満/.test(e.message)));
});

test("validateGenreStructure: duplicate quote text is rejected", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 10, aspects: [
      { key: "sound", positive: 2, negative: 0, quotes: [validQuote, validQuote] },
    ] }],
  });
  assert.ok(errors.some((e) => /重複/.test(e.message)));
});

test("validateGenreStructure: missing reviewUrl is rejected", () => {
  const errors = validateGenreStructure({
    categoryId: "test",
    products: [{ productId: "a", reviewsRead: 10, aspects: [
      { key: "sound", positive: 1, negative: 0, quotes: [{ text: "音質は良いです。低音がしっかり" }] },
    ] }],
  });
  assert.ok(errors.some((e) => /reviewUrl.*未設定/.test(e.message)));
});

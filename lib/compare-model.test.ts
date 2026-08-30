import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildListCards, sortListCards } from "./compare-model.ts";
import type { JoinedProduct } from "./types.ts";
import type { AspectDefinition } from "./category-definitions.ts";

const DEFINITIONS: AspectDefinition[] = [
  { key: "fit", label: "装着感", positivePole: "良い", negativePole: "悪い" },
  { key: "anc", label: "ANC", positivePole: "効く", negativePole: "効かない" },
];

function makeProduct(
  overrides: Partial<JoinedProduct> & { productId: string },
): JoinedProduct {
  return {
    name: overrides.name ?? `Product ${overrides.productId}`,
    brand: overrides.brand ?? "Brand",
    model: null,
    price: overrides.price ?? 10000,
    imageUrl: overrides.imageUrl ?? "https://example.com/img.jpg",
    productUrl: overrides.productUrl ?? "https://example.com",
    reviewCount: overrides.reviewCount ?? 10,
    reviewAverage: overrides.reviewAverage ?? 4.0,
    reviewsRead: overrides.reviewsRead ?? null,
    aspects: overrides.aspects ?? null,
    specs: overrides.specs ?? [],
    ...overrides,
  };
}

describe("buildListCards", () => {
  it("returns the same number of cards as input products", () => {
    const joined = [
      makeProduct({ productId: "a", reviewsRead: 10, aspects: [] }),
      makeProduct({ productId: "b" }),
      makeProduct({ productId: "c", reviewsRead: 5, aspects: [] }),
    ];
    const cards = buildListCards(joined, DEFINITIONS);
    assert.equal(cards.length, 3);
  });

  it("marks analyzed when both aspects and reviewsRead are present", () => {
    const p = makeProduct({
      productId: "a",
      reviewsRead: 10,
      aspects: [{ key: "fit", positive: 5, negative: 3, quotes: [] }],
    });
    const [card] = buildListCards([p], DEFINITIONS);
    assert.equal(card.status, "analyzed");
    assert.equal(card.reviewsRead, 10);
  });

  it("marks unread when aspects is null", () => {
    const p = makeProduct({ productId: "a" });
    const [card] = buildListCards([p], DEFINITIONS);
    assert.equal(card.status, "unread");
    assert.equal(card.reviewsRead, null);
    assert.deepEqual(card.praised, []);
    assert.deepEqual(card.blamed, []);
    assert.equal(card.totalMentions, 0);
  });

  it("keeps analyzed status even when totalMentions is 0", () => {
    const p = makeProduct({
      productId: "a",
      reviewsRead: 8,
      aspects: [],
    });
    const [card] = buildListCards([p], DEFINITIONS);
    assert.equal(card.status, "analyzed");
    assert.equal(card.totalMentions, 0);
    assert.deepEqual(card.praised, []);
    assert.deepEqual(card.blamed, []);
    assert.equal(card.reviewsRead, 8);
  });

  it("computes totalMentions as sum of all positive + negative", () => {
    const p = makeProduct({
      productId: "a",
      reviewsRead: 20,
      aspects: [
        { key: "fit", positive: 5, negative: 3, quotes: [] },
        { key: "anc", positive: 2, negative: 1, quotes: [] },
      ],
    });
    const [card] = buildListCards([p], DEFINITIONS);
    assert.equal(card.totalMentions, 11);
  });

  it("preserves positive and negative in verdict lines", () => {
    const p = makeProduct({
      productId: "a",
      reviewsRead: 20,
      aspects: [
        { key: "fit", positive: 7, negative: 4, quotes: [] },
      ],
    });
    const [card] = buildListCards([p], DEFINITIONS);
    assert.equal(card.praised.length, 1);
    assert.equal(card.praised[0].positive, 7);
    assert.equal(card.praised[0].negative, 4);
    assert.equal(card.praised[0].label, "装着感");
  });

  it("allows the same aspect in both praised and blamed", () => {
    const p = makeProduct({
      productId: "a",
      reviewsRead: 20,
      aspects: [
        { key: "fit", positive: 5, negative: 3, quotes: [] },
      ],
    });
    const [card] = buildListCards([p], DEFINITIONS);
    assert.ok(card.praised.length > 0);
    assert.ok(card.blamed.length > 0);
    assert.equal(card.praised[0].key, "fit");
    assert.equal(card.blamed[0].key, "fit");
  });

  it("limits praised and blamed to 2 each", () => {
    const defs: AspectDefinition[] = [
      { key: "a", label: "A", positivePole: "+", negativePole: "-" },
      { key: "b", label: "B", positivePole: "+", negativePole: "-" },
      { key: "c", label: "C", positivePole: "+", negativePole: "-" },
    ];
    const p = makeProduct({
      productId: "x",
      reviewsRead: 30,
      aspects: [
        { key: "a", positive: 10, negative: 2, quotes: [] },
        { key: "b", positive: 8, negative: 3, quotes: [] },
        { key: "c", positive: 6, negative: 4, quotes: [] },
      ],
    });
    const [card] = buildListCards([p], defs);
    assert.ok(card.praised.length <= 2);
    assert.ok(card.blamed.length <= 2);
  });
});

describe("sortListCards", () => {
  const analyzed1 = {
    product: makeProduct({ productId: "a1", name: "Alpha", price: 5000 }),
    status: "analyzed" as const,
    praised: [],
    blamed: [],
    reviewsRead: 20,
    totalMentions: 15,
  };
  const analyzed2 = {
    product: makeProduct({ productId: "a2", name: "Beta", price: 3000 }),
    status: "analyzed" as const,
    praised: [],
    blamed: [],
    reviewsRead: 10,
    totalMentions: 8,
  };
  const unread1 = {
    product: makeProduct({ productId: "u1", name: "Gamma", price: 2000 }),
    status: "unread" as const,
    praised: [],
    blamed: [],
    reviewsRead: null,
    totalMentions: 0,
  };
  const unread2 = {
    product: makeProduct({ productId: "u2", name: "Delta", price: 4000 }),
    status: "unread" as const,
    praised: [],
    blamed: [],
    reviewsRead: null,
    totalMentions: 0,
  };

  it("always puts analyzed before unread", () => {
    for (const key of ["mentions", "price", "reviews-read"] as const) {
      const sorted = sortListCards([unread1, analyzed1, unread2, analyzed2], key);
      assert.equal(sorted[0].status, "analyzed");
      assert.equal(sorted[1].status, "analyzed");
      assert.equal(sorted[2].status, "unread");
      assert.equal(sorted[3].status, "unread");
    }
  });

  it("sorts by mentions descending for analyzed", () => {
    const sorted = sortListCards([analyzed2, analyzed1], "mentions");
    assert.equal(sorted[0].product.productId, "a1");
    assert.equal(sorted[1].product.productId, "a2");
  });

  it("sorts unread by price ascending in mentions mode", () => {
    const sorted = sortListCards([unread2, unread1], "mentions");
    assert.equal(sorted[0].product.productId, "u1");
    assert.equal(sorted[1].product.productId, "u2");
  });

  it("sorts by price ascending", () => {
    const sorted = sortListCards([analyzed1, analyzed2, unread2, unread1], "price");
    assert.equal(sorted[0].product.productId, "a2");
    assert.equal(sorted[1].product.productId, "a1");
    assert.equal(sorted[2].product.productId, "u1");
    assert.equal(sorted[3].product.productId, "u2");
  });

  it("sorts by reviews-read descending for analyzed", () => {
    const sorted = sortListCards([analyzed2, analyzed1], "reviews-read");
    assert.equal(sorted[0].product.productId, "a1");
    assert.equal(sorted[1].product.productId, "a2");
  });

  it("breaks ties deterministically by name then productId", () => {
    const same1 = {
      ...analyzed1,
      product: makeProduct({ productId: "z1", name: "Same", price: 5000 }),
      totalMentions: 10,
    };
    const same2 = {
      ...analyzed1,
      product: makeProduct({ productId: "z2", name: "Same", price: 5000 }),
      totalMentions: 10,
    };
    const sorted = sortListCards([same2, same1], "mentions");
    assert.equal(sorted[0].product.productId, "z1");
    assert.equal(sorted[1].product.productId, "z2");
  });

  it("does not mutate the input array", () => {
    const input = [unread1, analyzed1];
    const copy = [...input];
    sortListCards(input, "mentions");
    assert.deepEqual(input, copy);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { selectFeatured, searchProducts, normalizeQuery } from "./home-model.ts";
import type { JoinedProduct } from "./types.ts";
import type { AspectDefinition } from "./category-definitions.ts";

const defs: AspectDefinition[] = [
  { key: "fit", label: "装着感", positivePole: "良い", negativePole: "悪い" },
  { key: "anc", label: "ANC", positivePole: "効く", negativePole: "効かない" },
];

function product(
  id: string,
  name: string,
  overrides: Partial<JoinedProduct> = {},
): JoinedProduct {
  return {
    productId: id,
    name,
    brand: "テスト",
    model: null,
    price: 10000,
    imageUrl: "",
    productUrl: "",
    reviewCount: 10,
    reviewAverage: 4.0,
    reviewsRead: 8,
    aspects: [],
    specs: [],
    ...overrides,
  };
}

describe("selectFeatured", () => {
  it("言及合計降順で上位を返す", () => {
    const products = [
      product("a", "少ない", {
        aspects: [{ key: "fit", positive: 1, negative: 0, quotes: [] }],
      }),
      product("b", "多い", {
        aspects: [
          { key: "fit", positive: 5, negative: 3, quotes: [] },
          { key: "anc", positive: 2, negative: 1, quotes: [] },
        ],
      }),
    ];
    const result = selectFeatured(products, defs);
    assert.equal(result[0].product.productId, "b");
    assert.equal(result[1].product.productId, "a");
  });

  it("未読の商品は除外", () => {
    const products = [
      product("a", "テスト", { aspects: null, reviewsRead: null }),
    ];
    const result = selectFeatured(products, defs);
    assert.equal(result.length, 0);
  });

  it("全観点の言及が0件の商品は除外", () => {
    const products = [
      product("a", "テスト", {
        aspects: [{ key: "fit", positive: 0, negative: 0, quotes: [] }],
      }),
    ];
    const result = selectFeatured(products, defs);
    assert.equal(result.length, 0);
  });

  it("同点は商品名で安定化", () => {
    const products = [
      product("x", "Bブランド", {
        aspects: [{ key: "fit", positive: 2, negative: 1, quotes: [] }],
      }),
      product("y", "Aブランド", {
        aspects: [{ key: "fit", positive: 2, negative: 1, quotes: [] }],
      }),
    ];
    const result = selectFeatured(products, defs);
    assert.equal(result[0].product.name, "Aブランド");
    assert.equal(result[1].product.name, "Bブランド");
  });

  it("limit を超えない", () => {
    const products = Array.from({ length: 20 }, (_, i) =>
      product(`p${i}`, `商品${i}`, {
        aspects: [{ key: "fit", positive: 20 - i, negative: 0, quotes: [] }],
      }),
    );
    const result = selectFeatured(products, defs, 3);
    assert.equal(result.length, 3);
  });

  it("praised と blamed を verdict から取得", () => {
    const products = [
      product("a", "テスト", {
        aspects: [
          { key: "fit", positive: 5, negative: 1, quotes: [] },
          { key: "anc", positive: 1, negative: 4, quotes: [] },
        ],
      }),
    ];
    const result = selectFeatured(products, defs);
    assert.ok(result[0].praised.some((p) => p.label === "装着感"));
    assert.ok(result[0].blamed.some((b) => b.label === "ANC"));
  });
});

describe("normalizeQuery", () => {
  it("全角を半角に変換", () => {
    assert.equal(normalizeQuery("ＳＯＮＹ"), "sony");
  });

  it("前後空白を除去", () => {
    assert.equal(normalizeQuery("  test  "), "test");
  });
});

describe("searchProducts", () => {
  const products = [
    product("a", "SONY WF-1000XM5", { brand: "SONY(ソニー)" }),
    product("b", "Apple AirPods Pro", { brand: "Apple" }),
    product("c", "Bose Ultra Open", { brand: "Bose" }),
  ];

  it("商品名でマッチ", () => {
    const results = searchProducts(products, "sony");
    assert.equal(results.length, 1);
    assert.equal(results[0].productId, "a");
  });

  it("ブランド名でマッチ", () => {
    const results = searchProducts(products, "ソニー");
    assert.equal(results.length, 1);
    assert.equal(results[0].productId, "a");
  });

  it("空クエリは空配列", () => {
    assert.equal(searchProducts(products, "").length, 0);
    assert.equal(searchProducts(products, "   ").length, 0);
  });

  it("マッチなし", () => {
    assert.equal(searchProducts(products, "Jabra").length, 0);
  });

  it("limit を超えない", () => {
    const many = Array.from({ length: 20 }, (_, i) =>
      product(`p${i}`, `SONY ${i}`, { brand: "SONY" }),
    );
    assert.equal(searchProducts(many, "sony", 5).length, 5);
  });

  it("大文字小文字を区別しない", () => {
    const results = searchProducts(products, "airpods");
    assert.equal(results.length, 1);
  });
});

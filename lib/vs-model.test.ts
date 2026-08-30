import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAspectRows, buildSpecRows } from "./vs-model.ts";
import type { JoinedProduct } from "./types.ts";
import type { AspectDefinition } from "./category-definitions.ts";

const defs: AspectDefinition[] = [
  { key: "fit", label: "装着感", positivePole: "良い", negativePole: "悪い" },
  { key: "anc", label: "ANC", positivePole: "効く", negativePole: "効かない" },
  { key: "sound", label: "音質", positivePole: "良い", negativePole: "不満" },
];

function product(overrides: Partial<JoinedProduct> = {}): JoinedProduct {
  return {
    productId: "aaaa",
    name: "テスト商品",
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

describe("buildAspectRows", () => {
  it("全観点に行を作る", () => {
    const a = product({ aspects: [] });
    const b = product({ aspects: [] });
    const rows = buildAspectRows(defs, a, b);
    assert.equal(rows.length, 3);
  });

  it("両方言及なしの行は両側 no-mention", () => {
    const a = product({ aspects: [] });
    const b = product({ aspects: [] });
    const rows = buildAspectRows(defs, a, b);
    assert.equal(rows[0].a.status, "no-mention");
    assert.equal(rows[0].b.status, "no-mention");
  });

  it("片方だけ言及ありの行は片側 mentioned、他方 no-mention", () => {
    const a = product({
      aspects: [{ key: "fit", positive: 3, negative: 1, quotes: [] }],
    });
    const b = product({ aspects: [] });
    const rows = buildAspectRows(defs, a, b);
    const fitRow = rows.find((r) => r.definition.key === "fit")!;
    assert.equal(fitRow.a.status, "mentioned");
    assert.equal(fitRow.b.status, "no-mention");
  });

  it("未読の商品側は全観点 unread", () => {
    const a = product({
      aspects: [{ key: "fit", positive: 3, negative: 1, quotes: [] }],
    });
    const b = product({ aspects: null, reviewsRead: null });
    const rows = buildAspectRows(defs, a, b);
    assert.ok(rows.every((r) => r.b.status === "unread"));
    const fitRow = rows.find((r) => r.definition.key === "fit")!;
    assert.equal(fitRow.a.status, "mentioned");
  });

  it("並び順: 両方言及あり → 片方のみ → 両方なし", () => {
    const a = product({
      aspects: [
        { key: "fit", positive: 3, negative: 1, quotes: [] },
        { key: "anc", positive: 5, negative: 2, quotes: [] },
      ],
    });
    const b = product({
      aspects: [{ key: "anc", positive: 2, negative: 1, quotes: [] }],
    });
    const rows = buildAspectRows(defs, a, b);
    assert.equal(rows[0].definition.key, "anc");
    assert.equal(rows[1].definition.key, "fit");
    assert.equal(rows[2].definition.key, "sound");
  });

  it("同点は定義順で安定化", () => {
    const a = product({
      aspects: [
        { key: "fit", positive: 1, negative: 0, quotes: [] },
        { key: "sound", positive: 1, negative: 0, quotes: [] },
      ],
    });
    const b = product({ aspects: [] });
    const rows = buildAspectRows(defs, a, b);
    const oneOnly = rows.filter((r) => r.a.status === "mentioned");
    assert.equal(oneOnly[0].definition.key, "fit");
    assert.equal(oneOnly[1].definition.key, "sound");
  });

  it("positive+negative が 0 の tally は言及なしとして扱う", () => {
    const a = product({
      aspects: [{ key: "fit", positive: 0, negative: 0, quotes: [] }],
    });
    const b = product({ aspects: [] });
    const rows = buildAspectRows(defs, a, b);
    const fitRow = rows.find((r) => r.definition.key === "fit")!;
    assert.equal(fitRow.a.status, "no-mention");
  });
});

describe("buildSpecRows", () => {
  it("商品Aの順を基準とし、Bのみのキーを末尾に追加", () => {
    const a = product({
      specs: [
        { key: "weight", label: "重量", value: 5, displayValue: "5g", unit: "g", provenance: "official" },
        { key: "battery", label: "電池", value: 8, displayValue: "8h", unit: "h", provenance: "ec_api" },
      ],
    });
    const b = product({
      specs: [
        { key: "battery", label: "電池", value: 6, displayValue: "6h", unit: "h", provenance: "ec_api" },
        { key: "anc", label: "ANC", value: true, displayValue: "対応", unit: null, provenance: "llm_inferred" },
      ],
    });
    const rows = buildSpecRows(a, b);
    assert.equal(rows.length, 3);
    assert.equal(rows[0].key, "weight");
    assert.equal(rows[0].b, null);
    assert.equal(rows[1].key, "battery");
    assert.equal(rows[1].a!.value, "8h");
    assert.equal(rows[1].b!.value, "6h");
    assert.equal(rows[2].key, "anc");
    assert.equal(rows[2].a, null);
    assert.equal(rows[2].b!.provenance, "llm_inferred");
  });

  it("両方 specs が空なら行なし", () => {
    const rows = buildSpecRows(product(), product());
    assert.equal(rows.length, 0);
  });
});

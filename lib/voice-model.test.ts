import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toRow, filterRows, tallyRows, starImpact, monthsAgo, checkRows } from "./voice-model.ts";
import type { VoiceRow } from "./voice-model.ts";

const row = (r: number | null, n: string[] = [], p: string[] = [], extra: Partial<VoiceRow> = {}): VoiceRow => ({ r, d: "2026-05", a: 30, s: "f", p, n, ...extra });

describe("toRow", () => {
  it("★・投稿月・年代・性別と、数えた観点だけを持つ。同じ観点・同じ向きは1つ", () => {
    const got = toRow({ rating: 3, date: "2026-09-24", age: 30, sex: "female" },
      [{ key: "fit", polarity: "negative" }, { key: "fit", polarity: "negative" }, { key: "sound", polarity: "positive" }, { key: "fit", polarity: "positive" }],
      [{ key: "size", direction: "low" }, { key: "size", direction: "just" }]);
    assert.deepEqual(got, { r: 3, d: "2026-09", a: 30, s: "f", p: ["sound", "fit"], n: ["fit"], f: { size: "low" } });
  });
  it("データが無いレビューも1件として残す（分母を変えない）", () => {
    assert.deepEqual(toRow(undefined, []), { r: null, d: null, a: null, s: null, p: [], n: [] });
  });
});

describe("filterRows・tallyRows", () => {
  const rows = [row(5, [], ["sound"], { a: 20, s: "m", d: "2024-01" }), row(2, ["fit"], [], { a: 30, s: "f" }), row(4, [], ["fit"], { a: null, s: null }), row(1, ["fit", "battery"], [], { a: 50, s: "f" })];
  it("性別・年代・最近で絞る。答えていない人は、その条件で絞るときは外す", () => {
    assert.equal(filterRows(rows, { sex: "f" }).length, 2);
    assert.equal(filterRows(rows, { ageFrom: 30, ageTo: 39 }).length, 1);
    assert.equal(filterRows(rows, { since: "2025-01" }).length, 3);
    assert.equal(filterRows(rows, {}).length, 4);
  });
  it("絞ったレビューだけで数える", () => {
    assert.deepEqual(tallyRows(filterRows(rows, { sex: "f" }), ["sound", "fit", "battery"]).map((t) => [t.key, t.positive, t.negative]), [["fit", 0, 2], ["battery", 0, 1]]);
  });
  it("monthsAgo：1年前の月", () => {
    assert.equal(monthsAgo(new Date("2026-09-26T00:00:00Z"), 12), "2025-09");
    assert.equal(monthsAgo(new Date("2026-01-15T00:00:00Z"), 1), "2025-12");
  });
});

describe("starImpact", () => {
  it("その残念があったレビューの★の平均と、ほかの★の平均。差の大きい順", () => {
    const rows = [
      ...Array.from({ length: 5 }, () => row(2, ["fit"])),
      ...Array.from({ length: 5 }, () => row(3, ["battery"])),
      ...Array.from({ length: 10 }, () => row(5)),
    ];
    const got = starImpact(rows, ["fit", "battery"]);
    assert.deepEqual(got.map((x) => x.key), ["fit", "battery"]);
    assert.equal(got[0].with.avg, 2);
    assert.equal(got[0].without.avg, (5 * 3 + 10 * 5) / 15);
  });
  it("その残念が5件未満の観点・差が0以下の観点は出さない。★の無いレビューは数えない", () => {
    const rows = [...Array.from({ length: 4 }, () => row(1, ["fit"])), ...Array.from({ length: 6 }, () => row(5, ["calls"])), row(3), row(null, ["fit"])];
    assert.deepEqual(starImpact(rows, ["fit", "calls"]).map((x) => x.key), []);
  });
});

describe("checkRows", () => {
  const rows = [row(5, [], ["sound"]), row(2, ["fit"])];
  it("件数と合っていれば通る。無ければ（前のデータ）通る", () => {
    assert.deepEqual(checkRows(rows, 2, [{ key: "sound", positive: 1, negative: 0 }, { key: "fit", positive: 0, negative: 1 }]), []);
    assert.deepEqual(checkRows(undefined, 2, []), []);
  });
  it("数・件数・★の食い違いを見つける", () => {
    assert.ok(checkRows(rows, 3, []).some((e) => /読んだ件数/.test(e)));
    assert.ok(checkRows(rows, 2, [{ key: "fit", positive: 0, negative: 2 }]).some((e) => /fit/.test(e)));
    assert.ok(checkRows([row(7)], 1, []).some((e) => /★/.test(e)));
  });
});

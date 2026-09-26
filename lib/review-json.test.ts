import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { structuredReviews, sliceJsonArray } from "./review-json.ts";

const priceNavi = (reviews: unknown[]) => `<script>window.x={"reviewInfo":{"reviews":${JSON.stringify(reviews)},"pagination":{"numFound":2}}}</script>`;
const shop = (list: unknown[]) => `<script>{"seo":{"itemReviewList":${JSON.stringify(list)}},"other":1}</script>`;

describe("sliceJsonArray", () => {
  it("文字列の中の括弧や引用符に惑わされない", () => {
    const text = `x=[{"a":"]\\"[}"},[1,2]] rest`;
    assert.equal(sliceJsonArray(text, 2), `[{"a":"]\\"[}"},[1,2]]`);
  });
  it("配列で始まらない・閉じていないときは null", () => {
    assert.equal(sliceJsonArray("{}", 0), null);
    assert.equal(sliceJsonArray("[1,2", 0), null);
  });
});

describe("structuredReviews", () => {
  it("商品価格ナビ：★・日付・色・年代・性別・本文（空白はまとめる）", () => {
    const got = structuredReviews(priceNavi([
      { encryptedEasyId: "YWJ", evaluation: 3, review: "音は問題ないです。\nただ、安定感がない。", reg_time: "2026-09-24T15:03:49.000+09:00", item_sku_info: "カラー:グラスブルー", age: 38, sex: 1, nickname: "持ち出さない" },
      { encryptedEasyId: "OGV", evaluation: 5, review: "満足です", reg_time: "2026-09-23T17:24:41.000+09:00", item_sku_info: "", age: 0, sex: 0 },
    ]))!;
    assert.equal(got.length, 2);
    assert.deepEqual(got[0], { id: "YWJ:2026-09-24T15:03:49.000+09:00", rating: 3, date: "2026-09-24", sku: "カラー:グラスブルー", age: 30, sex: "female", codes: [], title: null, body: "音は問題ないです。 ただ、安定感がない。" });
    assert.equal(got[1].age, null, "0 は答えていない");
    assert.equal(got[1].sku, null);
    assert.ok(!JSON.stringify(got).includes("持ち出さない"), "ニックネームは持ち出さない");
  });
  it("お店のページ：★・見出し・本人が選んだ欄", () => {
    const got = structuredReviews(shop([
      { key: "8836", rating: 5, title: "さすがSONY", body: "音の厚みが段違い", postDate: "2026/09/10", ageRange: "50", sex: "male", codes: ["実用品・普段使い", "自分用", "はじめて"], nickname: "持ち出さない" },
    ]))!;
    assert.deepEqual(got[0], { id: "8836", rating: 5, date: "2026-09-10", sku: null, age: 50, sex: "male", codes: ["実用品・普段使い", "自分用", "はじめて"], title: "さすがSONY", body: "音の厚みが段違い" });
  });
  it("本文の無いレビューは外す。★が範囲外なら null", () => {
    const got = structuredReviews(priceNavi([{ encryptedEasyId: "a", evaluation: 9, review: "よい", reg_time: "" }, { encryptedEasyId: "b", evaluation: 4, review: "  " }]))!;
    assert.equal(got.length, 1);
    assert.equal(got[0].rating, null);
  });
  it("データが無いページは null（呼ぶ側は HTML の本文に戻る）", () => {
    assert.equal(structuredReviews("<html>no data</html>"), null);
    assert.deepEqual(structuredReviews(priceNavi([])), []);
  });
});

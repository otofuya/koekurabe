import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matchByJan, mentionsJan, MAX_SHOP_ITEMS } from "./shop-match.ts";
import type { ShopItemCandidate } from "./shop-match.ts";

const JAN = "4571411204302";
const item = (over: Partial<ShopItemCandidate>): ShopItemCandidate => ({
  itemCode: "shop:a", itemName: "soundcore Liberty 4", itemUrl: "https://item.rakuten.co.jp/shop/a/", shopName: "お店", reviewCount: 10, ...over,
});

describe("mentionsJan", () => {
  it("ほかの数字とつながらない形で書いてあるときだけ", () => {
    assert.equal(mentionsJan(`JAN：${JAN}`, JAN), true);
    assert.equal(mentionsJan(`JANコード${JAN}／白`, JAN), true);
    assert.equal(mentionsJan(`1${JAN}`, JAN), false);
    assert.equal(mentionsJan(`${JAN}9`, JAN), false);
  });
  it("全角の数字でも見つける", () => {
    assert.equal(mentionsJan("ＪＡＮ：４５７１４１１２０４３０２", JAN), true);
  });
  it("JAN の形でないものは使わない", () => {
    assert.equal(mentionsJan("abc", "abc"), false);
    assert.equal(mentionsJan("12", "12"), false);
  });
});

describe("matchByJan", () => {
  it("JAN を書いているお店の商品だけ。レビューの多い順に3つまで", () => {
    const items = [
      item({ itemCode: "s:1", reviewCount: 50, itemCaption: `JAN ${JAN}` }),
      item({ itemCode: "s:2", reviewCount: 900, itemName: `Liberty 4 ${JAN}` }),
      item({ itemCode: "s:3", reviewCount: 5000, itemName: "Liberty 4 ケース" }),
      item({ itemCode: "s:4", reviewCount: 20, catchcopy: JAN }),
      item({ itemCode: "s:5", reviewCount: 10, itemCaption: JAN }),
    ];
    const got = matchByJan(items, JAN);
    assert.deepEqual(got.map((x) => x.itemCode), ["s:2", "s:1", "s:4"]);
    assert.equal(got.length, MAX_SHOP_ITEMS);
  });
  it("レビューが無い・中古・同じ商品コードの重複は使わない", () => {
    const items = [
      item({ itemCode: "s:1", reviewCount: 0, itemCaption: JAN }),
      item({ itemCode: "s:2", itemName: `【中古】Liberty 4 ${JAN}` }),
      item({ itemCode: "s:3", itemCaption: JAN }),
      item({ itemCode: "s:3", itemCaption: JAN }),
    ];
    assert.deepEqual(matchByJan(items, JAN).map((x) => x.itemCode), ["s:3"]);
  });
  it("返すのは結びつけに要る欄だけ（説明文は持ち出さない）", () => {
    const [got] = matchByJan([item({ itemCaption: `長い説明 ${JAN}` })], JAN);
    assert.deepEqual(Object.keys(got).sort(), ["itemCode", "itemName", "itemUrl", "reviewCount", "shopName"]);
  });
});

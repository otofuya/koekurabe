import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import {
  evidenceOf, nakami, allLines, concernsFirst, priorBadRate, orderRate, fewestBad, switchTargets,
  compareProducts, compareLead, parseQuery, displayName, READ_ENOUGH, TALKED_MIN, PRIOR_WEIGHT,
} from "./nakami-model.ts";
import type { AspectProduct } from "./aspect-model.ts";
import type { Priced } from "./nakami-model.ts";

const ORDER = ["sound", "fit", "anc", "battery"];
const tally = (key: string, positive: number, negative: number) => ({ key, positive, negative, quotes: [] });
const product = (id: string, reviewsRead: number, aspects: ReturnType<typeof tally>[], price = 8000): Priced =>
  ({ id, reviewsRead, aspects, price });

describe("evidenceOf", () => {
  it("読んでいない・少ない・足りる", () => {
    assert.equal(evidenceOf(null), "unread");
    assert.equal(evidenceOf(0), "unread");
    assert.equal(evidenceOf(READ_ENOUGH - 1), "thin");
    assert.equal(evidenceOf(READ_ENOUGH), "enough");
  });
});

describe("nakami", () => {
  const p = product("p", 129, [tally("sound", 52, 4), tally("fit", 21, 14), tally("anc", 32, 11), tally("battery", 8, 10)]);
  it("よかった・残念だった それぞれ多い順に3つ", () => {
    const { good, bad } = nakami(p, ORDER);
    assert.deepEqual(good.map((l) => [l.key, l.count]), [["sound", 52], ["anc", 32], ["fit", 21]]);
    assert.deepEqual(bad.map((l) => [l.key, l.count]), [["fit", 14], ["anc", 11], ["battery", 10]]);
    assert.ok(good.every((l) => l.read === 129), "分母は読んだ件数");
  });
  it("同じ観点が左右の両方に入る（丸めない）", () => {
    const { good, bad } = nakami(p, ORDER);
    assert.ok(good.some((l) => l.key === "anc") && bad.some((l) => l.key === "anc"));
  });
  it("0件の観点は出さない。同数は定義の順", () => {
    const q = product("q", 40, [tally("battery", 3, 0), tally("sound", 3, 0), tally("fit", 0, 0)]);
    const { good, bad } = nakami(q, ORDER);
    assert.deepEqual(good.map((l) => l.key), ["sound", "battery"]);
    assert.deepEqual(bad, []);
  });
});

describe("allLines・concernsFirst", () => {
  it("声のあった観点を、ふれた声の多い順に", () => {
    const p = product("p", 60, [tally("sound", 21, 4), tally("fit", 7, 1), tally("anc", 0, 0)]);
    assert.deepEqual(allLines(p, ORDER).map((l) => l.key), ["sound", "fit"]);
  });
  it("覚えた観点を先に、覚えた順で", () => {
    const lines = [{ key: "sound" }, { key: "fit" }, { key: "anc" }];
    assert.deepEqual(concernsFirst(lines, ["anc", "fit"]).map((l) => l.key), ["anc", "fit", "sound"]);
    assert.deepEqual(concernsFirst(lines, ["calls"]).map((l) => l.key), ["sound", "fit", "anc"]);
  });
});

describe("fewestBad", () => {
  const a = product("a", 60, [tally("fit", 7, 1)]);
  const b = product("b", 129, [tally("fit", 21, 14)]);
  const c = product("c", 2, [tally("fit", 0, 0)]);
  const d = product("d", 5, [tally("fit", 1, 1)]);
  it("ふれた声が少ない商品は並べず quiet へ（最下位にしない）", () => {
    const { ranked, quiet } = fewestBad([a, b, c, d], "fit");
    assert.deepEqual(ranked.map((r) => r.id), ["a", "b"]);
    assert.deepEqual(quiet, ["c", "d"]);
    assert.ok(TALKED_MIN === 3);
  });
  it("並べる順の値は、件数が少ないほど全体の割合に寄る", () => {
    const prior = priorBadRate([a, b], "fit");
    assert.equal(prior, 15 / 189);
    const few = product("few", 4, [tally("fit", 0, 3)]);
    // 素の割合は 3/4 だが、縮めると全体の割合の近くに寄る
    const rate = orderRate(few, "fit", prior);
    assert.equal(rate, (3 + PRIOR_WEIGHT * prior) / (4 + PRIOR_WEIGHT));
    assert.ok(rate < 0.2);
  });
});

describe("switchTargets", () => {
  const me = product("me", 129, [tally("fit", 21, 14)], 7980);
  const good = product("good", 60, [tally("fit", 7, 1)], 5940);
  const pricey = product("pricey", 80, [tally("fit", 9, 0)], 30000);
  const thinAlt = product("thinAlt", 10, [tally("fit", 5, 0)], 7000);
  const silent = product("silent", 90, [tally("fit", 1, 0)], 7000);
  const close = product("close", 130, [tally("fit", 12, 12)], 7990);
  const pool = [me, good, pricey, thinAlt, silent, close];
  it("同じくらいの値段・30件以上・ふれた声あり・3分の1以上少ない", () => {
    const result = switchTargets(me, pool, "fit");
    assert.equal(result.status, "found");
    if (result.status === "found") {
      assert.deepEqual(result.targets.map((t) => t.id), ["good"]);
      assert.deepEqual(result.band, [4788, 11172]);
    }
  });
  it("自分が少ししか読めていないときは出さない", () => {
    assert.deepEqual(switchTargets(product("x", 12, [tally("fit", 1, 5)]), pool, "fit"), { status: "thin" });
  });
  it("自分がその観点にふれていないときは出さない", () => {
    assert.deepEqual(switchTargets(product("x", 50, [tally("fit", 1, 0)]), pool, "fit"), { status: "quiet" });
  });
  it("見つからないときは値段の幅を返す", () => {
    const result = switchTargets(good, pool, "fit");
    assert.equal(result.status, "none");
  });
});

describe("compareProducts・compareLead", () => {
  const sony = product("sony", 129, [tally("fit", 21, 14), tally("sound", 52, 4), tally("anc", 32, 11), tally("battery", 8, 10)]);
  const victor = product("victor", 60, [tally("fit", 7, 1), tally("sound", 21, 4), tally("battery", 4, 1)]);
  const word = (k: string) => ({ fit: "つけ心地", sound: "音質", anc: "ノイキャン", battery: "電池" }[k] ?? k);
  it("両方でふれた観点だけ比べ、差の大きい順。片方だけは分ける", () => {
    const { differ, same, onlyA, onlyB } = compareProducts(sony, victor, ORDER);
    assert.deepEqual(differ.map((r) => [r.key, r.fewerBad]), [["fit", "b"], ["battery", "b"], ["sound", "a"]]);
    assert.deepEqual(same, []);
    assert.deepEqual(onlyA, ["anc"]);
    assert.deepEqual(onlyB, []);
  });
  it("★と逆向きなら「でも」", () => {
    const { differ } = compareProducts(sony, victor, ORDER);
    assert.equal(
      compareLead({ name: "Sony", star: 4.31 }, { name: "Victor", star: 4.06 }, differ[0], word),
      "★は Sony が上（4.31・4.06）。でも「つけ心地」の残念は Victor が少ない（60件中1件・129件中14件）。",
    );
  });
  it("★と同じ向きなら「でも」を付けない。差が無ければそう書く", () => {
    const { differ } = compareProducts(sony, victor, ORDER);
    assert.ok(!compareLead({ name: "Sony", star: 4.0 }, { name: "Victor", star: 4.5 }, differ[0], word).includes("でも"));
    assert.equal(compareLead({ name: "A", star: 4 }, { name: "B", star: 4 }, undefined, word), "★は同じ（4.00）。残念の数に、はっきりした差はありません。");
  });
});

describe("parseQuery", () => {
  it("楽天の商品価格ナビの URL は商品として開く", () => {
    assert.deepEqual(parseQuery("https://product.rakuten.co.jp/product/-/821de2ea4d103ede4bb09e3d80df3015/review/"), { kind: "product", id: "821de2ea4d103ede4bb09e3d80df3015" });
  });
  it("このサイトの URL も", () => {
    assert.deepEqual(parseQuery("https://example.com/reviews/821DE2EA4D103EDE4BB09E3D80DF3015?k=fit"), { kind: "product", id: "821de2ea4d103ede4bb09e3d80df3015" });
  });
  it("お店の商品ページは、今は結びつけられない", () => {
    assert.deepEqual(parseQuery("https://item.rakuten.co.jp/shop/item-1/"), { kind: "other-url" });
  });
  it("ふつうの言葉と空", () => {
    assert.deepEqual(parseQuery("  sony "), { kind: "text", q: "sony" });
    assert.deepEqual(parseQuery("   "), { kind: "empty" });
  });
});

describe("displayName", () => {
  it("カテゴリ名と読み仮名を外す", () => {
    assert.equal(displayName("SONY 完全ワイヤレスイヤホン WF-C710N/L グラスブルー"), "SONY WF-C710N/L グラスブルー");
    assert.equal(displayName("AUKEY｜オーキー フルワイヤレスイヤホン Pink EP-T21S-PK ワイヤレス 左右分離 "), "AUKEY Pink EP-T21S-PK");
    assert.equal(displayName("BOSE｜ボーズ 完全ワイヤレスイヤホン Bose Ultra Open Earbuds カーボンブ"), "BOSE Ultra Open Earbuds カーボンブ");
  });
  it("お店の商品名の宣伝を外し、長すぎる名前は言葉の切れ目で止める", () => {
    assert.equal(displayName("【送料無料】化粧水 グリシルグリシン 6% アゼライン酸誘導体 プレ化粧水 楽天ベストコスメ2024 2冠受賞 毛穴 テカリ 皮脂 エイジングケア"), "化粧水 グリシルグリシン 6% アゼライン酸誘導体 プレ化粧水…");
    assert.equal(displayName("Panasonic ワイヤレスステレオインサイドホン RZ-S50W-W"), "Panasonic ワイヤレスステレオインサイドホン RZ-S50W-W", "型番のあるふつうの長さの名前は切らない");
    assert.equal(displayName("Google Pixel Buds 2a Fog GA09553-JP /カナル型 /ノイズキャンセリング対応 /Bluetooth対応"), "Google Pixel Buds 2a Fog GA09553-JP");
    assert.equal(displayName("＼ドクダミリニューアル新発売／【Anua公式】ドクダミ 77% トナー"), "ドクダミ 77% トナー");
    assert.equal(displayName("【公式】SK-II フェイシャルトリートメントエッセンス"), "SK-II フェイシャルトリートメントエッセンス");
    assert.equal(displayName("公式 アンダーアーマー UNDER ARMOUR UA チャージド"), "アンダーアーマー UNDER ARMOUR UA チャージド");
    assert.equal(displayName("■生活応援キャンペーン実施中■ロイヤルカナン FHN インドア 4kg"), "ロイヤルカナン FHN インドア 4kg");
    assert.equal(displayName("★ポイント20倍+セット27日23:59マデ★【送料無料】Yunth 生VC 美白"), "Yunth 生VC 美白");
  });
  it("何も残らなければ元の名前", () => {
    assert.equal(displayName("完全ワイヤレスイヤホン"), "完全ワイヤレスイヤホン");
  });
});

describe("実データ（イヤホン）：docs/11 の数字", () => {
  const root = new URL("../data/", import.meta.url);
  const products = JSON.parse(readFileSync(new URL("genre-products.json", root), "utf8")).products as { productId: string; price: number }[];
  const aspects = JSON.parse(readFileSync(new URL("genre-aspects.json", root), "utf8")).genres.find((g: { categoryId: string }) => g.categoryId === "earbuds").products as { productId: string; reviewsRead: number; aspects: AspectProduct["aspects"] }[];
  const pool: Priced[] = aspects.map((a) => ({ id: a.productId, reviewsRead: a.reviewsRead, aspects: a.aspects, price: products.find((p) => p.productId === a.productId)!.price }));
  const byShort = (s: string) => pool.find((p) => p.id.startsWith(s))!;
  // 2026-09-26 に数え直した（gemini-3.5-flash-lite・引用の向き・レビューごとの記録）。soundcore C50i が新たに読めた
  it("くわしく読めたのは7商品", () => {
    assert.equal(pool.filter((p) => p.reviewsRead >= READ_ENOUGH).length, 7);
  });
  it("Sony WF-C710N のつけ心地から乗り換えられるのは Victor・Liberty 4・EarFun・soundcore C50i", () => {
    const result = switchTargets(byShort("821de2ea"), pool, "fit");
    assert.equal(result.status, "found");
    if (result.status === "found") assert.deepEqual(result.targets.map((t) => t.id.slice(0, 8)), ["e7e3a226", "637e1dd6", "d5f259d1", "f02e6fec"]);
  });
  it("Liberty 4 のノイキャンは、はっきり少ない商品が無い。AUKEY は同じ値段の商品が無い", () => {
    assert.equal(switchTargets(byShort("637e1dd6"), pool, "anc").status, "none");
    assert.equal(switchTargets(byShort("e89650d6"), pool, "connection").status, "none");
  });
});

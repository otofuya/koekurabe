import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { listedItems, listedCards, pickItems, productIdOf, NOT_A_UNIT } from "./category-list.ts";

const page = (items: unknown[]) => `<html><script type="application/ld+json">{"@type":"BreadcrumbList"}</script>
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org/", "@type": "ItemList", itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })) })}</script></html>`;
const product = (name: string, reviewCount: number, url = "https://item.rakuten.co.jp/shop/code/?scid=seo-carousel-search") =>
  ({ "@type": "Product", name, image: ["https://thumbnail.image.rakuten.co.jp/a.jpg"], offers: { price: 1460 }, aggregateRating: { ratingValue: 4.38, reviewCount }, url });

describe("listedItems", () => {
  it("ItemList から商品を読む。URL の問い合わせの文字は外し、商品コードを作る", () => {
    const [got] = listedItems(page([product("化粧水A", 2697, "https://item.rakuten.co.jp/tvert/352/?scid=seo-carousel-search")]));
    assert.deepEqual(got, { name: "化粧水A", image: "https://thumbnail.image.rakuten.co.jp/a.jpg", price: 1460, rating: 4.38, reviewCount: 2697, url: "https://item.rakuten.co.jp/tvert/352/", itemCode: "tvert:352" });
  });
  it("★の無い商品はレビュー0件。楽天の商品ページでない URL は読まない", () => {
    const got = listedItems(page([{ name: "B", url: "https://item.rakuten.co.jp/s/b/", offers: { price: 10 } }, product("C", 5, "https://example.com/x/y/")]));
    assert.equal(got.length, 1);
    assert.equal(got[0].reviewCount, 0);
    assert.equal(got[0].rating, null);
  });
  it("データの無いページは空", () => {
    assert.deepEqual(listedItems("<html></html>"), []);
  });
});

describe("listedCards", () => {
  const card = (title: string, href: string, stars: string, review = "") => `<div data-id="10000307" data-shop-id="218824" data-track-card="search" data-track-price="2100">
<a href="${href}"><img src="https://tshop.r10s.jp/a.jpg?fitin=275:275" alt="x"></a>
<div><h2><a title="${title}" target="_top" data-link="item" href="${href}">${title}</a></h2></div>
<div><div>2,100<span>円</span></div></div>${stars}${review}</div>`;
  it("カードから、名前・URL・値段・★・件数・レビューのページの番号を読む", () => {
    const html = card("化粧水 &amp; 乳液", "https://item.rakuten.co.jp/tvert/352/", `<span>4.38</span><span>(2,697件)</span>`, `<a href="https://review.rakuten.co.jp/item/1/218824_10000307/1.1/">レビュー</a>`)
      + `<div data-track-card="cpc">広告は読まない</div>`;
    const [got, ...rest] = listedCards(html);
    assert.equal(rest.length, 0);
    assert.deepEqual(got, { name: "化粧水 & 乳液", image: "https://tshop.r10s.jp/a.jpg?fitin=275:275", price: 2100, rating: 4.38, reviewCount: 2697, url: "https://item.rakuten.co.jp/tvert/352/", itemCode: "tvert:352", reviewKey: "218824_10000307" });
  });
  it("★の無いカードはレビュー0件。レビューのリンクが無ければ番号も無し", () => {
    const [got] = listedCards(card("B", "https://item.rakuten.co.jp/s/b/", ""));
    assert.equal(got.reviewCount, 0);
    assert.equal(got.rating, null);
    assert.equal(got.reviewKey, undefined);
  });
});

describe("pickItems", () => {
  it("レビューの多い順。30件未満・お試し・まとめ売りは理由つきで外す。同じ商品コードは1つ", () => {
    const items = listedItems(page([
      product("化粧水 お試しセット", 900, "https://item.rakuten.co.jp/s/1/"),
      product("化粧水 2個セット", 800, "https://item.rakuten.co.jp/s/2/"),
      product("化粧水 本品", 700, "https://item.rakuten.co.jp/s/3/"),
      product("化粧水 本品", 700, "https://item.rakuten.co.jp/s/3/"),
      product("化粧水 少ない", 12, "https://item.rakuten.co.jp/s/4/"),
      product("化粧水 大きいサイズ", 50, "https://item.rakuten.co.jp/s/5/"),
    ]));
    const { kept, skipped } = pickItems(items, { max: 1 });
    assert.deepEqual(kept.map((x) => x.itemCode), ["s:3"]);
    assert.deepEqual(skipped.map((x) => x.why), ["お試し・詰め替え・まとめ売り", "お試し・詰め替え・まとめ売り", "20商品を超えた".replace("20", "1"), "レビュー12件"]);
  });
  it("全角の数字のまとめ売りも外す", () => {
    assert.ok(NOT_A_UNIT.test("化粧水 ２個セット".normalize("NFKC")));
    assert.ok(!NOT_A_UNIT.test("化粧水 200ml"));
  });
  it("商品の ID は API で作るときと同じ形（32桁）", () => {
    assert.match(productIdOf("tvert:352"), /^[a-f0-9]{32}$/);
    assert.equal(productIdOf("tvert:352"), productIdOf("tvert:352"));
  });
});

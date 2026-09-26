import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  productHead, categoryHead, homeHead, vsHead, notFoundHead, robotsValue, breadcrumbLd, sitemapXml, robotsTxt,
  affiliateUrl, productIndexable, categoryIndexable,
} from "./seo-model.ts";
import { READ_ENOUGH } from "./nakami-model.ts";

const SITE = { name: "★の中身", url: "https://example.pages.dev", public: true };
const HIDDEN = { ...SITE, public: false };
const ORDER = ["sound", "fit", "anc", "battery"];
const WORDS: Record<string, string> = { sound: "音質", fit: "つけ心地", anc: "ノイキャン", battery: "電池" };
const word = (key: string) => WORDS[key] ?? key;
const tally = (key: string, positive: number, negative: number) => ({ key, positive, negative, quotes: [] });
const CAT = { id: "earbuds", label: "完全ワイヤレスイヤホン" };
const sony = {
  productId: "821de2ea4d103ede4bb09e3d80df3015",
  name: "SONY 完全ワイヤレスイヤホン WF-C710N/L グラスブルー",
  reviewCount: 132,
  reviewsRead: 129,
  aspects: [tally("sound", 52, 4), tally("fit", 21, 14), tally("anc", 32, 11), tally("battery", 8, 10)],
};

describe("productHead", () => {
  it("くわしく読めた商品：件数から組み立てた説明・検索に出す・シェア画像", () => {
    const head = productHead(sony, CAT, ORDER, word, SITE);
    assert.equal(head.title, "SONY WF-C710N/L グラスブルーの口コミ｜よかった・残念だったを数えました｜★の中身");
    assert.equal(head.description, "楽天のレビュー129件を読んで数えました。よかった：音質52件・ノイキャン32件・つけ心地21件。残念だった：つけ心地14件・ノイキャン11件・電池10件。");
    assert.equal(head.path, "/reviews/821de2ea4d103ede4bb09e3d80df3015");
    assert.equal(head.index, true);
    assert.equal(head.image, "/og/821de2ea4d103ede4bb09e3d80df3015.png");
    assert.deepEqual(head.crumbs?.map((c) => c.path), ["/", "/compare/earbuds", head.path]);
  });
  it("少ししか読めていない商品は、検索に出さず、シェア画像も作らない", () => {
    const head = productHead({ ...sony, reviewsRead: READ_ENOUGH - 1 }, CAT, ORDER, word, SITE);
    assert.equal(head.index, false);
    assert.equal(head.image, undefined);
  });
  it("読んでいない商品：読んでいないと書き、検索に出さない", () => {
    const head = productHead({ ...sony, reviewsRead: null, aspects: null }, CAT, ORDER, word, SITE);
    assert.equal(head.index, false);
    assert.equal(head.title, "SONY WF-C710N/L グラスブルー｜★の中身");
    assert.equal(head.description, "完全ワイヤレスイヤホン。楽天のレビュー132件は、まだ読んでいません。");
  });
  it("レビューが無い商品", () => {
    const head = productHead({ ...sony, reviewCount: 0, reviewsRead: null, aspects: null }, CAT, ORDER, word, SITE);
    assert.equal(head.description, "完全ワイヤレスイヤホン。楽天にレビューがまだ無い商品です。");
  });
});

describe("categoryHead", () => {
  const stats = { total: 97, analysed: 24, reviewsRead: 976, readEnough: 6, offerable: ["fit", "anc", "battery"] };
  it("読めた量と、並べられる観点を書く", () => {
    const head = categoryHead(CAT, stats, word, SITE);
    assert.equal(head.description, "完全ワイヤレスイヤホン97商品のうち24商品、レビュー976件を読みました。つけ心地・ノイキャン・電池など、気になることの残念が少ない順に並べます。");
    assert.equal(head.index, true);
  });
  it("並べられる観点が無い・くわしく読めた商品が無いカテゴリは出さない", () => {
    assert.equal(categoryHead(CAT, { ...stats, offerable: [] }, word, SITE).index, false);
    assert.equal(categoryHead(CAT, { ...stats, readEnough: 0 }, word, SITE).index, false);
  });
  it("まだ読んでいないカテゴリ", () => {
    const head = categoryHead(CAT, { total: 45, analysed: 0, reviewsRead: 0, readEnough: 0, offerable: [] }, word, SITE);
    assert.equal(head.description, "完全ワイヤレスイヤホン45商品。レビューはまだ読んでいません。");
  });
});

describe("検索に出すかの境目", () => {
  it("商品は30件から", () => {
    assert.equal(productIndexable(null), false);
    assert.equal(productIndexable(READ_ENOUGH - 1), false);
    assert.equal(productIndexable(READ_ENOUGH), true);
  });
  it("カテゴリは、くわしく読めた商品1つ以上・並べられる観点1つ以上", () => {
    assert.equal(categoryIndexable(1, 1), true);
    assert.equal(categoryIndexable(0, 3), false);
    assert.equal(categoryIndexable(3, 0), false);
  });
});

describe("robots", () => {
  it("公開前は、どのページも検索に出さない", () => {
    assert.equal(robotsValue(homeHead(HIDDEN), HIDDEN), "noindex,follow");
    assert.equal(robotsValue(homeHead(SITE), SITE), "index,follow");
    assert.equal(robotsValue(vsHead("A", "B", SITE, "/vs/a/b"), SITE), "noindex,follow");
    assert.equal(robotsValue(notFoundHead(SITE, "/x"), SITE), "noindex,follow");
  });
  it("robots.txt：公開前はすべて断る。公開後はサイトマップを示す", () => {
    assert.equal(robotsTxt(HIDDEN), "User-agent: *\nDisallow: /\n");
    assert.match(robotsTxt(SITE), /Sitemap: https:\/\/example\.pages\.dev\/sitemap\.xml/);
  });
});

describe("構造化データとサイトマップ", () => {
  it("パンくずは絶対 URL。評価の印は付けない", () => {
    const ld = breadcrumbLd(productHead(sony, CAT, ORDER, word, SITE), SITE)!;
    assert.equal(ld["@type"], "BreadcrumbList");
    assert.equal(ld.itemListElement[1].item, "https://example.pages.dev/compare/earbuds");
    assert.ok(!JSON.stringify(ld).includes("Rating"));
    assert.equal(breadcrumbLd(homeHead(SITE), SITE), null);
  });
  it("サイトマップは渡したページだけ。記号は逃がす", () => {
    const xml = sitemapXml(SITE, [{ path: "/" }, { path: "/a?b=1&c=2", lastmod: "2026-09-26" }]);
    assert.match(xml, /<loc>https:\/\/example\.pages\.dev\/<\/loc>/);
    assert.match(xml, /<loc>https:\/\/example\.pages\.dev\/a\?b=1&amp;c=2<\/loc><lastmod>2026-09-26<\/lastmod>/);
  });
});

describe("affiliateUrl", () => {
  const url = "https://product.rakuten.co.jp/product/-/821de2ea4d103ede4bb09e3d80df3015/?rafcid=wsc_i_ps_x";
  it("ID があれば楽天アフィリエイトの形に包む", () => {
    const out = affiliateUrl(url, "1a2b3c4d.5e6f7a8b.1a2b3c4d.5e6f7a8b");
    assert.equal(out, `https://hb.afl.rakuten.co.jp/hgc/1a2b3c4d.5e6f7a8b.1a2b3c4d.5e6f7a8b/?pc=${encodeURIComponent(url)}&m=${encodeURIComponent(url)}`);
  });
  it("ID が無い・形が変・楽天以外の URL なら、そのまま", () => {
    assert.equal(affiliateUrl(url, ""), url);
    assert.equal(affiliateUrl(url, "a b/c"), url);
    assert.equal(affiliateUrl("https://example.com/x", "1a2b3c4d.5e6f7a8b"), "https://example.com/x");
    assert.equal(affiliateUrl("https://evil-rakuten.co.jp.example.com/", "1a2b3c4d.5e6f7a8b"), "https://evil-rakuten.co.jp.example.com/");
  });
});

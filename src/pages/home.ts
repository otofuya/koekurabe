import { h, icon } from "../app/dom.ts";
import type { Page } from "../app/router.ts";
import { categoryIds, genre, findProduct } from "../app/data.ts";
import { selectFeatured } from "@lib/home-model.ts";
import { aspectsFor } from "@lib/category-definitions.ts";
import { nakamiCard, productImage, nameOf, productHref, categoryHref } from "../app/parts.ts";
import { searchBox } from "../app/shell.ts";
import { recent, concerns } from "../app/store.ts";
import type { JoinedProduct } from "@lib/types.ts";

/** まだ読んでいないカテゴリ（docs/10 第5節の10カテゴリのうち、イヤホン以外）。 */
const LATER = ["化粧水", "シャンプー", "ランニングシューズ", "枕", "ドリップコーヒー", "プロテイン", "キャットフード", "ドライヤー", "スティック掃除機"];

/**
 * ホーム。はじめての人には、本物の商品で「形」を1つ見せる（説明より例）。
 * 2回目からは、最近見た商品と、気にしていることが先に出る。
 */
export function homePage(app: HTMLElement): Page {
  document.title = "★の中身｜★の数では、わからないこと";
  const g = genre("earbuds")!;
  const featured = selectFeatured(g.joined, aspectsFor(g.id), 1)[0]?.product;
  const seen = recent.get().map((id) => findProduct(id)?.product).filter((p): p is JoinedProduct => !!p);
  const mine = concerns.get(g.id);

  app.append(h("article", { class: "home" },
    h("section", { class: "home__hero" },
      h("h1", null, "★の数では、", h("br"), "わからないこと。"),
      h("p", { class: "home__lead" }, "買った人のレビューを読んで、", h("b", null, "よかったこと・残念だったこと"), "を数えました。"),
      searchBox()),
    featured ? h("section", { class: "block" },
      h("div", { class: "stitle" }, h("h2", null, "たとえば")),
      h("a", { class: "example", href: productHref(featured.productId) },
        h("span", { class: "example__id" }, productImage(featured, 64), h("span", null, h("b", null, nameOf(featured)), h("span", { class: "example__meta" }, `レビュー${featured.reviewsRead}件を読んで数えました`))),
        nakamiCard(featured, g, { compact: true, rows: 2 }),
        h("span", { class: "more" }, "この商品の中身を見る", icon("arrow", 16)))) : null,
    seen.length ? h("section", { class: "block" },
      h("div", { class: "stitle" }, h("h2", null, "最近見た商品"), h("span", { class: "stitle__sub" }, "この端末にだけ")),
      h("div", { class: "strip" }, seen.map((p) => h("a", { class: "strip__i", href: productHref(p.productId) }, productImage(p, 72), h("span", null, nameOf(p)))))) : null,
    mine.length ? h("section", { class: "block" },
      h("div", { class: "stitle" }, h("h2", null, "気にしていること"), h("span", { class: "stitle__sub" }, "どの商品でも先に出ます")),
      h("div", { class: "chips" }, mine.map((k) => h("a", { class: "chip", href: categoryHref(g, k) }, icon("pin", 13, 2.2), g.word(k))))) : null,
    h("section", { class: "block" },
      h("div", { class: "stitle" }, h("h2", null, "カテゴリから")),
      categoryIds().map((id) => {
        const c = genre(id)!;
        const faces = [...c.joined].filter((p) => p.reviewsRead).sort((x, y) => (y.reviewsRead ?? 0) - (x.reviewsRead ?? 0)).slice(0, 3);
        return h("a", { class: "cat-card", href: categoryHref(c) },
          h("span", { class: "cat-card__faces" }, faces.map((p) => productImage(p, 56))),
          h("span", { class: "cat-card__body" }, h("b", null, c.label), h("span", null, `${c.coverage.total}商品のうち${c.coverage.analysed}商品を読みました`)),
          icon("arrow", 18));
      }),
      h("p", { class: "later" }, h("b", null, "準備中："), LATER.join("・"))),
    h("section", { class: "block steps" },
      h("div", { class: "stitle" }, h("h2", null, "使い方")),
      h("ol", null,
        h("li", null, h("b", null, "商品を開く"), h("span", null, "商品名か、楽天の商品ページの URL で")),
        h("li", null, h("b", null, "★の中身を見る"), h("span", null, "左によかった、右に残念だった。何件中何件か")),
        h("li", null, h("b", null, "気になる残念を押す"), h("span", null, "買った人のひとことと、その残念が少ない商品"))))));
  return {};
}

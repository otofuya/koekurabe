import { h, icon, yen, fill } from "../app/dom.ts";
import type { Page } from "../app/router.ts";
import { navigate } from "../app/router.ts";
import { findProduct } from "../app/data.ts";
import type { Genre } from "../app/data.ts";
import type { JoinedProduct, Spec } from "@lib/types.ts";
import { nakamiCard, allList, productImage, starLine, nameOf, sectionTitle, categoryHref, bar, evidenceTag, shopLink, adNotice, fitBlock } from "../app/parts.ts";
import { setHead } from "../app/head.ts";
import { SITE } from "../app/site.ts";
import { productHead } from "@lib/seo-model.ts";
import { createSheet } from "../app/sheet.ts";
import { concerns, recent, tray, onStoreChange } from "../app/store.ts";
import { notFound } from "./not-found.ts";

/**
 * 商品ページ。検索から着地したその画面で完結させる（docs/12 第1・2節）。
 * 上から：どの商品か → ★の中身 → ぜんぶの項目 → 仕様（評判が先、仕様が後）→ 楽天で見る。
 */
export function productPage(app: HTMLElement, id: string, url: URL): Page | void {
  const found = findProduct(id);
  if (!found) return notFound(app);
  const { product: p, genre: g } = found;
  recent.add(id);
  setHead(productHead(p, g, g.order, g.word, SITE));

  let opener: HTMLElement | null = null;
  const closeSheet = () => {
    if (history.state?.sheet) history.back();
    else navigate(location.pathname, { replace: true });
  };
  const sheet = createSheet(closeSheet);
  const pick = (key: string, from: HTMLElement) => {
    opener = from;
    if (sheet.key()) navigate(`${location.pathname}?k=${key}`, { replace: true, state: history.state ?? {} });
    else navigate(`${location.pathname}?k=${key}`, { state: { sheet: true } });
  };

  const main = h("div", { class: "pp__main" });
  const paintMain = () => {
    const keys = concerns.get(g.id);
    fill(main,
      concernStrip(p, g, keys, pick),
      nakamiCard(p, g, { onPick: pick, concernKeys: keys }),
      p.aspects && p.reviewsRead ? h("p", { class: "hint" }, "行を押すと、買った人のひとことと、その残念が少ない商品が見られます") : null,
      fitBlock(p, g),
      p.aspects && p.reviewsRead ? h("section", { class: "block" }, sectionTitle("ぜんぶの項目", h("span", null, h("span", { class: "dot dot--good" }), "よかった　残念だった", h("span", { class: "dot dot--bad" }))), allList(p, g, pick, keys)) : null,
      p.aspects ? null : unreadHelp(p, g),
    );
  };
  paintMain();
  const off = onStoreChange((key) => { if (key.startsWith("concerns.")) paintMain(); });

  const inTray = h("button", { type: "button", class: "btn btn--line" });
  const paintTray = () => {
    const on = tray.has(id);
    inTray.setAttribute("aria-pressed", String(on));
    inTray.replaceChildren(icon(on ? "check" : "plus", 16, 2.2), on ? "くらべるに入れた" : "くらべるに入れる");
  };
  paintTray();
  inTray.addEventListener("click", () => { tray.toggle(id); paintTray(); });
  const offTray = onStoreChange((key) => { if (key === "tray") paintTray(); });

  app.append(h("article", { class: "pp" },
    h("nav", { class: "crumb" }, h("a", { href: categoryHref(g) }, icon("back", 16), g.label)),
    adNotice(),
    h("div", { class: "pp__side" },
    h("header", { class: "pp__hero" },
      productImage(p, 168, { eager: true, transition: true }),
      h("div", { class: "pp__id" },
        h("h1", { class: "pp__name" }, nameOf(p)),
        h("p", { class: "pp__full" }, p.name),
        h("p", { class: "pp__meta" }, h("span", { class: "num pp__price" }, yen(p.price)), starLine(p)),
        h("p", null, evidenceTag(p)))),
    h("div", { class: "pp__acts" }, inTray, buyLink(p, "btn btn--soft"))),
    main,
    specs(p.specs),
    h("section", { class: "block buy" }, buyLink(p, "btn btn--ink btn--wide"), h("p", { class: "fine" }, "楽天の商品ページが開きます。値段と在庫は楽天でお確かめください。"))));

  const update = (u: URL) => {
    const key = u.searchParams.get("k");
    if (key && g.order.includes(key)) sheet.show(p, g, key, opener);
    else sheet.hide();
    return true;
  };
  update(url);
  return { update, leave: () => { sheet.hide(); off(); offTray(); } };
}

/** 気にしていること（この端末に覚えた観点）を、中身カードの上に先に出す。 */
function concernStrip(p: JoinedProduct, g: Genre, keys: readonly string[], pick: (key: string, from: HTMLElement) => void) {
  if (!keys.length || !p.aspects || !p.reviewsRead) return null;
  const read = p.reviewsRead;
  return h("section", { class: "mine", "aria-label": "あなたが気にしていること" },
    h("h2", { class: "mine__head" }, icon("pin", 14, 2.2), "あなたが気にしていること"),
    keys.map((key) => {
      const t = p.aspects!.find((x) => x.key === key);
      const pos = t?.positive ?? 0, neg = t?.negative ?? 0;
      return h("button", { type: "button", class: "mine__row", onclick: (e: Event) => pick(key, e.currentTarget as HTMLElement) },
        h("span", { class: "mine__word" }, g.word(key)),
        pos + neg
          ? h("span", { class: "mine__pair" },
            h("span", { class: "mine__side" }, h("span", { class: "mine__l mine__l--good" }, "よかった ", h("b", null, pos)), bar(pos, read, "good")),
            h("span", { class: "mine__side" }, h("span", { class: "mine__l mine__l--bad" }, "残念 ", h("b", null, neg)), bar(neg, read, "bad")))
          : h("span", { class: "mine__none" }, "ふれた声なし"),
        h("span", { class: "mine__read" }, `${read}件中`));
    }));
}

function unreadHelp(p: JoinedProduct, g: Genre) {
  return h("section", { class: "block" },
    h("p", { class: "note" }, p.reviewCount
      ? `楽天には${p.reviewCount.toLocaleString("ja-JP")}件のレビューがありますが、まだ読んでいません。読めている商品から探せます。`
      : "楽天にレビューがまだ無い商品です。読めている商品から探せます。"),
    h("a", { class: "more", href: categoryHref(g) }, `${g.label}で、読めている商品を見る`, icon("arrow", 16)));
}

const PROV: Record<Spec["provenance"], [string, string]> = {
  official: ["公式", "prov"],
  ec_api: ["販売ページ", "prov"],
  llm_inferred: ["推定", "prov prov--est"],
};
/** 仕様は評判のあと（設計原則4）。推定の値には「推定」。 */
function specs(list: Spec[]) {
  if (!list.length) return null;
  return h("section", { class: "block" },
    sectionTitle("仕様", "評判のあとに"),
    h("dl", { class: "specs" }, list.map((s) => [
      h("dt", null, s.label),
      h("dd", null, s.displayValue, " ", h("span", { class: PROV[s.provenance][1] }, PROV[s.provenance][0])),
    ])),
    h("p", { class: "fine" }, "推定：販売ページやメーカーの表に無く、商品名や説明から推し量った値です。"));
}

function buyLink(p: JoinedProduct, cls: string) {
  return shopLink(p, cls, "楽天で見る");
}

import { h, icon, yen } from "../app/dom.ts";
import type { Page } from "../app/router.ts";
import { findProduct, asAspect } from "../app/data.ts";
import type { Genre } from "../app/data.ts";
import type { JoinedProduct } from "@lib/types.ts";
import { compareProducts, compareLead } from "@lib/nakami-model.ts";
import type { CompareRow } from "@lib/nakami-model.ts";
import { buildSpecRows } from "@lib/vs-model.ts";
import { productImage, starLine, nameOf, productHref, bar, evidenceTag, sectionTitle, shopLink, adNotice } from "../app/parts.ts";
import { setHead } from "../app/head.ts";
import { SITE } from "../app/site.ts";
import { vsHead } from "@lib/seo-model.ts";
import { concerns } from "../app/store.ts";
import { notFound } from "./not-found.ts";

/**
 * 2つをくらべる。送られてきた URL だけでも読めるように、1行目に結論（件数から作る定型文）。
 * 並び：気にしていること → ちがいが大きいこと → 同じくらい → 片方だけ声があること → 仕様。
 */
export function vsPage(app: HTMLElement, aId: string, bId: string, url: URL): Page | void {
  const A = findProduct(aId), B = findProduct(bId);
  if (!A || !B || A.genre.id !== B.genre.id) return notFound(app);
  const g = A.genre, a = A.product, b = B.product;
  setHead(vsHead(a.name, b.name, SITE, url.pathname));

  const head = h("header", { class: "vs__head" },
    [a, b].map((p) => h("a", { class: "vs__p", href: productHref(p.productId) },
      productImage(p, 104, { eager: true, transition: true }),
      h("span", { class: "vs__name" }, nameOf(p)),
      h("span", { class: "vs__meta" }, h("span", { class: "num" }, yen(p.price)), " ", starLine(p)),
      evidenceTag(p))),
    h("a", { class: "vs__swap iconbtn", href: `/vs/${b.productId}/${a.productId}${url.search}`, "aria-label": "左右を入れかえる" }, icon("swap", 18)));

  const apA = asAspect(a), apB = asAspect(b);
  if (!apA || !apB) {
    app.append(h("article", { class: "vs" }, h("h1", { class: "vs__title" }, "2つをくらべる"), head,
      h("p", { class: "note" }, `${!apA ? nameOf(a) : nameOf(b)} のレビューは、まだ読んでいません。読めている商品どうしでくらべられます。`)));
    return;
  }

  const { differ, same, onlyA, onlyB } = compareProducts(apA, apB, g.order);
  const asked = url.searchParams.get("k");
  const mine = [...new Set([asked, ...concerns.get(g.id)].filter((k): k is string => !!k && g.order.includes(k)))];
  const all = [...differ, ...same];
  const leadRow = differ.find((r) => r.key === asked) ?? differ[0];
  const lead = compareLead({ name: nameOf(a), star: a.reviewAverage }, { name: nameOf(b), star: b.reviewAverage }, leadRow, g.word);
  const mineRows = mine.map((k) => all.find((r) => r.key === k)).filter((r): r is CompareRow => !!r);
  const rest = differ.filter((r) => !mine.includes(r.key));

  app.append(h("article", { class: "vs" },
    h("h1", { class: "vs__title" }, "2つをくらべる"),
    adNotice(),
    head,
    h("p", { class: "vs__lead" }, lead),
    mineRows.length ? h("section", { class: "block" }, sectionTitle(mineRows.every((r) => concerns.has(g.id, r.key)) ? "気にしていること" : "いま見ていること"), mineRows.map((r) => vrow(r, a, b, g))) : null,
    rest.length ? h("section", { class: "block" }, sectionTitle("ちがいが大きいこと", "残念の割合の差が大きい順"), rest.map((r) => vrow(r, a, b, g))) : null,
    same.filter((r) => !mine.includes(r.key)).length ? h("section", { class: "block" }, sectionTitle("同じくらいのこと"), h("p", { class: "same" }, same.filter((r) => !mine.includes(r.key)).map((r) => h("span", { class: "same__i" }, g.word(r.key))))) : null,
    onlyA.length + onlyB.length ? h("section", { class: "block" }, sectionTitle("片方だけに声があること"),
      h("ul", { class: "only" },
        onlyA.map((k) => h("li", null, h("b", null, g.word(k)), `：${nameOf(a)} だけ（${nameOf(b)} はふれた声が3件未満）`)),
        onlyB.map((k) => h("li", null, h("b", null, g.word(k)), `：${nameOf(b)} だけ（${nameOf(a)} はふれた声が3件未満）`)))) : null,
    specTable(a, b),
    h("div", { class: "vs__buy" }, [a, b].map((p) => shopLink(p, "btn btn--soft", h("span", null, "楽天で見る", h("small", { class: "vs__buyname" }, nameOf(p)))))),
    h("p", { class: "fine" }, "件数は AI がレビューを1件ずつ分類し、コードが数えたものです。分母は読んだ件数です。")));
}

function vrow(r: CompareRow, a: JoinedProduct, b: JoinedProduct, g: Genre) {
  const cell = (s: CompareRow["a"], fewer: boolean) => h("div", { class: `vcell${fewer ? " is-fewer" : ""}` },
    h("span", { class: "vcell__l vcell__l--good" }, "よかった ", h("b", null, s.positive)), bar(s.positive, s.read, "good"),
    h("span", { class: "vcell__l vcell__l--bad" }, "残念 ", h("b", null, s.negative)), bar(s.negative, s.read, "bad"),
    h("span", { class: "vcell__read" }, `${s.read}件中`, fewer ? h("span", { class: "vcell__tag" }, "残念が少ない") : null));
  return h("div", { class: "vrow" },
    h("a", { class: "vrow__word", href: `${productHref(a.productId, r.key)}` }, g.word(r.key)),
    h("div", { class: "vrow__cells" }, cell(r.a, r.fewerBad === "a"), cell(r.b, r.fewerBad === "b")));
}

const PROV: Record<string, [string, string]> = { official: ["公式", "prov"], ec_api: ["販売ページ", "prov"], llm_inferred: ["推定", "prov prov--est"] };
function specTable(a: JoinedProduct, b: JoinedProduct) {
  const rows = buildSpecRows(a, b);
  if (!rows.length) return null;
  const val = (v: { value: string; provenance: string } | null) => v ? [v.value, " ", h("span", { class: PROV[v.provenance]?.[1] ?? "prov" }, PROV[v.provenance]?.[0] ?? v.provenance)] : h("span", { class: "muted" }, "掲載なし");
  return h("section", { class: "block" }, sectionTitle("仕様", "評判のあとに"),
    h("div", { class: "vspec" }, rows.map((r) => h("div", { class: "vspec__r" }, h("span", { class: "vspec__k" }, r.label), h("span", null, val(r.a)), h("span", null, val(r.b))))),
    h("p", { class: "fine" }, "掲載なしは「非対応」ではありません。推定：販売ページやメーカーの表に無く、推し量った値。"));
}

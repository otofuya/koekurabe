import { h, icon, reduceMotion, yen, fill } from "../app/dom.ts";
import type { Page } from "../app/router.ts";
import { genre } from "../app/data.ts";
import type { Genre } from "../app/data.ts";
import { fewestBad, evidenceOf, TALKED_MIN } from "@lib/nakami-model.ts";
import { productRow, bar, evidenceTag, categoryHref, starLine, nameOf, productHref } from "../app/parts.ts";
import { concerns } from "../app/store.ts";
import { notFound } from "./not-found.ts";
import { setHead } from "../app/head.ts";
import { SITE } from "../app/site.ts";
import { categoryHead } from "@lib/seo-model.ts";

const BUDGETS: [number | null, string][] = [[null, "すべて"], [5000, "〜5千円"], [10000, "〜1万円"], [20000, "〜2万円"]];

/**
 * カテゴリ：何が気になる？ 押すと「残念が少ない順」に並びが動く（順位ではない）。
 * ふれた声が少ない商品は別の段、読んでいない商品も名前を出す、予算の外は薄くする（設計原則2・10・14）。
 */
export function categoryPage(app: HTMLElement, id: string, url: URL): Page | void {
  const g = genre(id);
  if (!g) return notFound(app);
  setHead(categoryHead(g, { ...g.coverage, readEnough: g.readEnough, offerable: g.offerable }, g.word, SITE));

  const fromUrl = url.searchParams.get("k");
  const mine = concerns.get(g.id).find((k) => g.offerable.includes(k));
  let key = fromUrl && g.offerable.includes(fromUrl) ? fromUrl : mine ?? g.defaultKey;
  let max: number | null = Number(url.searchParams.get("max")) || null;
  const blockedAsked = fromUrl && g.order.includes(fromUrl) && !g.offerable.includes(fromUrl) ? fromUrl : null;

  const chips = h("div", { class: "chips", role: "radiogroup", "aria-label": "何が気になる？" });
  const budget = h("div", { class: "chips chips--s", role: "radiogroup", "aria-label": "予算" });
  const caption = h("p", { class: "listcap", "aria-live": "polite" });
  const list = h("div", { class: "clist" });

  const setUrl = () => {
    const q = new URLSearchParams();
    q.set("k", key);
    if (max) q.set("max", String(max));
    history.replaceState(history.state, "", `${location.pathname}?${q}`);
  };

  const paintChips = () => {
    chips.replaceChildren(...g.offerable.map((k) => h("button", {
      type: "button", role: "radio", "aria-checked": String(k === key), class: "chip",
      onclick: () => { if (k !== key) { key = k; setUrl(); paint(true); } },
    }, concerns.has(g.id, k) ? icon("pin", 13, 2.2) : null, g.word(k))));
    budget.replaceChildren(...BUDGETS.map(([v, t]) => h("button", {
      type: "button", role: "radio", "aria-checked": String(v === max), class: "chip chip--s",
      onclick: () => { if (v !== max) { max = v; setUrl(); paint(false); } },
    }, t)));
  };

  const paint = (animate: boolean) => {
    const before = animate ? rects(list) : null;
    paintChips();
    const word = g.word(key);
    const { ranked, quiet } = fewestBad(g.analysed, key);
    const out = (price: number) => max !== null && price > max;
    caption.replaceChildren(h("b", null, `「${word}」の残念が少ない順`), "（順位ではありません）", max ? `・${yen(max)}より高い商品は薄く表示` : "");
    const card = (pid: string, pos: number, neg: number, read: number) => {
      const p = g.byId.get(pid)!;
      return h("li", { "data-id": pid }, productRow(p, h("span", { class: "cside" },
        h("span", { class: "cside__word" }, word),
        h("span", { class: "cside__pair" },
          h("span", { class: "cside__s" }, h("span", { class: "cside__l cside__l--good" }, "よかった ", h("b", null, pos)), bar(pos, read, "good")),
          h("span", { class: "cside__s" }, h("span", { class: "cside__l cside__l--bad" }, "残念 ", h("b", null, neg)), bar(neg, read, "bad"))),
        h("span", { class: "cside__read" }, `${read}件中`, evidenceOf(read) === "thin" ? h("span", { class: "tag tag--thin" }, "まだ少ない") : null)),
      { href: productHref(pid, key), dim: out(p.price) }));
    };
    const unread = g.joined.filter((p) => !p.aspects || !p.reviewsRead);
    fill(list,
      h("ol", { class: "clist__ol" }, ranked.map((r) => card(r.id, r.positive, r.negative, r.read))),
      quiet.length ? h("section", { class: "clist__sub" },
        h("h2", null, `「${word}」にふれた声が少ない商品（${TALKED_MIN}件未満）`),
        h("p", { class: "fine" }, "少ないことは、残念が少ないことではありません。並べずに分けています。"),
        h("ul", { class: "clist__ol" }, quiet.map((qid) => {
          const p = g.byId.get(qid)!;
          const t = p.aspects?.find((x) => x.key === key);
          return card(qid, t?.positive ?? 0, t?.negative ?? 0, p.reviewsRead ?? 0);
        }))) : null,
      h("details", { class: "clist__sub clist__unread" },
        h("summary", null, `まだ読んでいない ${unread.length}商品`),
        h("p", { class: "fine" }, "読めていないことは、悪いことではありません。名前と★だけ出しています。"),
        h("ul", { class: "names" }, unread.map((p) => h("li", { class: max !== null && p.price > max ? "is-dim" : "" }, h("a", { href: productHref(p.productId) }, nameOf(p)), " ", h("span", { class: "num" }, yen(p.price)), " ", starLine(p))))),
    );
    if (before) play(list, before);
  };

  const blocked = g.axes.filter((a) => !a.offerable);
  app.append(h("article", { class: "cat" },
    h("header", { class: "cat__head" },
      h("h1", null, g.label),
      h("p", { class: "cat__cov" }, `${g.coverage.total}商品のうち${g.coverage.analysed}商品、レビュー${g.coverage.reviewsRead.toLocaleString("ja-JP")}件を読みました`, h("span", { class: "fine" }, "（AI がレビューを分類し、コードが数えた件数）"))),
    blockedAsked ? h("p", { class: "note" }, `「${g.word(blockedAsked)}」はどの商品も似た評判で、並べても差が出ません。ほかのことで並べています。`) : null,
    h("section", { class: "cat__ask" },
      h("h2", null, "何が気になる？"),
      chips,
      blocked.length ? h("details", { class: "why" }, h("summary", null, "並べても差が出ないこと"), h("ul", null, blocked.map((a) => h("li", null, h("b", null, g.word(a.key)), `：${a.blockedBecause}`)))) : null,
      h("div", { class: "cat__budget" }, h("span", { class: "cat__budget-l" }, "予算"), budget)),
    caption,
    list));
  paint(false);
  if (fromUrl !== key) setUrl();
  return { update: () => true };
}

function rects(root: HTMLElement) {
  const map = new Map<string, DOMRect>();
  root.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => map.set(el.dataset.id!, el.getBoundingClientRect()));
  return map;
}
/** 並びが動くところを目で追えるように（FLIP）。動きを減らす設定では動かさない。 */
function play(root: HTMLElement, before: Map<string, DOMRect>) {
  if (reduceMotion()) return;
  root.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => {
    const old = before.get(el.dataset.id!);
    if (!old) return;
    const now = el.getBoundingClientRect();
    const dy = old.top - now.top;
    if (!dy) return;
    el.animate([{ transform: `translateY(${dy}px)` }, { transform: "translateY(0)" }], { duration: 420, easing: "cubic-bezier(.3,.8,.3,1)" });
  });
}

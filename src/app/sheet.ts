import { h, icon, reduceMotion, yen, fill } from "./dom.ts";
import type { JoinedProduct } from "@lib/types.ts";
import { switchTargets, READ_ENOUGH } from "@lib/nakami-model.ts";
import { asAspect } from "./data.ts";
import type { Genre } from "./data.ts";
import { bar, productImage, nameOf, productHref, categoryHref, starLine, sectionTitle, sideWord } from "./parts.ts";
import type { Quote } from "@lib/aspect-model.ts";
import { concerns, once } from "./store.ts";

/**
 * 1つの心配を確かめる板。商品ページの上に下から出る（PC では右から）。
 * 開いているあいだ URL に ?k= が付くので、戻るボタンで閉じ、その URL を人に送れる（docs/12 第4節）。
 */
export function createSheet(requestClose: () => void) {
  const backdrop = h("div", { class: "sheet-bg", onclick: () => requestClose() });
  const body = h("div", { class: "sheet__body" });
  const grab = h("div", { class: "sheet__grab", "aria-hidden": "true" }, h("span"));
  const panel = h("div", { class: "sheet", role: "dialog", "aria-modal": "true", "aria-labelledby": "sheet-title", tabindex: "-1" }, grab, body);
  let openKey: string | null = null;
  let opener: HTMLElement | null = null;

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); requestClose(); }
    if (e.key === "Tab") trapFocus(e, panel);
  };

  // 下に引いて閉じる
  let startY = 0, dy = 0, dragging = false;
  const down = (e: PointerEvent) => { dragging = true; startY = e.clientY; dy = 0; panel.style.transition = "none"; grab.setPointerCapture(e.pointerId); };
  const move = (e: PointerEvent) => { if (!dragging) return; dy = Math.max(0, e.clientY - startY); panel.style.transform = `translateY(${dy}px)`; };
  const up = () => {
    if (!dragging) return;
    dragging = false;
    panel.style.transition = "";
    panel.style.transform = "";
    if (dy > 90) requestClose();
  };
  grab.addEventListener("pointerdown", down);
  grab.addEventListener("pointermove", move);
  grab.addEventListener("pointerup", up);
  grab.addEventListener("pointercancel", up);

  function show(p: JoinedProduct, g: Genre, key: string, from?: HTMLElement | null) {
    const first = !openKey;
    openKey = key;
    if (from) opener = from;
    fill(body, ...content(p, g, key, requestClose));
    if (first) {
      document.body.append(backdrop, panel);
      document.body.classList.add("has-sheet");
      setInert(true);
      document.addEventListener("keydown", onKey);
      requestAnimationFrame(() => { backdrop.classList.add("is-open"); panel.classList.add("is-open"); });
      panel.focus({ preventScroll: true });
    } else {
      panel.scrollTop = 0;
    }
  }

  function hide() {
    if (!openKey) return;
    openKey = null;
    document.removeEventListener("keydown", onKey);
    document.body.classList.remove("has-sheet");
    setInert(false);
    backdrop.classList.remove("is-open");
    panel.classList.remove("is-open");
    const done = () => { backdrop.remove(); panel.remove(); };
    if (reduceMotion()) done(); else setTimeout(done, 260);
    opener?.focus({ preventScroll: true });
    opener = null;
  }

  return { show, hide, key: () => openKey };
}

function content(p: JoinedProduct, g: Genre, key: string, close: () => void) {
  const ap = asAspect(p);
  const word = g.word(key);
  const tally = p.aspects?.find((t) => t.key === key);
  const pos = tally?.positive ?? 0, neg = tally?.negative ?? 0, read = p.reviewsRead ?? 0;

  const pin = h("button", { type: "button", class: "pinbtn", "aria-pressed": String(concerns.has(g.id, key)), title: "気になることに入れると、ほかの商品でも先に出ます" });
  const paintPin = () => {
    const on = concerns.has(g.id, key);
    pin.setAttribute("aria-pressed", String(on));
    pin.replaceChildren(icon("pin", 16, 2.1), on ? "気にしている" : "気になる");
  };
  paintPin();
  pin.addEventListener("click", () => {
    const on = concerns.toggle(g.id, key);
    paintPin();
    if (on && !once.seen("pin")) { once.mark("pin"); toast(`ほかの商品でも「${word}」を先に見せます`); }
  });

  const head = h("header", { class: "sheet__head" },
    h("div", null, h("h2", { id: "sheet-title" }, word), h("p", { class: "sheet__sub" }, nameOf(p), read ? `・${read}件中` : "")),
    h("div", { class: "sheet__acts" }, pin, h("button", { type: "button", class: "iconbtn", "aria-label": "閉じる", onclick: () => close() }, icon("close", 20))));

  if (!ap) return [head, h("p", { class: "note" }, "この商品のレビューは、まだ読んでいません。")];

  const counts = pos + neg
    ? h("div", { class: "big2" },
      (["good", "bad"] as const).map((side) => h("div", { class: `big2__c big2__c--${side}` },
        h("span", { class: "big2__l" }, h("span", { class: `dot dot--${side}` }), side === "good" ? "よかった" : "残念だった"),
        h("span", { class: "big2__n" }, side === "good" ? pos : neg, h("small", null, `件 ／${read}件中`)),
        bar(side === "good" ? pos : neg, read, side))))
    : h("p", { class: "note" }, `この商品のレビュー${read}件では、「${word}」にふれた声はありませんでした。`);

  // 引用に向き（数えた側）があれば、よかった・残念だった に分けて出す。無い（前の抽出の）データは、向きを推測せずにまとめて出す
  const quoteList = (list: Quote[]) => h("ul", { class: "quotes" }, list.map((q) => h("li", null, h("q", null, q.text), " ", h("a", { href: q.reviewUrl, target: "_blank", rel: "noopener", class: "src" }, "出典"))));
  const sided = tally?.quotes.some((q) => q.polarity);
  const quotes = !tally?.quotes.length
    ? null
    : sided
      ? h("section", { class: "sheet__sec" },
        sectionTitle("買った人のひとこと", "原文から"),
        (["good", "bad"] as const).map((side) => {
          const list = tally.quotes.filter((q) => q.polarity === (side === "good" ? "positive" : "negative"));
          return list.length ? h("div", { class: "qside" }, h("p", { class: "qside__l" }, h("span", { class: `dot dot--${side}` }), sideWord(side)), quoteList(list)) : null;
        }))
      : h("section", { class: "sheet__sec" },
        sectionTitle("買った人のひとこと", "原文から・よかった／残念どちらも"),
        quoteList(tally.quotes));

  const result = switchTargets({ ...ap, price: p.price }, g.pool, key);
  const deep = g.pool.filter((x) => x.reviewsRead >= READ_ENOUGH).length;
  let sw: HTMLElement;
  if (result.status === "found") {
    sw = h("section", { class: "sheet__sec" },
      sectionTitle(`「${word}」の残念が、もっと少ない`, `同じくらいの値段（${yen(result.band[0])}〜${yen(result.band[1])}）`),
      h("div", { class: "swipe" }, result.targets.map((t) => {
        const q = g.byId.get(t.id)!;
        return h("div", { class: "alt" },
          h("a", { class: "alt__main", href: productHref(t.id, key) },
            productImage(q, 64),
            h("span", { class: "alt__name" }, nameOf(q)),
            h("span", { class: "alt__meta" }, h("span", { class: "num" }, yen(q.price)), " ", starLine(q)),
            h("span", { class: "alt__pair" },
              h("span", { class: "alt__side" }, h("span", { class: "alt__l alt__l--good" }, "よかった ", h("b", null, t.positive)), bar(t.positive, t.read, "good")),
              h("span", { class: "alt__side" }, h("span", { class: "alt__l alt__l--bad" }, "残念 ", h("b", null, t.negative)), bar(t.negative, t.read, "bad"))),
            h("span", { class: "alt__read" }, `${t.read}件中`)),
          h("a", { class: "btn btn--line btn--s", href: `/vs/${p.productId}/${t.id}?k=${key}` }, icon("pair", 15), "くらべる"));
      })),
      h("p", { class: "fine" }, `くわしく読めた${deep}商品から。残念が3分の1以上少ないものだけ`));
  } else {
    const why = result.status === "none"
      ? `同じくらいの値段（${yen(result.band[0])}〜${yen(result.band[1])}）で、「${word}」の残念がはっきり少ない商品は見つかりませんでした（くわしく読めた${deep}商品の中で）。`
      : result.status === "thin"
        ? `この商品は読めたレビューが${read}件と少ないので、乗り換え先は出していません。`
        : `「${word}」にふれた声が少ないので、乗り換え先は出していません。`;
    sw = h("section", { class: "sheet__sec" }, sectionTitle(`「${word}」の残念が、もっと少ない`), h("p", { class: "note" }, why));
  }

  const toCategory = g.offerable.includes(key)
    ? h("a", { class: "more", href: categoryHref(g, key) }, `${g.label}を「${word}」で並べて見る`, icon("arrow", 16))
    : h("p", { class: "fine" }, `「${word}」で並べる画面はありません（${g.axes.find((a) => a.key === key)?.blockedBecause ?? "並べても差が出ません"}）。`);

  return [head, counts, quotes, sw, toCategory];
}

/** 板が開いているあいだ、後ろの画面はキーボードと読み上げから外す。 */
function setInert(on: boolean) {
  document.querySelectorAll(".top, #main, .foot, .tray, .skip").forEach((el) => el.toggleAttribute("inert", on));
}

function trapFocus(e: KeyboardEvent, root: HTMLElement) {
  const items = [...root.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])")];
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && (document.activeElement === first || document.activeElement === root)) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

let toastTimer = 0;
export function toast(text: string) {
  let el = document.querySelector<HTMLElement>(".toast");
  if (!el) {
    el = h("div", { class: "toast", role: "status", "aria-live": "polite" });
    document.body.append(el);
  }
  el.textContent = text;
  el.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el!.classList.remove("is-on"), 3200);
}

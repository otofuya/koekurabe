import { h } from "../app/dom.ts";

export function notFound(app: HTMLElement) {
  document.title = "見つかりません｜★の中身";
  app.append(h("article", { class: "nf" }, h("h1", null, "ページが見つかりません"), h("p", null, h("a", { href: "/" }, "ホームへ戻る"))));
}

import { h } from "../app/dom.ts";
import { setHead } from "../app/head.ts";
import { SITE } from "../app/site.ts";
import { notFoundHead } from "@lib/seo-model.ts";

export function notFound(app: HTMLElement) {
  setHead(notFoundHead(SITE, location.pathname));
  app.append(h("article", { class: "nf" }, h("h1", null, "ページが見つかりません"), h("p", null, h("a", { href: "/" }, "ホームへ戻る"))));
}

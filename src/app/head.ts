import type { Head } from "@lib/seo-model.ts";
import { absoluteUrl, breadcrumbLd, robotsValue } from "@lib/seo-model.ts";
import { SITE } from "./site.ts";

/**
 * ページの頭（題・説明・正規の URL・検索に出すか・シェア用）を書きかえる。
 * 画面を移るたびに呼ぶ。先に書き出した HTML にも、同じものが入る（scripts/prerender.mjs）。
 */
export function setHead(head: Head) {
  document.title = head.title;
  const image = absoluteUrl(SITE, head.image ?? "/og/site.png");
  meta("name", "description", head.description);
  meta("name", "robots", robotsValue(head, SITE));
  link("canonical", absoluteUrl(SITE, head.path));
  meta("property", "og:site_name", SITE.name);
  meta("property", "og:type", head.path === "/" ? "website" : "article");
  meta("property", "og:title", head.title);
  meta("property", "og:description", head.description);
  meta("property", "og:url", absoluteUrl(SITE, head.path));
  meta("property", "og:image", image);
  meta("property", "og:locale", "ja_JP");
  meta("name", "twitter:card", "summary_large_image");
  const ld = breadcrumbLd(head, SITE);
  let script = document.head.querySelector<HTMLScriptElement>("script[data-head='ld']");
  if (!ld) { script?.remove(); return; }
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.head = "ld";
    document.head.append(script);
  }
  script.textContent = JSON.stringify(ld);
}

function meta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.append(el);
  }
  el.content = content;
}

function link(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.append(el);
  }
  el.href = href;
}

import { reduceMotion } from "./dom.ts";

/**
 * 小さな道具としての画面遷移。履歴 API で書き換えるので、戻るボタンがそのまま効く。
 * 同じページの中で ?k= だけが変わったとき（板を開く・閉じる）は、ページの update に任せて描き直さない。
 */
export type Page = { update?: (url: URL) => boolean; leave?: () => void };
type Render = (app: HTMLElement, match: RegExpMatchArray, url: URL) => Page | void;

const routes: { re: RegExp; render: Render }[] = [];
let app: HTMLElement;
let current: { path: string; page: Page | void } | null = null;

export function route(re: RegExp, render: Render) {
  routes.push({ re, render });
}

export function start(root: HTMLElement, notFound: Render) {
  app = root;
  routes.push({ re: /^.*$/, render: notFound });
  history.scrollRestoration = "manual";
  document.addEventListener("click", onClick);
  window.addEventListener("popstate", () => show(new URL(location.href), "pop"));
  show(new URL(location.href), "initial");
}

export function navigate(href: string, { replace = false, state = {} as Record<string, unknown> } = {}) {
  const url = new URL(href, location.href);
  if (url.origin !== location.origin) {
    location.href = url.href;
    return;
  }
  history.replaceState({ ...(history.state ?? {}), scroll: window.scrollY }, "");
  history[replace ? "replaceState" : "pushState"](state, "", url.pathname + url.search + url.hash);
  show(url, replace ? "replace" : "push");
}

function show(url: URL, how: "initial" | "push" | "replace" | "pop") {
  if (current && current.path === url.pathname && current.page?.update?.(url)) return;
  const draw = () => {
    current?.page?.leave?.();
    const found = routes.find((r) => r.re.test(url.pathname))!;
    app.replaceChildren();
    const page = found.render(app, url.pathname.match(found.re)!, url);
    current = { path: url.pathname, page };
    const saved = how === "pop" ? Number(history.state?.scroll ?? 0) : 0;
    window.scrollTo(0, saved);
    window.dispatchEvent(new CustomEvent("routechange"));
  };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (how !== "initial" && doc.startViewTransition && !reduceMotion()) doc.startViewTransition(draw);
  else draw();
}

function onClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const a = (event.target as Element).closest?.("a");
  if (!a || a.target || a.hasAttribute("download") || a.dataset.native !== undefined) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  event.preventDefault();
  navigate(url.href);
}

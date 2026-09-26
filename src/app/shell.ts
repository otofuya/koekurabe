import { h, icon } from "./dom.ts";
import { searchProducts } from "@lib/home-model.ts";
import { parseQuery } from "@lib/nakami-model.ts";
import type { JoinedProduct } from "@lib/types.ts";
import { navigate } from "./router.ts";
import { categoryIds, findProduct, genre } from "./data.ts";
import { productRow, evidenceTag, productHref, productImage, nameOf } from "./parts.ts";
import { tray, recent, onStoreChange } from "./store.ts";
import { hasAds } from "./site.ts";

const allProducts = () => categoryIds().flatMap((id) => genre(id)!.joined);
const mostRead = () => [...allProducts()].filter((p) => p.reviewsRead).sort((a, b) => (b.reviewsRead ?? 0) - (a.reviewsRead ?? 0));

/** 上の帯。ロゴと「さがす」。名前はまだ決めていない（仮）。 */
export function topBar() {
  return h("header", { class: "top" },
    h("a", { class: "logo", href: "/", "aria-label": "ホーム" }, h("span", { class: "logo__mark", "aria-hidden": "true" }, "★"), "の中身", h("small", null, "（仮）")),
    h("button", { type: "button", class: "top__search", onclick: () => openSearch() }, icon("search", 18), h("span", null, "さがす")));
}

/**
 * さがす：商品名、または楽天の商品ページの URL。
 * 読めていない商品も出す（設計原則2）。読めた量を横に書く。
 */
export function searchBox({ autofocus = false, onGo }: { autofocus?: boolean; onGo?: () => void } = {}) {
  const input = h("input", { type: "search", class: "sbox__input", placeholder: "商品名か、楽天の商品URL", "aria-label": "商品をさがす", autocomplete: "off", enterkeyhint: "search" });
  const list = h("div", { class: "sbox__list", role: "region", "aria-live": "polite" });
  const go = (href: string) => { onGo?.(); navigate(href); };
  const row = (p: JoinedProduct) => h("li", null, productRow(p, evidenceTag(p), { size: 48 }));
  let first: string | null = null;
  const paint = () => {
    const parsed = parseQuery(input.value);
    first = null;
    if (parsed.kind === "empty") {
      const seen = recent.get().map((id) => findProduct(id)?.product).filter((p): p is JoinedProduct => !!p);
      const pick = seen.length ? seen : mostRead().slice(0, 5);
      list.replaceChildren(h("p", { class: "sbox__cap" }, seen.length ? "最近見た商品" : "よく読めている商品"), h("ul", { class: "sbox__ul" }, pick.slice(0, 6).map(row)));
      return;
    }
    if (parsed.kind === "product") {
      const found = findProduct(parsed.id);
      if (found) { first = productHref(parsed.id); list.replaceChildren(h("p", { class: "sbox__cap" }, "この商品を開きます"), h("ul", { class: "sbox__ul" }, row(found.product))); }
      else list.replaceChildren(h("p", { class: "note" }, "この商品は、まだ扱っていません（今はワイヤレスイヤホンだけです）。"));
      return;
    }
    if (parsed.kind === "other-url") {
      list.replaceChildren(h("p", { class: "note" }, "お店の商品ページの URL には、まだ対応していません。商品名で探すか、楽天の「商品価格ナビ」のページの URL を貼ってください。"));
      return;
    }
    const found = searchProducts(allProducts(), parsed.q, 12);
    // 読めている商品を先に（同じ読めた量なら元の順）
    found.sort((a, b) => (b.reviewsRead ?? 0) - (a.reviewsRead ?? 0));
    if (found.length) first = productHref(found[0].productId);
    list.replaceChildren(found.length
      ? h("ul", { class: "sbox__ul" }, found.map(row))
      : h("p", { class: "note" }, `「${parsed.q}」に合う商品は見つかりませんでした。今はワイヤレスイヤホンだけです。`));
  };
  input.addEventListener("input", paint);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter" && first) { e.preventDefault(); go(first); } });
  list.addEventListener("click", (e) => { if ((e.target as Element).closest("a")) onGo?.(); });
  paint();
  if (autofocus) requestAnimationFrame(() => input.focus());
  return h("div", { class: "sbox" }, h("label", { class: "sbox__field" }, icon("search", 20), input), list);
}

let searchOpen: HTMLElement | null = null;
export function openSearch() {
  if (searchOpen) return;
  const close = () => { searchOpen?.remove(); searchOpen = null; document.body.classList.remove("has-sheet"); document.removeEventListener("keydown", esc); };
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
  searchOpen = h("div", { class: "search-layer", role: "dialog", "aria-modal": "true", "aria-label": "さがす" },
    h("div", { class: "search-layer__in" },
      h("div", { class: "search-layer__head" }, h("b", null, "さがす"), h("button", { type: "button", class: "iconbtn", "aria-label": "閉じる", onclick: close }, icon("close", 20))),
      searchBox({ autofocus: true, onGo: close })));
  searchOpen.addEventListener("click", (e) => { if (e.target === searchOpen) close(); });
  document.addEventListener("keydown", esc);
  document.body.classList.add("has-sheet");
  document.body.append(searchOpen);
}

/** くらべるに入れた商品（2つまで）。画面の下に浮く。 */
export function mountTray() {
  const el = h("div", { class: "tray", role: "region", "aria-label": "くらべる" });
  document.body.append(el);
  const paint = () => {
    const ids = tray.get().filter((id) => findProduct(id));
    const onVs = location.pathname.startsWith("/vs/");
    el.classList.toggle("is-on", ids.length > 0 && !onVs);
    if (!ids.length) { el.replaceChildren(); return; }
    const imgs = h("span", { class: "tray__imgs" }, ids.map((id) => productImage(findProduct(id)!.product, 40)));
    const clear = h("button", { type: "button", class: "tray__x", "aria-label": "くらべるを空にする", onclick: () => tray.clear() }, icon("close", 16));
    el.replaceChildren(ids.length === 2
      ? h("a", { class: "tray__go", href: `/vs/${ids[0]}/${ids[1]}` }, imgs, h("span", null, "2つをくらべる"), icon("arrow", 18))
      : h("span", { class: "tray__go tray__go--wait" }, imgs, h("span", null, h("b", null, nameOf(findProduct(ids[0])!.product)), h("small", null, "もう1つ選ぶと、くらべられます"))),
    clear);
  };
  onStoreChange((key) => { if (key === "tray") paint(); });
  window.addEventListener("routechange", paint);
  paint();
}

/** このサイトの数え方。どの画面の下にも。 */
export function footer() {
  const g = genre("earbuds");
  return h("footer", { class: "foot" },
    h("h2", null, "このサイトの数え方"),
    h("ul", null,
      h("li", null, "★・レビュー数・値段は、楽天の値をそのまま出しています。"),
      h("li", null, "「よかった」「残念だった」は、AI がレビューを1件ずつ分類し、コードが数えた件数です。分母はいつも、読んだレビューの件数です。"),
      h("li", null, "ひとことは、原文と照合した短い引用です。出典にリンクしています。レビューの本文は載せていません。"),
      g ? h("li", null, `${g.label}：${g.coverage.total}商品のうち${g.coverage.analysed}商品、レビュー${g.coverage.reviewsRead.toLocaleString("ja-JP")}件を読みました。`) : null,
      h("li", null, "「気になる」・最近見た商品・くらべるに入れた商品は、この端末にだけ残ります。")),
    h("p", { class: "foot__links" }, h("a", { href: "/about" }, `このサイトについて（数え方・${hasAds() ? "広告・" : ""}プライバシー・運営者）`)),
    // 楽天ウェブサービスの API で取った商品の情報を使うので、決まりのクレジットを出す（決まりの HTML のまま。変えてはいけない）
    h("p", { class: "foot__fine" }, h("a", { href: "https://developers.rakuten.com/", target: "_blank" }, "Supported by Rakuten Developers")));
}

import "./styles/app.css";
import { route, start } from "./app/router.ts";
import { topBar, mountTray, footer } from "./app/shell.ts";
import { h } from "./app/dom.ts";
import { homePage } from "./pages/home.ts";
import { productPage } from "./pages/product.ts";
import { categoryPage } from "./pages/category.ts";
import { vsPage } from "./pages/vs.ts";
import { notFound } from "./pages/not-found.ts";

const root = document.getElementById("app")!;
const main = h("main", { class: "page", id: "main" });
root.replaceChildren(h("a", { class: "skip", href: "#main", "data-native": "" }, "本文へ"), topBar(), main, footer());

const ID = "([a-f0-9]{32})";
route(/^\/?$/, (app) => homePage(app));
route(new RegExp(`^/reviews/${ID}/?$`), (app, m, url) => productPage(app, m[1], url));
route(new RegExp(`^/vs/${ID}/${ID}/?$`), (app, m, url) => vsPage(app, m[1], m[2], url));
route(/^\/compare\/([a-z0-9-]+)\/?$/, (app, m, url) => categoryPage(app, m[1], url));
// 前の観点ランキングの URL は、カテゴリの「何が気になる？」へつなぐ
route(/^\/aspect\/([a-z0-9-]+)\/([a-z0-9-]+)\/?$/, (app, m) => {
  history.replaceState({}, "", `/compare/${m[1]}?k=${m[2]}`);
  return categoryPage(app, m[1], new URL(location.href));
});
start(main, (app) => notFound(app));
mountTray();

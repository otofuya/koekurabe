// 検索とシェアのために、各ページの HTML を先に書き出す。`vite build` のあとに走る（npm run build）。
//
// 実際のブラウザ（Playwright）でアプリを描き、#app の中身と頭（題・説明・検索に出すか・シェア用）を、
// ビルドした index.html に差し込む。JS が動くと、アプリは同じ中身を描き直す（書き出した HTML は置き換わる）。
//
// あわせて書き出すもの：sitemap.xml（検索に出すページだけ）・robots.txt・シェア用の画像（/og/）・
// 置き場（Cloudflare Pages）の _redirects と _headers。
//
// 公開の設定は .env.local の VITE_SITE_PUBLIC / VITE_SITE_URL（docs/13）。公開前は、どのページも noindex。

import { preview, loadEnv } from "vite";
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sitemapXml, robotsTxt, SITE_TAGLINE } from "../lib/seo-model.ts";
import { nakami, displayName } from "../lib/nakami-model.ts";
import { aspectsFor, wordOf } from "../lib/category-definitions.ts";
import { productOgHtml, siteOgHtml } from "./og-image.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const OUT = join(ROOT, ".cache", "prerender");
const SITE_NAME = "★の中身"; // src/app/site.ts と同じ（名前が決まったら両方を直す）
const SHELL_DIR = "app-shell"; // /vs/* のように書き出さないページの受け皿

const env = loadEnv("production", ROOT, "VITE_");
const site = {
  name: SITE_NAME,
  url: (env.VITE_SITE_URL || "https://koekurabe.pages.dev").replace(/\/$/, ""),
  public: env.VITE_SITE_PUBLIC === "1",
};

const products = JSON.parse(readFileSync(join(ROOT, "data/genre-products.json"), "utf8"));
const aspects = JSON.parse(readFileSync(join(ROOT, "data/genre-aspects.json"), "utf8"));
const categories = [...new Set(products.products.map((p) => p.categoryId))];
const lastmod = String(aspects.genres[0]?.generatedAt ?? products.generatedAt).slice(0, 10);

const routes = [
  "/",
  "/about",
  ...categories.map((id) => `/compare/${id}`),
  ...products.products.map((p) => `/reviews/${p.productId}`),
];

const template = readFileSync(join(DIST, "index.html"), "utf8");
if (!template.includes('<div id="app"></div>')) throw new Error("dist/index.html が、ビルドしたままの形ではありません（2回目の書き出し？）。先に vite build を。");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const server = await preview({ root: ROOT, logLevel: "warn", preview: { port: 4399, strictPort: false, open: false } });
const base = server.resolvedUrls.local[0].replace(/\/$/, "");
const browser = await chromium.launch();

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", locale: "ja-JP" });
  // この端末に覚えたこと（最近見た・気になる）が、書き出す中身に混ざらないように
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  // 外の画像やフォントは読まない（中身の HTML だけが要る）
  await context.route((url) => !url.href.startsWith(base), (route) => route.abort());

  const results = [];
  const queue = [...routes, "/__not-found__"];
  const workers = Array.from({ length: 4 }, async () => {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (let path = queue.shift(); path; path = queue.shift()) {
      await page.goto(base + path, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => document.querySelector("#main")?.children.length && document.querySelector('link[rel="canonical"]'));
      const got = await page.evaluate(() => ({
        title: document.title,
        head: [...document.head.querySelectorAll('meta[name="description"], meta[name="robots"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], script[data-head]')].map((el) => el.outerHTML),
        app: document.getElementById("app").innerHTML,
        robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "",
        image: document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? "",
      }));
      if (errors.length) throw new Error(`${path}: 画面のエラー ${errors.join(" | ")}`);
      results.push({ path, ...got });
    }
    await page.close();
  });
  await Promise.all(workers);

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const fill = (r) => template
    .replace(/<meta name="robots"[^>]*>\s*/, "")
    .replace(/<meta name="description"[^>]*>\s*/, "")
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(r.title)}</title>\n    ${r.head.join("\n    ")}`)
    .replace('<div id="app"></div>', `<div id="app">${r.app}</div>`);

  results.sort((a, b) => a.path.localeCompare(b.path));
  const indexable = [];
  for (const r of results) {
    // /reviews/<id> → reviews/<id>.html（Cloudflare Pages は末尾の / なしの URL で出す。正規の URL と同じ形）
    const file = r.path === "/__not-found__" ? join(OUT, "404.html") : r.path === "/" ? join(OUT, "index.html") : join(OUT, `${r.path}.html`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, fill(r));
    if (r.robots.startsWith("index")) indexable.push(r.path);
  }

  // 書き出さないページ（くらべる）は、ビルドしたままの index.html で受ける
  writeFileSync(join(OUT, `${SHELL_DIR}.html`), template);

  writeFileSync(join(OUT, "sitemap.xml"), sitemapXml(site, indexable.map((path) => ({ path, lastmod }))));
  writeFileSync(join(OUT, "robots.txt"), robotsTxt(site));
  writeFileSync(join(OUT, "_redirects"), [
    "# 前の観点ランキングは、アプリがカテゴリの「何が気になる？」へつなぐ（src/main.ts）。",
    "# 本番の Cloudflare Pages は、転送先の ? のあとの :key を置きかえない（2026-09-26 に確かめた）ので、301 にしない",
    "/aspect/* /app-shell 200",
    "# くらべるは組み合わせが多いので書き出さない。アプリが描く",
    `/vs/* /${SHELL_DIR} 200`,
    "",
  ].join("\n"));
  writeFileSync(join(OUT, "_headers"), [
    "/assets/*",
    "  Cache-Control: public, max-age=31536000, immutable",
    "/og/*",
    "  Cache-Control: public, max-age=86400",
    `/${SHELL_DIR}`,
    "  X-Robots-Tag: noindex",
    "",
  ].join("\n"));

  // シェア用の画像
  const ogPage = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  mkdirSync(join(OUT, "og"), { recursive: true });
  const shoot = async (html, file) => {
    await ogPage.setContent(html, { waitUntil: "networkidle" });
    await ogPage.evaluate(() => document.fonts.ready);
    await ogPage.screenshot({ path: file, type: "png" });
  };
  await shoot(siteOgHtml({ siteName: site.name, tagline: SITE_TAGLINE + "。", lead: "買った人のレビューを読んで、よかったこと・残念だったことを数えました。" }), join(OUT, "og", "site.png"));
  const byId = new Map(aspects.genres.flatMap((g) => g.products.map((p) => [p.productId, { ...p, categoryId: g.categoryId }])));
  let ogCount = 0;
  for (const r of results) {
    const m = r.image.match(/\/og\/([a-f0-9]{32})\.png$/);
    if (!m) continue;
    const p = products.products.find((x) => x.productId === m[1]);
    const a = byId.get(m[1]);
    const defs = aspectsFor(p.categoryId);
    const words = new Map(defs.map((d) => [d.key, wordOf(d)]));
    const { good, bad } = nakami({ id: p.productId, reviewsRead: a.reviewsRead, aspects: a.aspects }, defs.map((d) => d.key), 3);
    const named = (lines) => lines.map((l) => ({ word: words.get(l.key) ?? l.key, count: l.count }));
    await shoot(productOgHtml({ name: displayName(p.name), star: p.reviewAverage, reviewCount: p.reviewCount, read: a.reviewsRead, good: named(good), bad: named(bad), siteName: site.name }), join(OUT, "og", `${p.productId}.png`));
    ogCount++;
  }
  await ogPage.close();

  cpSync(OUT, DIST, { recursive: true });
  console.log(`書き出し：${results.length}ページ（検索に出す ${site.public ? indexable.length : 0}・公開${site.public ? "する" : "前なので全部 noindex"}）・シェア画像 ${ogCount + 1}枚・${site.url}`);
  if (!existsSync(join(DIST, "404.html"))) throw new Error("404.html がありません");
} finally {
  await browser.close();
  await new Promise((done) => server.httpServer.close(done));
}

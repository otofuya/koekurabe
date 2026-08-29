import { renderComparePage } from "./compare/compare-page.ts";

const path = window.location.pathname;
const match = path.match(/^\/compare\/(\w+)/);
const app = document.getElementById("app")!;

if (match) {
  renderComparePage(app, match[1]);
} else {
  app.innerHTML = `<p>ページが見つかりません。<a href="/compare/earbuds">/compare/earbuds</a> をお試しください。</p>`;
}

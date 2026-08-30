import { renderComparePage } from "./compare/compare-page.ts";
import { renderReviewPage } from "./reviews/review-page.ts";
import { renderAspectPage } from "./aspect/aspect-page.ts";
import { renderHomePage } from "./home/home-page.ts";
import { renderVsPage } from "./vs/vs-page.ts";

const path = window.location.pathname;
const app = document.getElementById("app")!;

const vsMatch = path.match(/^\/vs\/([a-f0-9]{32})\/([a-f0-9]{32})\/?$/);
const compareMatch = path.match(/^\/compare\/([a-z0-9-]+)\/?$/);
const reviewMatch = path.match(/^\/reviews\/([a-f0-9]{32})\/?$/);
const aspectMatch = path.match(/^\/aspect\/([a-z0-9-]+)\/([a-z0-9-]+)\/?$/);

if (path === "/" || path === "") {
  renderHomePage(app);
} else if (vsMatch) {
  renderVsPage(app, vsMatch[1], vsMatch[2]);
} else if (compareMatch) {
  renderComparePage(app, compareMatch[1]);
} else if (reviewMatch) {
  renderReviewPage(app, reviewMatch[1]);
} else if (aspectMatch) {
  renderAspectPage(app, aspectMatch[1], aspectMatch[2]);
} else {
  app.innerHTML = `<p>ページが見つかりません。<a href="/">ホームに戻る</a></p>`;
}

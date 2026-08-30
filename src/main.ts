import { renderComparePage } from "./compare/compare-page.ts";
import { renderReviewPage } from "./reviews/review-page.ts";
import { renderAspectPage } from "./aspect/aspect-page.ts";

const path = window.location.pathname;
const app = document.getElementById("app")!;

const compareMatch = path.match(/^\/compare\/(\w+)/);
const reviewMatch = path.match(/^\/reviews\/([a-f0-9]{32})/);
const aspectMatch = path.match(/^\/aspect\/(\w+)\/(\w+)/);

if (compareMatch) {
  renderComparePage(app, compareMatch[1]);
} else if (reviewMatch) {
  renderReviewPage(app, reviewMatch[1]);
} else if (aspectMatch) {
  renderAspectPage(app, aspectMatch[1], aspectMatch[2]);
} else {
  app.innerHTML = `<p>ページが見つかりません。<a href="/compare/earbuds">/compare/earbuds</a> をお試しください。</p>`;
}

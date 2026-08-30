import { loadProduct } from "@lib/data-loader.ts";
import { coverageOf } from "@lib/aspect-model.ts";
import {
  CATEGORY_DEFINITIONS,
  aspectsFor,
} from "@lib/category-definitions.ts";
import { buildAspectRows, buildSpecRows } from "@lib/vs-model.ts";
import type { VsAspectRow, VsSpecRow } from "@lib/vs-model.ts";
import type { JoinedProduct } from "@lib/types.ts";
import type { AspectTally } from "@lib/aspect-model.ts";
import { renderAiDisclosure } from "../ai-disclosure.ts";
import "../styles/vs.css";

export function renderVsPage(
  container: HTMLElement,
  idA: string,
  idB: string,
) {
  container.innerHTML = "";

  if (idA === idB) {
    container.innerHTML = `<p>同じ商品同士は比較できません。<a href="/reviews/${idA}">商品ページを見る</a></p>`;
    return;
  }

  const loadedA = loadProduct(idA);
  const loadedB = loadProduct(idB);

  if (!loadedA || !loadedB) {
    container.innerHTML = `<p>商品が見つかりません。<a href="/">ホームに戻る</a></p>`;
    return;
  }

  if (loadedA.categoryId !== loadedB.categoryId) {
    container.innerHTML = `<p>異なるジャンルの商品は比較できません。<a href="/">ホームに戻る</a></p>`;
    return;
  }

  const { categoryId } = loadedA;
  const category = CATEGORY_DEFINITIONS[categoryId];
  if (!category) {
    container.innerHTML = `<p>このジャンルの観点定義がありません。<a href="/">ホームに戻る</a></p>`;
    return;
  }

  const productA = loadedA.product;
  const productB = loadedB.product;
  const definitions = aspectsFor(categoryId);
  const coverage = coverageOf(loadedA.totalProducts, loadedA.aspectProducts);

  renderBreadcrumb(container, categoryId, category.label);
  renderHeader(container, productA, productB);
  renderAiDisclosure(container);
  renderAspects(container, definitions, productA, productB);
  renderSpecs(container, productA, productB);
  renderBuyButtons(container, productA, productB);
  renderCoverage(container, coverage);
}

function renderBreadcrumb(
  container: HTMLElement,
  categoryId: string,
  categoryLabel: string,
) {
  const nav = document.createElement("nav");
  nav.className = "vs-breadcrumb";
  const link = document.createElement("a");
  link.href = `/compare/${categoryId}`;
  link.textContent = categoryLabel;
  nav.appendChild(link);
  nav.appendChild(document.createTextNode(" > 2商品比較"));
  container.appendChild(nav);
}

function renderProductCard(product: JoinedProduct): HTMLElement {
  const div = document.createElement("div");
  div.className = "vs-header__product";

  if (product.imageUrl) {
    const img = document.createElement("img");
    img.className = "vs-header__image";
    img.src = product.imageUrl;
    img.alt = product.name;
    img.width = 100;
    img.height = 100;
    div.appendChild(img);
  }

  const info = document.createElement("div");
  info.className = "vs-header__info";

  const brand = document.createElement("p");
  brand.className = "vs-header__brand";
  brand.textContent = product.brand;
  info.appendChild(brand);

  const nameLink = document.createElement("a");
  nameLink.href = `/reviews/${product.productId}`;
  nameLink.className = "vs-header__name";
  nameLink.textContent = product.name;
  const nameH2 = document.createElement("h2");
  nameH2.appendChild(nameLink);
  info.appendChild(nameH2);

  const price = document.createElement("p");
  price.className = "vs-header__price";
  price.textContent = `¥${product.price.toLocaleString()}`;
  info.appendChild(price);

  const reviews = document.createElement("p");
  reviews.className = "vs-header__reviews";
  reviews.textContent = `レビュー ${product.reviewCount}件（平均 ${product.reviewAverage}）`;
  info.appendChild(reviews);

  if (product.reviewsRead !== null) {
    const read = document.createElement("p");
    read.className = "vs-header__read";
    read.textContent = `うち${product.reviewsRead}件を読みました`;
    info.appendChild(read);
  }

  div.appendChild(info);
  return div;
}

function renderHeader(
  container: HTMLElement,
  productA: JoinedProduct,
  productB: JoinedProduct,
) {
  const header = document.createElement("header");
  header.className = "vs-header";

  header.appendChild(renderProductCard(productA));

  const vs = document.createElement("div");
  vs.className = "vs-header__vs";
  vs.textContent = "VS";
  header.appendChild(vs);

  header.appendChild(renderProductCard(productB));
  container.appendChild(header);
}

function renderAspectSide(
  row: VsAspectRow,
  side: "a" | "b",
  product: JoinedProduct,
): HTMLElement {
  const div = document.createElement("div");
  div.className = `vs-row__side vs-row__side--${side}`;

  const data = row[side];

  if (data.status === "unread") {
    const span = document.createElement("span");
    span.className = "vs-row__unread";
    span.textContent = "レビュー未読";
    div.appendChild(span);
    return div;
  }

  if (data.status === "no-mention") {
    const span = document.createElement("span");
    span.className = "vs-row__no-mention";
    span.textContent = "言及なし";
    div.appendChild(span);
    return div;
  }

  const tally = data.tally!;
  const reviewsRead = product.reviewsRead!;

  const barContainer = document.createElement("div");
  barContainer.className = "vs-row__bars";

  const posBar = document.createElement("div");
  posBar.className = "vs-row__bar vs-row__bar--pos";
  const posWidth = reviewsRead > 0 ? (tally.positive / reviewsRead) * 100 : 0;
  posBar.style.width = `${posWidth}%`;
  barContainer.appendChild(posBar);

  const negBar = document.createElement("div");
  negBar.className = "vs-row__bar vs-row__bar--neg";
  const negWidth = reviewsRead > 0 ? (tally.negative / reviewsRead) * 100 : 0;
  negBar.style.width = `${negWidth}%`;
  barContainer.appendChild(negBar);

  div.appendChild(barContainer);

  const counts = document.createElement("span");
  counts.className = "vs-row__counts";
  counts.textContent = `+${tally.positive} / -${tally.negative}（${reviewsRead}件中）`;
  div.appendChild(counts);

  if (tally.quotes.length > 0) {
    const q = tally.quotes[0];
    const link = document.createElement("a");
    link.className = "vs-row__quote";
    link.href = q.reviewUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `「${q.text}」`;
    div.appendChild(link);

    const cite = document.createElement("span");
    cite.className = "vs-row__cite";
    cite.textContent = "出典：楽天レビュー";
    div.appendChild(cite);
  }

  return div;
}

function renderAspects(
  container: HTMLElement,
  definitions: readonly import("@lib/category-definitions.ts").AspectDefinition[],
  productA: JoinedProduct,
  productB: JoinedProduct,
) {
  const section = document.createElement("section");
  section.className = "vs-aspects";

  const title = document.createElement("h2");
  title.className = "vs-aspects__title";
  title.textContent = "観点ごとの比較";
  section.appendChild(title);

  const rows = buildAspectRows(definitions, productA, productB);

  for (const row of rows) {
    const rowEl = document.createElement("div");
    rowEl.className = "vs-row";

    rowEl.appendChild(renderAspectSide(row, "a", productA));

    const label = document.createElement("div");
    label.className = "vs-row__label";
    label.textContent = row.definition.label;
    rowEl.appendChild(label);

    rowEl.appendChild(renderAspectSide(row, "b", productB));
    section.appendChild(rowEl);
  }

  container.appendChild(section);
}

function renderSpecs(
  container: HTMLElement,
  productA: JoinedProduct,
  productB: JoinedProduct,
) {
  const specRows = buildSpecRows(productA, productB);
  if (specRows.length === 0) return;

  const section = document.createElement("section");
  section.className = "vs-specs";

  const title = document.createElement("h2");
  title.className = "vs-specs__title";
  title.textContent = "仕様の比較";
  section.appendChild(title);

  const table = document.createElement("table");
  table.className = "vs-specs__table";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const emptyTh = document.createElement("th");
  headRow.appendChild(emptyTh);

  const thA = document.createElement("th");
  thA.textContent = productA.brand;
  headRow.appendChild(thA);

  const thB = document.createElement("th");
  thB.textContent = productB.brand;
  headRow.appendChild(thB);

  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const row of specRows) {
    const tr = document.createElement("tr");

    const th = document.createElement("th");
    th.textContent = row.label;
    tr.appendChild(th);

    tr.appendChild(renderSpecCell(row.a));
    tr.appendChild(renderSpecCell(row.b));

    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  section.appendChild(table);
  container.appendChild(section);
}

function renderSpecCell(
  spec: { value: string; provenance: string } | null,
): HTMLElement {
  const td = document.createElement("td");
  if (!spec) {
    td.textContent = "掲載なし";
    td.className = "vs-specs__no-data";
    return td;
  }
  td.textContent = spec.value;
  if (spec.provenance === "llm_inferred") {
    const badge = document.createElement("span");
    badge.className = "vs-specs__badge";
    badge.textContent = "推定";
    badge.title = "商品ページの記載から推定した値です";
    td.appendChild(badge);
  }
  return td;
}

function renderBuyButtons(
  container: HTMLElement,
  productA: JoinedProduct,
  productB: JoinedProduct,
) {
  const section = document.createElement("section");
  section.className = "vs-buy";

  for (const p of [productA, productB]) {
    const a = document.createElement("a");
    a.className = "vs-buy__button";
    a.href = p.productUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer sponsored";
    a.textContent = `${p.brand} を楽天で見る`;
    section.appendChild(a);
  }

  container.appendChild(section);
}

function renderCoverage(
  container: HTMLElement,
  coverage: { total: number; analysed: number; reviewsRead: number },
) {
  const p = document.createElement("p");
  p.className = "vs-coverage";
  p.textContent = `${coverage.total}件中${coverage.analysed}件のレビューを読めています（のべ${coverage.reviewsRead}件）`;
  container.appendChild(p);
}

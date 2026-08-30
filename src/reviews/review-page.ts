import { loadProduct } from "@lib/data-loader.ts";
import {
  verdict,
  aspectRanking,
  coverageOf,
  shrunkScore,
} from "@lib/aspect-model.ts";
import {
  CATEGORY_DEFINITIONS,
  aspectsFor,
} from "@lib/category-definitions.ts";
import type { JoinedProduct, Spec } from "@lib/types.ts";
import type { AspectTally, AspectProduct, VerdictLine } from "@lib/aspect-model.ts";
import type { AspectDefinition } from "@lib/category-definitions.ts";
import { renderAiDisclosure } from "../ai-disclosure.ts";
import "../styles/review.css";

export function renderReviewPage(container: HTMLElement, productId: string) {
  const loaded = loadProduct(productId);
  if (!loaded) {
    container.innerHTML = `<p>商品が見つかりません。<a href="/">ホームに戻る</a></p>`;
    return;
  }

  const { product, joined, aspectProducts, totalProducts, categoryId } = loaded;
  const category = CATEGORY_DEFINITIONS[categoryId];
  const definitions = aspectsFor(categoryId);
  const coverage = coverageOf(totalProducts, aspectProducts);

  container.innerHTML = "";
  container.className = "review-page";

  // パンくず
  const nav = document.createElement("nav");
  nav.className = "review-breadcrumb";
  nav.innerHTML = `<a href="/compare/${esc(categoryId)}">${esc(category?.label ?? categoryId)}</a> &gt; 商品の評判`;
  container.appendChild(nav);

  // ヘッダー: 画像 + 商品情報
  const header = document.createElement("header");
  header.className = "review-header";

  const img = document.createElement("img");
  img.className = "review-header__image";
  img.src = product.imageUrl;
  img.alt = product.name;
  header.appendChild(img);

  const info = document.createElement("div");
  info.className = "review-header__info";

  const brand = document.createElement("p");
  brand.className = "review-header__brand";
  brand.textContent = product.brand;
  info.appendChild(brand);

  const name = document.createElement("h1");
  name.className = "review-header__name";
  name.textContent = product.name;
  info.appendChild(name);

  const price = document.createElement("p");
  price.className = "review-header__price";
  price.textContent = `¥${product.price.toLocaleString()}`;
  info.appendChild(price);

  const stars = document.createElement("p");
  stars.className = "review-header__stars";
  stars.textContent = `レビュー ${product.reviewCount}件（平均 ${product.reviewAverage.toFixed(1)}）`;
  info.appendChild(stars);

  header.appendChild(info);
  container.appendChild(header);

  // レビュー未読の場合
  if (!product.aspects || !product.reviewsRead) {
    const noData = document.createElement("p");
    noData.className = "review-no-data";
    noData.textContent = "この商品のレビューはまだ読めていません。";
    container.appendChild(noData);
    renderSpecs(container, product.specs);
    renderBuyButton(container, product);
    return;
  }

  // ── 評判セクション（上部） ──

  const reviewsReadCount = product.reviewsRead;
  const denomNote = document.createElement("p");
  denomNote.className = "review-denom";
  denomNote.textContent = `${product.reviewCount}件のレビューのうち${reviewsReadCount}件を読みました`;
  container.appendChild(denomNote);
  renderAiDisclosure(container);

  // 観点バー
  renderAspectBars(container, product.aspects, reviewsReadCount, definitions);

  // まとめ（verdict）
  const aspectProduct: AspectProduct = {
    id: product.productId,
    reviewsRead: reviewsReadCount,
    aspects: product.aspects,
  };
  const v = verdict(aspectProduct, definitions);
  renderVerdict(container, v);

  // ── 弱い観点からの導線 ──
  if (v.blamed.length > 0) {
    renderCrossLinks(container, v.blamed, product, aspectProducts, joined, definitions);
  }

  // ── 仕様セクション（下部） ──
  renderSpecs(container, product.specs);

  // 購入ボタン
  renderBuyButton(container, product);

  // カバレッジ
  const coverageEl = document.createElement("p");
  coverageEl.className = "review-coverage";
  coverageEl.textContent = `${coverage.total}件中${coverage.analysed}件のレビューを読めています（のべ${coverage.reviewsRead.toLocaleString()}件）`;
  container.appendChild(coverageEl);
}

function renderAspectBars(
  container: HTMLElement,
  aspects: AspectTally[],
  reviewsRead: number,
  definitions: readonly AspectDefinition[],
) {
  const section = document.createElement("section");
  section.className = "aspect-bars";

  const definitionMap = new Map(definitions.map((d) => [d.key, d]));

  const sorted = [...aspects]
    .filter((a) => a.positive + a.negative > 0)
    .sort((a, b) => (b.positive + b.negative) - (a.positive + a.negative));

  for (const tally of sorted) {
    const def = definitionMap.get(tally.key);
    if (!def) continue;

    const row = document.createElement("div");
    row.className = "aspect-bar";

    const label = document.createElement("span");
    label.className = "aspect-bar__label";
    label.textContent = def.label;
    row.appendChild(label);

    const barWrap = document.createElement("div");
    barWrap.className = "aspect-bar__track";

    const total = tally.positive + tally.negative;
    const posWidth = total > 0 ? (tally.positive / reviewsRead) * 100 : 0;
    const negWidth = total > 0 ? (tally.negative / reviewsRead) * 100 : 0;

    const posBar = document.createElement("div");
    posBar.className = "aspect-bar__pos";
    posBar.style.width = `${posWidth}%`;
    barWrap.appendChild(posBar);

    const negBar = document.createElement("div");
    negBar.className = "aspect-bar__neg";
    negBar.style.width = `${negWidth}%`;
    barWrap.appendChild(negBar);

    row.appendChild(barWrap);

    const counts = document.createElement("span");
    counts.className = "aspect-bar__counts";
    counts.innerHTML =
      `<span class="aspect-bar__pos-count">+${tally.positive}</span>` +
      ` <span class="aspect-bar__neg-count">-${tally.negative}</span>` +
      ` <span class="aspect-bar__denom">（${reviewsRead}件中）</span>`;
    row.appendChild(counts);

    // 引用
    if (tally.quotes.length > 0) {
      const quoteEl = document.createElement("div");
      quoteEl.className = "aspect-bar__quotes";
      const seen = new Set<string>();
      let shown = 0;
      for (const q of tally.quotes) {
        if (seen.has(q.text) || shown >= 2) continue;
        seen.add(q.text);
        shown += 1;
        const link = document.createElement("a");
        link.className = "aspect-bar__quote";
        link.href = q.reviewUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = `「${q.text}」`;
        quoteEl.appendChild(link);
        const cite = document.createElement("span");
        cite.className = "aspect-bar__cite";
        cite.textContent = "出典：楽天レビュー";
        quoteEl.appendChild(cite);
      }
      row.appendChild(quoteEl);
    }

    section.appendChild(row);
  }

  container.appendChild(section);
}

function renderVerdict(
  container: HTMLElement,
  v: { praised: VerdictLine[]; blamed: VerdictLine[] },
) {
  if (v.praised.length === 0 && v.blamed.length === 0) return;

  const section = document.createElement("section");
  section.className = "review-verdict";

  const h2 = document.createElement("h2");
  h2.className = "review-verdict__title";
  h2.textContent = "レビューから分かること";
  section.appendChild(h2);

  if (v.praised.length > 0) {
    const ul = document.createElement("ul");
    ul.className = "review-verdict__list review-verdict__list--praised";
    for (const line of v.praised) {
      const li = document.createElement("li");
      li.innerHTML =
        `<strong>${esc(line.label)}</strong>に` +
        `<span class="review-verdict__pos">${line.positive}件が満足</span>` +
        (line.negative > 0 ? `、<span class="review-verdict__neg">${line.negative}件が不満</span>` : "") +
        `<span class="review-verdict__denom">（${line.total}件中）</span>`;
      ul.appendChild(li);
    }
    section.appendChild(ul);
  }

  if (v.blamed.length > 0) {
    const ul = document.createElement("ul");
    ul.className = "review-verdict__list review-verdict__list--blamed";
    for (const line of v.blamed) {
      const li = document.createElement("li");
      li.innerHTML =
        `<strong>${esc(line.label)}</strong>に` +
        `<span class="review-verdict__neg">${line.negative}件が不満</span>` +
        (line.positive > 0 ? `、<span class="review-verdict__pos">${line.positive}件は満足</span>` : "") +
        `<span class="review-verdict__denom">（${line.total}件中）</span>`;
      ul.appendChild(li);
    }
    section.appendChild(ul);
  }

  container.appendChild(section);
}

function renderCrossLinks(
  container: HTMLElement,
  blamed: VerdictLine[],
  currentProduct: JoinedProduct,
  aspectProducts: AspectProduct[],
  allProducts: JoinedProduct[],
  definitions: readonly AspectDefinition[],
) {
  const section = document.createElement("section");
  section.className = "review-crosslinks";

  const h2 = document.createElement("h2");
  h2.className = "review-crosslinks__title";
  h2.textContent = "不満が多い観点で探す";
  section.appendChild(h2);

  const productMap = new Map(allProducts.map((p) => [p.productId, p]));
  const currentAspect = new Map(
    (currentProduct.aspects ?? []).map((a) => [a.key, a]),
  );

  for (const line of blamed.slice(0, 3)) {
    const { ranked } = aspectRanking(aspectProducts, line.key);
    const currentScore = (() => {
      const t = currentAspect.get(line.key);
      return t ? shrunkScore(t.positive, t.negative) : -Infinity;
    })();

    const better = ranked
      .filter((r) => r.id !== currentProduct.productId && r.score > currentScore)
      .slice(0, 3);

    if (better.length === 0) continue;

    const group = document.createElement("div");
    group.className = "review-crosslinks__group";

    const aspectLabel = document.createElement("h3");
    aspectLabel.className = "review-crosslinks__aspect";
    aspectLabel.textContent = `${line.label}がより良い商品`;
    group.appendChild(aspectLabel);

    const list = document.createElement("ul");
    list.className = "review-crosslinks__list";

    for (const r of better) {
      const p = productMap.get(r.id);
      if (!p) continue;

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `/reviews/${p.productId}`;
      a.className = "review-crosslinks__link";

      const img = document.createElement("img");
      img.className = "review-crosslinks__image";
      img.src = p.imageUrl;
      img.alt = p.name;
      img.loading = "lazy";
      a.appendChild(img);

      const text = document.createElement("span");
      text.className = "review-crosslinks__text";

      const pName = document.createElement("span");
      pName.className = "review-crosslinks__name";
      pName.textContent = p.name;
      text.appendChild(pName);

      const detail = document.createElement("span");
      detail.className = "review-crosslinks__detail";
      const detailParts = [
        `¥${p.price.toLocaleString()}`,
        `+${r.tally.positive} -${r.tally.negative}`,
      ];
      if (r.tally.negative > r.tally.positive) {
        detail.classList.add("review-crosslinks__detail--honest");
        detailParts.push("こちらも不満が多め");
      }
      detail.textContent = detailParts.join("  ");
      text.appendChild(detail);

      a.appendChild(text);
      li.appendChild(a);

      const vsLink = document.createElement("a");
      vsLink.href = `/vs/${currentProduct.productId}/${p.productId}`;
      vsLink.className = "review-crosslinks__vs-link";
      vsLink.textContent = "2商品を比較";
      li.appendChild(vsLink);

      list.appendChild(li);
    }

    group.appendChild(list);
    section.appendChild(group);
  }

  if (section.querySelectorAll(".review-crosslinks__group").length > 0) {
    container.appendChild(section);
  }
}

function renderSpecs(container: HTMLElement, specs: Spec[]) {
  if (specs.length === 0) return;

  const section = document.createElement("section");
  section.className = "review-specs";

  const h2 = document.createElement("h2");
  h2.className = "review-specs__title";
  h2.textContent = "仕様";
  section.appendChild(h2);

  const table = document.createElement("table");
  table.className = "review-specs__table";

  for (const spec of specs) {
    const tr = document.createElement("tr");

    const th = document.createElement("th");
    th.textContent = spec.label;
    tr.appendChild(th);

    const td = document.createElement("td");
    const valueText = spec.displayValue + (spec.unit && !spec.displayValue.includes(spec.unit) ? spec.unit : "");
    td.textContent = valueText;

    if (spec.provenance === "llm_inferred") {
      const badge = document.createElement("span");
      badge.className = "review-specs__badge";
      badge.textContent = "推定";
      badge.title = "商品ページの記載から推定した値です";
      td.appendChild(badge);
    }

    tr.appendChild(td);
    table.appendChild(tr);
  }

  section.appendChild(table);
  container.appendChild(section);
}

function renderBuyButton(container: HTMLElement, product: JoinedProduct) {
  const section = document.createElement("section");
  section.className = "review-buy";

  const a = document.createElement("a");
  a.href = product.productUrl;
  a.className = "review-buy__button";
  a.textContent = "楽天で見る";
  a.target = "_blank";
  a.rel = "noopener noreferrer sponsored";
  section.appendChild(a);

  container.appendChild(section);
}

function esc(s: string): string {
  const el = document.createElement("span");
  el.textContent = s;
  return el.innerHTML;
}

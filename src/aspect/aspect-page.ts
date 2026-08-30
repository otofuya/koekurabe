import { loadGenre } from "@lib/data-loader.ts";
import {
  aspectRanking,
  offerableAxes,
  coverageOf,
} from "@lib/aspect-model.ts";
import {
  CATEGORY_DEFINITIONS,
  aspectsFor,
} from "@lib/category-definitions.ts";
import type { JoinedProduct } from "@lib/types.ts";
import type { AspectTally, RankedProduct, OfferableAxis } from "@lib/aspect-model.ts";
import { renderAiDisclosure } from "../ai-disclosure.ts";
import "../styles/aspect.css";

export function renderAspectPage(
  container: HTMLElement,
  genre: string,
  aspectKey: string,
) {
  const category = CATEGORY_DEFINITIONS[genre];
  if (!category) {
    container.innerHTML = `<p>ジャンルが見つかりません。<a href="/compare/earbuds">/compare/earbuds</a> をお試しください。</p>`;
    return;
  }

  const { joined, aspectProducts, totalProducts } = loadGenre(genre);
  const definitions = aspectsFor(genre);
  const axes = offerableAxes(aspectProducts, definitions);
  const axis = axes.find((a) => a.key === aspectKey);

  if (!axis) {
    container.innerHTML = `<p>観点が見つかりません。<a href="/compare/${esc(genre)}">${esc(category.label)}</a> に戻る</p>`;
    return;
  }

  if (!axis.offerable) {
    container.innerHTML =
      `<p>「${esc(axis.label)}」のランキングは作成できません：${esc(axis.blockedBecause!)}</p>` +
      `<p><a href="/compare/${esc(genre)}">${esc(category.label)}</a> に戻る</p>`;
    return;
  }

  const { ranked, unspoken } = aspectRanking(aspectProducts, aspectKey);
  const coverage = coverageOf(totalProducts, aspectProducts);
  const productMap = new Map(joined.map((p) => [p.productId, p]));

  container.innerHTML = "";
  container.className = "aspect-page";

  // パンくず
  const nav = document.createElement("nav");
  nav.className = "aspect-breadcrumb";
  nav.innerHTML = `<a href="/compare/${esc(genre)}">${esc(category.label)}</a> &gt; ${esc(axis.label)}ランキング`;
  container.appendChild(nav);

  // ヘッダー
  const header = document.createElement("header");
  header.className = "aspect-header";

  const h1 = document.createElement("h1");
  h1.className = "aspect-header__title";
  h1.textContent = `${axis.label}ランキング`;
  header.appendChild(h1);

  const poles = document.createElement("p");
  poles.className = "aspect-header__poles";
  poles.textContent = `${axis.positivePole} ↔ ${axis.negativePole}`;
  header.appendChild(poles);

  container.appendChild(header);

  // 分母
  const denom = document.createElement("p");
  denom.className = "aspect-denom";
  denom.textContent = `${coverage.analysed}商品中${axis.products}商品が${axis.label}に言及`;
  container.appendChild(denom);
  renderAiDisclosure(container);

  // ランキング
  renderRanking(container, ranked, productMap);

  // 言及なし
  if (unspoken.length > 0) {
    renderUnspoken(container, unspoken, productMap, axis);
  }

  // カバレッジ
  const coverageEl = document.createElement("p");
  coverageEl.className = "aspect-coverage";
  coverageEl.textContent = `${coverage.total}件中${coverage.analysed}件のレビューを読めています（のべ${coverage.reviewsRead.toLocaleString()}件）`;
  container.appendChild(coverageEl);
}

function renderRanking(
  container: HTMLElement,
  ranked: RankedProduct[],
  productMap: Map<string, JoinedProduct>,
) {
  const ol = document.createElement("ol");
  ol.className = "aspect-ranking";

  for (let i = 0; i < ranked.length; i++) {
    const r = ranked[i];
    const product = productMap.get(r.id);
    if (!product) continue;

    const li = document.createElement("li");
    li.className = "aspect-rank-item";

    // 順位
    const rank = document.createElement("span");
    rank.className = "aspect-rank-item__rank";
    rank.textContent = `${i + 1}`;
    li.appendChild(rank);

    // 商品画像
    const img = document.createElement("img");
    img.className = "aspect-rank-item__image";
    img.src = product.imageUrl;
    img.alt = product.name;
    img.loading = "lazy";
    li.appendChild(img);

    // 商品情報
    const info = document.createElement("div");
    info.className = "aspect-rank-item__info";

    const nameLink = document.createElement("a");
    nameLink.className = "aspect-rank-item__name";
    nameLink.href = `/reviews/${product.productId}`;
    nameLink.textContent = product.name;
    info.appendChild(nameLink);

    const meta = document.createElement("span");
    meta.className = "aspect-rank-item__meta";
    meta.textContent = `${product.brand}  ¥${product.price.toLocaleString()}`;
    info.appendChild(meta);

    li.appendChild(info);

    // 評価バー + カウント
    const eval_ = document.createElement("div");
    eval_.className = "aspect-rank-item__eval";

    const track = document.createElement("div");
    track.className = "aspect-rank-item__track";

    const reviewsRead = product.reviewsRead ?? 1;
    const posWidth = (r.tally.positive / reviewsRead) * 100;
    const negWidth = (r.tally.negative / reviewsRead) * 100;

    const posBar = document.createElement("div");
    posBar.className = "aspect-rank-item__pos";
    posBar.style.width = `${posWidth}%`;
    track.appendChild(posBar);

    const negBar = document.createElement("div");
    negBar.className = "aspect-rank-item__neg";
    negBar.style.width = `${negWidth}%`;
    track.appendChild(negBar);

    eval_.appendChild(track);

    const counts = document.createElement("span");
    counts.className = "aspect-rank-item__counts";
    counts.innerHTML =
      `<span class="aspect-rank-item__pos-count">+${r.tally.positive}</span>` +
      ` <span class="aspect-rank-item__neg-count">-${r.tally.negative}</span>` +
      ` <span class="aspect-rank-item__denom">（${reviewsRead}件中）</span>`;
    eval_.appendChild(counts);

    li.appendChild(eval_);

    // 引用（1件）
    if (r.tally.quotes.length > 0) {
      const q = r.tally.quotes[0];
      const link = document.createElement("a");
      link.className = "aspect-rank-item__quote";
      link.href = q.reviewUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = `「${q.text}」`;
      li.appendChild(link);
      const cite = document.createElement("span");
      cite.className = "aspect-rank-item__cite";
      cite.textContent = "出典：楽天レビュー";
      li.appendChild(cite);
    }

    ol.appendChild(li);
  }

  container.appendChild(ol);
}

function renderUnspoken(
  container: HTMLElement,
  unspokenIds: string[],
  productMap: Map<string, JoinedProduct>,
  axis: OfferableAxis,
) {
  const section = document.createElement("section");
  section.className = "aspect-unspoken";

  const details = document.createElement("details");
  details.open = true;

  const summary = document.createElement("summary");
  summary.className = "aspect-unspoken__summary";
  summary.textContent = `${axis.label}に言及がない商品（${unspokenIds.length}件）`;
  details.appendChild(summary);

  const list = document.createElement("ul");
  list.className = "aspect-unspoken__list";

  for (const id of unspokenIds) {
    const product = productMap.get(id);
    if (!product) continue;

    const li = document.createElement("li");
    li.className = "aspect-unspoken__item";

    const a = document.createElement("a");
    a.href = `/reviews/${product.productId}`;
    a.className = "aspect-unspoken__link";

    const img = document.createElement("img");
    img.className = "aspect-unspoken__image";
    img.src = product.imageUrl;
    img.alt = product.name;
    img.loading = "lazy";
    a.appendChild(img);

    const text = document.createElement("span");
    text.className = "aspect-unspoken__text";

    const pName = document.createElement("span");
    pName.className = "aspect-unspoken__name";
    pName.textContent = product.name;
    text.appendChild(pName);

    const meta = document.createElement("span");
    meta.className = "aspect-unspoken__meta";
    meta.textContent = `${product.brand}  ¥${product.price.toLocaleString()}`;
    text.appendChild(meta);

    a.appendChild(text);
    li.appendChild(a);
    list.appendChild(li);
  }

  details.appendChild(list);
  section.appendChild(details);
  container.appendChild(section);
}

function esc(s: string): string {
  const el = document.createElement("span");
  el.textContent = s;
  return el.innerHTML;
}

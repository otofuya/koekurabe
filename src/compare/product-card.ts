import type { QuadrantPoint, OfferableAxis } from "@ref/aspect-model.ts";
import type { JoinedProduct } from "../lib/types.ts";

const CARD_CLASS = "product-card";

export function showProductCard(
  chartContainer: HTMLElement,
  anchor: HTMLElement,
  product: JoinedProduct,
  point: QuadrantPoint,
  xAxis: OfferableAxis,
  yAxis: OfferableAxis,
): void {
  hideProductCard(chartContainer);

  const card = document.createElement("div");
  card.className = CARD_CLASS;

  const denominator = product.reviewsRead ?? product.reviewCount;

  card.innerHTML = `
    <div class="product-card__name">${esc(product.name)}</div>
    <div class="product-card__price">¥${product.price.toLocaleString()}</div>
    <div class="product-card__tally">
      <span class="product-card__aspect-label">${esc(xAxis.label)}</span>
      <span class="product-card__pos">良い${point.xTally.positive}件</span>
      <span class="product-card__neg">不満${point.xTally.negative}件</span>
      <span class="product-card__denom">（${denominator}件中）</span>
    </div>
    <div class="product-card__tally">
      <span class="product-card__aspect-label">${esc(yAxis.label)}</span>
      <span class="product-card__pos">良い${point.yTally.positive}件</span>
      <span class="product-card__neg">不満${point.yTally.negative}件</span>
      <span class="product-card__denom">（${denominator}件中）</span>
    </div>
  `;

  // カードの位置: ボタンの右上に配置、画面外に出たら調整
  const chartRect = chartContainer.getBoundingClientRect();
  const btnRect = anchor.getBoundingClientRect();

  let left = btnRect.right - chartRect.left + 8;
  let top = btnRect.top - chartRect.top - 8;

  chartContainer.appendChild(card);

  const cardRect = card.getBoundingClientRect();
  if (left + cardRect.width > chartRect.width) {
    left = btnRect.left - chartRect.left - cardRect.width - 8;
  }
  if (top + cardRect.height > chartRect.height) {
    top = chartRect.height - cardRect.height - 8;
  }
  if (top < 0) top = 8;

  card.style.left = `${left}px`;
  card.style.top = `${top}px`;
}

export function hideProductCard(chartContainer: HTMLElement): void {
  const existing = chartContainer.querySelector(`.${CARD_CLASS}`);
  if (existing) existing.remove();
}

function esc(s: string): string {
  const el = document.createElement("span");
  el.textContent = s;
  return el.innerHTML;
}

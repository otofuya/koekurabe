import type { QuadrantPoint, OfferableAxis } from "@lib/aspect-model.ts";
import type { JoinedProduct } from "@lib/types.ts";
import { showProductCard, hideProductCard } from "./product-card.ts";

function scoreToPercent(score: number): number {
  return 50 + score * 45;
}

function circleDiameter(weight: number, maxWeight: number): number {
  const MIN = 36;
  const MAX = 80;
  const ratio = Math.sqrt(weight) / Math.sqrt(maxWeight);
  return MIN + ratio * (MAX - MIN);
}

export type ChartState = {
  container: HTMLElement;
  points: QuadrantPoint[];
  productMap: Map<string, JoinedProduct>;
  xAxis: OfferableAxis;
  yAxis: OfferableAxis;
  dimmedIds: Set<string>;
  priceDate?: string;
};

export function renderChart(state: ChartState): void {
  const { container, points, productMap, xAxis, yAxis, dimmedIds, priceDate } = state;
  container.innerHTML = "";
  container.className = "chart";

  const maxWeight = Math.max(...points.map((p) => p.weight), 1);

  // 軸線
  const xLine = document.createElement("div");
  xLine.className = "chart-axis chart-axis--x";
  container.appendChild(xLine);

  const yLine = document.createElement("div");
  yLine.className = "chart-axis chart-axis--y";
  container.appendChild(yLine);

  // 極ラベル
  const poleData: { text: string; className: string }[] = [
    { text: xAxis.positivePole, className: "chart-pole chart-pole--x-pos" },
    { text: xAxis.negativePole, className: "chart-pole chart-pole--x-neg" },
    { text: yAxis.positivePole, className: "chart-pole chart-pole--y-pos" },
    { text: yAxis.negativePole, className: "chart-pole chart-pole--y-neg" },
  ];
  for (const { text, className } of poleData) {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    container.appendChild(span);
  }

  // 商品ボタン
  for (const point of points) {
    const product = productMap.get(point.id);
    if (!product) continue;

    const btn = document.createElement("button");
    btn.className = "chart-product";
    if (dimmedIds.has(point.id)) {
      btn.classList.add("chart-product--dimmed");
    }
    btn.dataset.productId = point.id;

    const left = scoreToPercent(point.x);
    const top = 100 - scoreToPercent(point.y);
    const size = Math.round(circleDiameter(point.weight, maxWeight));

    btn.style.left = `${left}%`;
    btn.style.top = `${top}%`;
    btn.style.width = `${size}px`;
    btn.style.height = `${size}px`;

    const img = document.createElement("img");
    img.className = "chart-product__image";
    img.src = product.imageUrl;
    img.alt = product.name;
    img.loading = "lazy";
    btn.appendChild(img);

    btn.addEventListener("mouseenter", () => {
      showProductCard(container, btn, product, point, xAxis, yAxis, priceDate);
    });
    btn.addEventListener("mouseleave", () => {
      hideProductCard(container);
    });
    btn.addEventListener("focus", () => {
      showProductCard(container, btn, product, point, xAxis, yAxis, priceDate);
    });
    btn.addEventListener("blur", () => {
      hideProductCard(container);
    });
    btn.addEventListener("click", () => {
      window.location.href = `/reviews/${point.id}`;
    });

    container.appendChild(btn);
  }
}

export function updateDimming(
  container: HTMLElement,
  dimmedIds: Set<string>,
): void {
  for (const btn of container.querySelectorAll<HTMLButtonElement>(
    ".chart-product",
  )) {
    const id = btn.dataset.productId ?? "";
    btn.classList.toggle("chart-product--dimmed", dimmedIds.has(id));
  }
}

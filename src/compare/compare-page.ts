import { loadGenre } from "@lib/data-loader.ts";
import {
  offerableAxes,
  axisPairs,
  quadrantPoints,
  coverageOf,
  resolveDefaultAxes,
} from "@lib/aspect-model.ts";
import {
  CATEGORY_DEFINITIONS,
  defaultAxesFor,
} from "@lib/category-definitions.ts";
import { renderChart, updateDimming } from "./chart.ts";
import { renderAxisPicker } from "./axis-picker.ts";
import { renderPriceFilter } from "./price-filter.ts";
import { renderCoveragebar } from "./coverage-bar.ts";
import { renderUnspokenList } from "./unspoken-list.ts";
import type { JoinedProduct } from "@lib/types.ts";
import { renderAiDisclosure } from "../ai-disclosure.ts";
import "../styles/chart.css";

export function renderComparePage(container: HTMLElement, genreId: string) {
  const category = CATEGORY_DEFINITIONS[genreId];
  if (!category) {
    container.innerHTML = `<p>カテゴリ「${genreId}」が見つかりません。</p>`;
    return;
  }

  const { joined, aspectProducts, totalProducts } = loadGenre(genreId);
  const axes = offerableAxes(aspectProducts, category.aspects);
  const pairs = axisPairs(axes, aspectProducts);
  const coverage = coverageOf(totalProducts, aspectProducts);
  const defaults = resolveDefaultAxes(
    aspectProducts,
    category.aspects,
    defaultAxesFor(genreId),
  );

  if (!defaults) {
    container.innerHTML = `<p>「${category.label}」は比較に十分なデータがまだありません。</p>`;
    return;
  }

  const productMap = new Map<string, JoinedProduct>();
  for (const p of joined) productMap.set(p.productId, p);

  const notAnalysed = joined.filter((p) => p.aspects === null);
  const maxPrice = Math.max(...joined.map((p) => p.price));

  // DOM 骨格
  container.innerHTML = "";

  const header = document.createElement("header");
  header.className = "page-header";
  const h1 = document.createElement("h1");
  h1.textContent = category.label;
  header.appendChild(h1);
  const coverageEl = document.createElement("p");
  renderCoveragebar(coverageEl, coverage);
  header.appendChild(coverageEl);
  renderAiDisclosure(header);
  container.appendChild(header);

  const pickerEl = document.createElement("div");
  container.appendChild(pickerEl);

  const filterEl = document.createElement("div");
  container.appendChild(filterEl);

  const chartInfoEl = document.createElement("p");
  chartInfoEl.className = "chart-info";
  container.appendChild(chartInfoEl);

  const chartEl = document.createElement("div");
  container.appendChild(chartEl);

  const unspokenEl = document.createElement("div");
  container.appendChild(unspokenEl);

  // 状態
  let currentX = defaults[0];
  let currentY = defaults[1];
  let currentMaxPrice = maxPrice;

  function getDimmedIds(): Set<string> {
    if (currentMaxPrice >= maxPrice) return new Set();
    return new Set(
      joined.filter((p) => p.price > currentMaxPrice).map((p) => p.productId),
    );
  }

  function renderAll() {
    const xAxis = axes.find((a) => a.key === currentX)!;
    const yAxis = axes.find((a) => a.key === currentY)!;
    const { points, unspoken } = quadrantPoints(
      aspectProducts,
      currentX,
      currentY,
    );

    chartInfoEl.textContent = `${xAxis.label} × ${yAxis.label} で比較（${points.length}商品を配置）`;

    renderChart({
      container: chartEl,
      points,
      productMap,
      xAxis,
      yAxis,
      dimmedIds: getDimmedIds(),
    });

    renderAxisPicker(pickerEl, axes, pairs, currentX, currentY, (newX, newY) => {
      currentX = newX;
      currentY = newY;
      renderAll();
    });

    renderUnspokenList(
      unspokenEl,
      unspoken,
      notAnalysed,
      joined,
      xAxis,
      yAxis,
    );
  }

  renderPriceFilter(filterEl, joined, currentMaxPrice, (newMax) => {
    currentMaxPrice = newMax;
    updateDimming(chartEl, getDimmedIds());
  });

  renderAll();
}

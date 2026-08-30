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
  aspectsFor,
  defaultAxesFor,
} from "@lib/category-definitions.ts";
import { buildListCards } from "@lib/compare-model.ts";
import type { ListSortKey } from "@lib/compare-model.ts";
import { renderChart, updateDimming } from "./chart.ts";
import { renderAxisPicker } from "./axis-picker.ts";
import { renderPriceFilter } from "./price-filter.ts";
import { renderCoveragebar } from "./coverage-bar.ts";
import { renderUnspokenList } from "./unspoken-list.ts";
import { renderViewToggle } from "./view-toggle.ts";
import type { ViewMode } from "./view-toggle.ts";
import {
  initListView,
  renderListGrid,
  updateListDimming,
  updateListSelection,
  computeVisibleCards,
  updateCountText,
  formatPriceDate,
} from "./list-view.ts";
import type { ListViewElements } from "./list-view.ts";
import { renderVsSelectionBar } from "./vs-selection-bar.ts";
import type { JoinedProduct } from "@lib/types.ts";
import { renderAiDisclosure } from "../ai-disclosure.ts";
import "../styles/chart.css";

export function renderComparePage(container: HTMLElement, genreId: string) {
  const category = CATEGORY_DEFINITIONS[genreId];
  if (!category) {
    container.innerHTML = `<p>カテゴリ「${genreId}」が見つかりません。</p>`;
    return;
  }

  const { joined, aspectProducts, totalProducts, generatedAt } = loadGenre(genreId);
  const definitions = aspectsFor(genreId);
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
  const allCards = buildListCards(joined, definitions);

  // ── 状態 ──────────────────────────────────────
  let currentView: ViewMode = "chart";
  let currentX = defaults[0];
  let currentY = defaults[1];
  let currentMaxPrice = maxPrice;
  let listQuery = "";
  let listSortKey: ListSortKey = "mentions";
  let vsSelection: string[] = [];

  function getDimmedIds(): Set<string> {
    if (currentMaxPrice >= maxPrice) return new Set();
    return new Set(
      joined.filter((p) => p.price > currentMaxPrice).map((p) => p.productId),
    );
  }

  // ── DOM骨格 ───────────────────────────────────
  container.innerHTML = "";

  // 1. ヘッダー
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

  // 2. ビュートグル
  const toggleEl = document.createElement("div");
  container.appendChild(toggleEl);

  // 3. 軸ピッカー（chartのみ）
  const pickerEl = document.createElement("div");
  container.appendChild(pickerEl);

  // 4. 価格フィルタ（常設）
  const filterEl = document.createElement("div");
  container.appendChild(filterEl);

  // 5. チャート情報（chartのみ）
  const chartInfoEl = document.createElement("p");
  chartInfoEl.className = "chart-info";
  container.appendChild(chartInfoEl);

  // 6. チャート（chartのみ）
  const chartEl = document.createElement("div");
  container.appendChild(chartEl);

  // 7. 一覧セクション（listのみ）
  const listSectionEl = document.createElement("div");
  container.appendChild(listSectionEl);

  // 8. 非掲載リスト（chartのみ）
  const unspokenEl = document.createElement("div");
  container.appendChild(unspokenEl);

  // 9. VSバー（listかつ選択時のみ）
  const vsBarEl = document.createElement("div");
  document.body.appendChild(vsBarEl);

  // ── 一覧の初期化（一度だけ） ─────────────────
  let listView: ListViewElements | null = null;

  function ensureListView(): ListViewElements {
    if (!listView) {
      listView = initListView(
        listSectionEl,
        (query) => {
          listQuery = query;
          renderListGridContent();
        },
        (key) => {
          listSortKey = key;
          renderListGridContent();
        },
      );
    }
    return listView;
  }

  // ── 描画関数 ──────────────────────────────────
  function renderChartContent() {
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
      priceDate: formatPriceDate(generatedAt),
    });

    renderAxisPicker(pickerEl, axes, pairs, currentX, currentY, (newX, newY) => {
      currentX = newX;
      currentY = newY;
      renderChartContent();
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

  function renderListGridContent() {
    const lv = ensureListView();
    const visible = computeVisibleCards(allCards, joined, listQuery, listSortKey);
    updateCountText(
      lv.countEl,
      joined.length,
      visible.length,
      listQuery.trim().length > 0,
    );
    renderListGrid(
      lv.gridEl,
      visible,
      getDimmedIds(),
      vsSelection,
      handleVsToggle,
      generatedAt,
    );
    syncListPadding();
  }

  function syncViewVisibility() {
    renderViewToggle(toggleEl, currentView, (view) => {
      currentView = view;
      syncViewVisibility();
      if (currentView === "list") {
        renderListGridContent();
      }
    });

    const isChart = currentView === "chart";
    pickerEl.hidden = !isChart;
    chartInfoEl.hidden = !isChart;
    chartEl.hidden = !isChart;
    unspokenEl.hidden = !isChart;
    listSectionEl.hidden = isChart;

    if (isChart || vsSelection.length === 0) {
      vsBarEl.hidden = true;
      syncListPadding();
    } else {
      renderVsBar();
    }
  }

  function syncDimming() {
    const dimmedIds = getDimmedIds();
    if (currentView === "chart") {
      updateDimming(chartEl, dimmedIds);
    } else if (listView) {
      updateListDimming(listView.gridEl, dimmedIds);
    }
  }

  function syncSelection() {
    if (listView) {
      updateListSelection(listView.gridEl, vsSelection);
    }
    renderVsBar();
  }

  // ── VS選択 ────────────────────────────────────
  function handleVsToggle(productId: string) {
    const idx = vsSelection.indexOf(productId);
    if (idx >= 0) {
      vsSelection = vsSelection.filter((id) => id !== productId);
    } else if (vsSelection.length >= 2) {
      vsSelection = [vsSelection[1], productId];
    } else {
      vsSelection = [...vsSelection, productId];
    }
    syncSelection();
  }

  function handleVsRemove(productId: string) {
    vsSelection = vsSelection.filter((id) => id !== productId);
    syncSelection();
  }

  function handleVsClearAll() {
    vsSelection = [];
    syncSelection();
  }

  function renderVsBar() {
    if (currentView !== "list" || vsSelection.length === 0) {
      vsBarEl.hidden = true;
      syncListPadding();
      return;
    }
    renderVsSelectionBar(vsBarEl, vsSelection, productMap, handleVsRemove, handleVsClearAll);
    syncListPadding();
  }

  function syncListPadding() {
    if (currentView === "list" && vsSelection.length > 0 && !vsBarEl.hidden) {
      const barHeight = vsBarEl.offsetHeight || 72;
      listSectionEl.style.paddingBottom = `${barHeight + 16}px`;
    } else {
      listSectionEl.style.paddingBottom = "";
    }
  }

  // ── 初期描画 ──────────────────────────────────
  renderPriceFilter(filterEl, joined, currentMaxPrice, (newMax) => {
    currentMaxPrice = newMax;
    syncDimming();
  });

  renderChartContent();
  syncViewVisibility();
}

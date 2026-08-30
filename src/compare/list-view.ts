import type { ListCard, ListSortKey } from "@lib/compare-model.ts";
import { sortListCards } from "@lib/compare-model.ts";
import { searchProducts } from "@lib/home-model.ts";
import type { JoinedProduct } from "@lib/types.ts";

function esc(s: string): string {
  const el = document.createElement("span");
  el.textContent = s;
  return el.innerHTML;
}

export function formatPriceDate(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getMonth() + 1}/${d.getDate()}取得`;
}

export type ListViewElements = {
  section: HTMLElement;
  searchEl: HTMLElement;
  toolbarEl: HTMLElement;
  gridEl: HTMLElement;
  countEl: HTMLElement;
};

export function initListView(
  container: HTMLElement,
  onQueryChange: (query: string) => void,
  onSortChange: (key: ListSortKey) => void,
): ListViewElements {
  container.innerHTML = "";
  container.className = "compare-list";

  const searchEl = document.createElement("div");
  searchEl.className = "compare-search";

  const searchLabel = document.createElement("label");
  searchLabel.className = "compare-search__label";
  searchLabel.textContent = "商品名で探す";
  searchLabel.htmlFor = "compare-search-input";
  searchEl.appendChild(searchLabel);

  const searchIcon = document.createElement("span");
  searchIcon.className = "compare-search__icon";
  searchIcon.setAttribute("aria-hidden", "true");
  searchIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
  searchEl.appendChild(searchIcon);

  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.id = "compare-search-input";
  searchInput.className = "compare-search__input";
  searchInput.placeholder = "商品名やブランド名で探す";
  searchInput.autocomplete = "off";
  searchEl.appendChild(searchInput);

  searchInput.addEventListener("input", () => {
    onQueryChange(searchInput.value);
  });

  container.appendChild(searchEl);

  const toolbarEl = document.createElement("div");
  toolbarEl.className = "compare-list__toolbar";

  const sortLabel = document.createElement("label");
  sortLabel.className = "compare-list__sort-label";
  sortLabel.htmlFor = "compare-sort";
  sortLabel.textContent = "並び順";
  toolbarEl.appendChild(sortLabel);

  const sortSelect = document.createElement("select");
  sortSelect.id = "compare-sort";
  sortSelect.className = "compare-list__sort-select";
  const sortOptions: { value: ListSortKey; label: string }[] = [
    { value: "mentions", label: "言及数順（分析済み優先）" },
    { value: "price", label: "価格が安い順（分析済み優先）" },
    { value: "reviews-read", label: "読了レビュー数順（分析済み優先）" },
  ];
  for (const opt of sortOptions) {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.label;
    sortSelect.appendChild(option);
  }
  sortSelect.addEventListener("change", () => {
    onSortChange(sortSelect.value as ListSortKey);
  });
  toolbarEl.appendChild(sortSelect);

  const countEl = document.createElement("span");
  countEl.className = "compare-list__count";
  countEl.setAttribute("aria-live", "polite");
  toolbarEl.appendChild(countEl);

  container.appendChild(toolbarEl);

  const gridEl = document.createElement("ul");
  gridEl.className = "compare-list__grid";
  container.appendChild(gridEl);

  return { section: container, searchEl, toolbarEl, gridEl, countEl };
}

export function renderListGrid(
  gridEl: HTMLElement,
  cards: ListCard[],
  dimmedIds: Set<string>,
  vsSelection: readonly string[],
  onVsToggle: (productId: string) => void,
  generatedAt: string | null,
): void {
  gridEl.innerHTML = "";

  if (cards.length === 0) {
    const empty = document.createElement("li");
    empty.className = "compare-list__empty";
    empty.textContent = "該当する商品がありません";
    gridEl.appendChild(empty);
    return;
  }

  for (const card of cards) {
    const li = document.createElement("li");
    li.className = "compare-list__card";
    li.dataset.productId = card.product.productId;

    if (dimmedIds.has(card.product.productId)) {
      li.classList.add("compare-list__card--dimmed");
    }
    if (vsSelection.includes(card.product.productId)) {
      li.classList.add("compare-list__card--selected");
    }

    const checkDiv = document.createElement("div");
    checkDiv.className = "compare-list__vs-check";
    const checkId = `vs-check-${card.product.productId}`;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = checkId;
    checkbox.className = "compare-list__checkbox";
    checkbox.checked = vsSelection.includes(card.product.productId);
    checkbox.addEventListener("change", () => {
      onVsToggle(card.product.productId);
    });
    const checkLabel = document.createElement("label");
    checkLabel.htmlFor = checkId;
    checkLabel.className = "compare-list__checkbox-label";
    checkLabel.textContent = "VSに追加";
    checkDiv.appendChild(checkbox);
    checkDiv.appendChild(checkLabel);
    li.appendChild(checkDiv);

    const link = document.createElement("a");
    link.className = "compare-list__link";
    link.href = `/reviews/${card.product.productId}`;

    if (card.product.imageUrl) {
      const img = document.createElement("img");
      img.className = "compare-list__image";
      img.src = card.product.imageUrl;
      img.alt = card.product.name;
      img.width = 56;
      img.height = 56;
      img.loading = "lazy";
      link.appendChild(img);
    }

    const info = document.createElement("div");
    info.className = "compare-list__info";

    const nameEl = document.createElement("span");
    nameEl.className = "compare-list__name";
    nameEl.textContent = card.product.name;
    info.appendChild(nameEl);

    const brandEl = document.createElement("span");
    brandEl.className = "compare-list__brand";
    brandEl.textContent = card.product.brand;
    info.appendChild(brandEl);

    const priceEl = document.createElement("span");
    priceEl.className = "compare-list__price";
    priceEl.textContent = `¥${card.product.price.toLocaleString()}`;
    if (generatedAt) {
      const dateSpan = document.createElement("span");
      dateSpan.className = "compare-list__price-date";
      dateSpan.textContent = `（${formatPriceDate(generatedAt)}）`;
      priceEl.appendChild(dateSpan);
    }
    info.appendChild(priceEl);

    link.appendChild(info);
    li.appendChild(link);

    const verdictDiv = document.createElement("div");
    verdictDiv.className = "compare-list__verdict";

    if (card.status === "unread") {
      const badge = document.createElement("span");
      badge.className = "compare-list__unread-badge";
      badge.textContent = "レビュー未読";
      verdictDiv.appendChild(badge);
    } else if (card.praised.length === 0 && card.blamed.length === 0) {
      const noMention = document.createElement("span");
      noMention.className = "compare-list__no-mention";
      noMention.textContent = `まとめに使える言及なし（${card.reviewsRead}件を読了）`;
      verdictDiv.appendChild(noMention);
    } else {
      if (card.praised.length > 0) {
        const heading = document.createElement("span");
        heading.className = "compare-list__verdict-heading compare-list__verdict-heading--pos";
        heading.textContent = "褒められている";
        verdictDiv.appendChild(heading);
        for (const line of card.praised) {
          verdictDiv.appendChild(renderAspectLine(line, card.reviewsRead!, "pos"));
        }
      }
      if (card.blamed.length > 0) {
        const heading = document.createElement("span");
        heading.className = "compare-list__verdict-heading compare-list__verdict-heading--neg";
        heading.textContent = "不満がある";
        verdictDiv.appendChild(heading);
        for (const line of card.blamed) {
          verdictDiv.appendChild(renderAspectLine(line, card.reviewsRead!, "neg"));
        }
      }
    }

    li.appendChild(verdictDiv);
    gridEl.appendChild(li);
  }
}

function renderAspectLine(
  line: { label: string; positive: number; negative: number },
  reviewsRead: number,
  type: "pos" | "neg",
): HTMLElement {
  const div = document.createElement("div");
  div.className = `compare-list__aspect compare-list__aspect--${type}`;
  div.innerHTML =
    `${type === "pos" ? "○" : "△"} ${esc(line.label)}` +
    ` <span class="compare-list__pos">満足${line.positive}件</span>` +
    ` / <span class="compare-list__neg">不満${line.negative}件</span>` +
    ` <span class="compare-list__denom">（${reviewsRead}件中）</span>`;
  return div;
}

export function updateListDimming(
  gridEl: HTMLElement,
  dimmedIds: Set<string>,
): void {
  for (const card of gridEl.querySelectorAll<HTMLElement>(
    ".compare-list__card",
  )) {
    const id = card.dataset.productId ?? "";
    card.classList.toggle("compare-list__card--dimmed", dimmedIds.has(id));
  }
}

export function updateListSelection(
  gridEl: HTMLElement,
  vsSelection: readonly string[],
): void {
  for (const card of gridEl.querySelectorAll<HTMLElement>(
    ".compare-list__card",
  )) {
    const id = card.dataset.productId ?? "";
    const selected = vsSelection.includes(id);
    card.classList.toggle("compare-list__card--selected", selected);
    const checkbox = card.querySelector<HTMLInputElement>(
      ".compare-list__checkbox",
    );
    if (checkbox) checkbox.checked = selected;
  }
}

export function computeVisibleCards(
  allCards: ListCard[],
  joined: readonly JoinedProduct[],
  query: string,
  sortKey: ListSortKey,
): ListCard[] {
  const sorted = sortListCards(allCards, sortKey);
  if (!query.trim()) return sorted;
  const matchingIds = new Set(
    searchProducts([...joined], query, joined.length).map((p) => p.productId),
  );
  return sorted.filter((card) => matchingIds.has(card.product.productId));
}

export function updateCountText(
  countEl: HTMLElement,
  totalCount: number,
  visibleCount: number,
  isFiltered: boolean,
): void {
  countEl.textContent = isFiltered
    ? `全${totalCount}件中 ${visibleCount}件を表示`
    : `${totalCount}件`;
}

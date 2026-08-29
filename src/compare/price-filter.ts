import type { JoinedProduct } from "@lib/types.ts";

export type PriceChangeCallback = (maxPrice: number) => void;

export function renderPriceFilter(
  container: HTMLElement,
  products: readonly JoinedProduct[],
  initialMax: number,
  onChange: PriceChangeCallback,
): void {
  container.innerHTML = "";
  container.className = "price-filter";

  const prices = products.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const label = document.createElement("span");
  label.className = "price-filter__label";
  label.textContent = "価格";
  container.appendChild(label);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.className = "price-filter__slider";
  slider.min = String(minPrice);
  slider.max = String(maxPrice);
  slider.value = String(initialMax);
  slider.step = "1000";
  container.appendChild(slider);

  const valueEl = document.createElement("span");
  valueEl.className = "price-filter__value";
  container.appendChild(valueEl);

  const countEl = document.createElement("span");
  countEl.className = "price-filter__count";
  container.appendChild(countEl);

  function update(max: number) {
    valueEl.textContent = `〜¥${max.toLocaleString()}`;
    const inRange = products.filter((p) => p.price <= max).length;
    if (max >= maxPrice) {
      countEl.textContent = "";
    } else {
      countEl.textContent = `（${products.length}件中${inRange}件）`;
    }
  }

  update(initialMax);

  slider.addEventListener("input", () => {
    const v = Number(slider.value);
    update(v);
    onChange(v);
  });
}

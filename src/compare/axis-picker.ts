import type { OfferableAxis } from "@lib/aspect-model.ts";

export type AxisChangeCallback = (xKey: string, yKey: string) => void;

export function renderAxisPicker(
  container: HTMLElement,
  axes: readonly OfferableAxis[],
  currentX: string,
  currentY: string,
  onChange: AxisChangeCallback,
): void {
  container.innerHTML = "";
  container.className = "axis-picker";

  const rows: { label: string; current: string; other: string; axis: "x" | "y" }[] = [
    { label: "横軸", current: currentX, other: currentY, axis: "x" },
    { label: "縦軸", current: currentY, other: currentX, axis: "y" },
  ];

  for (const row of rows) {
    const rowEl = document.createElement("div");
    rowEl.className = "axis-picker__row";

    const label = document.createElement("span");
    label.className = "axis-picker__label";
    label.textContent = row.label;
    rowEl.appendChild(label);

    for (const ax of axes) {
      const btn = document.createElement("button");
      btn.className = "axis-picker__cell";
      btn.textContent = ax.label;

      if (ax.key === row.current) {
        btn.classList.add("axis-picker__cell--active");
      } else if (!ax.offerable) {
        btn.classList.add("axis-picker__cell--blocked");
        btn.disabled = true;
        btn.title = ax.blockedBecause ?? "";
      } else if (ax.key === row.other) {
        btn.disabled = true;
        btn.title = "もう一方の軸で使用中";
        btn.style.opacity = "0.4";
      }

      btn.addEventListener("click", () => {
        if (row.axis === "x") {
          onChange(ax.key, currentY);
        } else {
          onChange(currentX, ax.key);
        }
      });

      rowEl.appendChild(btn);
    }

    container.appendChild(rowEl);
  }
}

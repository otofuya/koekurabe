import type { Coverage } from "@lib/aspect-model.ts";

export function renderCoveragebar(
  container: HTMLElement,
  coverage: Coverage,
): void {
  container.innerHTML = "";
  container.className = "coverage";
  container.textContent = `${coverage.total}件中${coverage.analysed}件のレビューを読めています（のべ${coverage.reviewsRead.toLocaleString()}件）`;
}

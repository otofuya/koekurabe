import type { OfferableAxis } from "@ref/aspect-model.ts";
import type { JoinedProduct } from "../lib/types.ts";

export function renderUnspokenList(
  container: HTMLElement,
  unspokenIds: readonly string[],
  notAnalysed: readonly JoinedProduct[],
  allProducts: readonly JoinedProduct[],
  xAxis: OfferableAxis,
  yAxis: OfferableAxis,
): void {
  container.innerHTML = "";
  container.className = "unspoken-list";

  const total = unspokenIds.length + notAnalysed.length;

  const details = document.createElement("details");
  details.open = false;

  const summary = document.createElement("summary");
  summary.textContent = `この図に載っていない商品（${total}件）`;
  details.appendChild(summary);

  const note = document.createElement("p");
  note.className = "unspoken-list__note";
  note.textContent =
    "両方の観点に言及が無いため配置できません";
  details.appendChild(note);

  const ul = document.createElement("ul");

  for (const id of unspokenIds) {
    const product = allProducts.find((p) => p.productId === id);
    if (!product) continue;

    const li = document.createElement("li");
    const detail = describeUnspoken(product, xAxis, yAxis);
    li.innerHTML = `${esc(product.name)} <span class="unspoken-list__detail">${esc(detail)}</span>`;
    ul.appendChild(li);
  }

  for (const product of notAnalysed) {
    const li = document.createElement("li");
    li.innerHTML = `${esc(product.name)} <span class="unspoken-list__detail">（レビュー未読）</span>`;
    ul.appendChild(li);
  }

  details.appendChild(ul);
  container.appendChild(details);
}

function describeUnspoken(
  product: JoinedProduct,
  xAxis: OfferableAxis,
  yAxis: OfferableAxis,
): string {
  if (!product.aspects) return "（レビュー未読）";

  const xMention = product.aspects.some(
    (a) => a.key === xAxis.key && a.positive + a.negative > 0,
  );
  const yMention = product.aspects.some(
    (a) => a.key === yAxis.key && a.positive + a.negative > 0,
  );

  if (xMention && !yMention) return `（${xAxis.label}のみ言及あり）`;
  if (!xMention && yMention) return `（${yAxis.label}のみ言及あり）`;
  return "（両方とも言及なし）";
}

function esc(s: string): string {
  const el = document.createElement("span");
  el.textContent = s;
  return el.innerHTML;
}

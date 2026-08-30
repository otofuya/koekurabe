import type { JoinedProduct } from "@lib/types.ts";

function esc(s: string): string {
  const el = document.createElement("span");
  el.textContent = s;
  return el.innerHTML;
}

export function renderVsSelectionBar(
  container: HTMLElement,
  vsSelection: readonly string[],
  productMap: Map<string, JoinedProduct>,
  onRemove: (productId: string) => void,
  onClearAll: () => void,
): void {
  container.innerHTML = "";
  container.className = "vs-bar";

  if (vsSelection.length === 0) {
    container.hidden = true;
    return;
  }
  container.hidden = false;

  const inner = document.createElement("div");
  inner.className = "vs-bar__inner";

  const productsDiv = document.createElement("div");
  productsDiv.className = "vs-bar__products";

  for (let i = 0; i < vsSelection.length; i++) {
    const id = vsSelection[i];
    const product = productMap.get(id);
    if (!product) continue;

    if (i > 0) {
      const vsLabel = document.createElement("span");
      vsLabel.className = "vs-bar__vs-label";
      vsLabel.textContent = "vs";
      productsDiv.appendChild(vsLabel);
    }

    const item = document.createElement("div");
    item.className = "vs-bar__product";

    if (product.imageUrl) {
      const img = document.createElement("img");
      img.className = "vs-bar__image";
      img.src = product.imageUrl;
      img.alt = product.name;
      img.width = 32;
      img.height = 32;
      item.appendChild(img);
    }

    const nameEl = document.createElement("span");
    nameEl.className = "vs-bar__product-name";
    nameEl.textContent = product.name;
    item.appendChild(nameEl);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "vs-bar__remove";
    removeBtn.setAttribute("aria-label", `${product.name}の選択を解除`);
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", () => onRemove(id));
    item.appendChild(removeBtn);

    productsDiv.appendChild(item);
  }

  inner.appendChild(productsDiv);

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "vs-bar__actions";

  if (vsSelection.length === 1) {
    const hint = document.createElement("span");
    hint.className = "vs-bar__hint";
    hint.textContent = "もう1商品を選んでください";
    actionsDiv.appendChild(hint);
  }

  const compareBtn = document.createElement("button");
  compareBtn.type = "button";
  compareBtn.className = "vs-bar__btn";
  compareBtn.textContent = "比較する";
  compareBtn.disabled = vsSelection.length < 2;
  if (vsSelection.length >= 2) {
    compareBtn.addEventListener("click", () => {
      const [idA, idB] = vsSelection;
      window.location.assign(`/vs/${encodeURIComponent(idA)}/${encodeURIComponent(idB)}`);
    });
  }
  actionsDiv.appendChild(compareBtn);

  if (vsSelection.length > 0) {
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "vs-bar__clear";
    clearBtn.textContent = "全解除";
    clearBtn.addEventListener("click", onClearAll);
    actionsDiv.appendChild(clearBtn);
  }

  inner.appendChild(actionsDiv);
  container.appendChild(inner);
}

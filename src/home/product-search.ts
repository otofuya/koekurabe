import { searchProducts } from "@lib/home-model.ts";
import type { JoinedProduct } from "@lib/types.ts";

export function renderProductSearch(
  container: HTMLElement,
  allProducts: JoinedProduct[],
) {
  const section = document.createElement("section");
  section.className = "home-search";

  const label = document.createElement("label");
  label.className = "home-search__label";
  label.textContent = "商品名で探す";
  label.htmlFor = "home-search-input";
  section.appendChild(label);

  const listId = "home-search-results";

  const input = document.createElement("input");
  input.type = "search";
  input.id = "home-search-input";
  input.className = "home-search__input";
  input.placeholder = "商品名やブランド名で探す";
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("aria-controls", listId);
  input.autocomplete = "off";

  const icon = document.createElement("span");
  icon.className = "home-search__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
  section.appendChild(icon);

  section.appendChild(input);

  const list = document.createElement("ul");
  list.id = listId;
  list.className = "home-search__results";
  list.setAttribute("role", "listbox");
  list.hidden = true;
  section.appendChild(list);

  let activeIndex = -1;
  let currentResults: JoinedProduct[] = [];

  function updateResults() {
    const results = searchProducts(allProducts, input.value);
    currentResults = results;
    activeIndex = -1;
    list.innerHTML = "";

    if (!input.value.trim()) {
      list.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      return;
    }

    if (results.length === 0) {
      const li = document.createElement("li");
      li.className = "home-search__empty";
      li.textContent = "該当する商品がありません";
      list.appendChild(li);
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
      input.removeAttribute("aria-activedescendant");
      return;
    }

    for (let i = 0; i < results.length; i++) {
      const p = results[i];
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.id = `search-option-${i}`;
      li.className = "home-search__result-item";
      li.dataset.productId = p.productId;

      if (p.imageUrl) {
        const img = document.createElement("img");
        img.className = "home-search__result-image";
        img.src = p.imageUrl;
        img.alt = p.name;
        img.width = 40;
        img.height = 40;
        li.appendChild(img);
      }

      const text = document.createElement("span");
      text.className = "home-search__result-text";
      const name = document.createElement("span");
      name.className = "home-search__result-name";
      name.textContent = p.name;
      text.appendChild(name);
      const meta = document.createElement("span");
      meta.className = "home-search__result-meta";
      meta.textContent = `${p.brand}  ¥${p.price.toLocaleString()}`;
      text.appendChild(meta);
      li.appendChild(text);

      li.addEventListener("click", () => {
        window.location.assign(`/reviews/${p.productId}`);
      });

      list.appendChild(li);
    }

    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
    input.removeAttribute("aria-activedescendant");
  }

  function setActive(index: number) {
    const items = list.querySelectorAll<HTMLElement>("[role='option']");
    for (const item of items) {
      item.removeAttribute("aria-selected");
      item.classList.remove("home-search__result-item--active");
    }
    if (index >= 0 && index < items.length) {
      activeIndex = index;
      items[index].setAttribute("aria-selected", "true");
      items[index].classList.add("home-search__result-item--active");
      input.setAttribute("aria-activedescendant", items[index].id);
      items[index].scrollIntoView({ block: "nearest" });
    } else {
      activeIndex = -1;
      input.removeAttribute("aria-activedescendant");
    }
  }

  input.addEventListener("input", () => {
    updateResults();
  });

  input.addEventListener("keydown", (e) => {
    if (e.isComposing) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (currentResults.length > 0) {
        setActive(activeIndex < currentResults.length - 1 ? activeIndex + 1 : 0);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (currentResults.length > 0) {
        setActive(activeIndex > 0 ? activeIndex - 1 : currentResults.length - 1);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < currentResults.length) {
        window.location.assign(`/reviews/${currentResults[activeIndex].productId}`);
      }
    } else if (e.key === "Escape") {
      input.value = "";
      list.hidden = true;
      input.setAttribute("aria-expanded", "false");
      activeIndex = -1;
    }
  });

  input.addEventListener("blur", (e) => {
    setTimeout(() => {
      if (!section.contains(document.activeElement)) {
        list.hidden = true;
        input.setAttribute("aria-expanded", "false");
      }
    }, 150);
  });

  input.addEventListener("focus", () => {
    if (input.value.trim()) {
      updateResults();
    }
  });

  container.appendChild(section);
}

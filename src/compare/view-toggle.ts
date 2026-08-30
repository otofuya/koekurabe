export type ViewMode = "chart" | "list";

export function renderViewToggle(
  container: HTMLElement,
  currentView: ViewMode,
  onChange: (view: ViewMode) => void,
): void {
  container.innerHTML = "";
  container.className = "view-toggle";
  container.setAttribute("role", "group");
  container.setAttribute("aria-label", "表示方法");

  const views: { key: ViewMode; label: string }[] = [
    { key: "chart", label: "チャート" },
    { key: "list", label: "一覧" },
  ];

  for (const { key, label } of views) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "view-toggle__btn";
    if (key === currentView) {
      btn.classList.add("view-toggle__btn--active");
    }
    btn.setAttribute("aria-pressed", String(key === currentView));
    btn.textContent = label;
    btn.addEventListener("click", () => {
      if (key !== currentView) onChange(key);
    });
    container.appendChild(btn);
  }
}

export function renderAiDisclosure(container: HTMLElement) {
  const note = document.createElement("p");
  note.className = "ai-disclosure";
  note.textContent =
    "件数はAIによるレビュー分類結果の集計です。分母（レビュー数）と集計は検証可能ですが、各レビューの観点判定はAIの推論です。";
  container.appendChild(note);
}

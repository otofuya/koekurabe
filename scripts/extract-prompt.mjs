/**
 * 抽出のプロンプトと、返してもらう形。extract-aspects.mjs と check-extraction.mjs（確かさを測る）で同じものを使う。
 */

// ── Per-review schema: Gemini classifies each review individually ────────────

// ちょうどよさ（lib/fit-model.ts）。定義があるカテゴリだけ、レビューごとに fits を返させる
export const fitSchema = (fits) => ({
  type: "array",
  items: {
    type: "object",
    properties: {
      aspect: { type: "string", enum: fits.map((f) => f.label) },
      direction: { type: "string", enum: ["low", "just", "high"] },
      quote: { type: "string" },
    },
    required: ["aspect", "direction", "quote"],
  },
});

export const schemaFor = (aspects, fits = []) => ({
  type: "object",
  properties: {
    reviews: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          ...(fits.length ? { fits: fitSchema(fits) } : {}),
          aspects: {
            type: "array",
            items: {
              type: "object",
              properties: {
                aspect: { type: "string", enum: aspects.map((a) => a.label) },
                polarity: { type: "string", enum: ["positive", "negative"] },
                quote: { type: "string" },
              },
              required: ["aspect", "polarity", "quote"],
            },
          },
        },
        required: ["index", "aspects"],
      },
    },
  },
  required: ["reviews"],
});

export const fitPrompt = (fits) => fits.length ? `

次の観点は、良し悪しではなく「ちょうどよさ」（好み）です。レビューがふれていたら fits に入れてください。
- 向きは low・just・high のどれか1つ。1件のレビューで、1つの観点につき1つだけ
- 根拠となる引用（そのレビューの本文にそのまま現れる一節）を付けてください
- ふれていなければ入れないでください。推測で埋めないでください
${fits.map((f) => `- ${f.label}：low＝${f.low}、just＝${f.just}、high＝${f.high}`).join("\n")}` : "";

export const promptFor = (aspects, numberedReviews, fits = []) => `次は1つの商品に対する購入者レビューです。番号付きで並んでいます。

各レビューについて、どの観点に言及しているか判定してください。
言及している場合、それが肯定的か否定的かを判定し、根拠となる引用（そのレビューの本文にそのまま現れる一節）を付けてください。

- 1つのレビューが同じ観点について肯定と否定の両方を述べている場合、両方を出してください
- 引用は、その判定（肯定か否定か）の根拠になる一節だけにしてください。肯定と否定の両方を出すときは、それぞれの根拠を別々に引用してください
- 観点に言及していないレビューは aspects を空配列にしてください
- 否定表現（「〜ない」「〜しにくい」「期待したほどでは」）を見落とさないでください
- 商品説明やショップの宣伝文が混ざっている場合、それは購入者の声ではないので判定しないでください
- この商品についての感想だけを判定してください。前に使っていた別の商品や、ほかの商品についての感想は数えないでください（例：「前のイヤホンは通話が不評だった」は、この商品の通話ではない）
- 評価していない言及は数えないでください（例：「音にこだわる方のことは分かりませんが」「通話はまだ試していません」「電池の減りは気にしていない」）
- 配送・梱包・お店の対応・初期不良の交換の対応は、商品の観点ではないので数えないでください。商品そのものの不具合（片耳だけつながらない等）は、その観点で数えてください
- 入力のレビュー番号をすべて返してください。省略しないでください

観点: ${aspects.map((a) => a.label).join("、")}${fitPrompt(fits)}

--- レビュー ---
${numberedReviews}`;

export function formatBatch(reviews) {
  return reviews.map((r) => `[${r.batchIndex}] ${r.text}`).join("\n\n");
}

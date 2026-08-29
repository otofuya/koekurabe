/**
 * 観点（アスペクト）の定義。
 *
 * カテゴリごとに**人手で書く。** 自由文から発見させてはいけない——リフトが最大になるのは
 * 「1つのカテゴリにしか現れない語」であり、商品コーパスではそれはシリーズ名・著者名・
 * ブランド名だからである（前身プロジェクトで実測：「ガッシュカフェ」「シュタイナー」が
 * エリア名になった）。
 *
 * 極の言葉は**件数で裏が取れる範囲**に留める。「静かになる ↔ 効かない」は言及の集計だが、
 * 「解像感 ↔ 音場」は誰かが実際に聴いて下した判断であり、ここでは誰も聴いていない。
 */
export type AspectDefinition = {
  key: string;
  /** 抽出プロンプトとバーに出る名前。 */
  label: string;
  /** 評価が肯定に振れる側の言葉。図の極になる。 */
  positivePole: string;
  /** その反対側。「悪い」ではなく「割れている」を表す言葉にする。 */
  negativePole: string;
};

export type CategoryDefinition = {
  id: string;
  label: string;
  aspects: AspectDefinition[];
  /**
   * チャートが最初に開く2軸。手で選ぶ。
   *
   * 分離度だけで並べると最も広い組が選ばれるが、それは最も読みやすい組とは限らない。
   * イヤホンでは ノイズキャンセリング × 外音取り込み が1位になるが、これは同じ問いの
   * 両端なので商品が対角線上に並び、4つの象限が別々の意味を持たなくなる。
   */
  defaultAxes?: [string, string];
};

/**
 * 完全ワイヤレスイヤホンの実績ある10観点。
 *
 * 音質はリストに残してあるが軸にはならない——24商品すべてが言及し、平均7件、
 * そして全員が「良い」と言うので分離度は0.22で `offerableAxes` が落とす。
 * それでも商品ページのバーには出す価値がある（「誰も音質に文句を言っていない」は情報）。
 * ゲートがあるおかげで、リストは「何が語られているか」に正直なまま、
 * そのうち並べ替えに使えるものだけを軸にできる。
 */
export const CATEGORY_DEFINITIONS: Record<string, CategoryDefinition> = {
  earbuds: {
    id: "earbuds",
    label: "完全ワイヤレスイヤホン",
    aspects: [
      { key: "sound", label: "音質", positivePole: "音が良い", negativePole: "音に不満" },
      { key: "bass", label: "低音", positivePole: "低音が出る", negativePole: "低音が物足りない" },
      { key: "fit", label: "装着感", positivePole: "つけ心地が良い", negativePole: "合わない人がいる" },
      { key: "anc", label: "ノイズキャンセリング", positivePole: "静かになる", negativePole: "効かない" },
      { key: "ambient", label: "外音取り込み", positivePole: "外がよく聞こえる", negativePole: "不自然" },
      { key: "battery", label: "バッテリー", positivePole: "長く持つ", negativePole: "持たない" },
      { key: "connection", label: "接続の安定", positivePole: "安定している", negativePole: "途切れる" },
      { key: "controls", label: "操作性", positivePole: "使いやすい", negativePole: "使いにくい" },
      { key: "calls", label: "通話品質", positivePole: "通話しやすい", negativePole: "通話が弱い" },
      { key: "value", label: "価格の納得感", positivePole: "値段に納得", negativePole: "割高" },
    ],
    defaultAxes: ["fit", "anc"],
  },
};

/** カテゴリの観点。まだレビューを読んでいないカテゴリでは空。 */
export function aspectsFor(categoryId: string): readonly AspectDefinition[] {
  return CATEGORY_DEFINITIONS[categoryId]?.aspects ?? [];
}

/** 手で選んだ既定の2軸。 */
export function defaultAxesFor(categoryId: string): [string, string] | null {
  return CATEGORY_DEFINITIONS[categoryId]?.defaultAxes ?? null;
}

import type { FitDefinition } from "./fit-model.ts";

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
  /** 抽出プロンプトに渡す名前。 */
  label: string;
  /** 画面に出す日常の言葉（装着感 → つけ心地）。抽出には使わない。無ければ label。 */
  word?: string;
  /** 評価が肯定に振れる側の言葉。図の極になる。 */
  positivePole: string;
  /** その反対側。「悪い」ではなく「割れている」を表す言葉にする。 */
  negativePole: string;
};

export type CategoryDefinition = {
  id: string;
  label: string;
  aspects: AspectDefinition[];
  /** ちょうどよさの観点（小さめ・ちょうど・大きめ のような好み）。良し悪しの観点とは別に数える（lib/fit-model.ts）。 */
  fits?: FitDefinition[];
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
      { key: "sound", word: "音質", label: "音質", positivePole: "音が良い", negativePole: "音に不満" },
      { key: "bass", word: "低音", label: "低音", positivePole: "低音が出る", negativePole: "低音が物足りない" },
      { key: "fit", word: "つけ心地", label: "装着感", positivePole: "つけ心地が良い", negativePole: "合わない人がいる" },
      { key: "anc", word: "ノイキャン", label: "ノイズキャンセリング", positivePole: "静かになる", negativePole: "効かない" },
      { key: "ambient", word: "外の音", label: "外音取り込み", positivePole: "外がよく聞こえる", negativePole: "不自然" },
      { key: "battery", word: "電池", label: "バッテリー", positivePole: "長く持つ", negativePole: "持たない" },
      { key: "connection", word: "つながり", label: "接続の安定", positivePole: "安定している", negativePole: "途切れる" },
      { key: "controls", word: "操作", label: "操作性", positivePole: "使いやすい", negativePole: "使いにくい" },
      { key: "calls", word: "通話", label: "通話品質", positivePole: "通話しやすい", negativePole: "通話が弱い" },
      { key: "value", word: "値段", label: "価格の納得感", positivePole: "値段に納得", negativePole: "割高" },
    ],
    defaultAxes: ["fit", "anc"],
  },

  /*
   * ── ここから下は仮（2026-09-26・オーナーの確認待ち） ─────────────────────────
   *
   * docs/10 第6節の「まず3つで抽出し直す」の残り2つ。docs/09 の観点の辞書（共通・系統・固有）と、
   * 楽天の「トピックに絞って見る」（シューズ＝サイズ感・クッション性・フィット感・軽量。docs/02）から書いた。
   *
   * 良し悪しの観点は aspects に、好みの観点（シューズのサイズ感・足幅、化粧水の使用感）は fits に書いた。
   * fits は「小さめ｜ちょうど｜大きめ」の3つで数える（lib/fit-model.ts。2026-09-26 にオーナーが「足す」と答えた）。
   */
  lotion: {
    id: "lotion",
    label: "化粧水",
    aspects: [
      { key: "moisture", word: "うるおい", label: "保湿", positivePole: "うるおう", negativePole: "乾く・物足りない" },
      { key: "irritation", word: "刺激", label: "肌への刺激", positivePole: "しみない", negativePole: "しみた・ピリピリした" },
      { key: "absorb", word: "なじみ", label: "肌へのなじみ", positivePole: "すっとなじむ", negativePole: "なじみにくい" },
      { key: "sticky", word: "べたつき", label: "べたつき", positivePole: "べたつかない", negativePole: "べたつく" },
      { key: "scent", word: "香り", label: "香り", positivePole: "香りが好き", negativePole: "香りが苦手" },
      { key: "skin", word: "肌の調子", label: "使い続けたときの肌の調子", positivePole: "調子がよくなった", negativePole: "変わらない・荒れた" },
      { key: "bottle", word: "容器", label: "容器の使いやすさ", positivePole: "出しやすい", negativePole: "出しにくい・漏れる" },
      { key: "value", word: "値段", label: "価格の納得感", positivePole: "値段に納得", negativePole: "割高" },
    ],
    fits: [
      { key: "texture", word: "使用感", label: "使用感（さっぱり〜しっとり）", low: "さっぱり", just: "ちょうどいい", high: "しっとり・とろみ" },
    ],
  },
  "running-shoes": {
    id: "running-shoes",
    label: "ランニングシューズ",
    aspects: [
      { key: "cushion", word: "クッション", label: "クッション性", positivePole: "衝撃がやわらぐ", negativePole: "硬い・底づきする" },
      { key: "fit", word: "足へのなじみ", label: "フィット感・履き心地", positivePole: "足になじむ", negativePole: "当たる・痛い" },
      { key: "light", word: "軽さ", label: "軽さ", positivePole: "軽い", negativePole: "重い" },
      { key: "fatigue", word: "疲れにくさ", label: "長く走ったときの疲れにくさ", positivePole: "疲れにくい", negativePole: "疲れる・痛くなる" },
      { key: "grip", word: "グリップ", label: "グリップ（滑りにくさ）", positivePole: "滑らない", negativePole: "滑る" },
      { key: "breath", word: "蒸れ", label: "通気性", positivePole: "蒸れない", negativePole: "蒸れる" },
      { key: "durability", word: "丈夫さ", label: "耐久性", positivePole: "長持ち", negativePole: "すぐすり減る・破れる" },
      { key: "look", word: "見た目", label: "見た目・色", positivePole: "見た目が良い", negativePole: "写真と違う" },
      { key: "value", word: "値段", label: "価格の納得感", positivePole: "値段に納得", negativePole: "割高" },
    ],
    fits: [
      { key: "size", word: "サイズ感", label: "サイズ感（いつものサイズと比べて）", low: "小さめ・きつい", just: "ちょうど", high: "大きめ・ゆるい" },
      { key: "width", word: "足幅", label: "足幅（横の幅）", low: "幅がせまい", just: "ちょうど", high: "幅が広い" },
    ],
  },
};

/** ちょうどよさの観点。無いカテゴリでは空。 */
export function fitsFor(categoryId: string): readonly FitDefinition[] {
  return CATEGORY_DEFINITIONS[categoryId]?.fits ?? [];
}

/** カテゴリの観点。まだレビューを読んでいないカテゴリでは空。 */
export function aspectsFor(categoryId: string): readonly AspectDefinition[] {
  return CATEGORY_DEFINITIONS[categoryId]?.aspects ?? [];
}

/** 手で選んだ既定の2軸。 */
export function defaultAxesFor(categoryId: string): [string, string] | null {
  return CATEGORY_DEFINITIONS[categoryId]?.defaultAxes ?? null;
}

/** 画面に出す観点の言葉。 */
export function wordOf(definition: AspectDefinition | FitDefinition): string {
  return definition.word ?? definition.label;
}

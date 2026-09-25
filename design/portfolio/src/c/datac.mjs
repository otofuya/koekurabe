// 別案C（全ジャンル前提）の数字
// ・カテゴリの数は、オーナーから受け取ったカテゴリ調査（マイベスト・価格.com）から数えた
// ・3カテゴリの見本は、楽天のカテゴリ一覧から8商品ずつ1ページ（30件）読み、単語の規則で数えた値（AI の分類ではない）
//   本文はリポジトリに入れていない。ここにあるのは件数だけ（docs/09 第3節）
// ・イヤホンは data/ の実データ（../data.mjs）
import { shrunkScore } from '../../../../lib/aspect-model.ts';
export { MAPPED, STATS, AXES, KEYS, SHORT, LABEL, POLE, neighbors, byShort, Q, P, OFFMAP, yen, verdictOf } from '../data.mjs';

// ---------- カテゴリ（マイベストのルート。物販だけ） ----------
// fam：系統（体とのかかわり方）。ルート単位で振った概算
export const FAMILIES = [
  { key: 'power', name: '電気で動く', short: '電気', obj: 'vacuum', aspects: ['性能（単位ごと）', '音の静かさ', '手入れ', '操作', '故障'], conds: ['一人暮らし・家族', '使う場所'] },
  { key: 'play', name: '体を動かす・遊ぶ', short: '遊ぶ', obj: 'tent', aspects: ['性能', 'サイズ感', '丈夫さ', '重さ', '持ち運び'], conds: ['レベル（初心者・上級）', '体格'] },
  { key: 'tool', name: '置いて使う道具', short: '道具', obj: 'kettle', aspects: ['大きさ', '組み立て', '丈夫さ', '手入れ', '質感'], conds: ['住まいの広さ', '家族の人数'] },
  { key: 'skin', name: '肌と髪に使う', short: '肌と髪', obj: 'bottle', aspects: ['刺激', '使用感（さっぱり↔しっとり）', '香り', '効いた実感', '続けやすさ'], conds: ['肌質', '髪質', '年代'] },
  { key: 'eat', name: '食べる・飲む', short: '食べる', obj: 'bag', aspects: ['味の向き（酸味↔苦味 等）', '量', '香り', '状態・鮮度', 'また買った'], conds: ['飲み方・食べ方', '好み'] },
  { key: 'wear', name: '着る・履く', short: '着る', obj: 'shoe', aspects: ['サイズ感（小さめ↔大きめ）', '着心地', '洗濯', '見た目', '丈夫さ'], conds: ['普段のサイズ', '足幅・体型'] },
];
export const FAM = Object.fromEntries(FAMILIES.map((f) => [f.key, f]));
export const MYBEST_GOODS = [
  ['家電', 91, 'power'], ['パソコン・周辺機器', 65, 'power'], ['コスメ・化粧品', 35, 'skin'], ['カメラ', 27, 'power'],
  ['ドリンク・お酒', 26, 'eat'], ['スポーツ用品', 26, 'play'], ['ファッション', 26, 'wear'], ['アウトドア・キャンプ', 24, 'play'],
  ['釣具・釣り用品', 20, 'play'], ['食品', 18, 'eat'], ['生活雑貨', 17, 'tool'], ['ビューティー・ヘルス', 16, 'skin'],
  ['趣味・ホビー', 16, 'play'], ['ベビー・キッズ・マタニティ', 15, 'kids'], ['キッチン用品', 13, 'tool'], ['テレビゲーム・周辺機器', 13, 'power'],
  ['DIY・工具・エクステリア', 12, 'tool'], ['インテリア・家具', 12, 'tool'], ['コンタクトレンズ', 11, 'skin'], ['住宅設備・リフォーム', 10, 'tool'],
  ['ペットフード・ペット用品', 8, 'kids'], ['スマホ・携帯電話', 6, 'power'], ['車・バイク', 6, 'play'], ['靴・シューズ', 5, 'wear'],
  ['腕時計・アクセサリー', 4, 'wear'], ['本・音楽・動画', 4, 'play'],
];
export const MYBEST_OUT = [
  ['その他', 40], ['サービス', 35], ['アプリ', 27], ['保険', 21], ['ギフト・プレゼント', 18], ['旅行・宿泊', 16], ['投資・資産運用', 15],
  ['ローン・借入', 12], ['インターネット回線', 5], ['就職・転職', 5], ['クレジットカード', 4], ['脱毛', 4], ['ウォーターサーバー', 4], ['格安SIM', 3], ['セール情報', 3],
];
export const KAKAKU_GOODS = [
  ['スポーツ', 11067], ['コンタクトレンズ', 8219], ['ビューティー・ヘルス', 6381], ['食品', 4300], ['生活雑貨', 3818], ['ベビー・キッズ', 2437],
  ['DIY・工具', 2250], ['ファッション', 1938], ['ペット', 1399], ['キッチン用品', 1131], ['靴', 1088], ['ドリンク', 926], ['インテリア', 699],
  ['腕時計', 608], ['アウトドア', 542], ['自動車・バイク', 505], ['住宅設備', 307], ['家電', 266], ['パソコン', 210], ['ホビー', 187],
  ['スマホ', 159], ['カメラ', 118], ['ゲーム', 85],
];
export const COUNTS = {
  mbRoots: 41, mbMid: 738, mbGoodsRoots: MYBEST_GOODS.length, mbGoodsMid: MYBEST_GOODS.reduce((s, r) => s + r[1], 0),
  kkRoots: 38, kkSections: 659, kkItems: '62,000', kkGoodsRoots: KAKAKU_GOODS.length, kkGoodsItems: KAKAKU_GOODS.reduce((s, r) => s + r[1], 0),
};
COUNTS.mbOutMid = COUNTS.mbMid - COUNTS.mbGoodsMid;
export const famCount = (k) => MYBEST_GOODS.filter((r) => r[2] === k).reduce((s, r) => s + r[1], 0);

// ---------- 暮らしの場所（入口）。obj はモノの絵 ----------
export const PLACES = [
  { key: 'kitchen', name: '台所', objs: ['kettle', 'pan', 'bag'], units: ['電気ケトル', 'フライパン', 'コーヒー', '炊飯器'] },
  { key: 'wash', name: '洗面所', objs: ['bottle', 'dryer', 'brush'], units: ['化粧水', 'ドライヤー', '電動歯ブラシ', 'シャンプー'] },
  { key: 'out', name: '外へ', objs: ['shoe', 'earbuds', 'pack'], units: ['ランニングシューズ', '完全ワイヤレスイヤホン', 'リュック'] },
  { key: 'living', name: 'リビング', objs: ['vacuum', 'lamp', 'chair'], units: ['スティック掃除機', '照明', 'ソファ'] },
  { key: 'bed', name: '寝室', objs: ['pillow', 'lamp'], units: ['枕', 'マットレス', '加湿器'] },
  { key: 'work', name: '仕事と学び', objs: ['laptop', 'chair'], units: ['ノートPC', 'オフィスチェア', 'モニター'] },
  { key: 'closet', name: 'クローゼット', objs: ['tee', 'watch'], units: ['Tシャツ', '腕時計', '財布'] },
  { key: 'kids', name: '子ども', objs: ['stroller'], units: ['ベビーカー', 'おむつ'] },
  { key: 'pet', name: 'ペット', objs: ['bowl'], units: ['キャットフード', 'ペットのトイレ'] },
  { key: 'weekend', name: '週末', objs: ['tent', 'camera'], units: ['テント', 'ミラーレス一眼'] },
];

// ---------- 測った3カテゴリ（単語の規則で数えた） ----------
export const MEASURE = {
  requests: 35, perItem: 30, items: 8, reviews: 720, stopped503: 4,
  cats: [
    { key: 'skin', name: '化粧水', n: 240, cond: 37, person: 18, size: 6, dir: [['さっぱり', 32], ['しっとり', 59]], rep: 76, ship: 22, gift: 11, deep: [35, 44], median: 2150, fam: 'skin' },
    { key: 'run', name: 'ランニングシューズ', n: 240, cond: 58, person: 29, size: 90, dir: [['小さめ', 33], ['ちょうど', 29], ['大きめ', 26]], rep: 32, ship: 34, gift: 4, deep: [15, 45], median: 107, fam: 'wear' },
    { key: 'coffee', name: 'コーヒー', n: 240, cond: 24, person: 29, size: 1, dir: [['酸味', 15], ['苦味', 20]], rep: 98, ship: 60, gift: 21, deep: [44, 45], median: 5990, fam: 'eat' },
  ],
  // 化粧水：刺激（全体と、敏感肌と書いた人）
  irritation: { all: { n: 240, pos: 6, neg: 13 }, sensitive: { n: 14, pos: 2, neg: 8 } },
  earbudsDeep: [45, 97], // 商品価格ナビでレビューが1件以上ある商品
};
export const pct = (a, b) => Math.round((a / b) * 100);

// ランニングシューズ8商品（1ページ30件ずつ）。dir＝小さめ・ちょうど・大きめ、wideDir＝そのうち「幅広」と書いた人
// 色は商品名から推した代わりの絵の色。同じ型が2ページ（UA の2つ）に分かれていた
export const SHOES = [
  { id: 'nk-rev8', name: 'ナイキ レボリューション 8', sub: 'ウィメンズ', total: 170, read: 30, rep: 8, wide: 5, dir: [9, 4, 5], wideDir: [3, 0, 1], light: [10, 0], cushion: [1, 1], wideCush: [0, 0], wideLight: [2, 0], ship: 9, col: '#2C2C2E', sole: '#F2F1EE', shop: 'A' },
  { id: 'ad-lite3', name: 'アディダス ライト レーサー 3.0', sub: '', total: 129, read: 30, rep: 2, wide: 3, dir: [2, 5, 2], wideDir: [1, 0, 1], light: [8, 0], cushion: [4, 0], wideCush: [0, 0], wideLight: [1, 0], ship: 3, col: '#ECEBE7', sole: '#FFFFFF', shop: 'B' },
  { id: 'ad-ultima', name: 'アディダス ウルティマショー', sub: '', total: 108, read: 30, rep: 2, wide: 2, dir: [3, 5, 5], wideDir: [1, 0, 2], light: [8, 0], cushion: [0, 1], wideCush: [0, 1], wideLight: [1, 0], ship: 2, col: '#3B4150', sole: '#F2F1EE', shop: 'B' },
  { id: 'nb-arishi', name: 'ニューバランス アリシ v4', sub: 'レディース', total: 108, read: 30, rep: 8, wide: 3, dir: [11, 6, 7], wideDir: [1, 2, 1], light: [12, 0], cushion: [2, 0], wideCush: [1, 0], wideLight: [0, 0], ship: 3, col: '#CFC8BB', sole: '#F4F2EE', shop: 'C' },
  { id: 'ua-cp3a', name: 'UA チャージド パスート3 EW', sub: '出品1', total: 105, read: 30, rep: 6, wide: 10, dir: [3, 3, 2], wideDir: [2, 3, 1], light: [2, 0], cushion: [1, 1], wideCush: [1, 1], wideLight: [0, 0], ship: 2, col: '#303035', sole: '#E9E7E2', shop: 'D' },
  { id: 'ua-cp3b', name: 'UA チャージド パスート3 EW', sub: '出品2', total: 103, read: 30, rep: 2, wide: 5, dir: [2, 2, 3], wideDir: [2, 0, 1], light: [8, 0], cushion: [3, 0], wideCush: [0, 0], wideLight: [2, 0], ship: 6, col: '#8D9096', sole: '#F2F1EE', shop: 'D' },
  { id: 'hk-bondi9w', name: 'ホカ ボンダイ 9 ワイド', sub: '', total: 70, read: 30, rep: 3, wide: 8, dir: [2, 2, 1], wideDir: [1, 1, 1], light: [2, 1], cushion: [4, 0], wideCush: [2, 0], wideLight: [0, 0], ship: 2, col: '#242426', sole: '#ECEBE7', shop: 'A', thick: true },
  { id: 'hk-clifton11', name: 'ホカ クリフトン 11', sub: '', total: 58, read: 30, rep: 1, wide: 2, dir: [1, 2, 1], wideDir: [0, 1, 0], light: [8, 0], cushion: [7, 0], wideCush: [1, 0], wideLight: [1, 0], ship: 7, col: '#DCE2E6', sole: '#FFFFFF', shop: 'E', thick: true },
];
// 化粧水8商品。dir＝さっぱり・しっとり、irr＝刺激（しみない等・しみた等）、sens＝敏感肌と書いた件数とその中の刺激
export const SKIN = [
  { id: 'sk-pitera', name: 'ピテラ お試しセット', note: 'セット', total: 4382, read: 30, rep: 8, gift: 8, dir: [1, 3], irr: [0, 1], sens: [0, 0, 0], oily: 0, dry: 0, col: '#C9B8A6' },
  { id: 'lmt-uruoi', name: 'ラブミータッチ URUOI 2.0', total: 3520, read: 30, rep: 10, gift: 0, dir: [6, 5], irr: [1, 3], sens: [2, 0, 2], oily: 0, dry: 0, col: '#E9E2D6' },
  { id: 'anua-dok', name: 'Anua ドクダミ トナー', total: 3111, read: 30, rep: 9, gift: 1, dir: [5, 6], irr: [0, 1], sens: [2, 0, 1], oily: 0, dry: 2, col: '#DDE5D5' },
  { id: 'tb-pre', name: 'トゥベール プレ化粧水', total: 2697, read: 30, rep: 8, gift: 0, dir: [8, 9], irr: [1, 3], sens: [2, 0, 1], oily: 7, dry: 3, col: '#E3E7EA' },
  { id: 'cl-vc100', name: 'ドクターシーラボ VC100 ローション', total: 1600, read: 30, rep: 9, gift: 1, dir: [1, 10], irr: [1, 2], sens: [2, 0, 2], oily: 0, dry: 0, col: '#F0D9B5' },
  { id: 'tb-white', name: 'トゥベール 薬用ホワイトニング', total: 1075, read: 30, rep: 9, gift: 0, dir: [4, 6], irr: [1, 1], sens: [2, 1, 0], oily: 2, dry: 1, col: '#EEEAE3' },
  { id: 'sbc-lotion', name: 'SBC メディスパ ローション', total: 851, read: 30, rep: 14, gift: 0, dir: [5, 7], irr: [2, 2], sens: [3, 1, 2], oily: 1, dry: 2, col: '#D8D4CF' },
  { id: 'retinol', name: 'レチノール化粧水', note: 'メーカー不明', total: 846, read: 30, rep: 9, gift: 1, dir: [2, 13], irr: [0, 0], sens: [1, 0, 0], oily: 1, dry: 3, col: '#E8D8C6' },
];
// コーヒー8商品。上位8のうち5が同じお店（shop:'S'）。dir＝酸味・苦味
export const COFFEE = [
  { id: 'sw-beans', name: '豆のセット', shop: 'S', total: 50197, read: 30, rep: 13, gift: 2, ship: 4, dir: [0, 0], col: '#B99A76' },
  { id: 'sw-drip6', name: 'ドリップ 6種', shop: 'S', total: 10154, read: 30, rep: 14, gift: 4, ship: 11, dir: [0, 3], col: '#C9B08D' },
  { id: 'sw-drip', name: 'ドリップパック', shop: 'S', total: 7925, read: 30, rep: 12, gift: 2, ship: 5, dir: [10, 8], col: '#A8876A' },
  { id: 'sw-mocha', name: 'モカのセット', shop: 'S', total: 6491, read: 30, rep: 14, gift: 2, ship: 12, dir: [3, 3], col: '#8F6F55' },
  { id: 'sw-drip4', name: 'ドリップ 4種', shop: 'S', total: 5484, read: 30, rep: 10, gift: 4, ship: 8, dir: [0, 2], col: '#D6C3A5' },
  { id: 'dr-5', name: 'ドリップ 5種 100杯', shop: 'T', total: 3755, read: 30, rep: 14, gift: 1, ship: 4, dir: [0, 0], col: '#7E6450' },
  { id: 'cf-200', name: '訳ありドリップ 200袋', shop: 'U', total: 3684, read: 30, rep: 9, gift: 0, ship: 12, dir: [0, 0], col: '#CDB795' },
  { id: 'dp-cap', name: 'カプセル 7箱', shop: 'V', total: 3679, read: 30, rep: 12, gift: 6, ship: 4, dir: [2, 4], col: '#3E3A36' },
];

// ---------- 計算（本物の収縮の式を使う） ----------
export const shrink = (pos, neg) => (pos + neg ? shrunkScore(pos, neg) : null);
// ちょうどよさ：小さめ(-)↔大きめ(+)。ちょうどは真ん中に引く。収縮は同じ +4
export const dirScore = ([lo, mid, hi]) => (lo + mid + hi ? (hi - lo) / (lo + mid + hi + 4) : null);
export const sum = (list, f) => list.reduce((s, x) => s + f(x), 0);
export const WIDE_TOTAL = sum(SHOES, (s) => s.wide);
export const WIDE_DIR = [0, 1, 2].map((i) => sum(SHOES, (s) => s.wideDir[i]));
export const ALL_DIR = [0, 1, 2].map((i) => sum(SHOES, (s) => s.dir[i]));
export const LIGHT = [sum(SHOES, (s) => s.light[0]), sum(SHOES, (s) => s.light[1])];
export const CUSH = [sum(SHOES, (s) => s.cushion[0]), sum(SHOES, (s) => s.cushion[1])];
export const SHOE_REP = sum(SHOES, (s) => s.rep), SHOE_SHIP = sum(SHOES, (s) => s.ship), SHOE_BEGIN = 11;

// ---------- 今の状態（段）。イヤホンは実データ、ほかは未測定 ----------
export const MAP_GATE = { minThick: 12 };

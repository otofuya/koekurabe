// 統合案の数字：最初の10カテゴリ（範囲②）と、イヤホンの実データ・3カテゴリの見本
// 一覧の数字は、楽天のカテゴリ一覧の1ページ目（標準の並び・最大45商品）を読んで数えた（2026-09-25）。本文は読んでいない
export * from '../c/datac.mjs';
import { MAPPED, neighbors, SHORT, byShort, shrink, KEYS } from '../c/datac.mjs';

// state：real＝AI の分類済み（data/）／sample＝単語の規則で数えた見本／todo＝これから読む
// listing：items 一覧の商品数・ge30 レビュー30件以上・medRev レビュー件数の中央値・medPrice 価格の中央値・shops お店の数・topShop 1店の最多
export const UNITS = [
  { key: 'earbuds', name: '完全ワイヤレスイヤホン', short: 'イヤホン', obj: 'earbuds', fam: '電気で動く', state: 'real', listing: { items: 97, ge30: 9, withRev: 45, medPrice: 9980, src: '商品価格ナビ' }, voice: ['良し悪し'], conds: ['耳が小さい', '通勤で使う'] },
  { key: 'dryer', name: 'ドライヤー', short: 'ドライヤー', obj: 'dryer', fam: '電気で動く', state: 'todo', listing: { items: 45, ge30: 40, medRev: 237, medPrice: 23100, shops: 28, topShop: 8, note: 'ヘアアイロンを含む一覧' }, voice: ['良し悪し', 'ちょうどよさ'], conds: ['髪が多い', '髪が長い'] },
  { key: 'vacuum', name: 'スティック掃除機', short: '掃除機', obj: 'vacuum', fam: '電気で動く', state: 'todo', listing: { items: 44, ge30: 35, medRev: 458, medPrice: 49800, shops: 20, topShop: 9, note: '掃除機ぜんたいの一覧' }, voice: ['良し悪し'], conds: ['ペットがいる', '一人暮らし'] },
  { key: 'lotion', name: '化粧水', short: '化粧水', obj: 'bottle', fam: '肌と髪に使う', state: 'sample', listing: { items: 44, ge30: 35, medRev: 269, medPrice: 3744, shops: 27, topShop: 6 }, voice: ['良し悪し', 'ちょうどよさ', 'また買った'], conds: ['敏感肌', '乾燥肌', '脂性肌'] },
  { key: 'shampoo', name: 'シャンプー', short: 'シャンプー', obj: 'pump', fam: '肌と髪に使う', state: 'todo', listing: null, voice: ['良し悪し', 'ちょうどよさ', 'また買った'], conds: ['くせ毛', '髪が細い'] },
  { key: 'run', name: 'ランニングシューズ', short: 'シューズ', obj: 'shoe', fam: '着る・履く', state: 'sample', listing: { items: 45, ge30: 15, medRev: 21, medPrice: 7700, shops: 11, topShop: 13 }, voice: ['良し悪し', 'ちょうどよさ'], conds: ['足幅が広い', 'はじめたばかり'] },
  { key: 'pillow', name: '枕', short: '枕', obj: 'pillow', fam: '置いて使う道具', state: 'todo', listing: null, voice: ['良し悪し', 'ちょうどよさ'], conds: ['横向きで寝る', '肩こり'] },
  { key: 'coffee', name: 'ドリップコーヒー', short: 'コーヒー', obj: 'bag', fam: '食べる・飲む', state: 'sample', listing: { items: 45, ge30: 42, medRev: 601, medPrice: 4189, shops: 14, topShop: 20 }, voice: ['ちょうどよさ', 'また買った'], conds: ['ブラック派', 'ミルクを入れる'] },
  { key: 'protein', name: 'プロテイン', short: 'プロテイン', obj: 'tub', fam: '食べる・飲む', state: 'todo', listing: { items: 45, ge30: 43, medRev: 524, medPrice: 5481, shops: 32, topShop: 4 }, voice: ['良し悪し', 'ちょうどよさ', 'また買った'], conds: ['筋トレ', 'ダイエット'] },
  { key: 'catfood', name: 'キャットフード', short: 'キャットフード', obj: 'bowl', fam: '食べる（ペット）', state: 'todo', listing: { items: 45, ge30: 40, medRev: 307, medPrice: 5957, shops: 9, topShop: 11 }, voice: ['良し悪し', 'また買った'], conds: ['シニア猫', '子猫'] },
];
export const LISTING_REQUESTS = { ok: 8, fail503: ['シャンプー', '枕'], tries: 2 };

// 画面の言葉（観点の日常語）
export const QL = { fit: 'つけ心地', anc: 'ノイキャン', ambient: '外の音', controls: '操作', value: '値段', sound: '音質', connection: 'つながり', battery: '電池', bass: '低音', calls: '通話' };

// ---------- 似ているもの（A）：起点を真ん中に、近い5つをまわりに ----------
export function reasonOf(n) {
  const same = n.diffs.filter((d) => Math.abs(d.d) < 0.15).map((d) => QL[d.k]);
  const big = n.diffs.filter((d) => Math.abs(d.d) >= 0.15).slice(0, 2).map((d) => ({ k: d.k, up: d.d > 0 }));
  return { same: same.slice(0, 2), diff: big };
}
export const reasonText = (r) => [r.same.length ? `${r.same.join('・')}は同じくらい` : '', ...r.diff.map((d) => `${QL[d.k]}はこちらが${d.up ? '好評' : '不満寄り'}`)].filter(Boolean).join('。');
export const reasonChip = (r) => (r.diff[0] ? `${QL[r.diff[0].k]} ${r.diff[0].up ? '↑' : '↓'}` : '近い');
export function egoLayout(anchorS, { w = 342, h = 360 } = {}) {
  const a = byShort[anchorS];
  const nb = neighbors(a, 5);
  const cx = w / 2, cy = h / 2, maxD = Math.max(...nb.map((n) => n.dist), 0.01);
  const pos = { [anchorS]: { x: cx, y: cy, size: 84, anchor: true } };
  nb.forEach((n, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / nb.length;
    const r = 96 + (n.dist / maxD) * 52;
    pos[n.p.s] = { x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r * 0.92, size: 56, r: reasonOf(n), dist: n.dist };
  });
  return { pos, nb };
}
export const EAR_ANCHORS = MAPPED.filter((p) => neighbors(p, 5).length >= 3).map((p) => p.s);
export { KEYS, shrink };

// 本人が選んだ欄（1ページ目30件ずつ・キャッシュから数えた）。attr＝使い道の欄に答えた人、rep＝リピート、first＝はじめて、fam＝家族へ等、gift＝贈り物、ga＝年代と性別を出した人、f40＝40代・女性
export const FIELDS = {
  'sk-pitera': { attr: 14, rep: 7, first: 7, fam: 5, gift: 3, ga: 22, f40: 5 }, 'lmt-uruoi': { attr: 17, rep: 16, first: 1, fam: 2, gift: 0, ga: 22, f40: 8 },
  'anua-dok': { attr: 18, rep: 3, first: 14, fam: 2, gift: 0, ga: 24, f40: 4 }, 'tb-pre': { attr: 12, rep: 4, first: 8, fam: 1, gift: 0, ga: 19, f40: 5 },
  'cl-vc100': { attr: 14, rep: 1, first: 13, fam: 1, gift: 0, ga: 22, f40: 9 }, 'tb-white': { attr: 7, rep: 6, first: 1, fam: 0, gift: 0, ga: 14, f40: 2 },
  'sbc-lotion': { attr: 20, rep: 15, first: 4, fam: 0, gift: 0, ga: 23, f40: 6 }, retinol: { attr: 15, rep: 9, first: 6, fam: 0, gift: 0, ga: 15, f40: 1 },
  'nk-rev8': { attr: 11, rep: 2, first: 9, fam: 2, gift: 0, ga: 17, f40: 7 }, 'ad-lite3': { attr: 12, rep: 1, first: 11, fam: 2, gift: 0, ga: 16, f40: 4 },
  'ad-ultima': { attr: 12, rep: 2, first: 9, fam: 5, gift: 2, ga: 21, f40: 5 }, 'nb-arishi': { attr: 15, rep: 0, first: 14, fam: 1, gift: 1, ga: 21, f40: 6 },
  'ua-cp3a': { attr: 10, rep: 5, first: 5, fam: 4, gift: 1, ga: 21, f40: 1 }, 'ua-cp3b': { attr: 13, rep: 2, first: 11, fam: 2, gift: 0, ga: 27, f40: 5 },
  'hk-bondi9w': { attr: 7, rep: 0, first: 7, fam: 1, gift: 0, ga: 14, f40: 1 }, 'hk-clifton11': { attr: 18, rep: 1, first: 17, fam: 2, gift: 0, ga: 22, f40: 1 },
  'sw-beans': { attr: 24, rep: 22, first: 2, fam: 12, gift: 0, ga: 27, f40: 1 }, 'sw-drip6': { attr: 17, rep: 16, first: 1, fam: 7, gift: 0, ga: 25, f40: 4 },
  'sw-drip': { attr: 18, rep: 15, first: 2, fam: 7, gift: 1, ga: 25, f40: 3 }, 'sw-mocha': { attr: 13, rep: 10, first: 3, fam: 2, gift: 0, ga: 27, f40: 1 },
  'sw-drip4': { attr: 19, rep: 11, first: 8, fam: 5, gift: 6, ga: 28, f40: 4 }, 'dr-5': { attr: 19, rep: 15, first: 4, fam: 11, gift: 2, ga: 24, f40: 4 },
  'cf-200': { attr: 17, rep: 11, first: 6, fam: 7, gift: 0, ga: 24, f40: 4 }, 'dp-cap': { attr: 20, rep: 14, first: 5, fam: 6, gift: 0, ga: 26, f40: 5 },
};
// カテゴリ全体（3カテゴリ×240件・ほか5カテゴリは1商品30件）。docs/02 第12節
export const FIELD_CATS = [
  { name: '化粧水', n: 240, ga: 161, attr: 117, rep: 61, variant: 60 },
  { name: 'ランニングシューズ', n: 240, ga: 159, attr: 98, rep: 13, variant: 178 },
  { name: 'コーヒー', n: 240, ga: 206, attr: 147, rep: 114, variant: 30 },
  { name: 'プロテイン', n: 30, ga: 14, attr: 14, rep: 10, variant: 30 },
  { name: 'ドリップコーヒー', n: 30, ga: 23, attr: 13, rep: 10, variant: 30 },
  { name: 'キャットフード', n: 30, ga: 29, attr: 9, rep: 9, variant: 0 },
  { name: 'ドライヤー', n: 30, ga: 15, attr: 17, rep: 2, variant: 16 },
  { name: '掃除機', n: 30, ga: 13, attr: 19, rep: 1, variant: 0 },
  { name: 'イヤホン（商品価格ナビ）', n: 8, ga: 5, attr: 0, rep: 0, variant: 0, navi: true },
];

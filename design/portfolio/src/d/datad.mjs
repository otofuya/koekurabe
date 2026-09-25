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

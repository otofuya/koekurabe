// ポートフォリオに載せる数字は、すべて data/ から計算する（見本の数字を作らない）
// 判断は lib/aspect-model.ts（本物の純粋関数）をそのまま使う
import { readFileSync } from 'fs';
import { offerableAxes, axisPairs, quadrantPoints, shrunkScore, coverageOf } from '../../../lib/aspect-model.ts';
import { CATEGORY_DEFINITIONS } from '../../../lib/category-definitions.ts';

const root = new URL('../../../', import.meta.url);
const aspectsJson = JSON.parse(readFileSync(new URL('data/genre-aspects.json', root), 'utf8'));
const productsJson = JSON.parse(readFileSync(new URL('data/genre-products.json', root), 'utf8'));
const genre = aspectsJson.genres[0];
export const DEFS = CATEGORY_DEFINITIONS.earbuds.aspects;
export const LABEL = Object.fromEntries(DEFS.map((d) => [d.key, d.label]));
export const SHORT = { sound: '音質', bass: '低音', fit: '装着感', anc: 'ノイキャン', ambient: '外音取り込み', battery: '電池', connection: '接続', controls: '操作', calls: '通話', value: '値段' };
export const POLE = Object.fromEntries(DEFS.map((d) => [d.key, { pos: d.positivePole, neg: d.negativePole }]));
export const KEYS = DEFS.map((d) => d.key);

// 表示名（楽天の商品名は長い。ポートフォリオでは短い名前で描く）
const NAME = {
  '637e1dd6': ['soundcore Liberty 4', 'Anker'],
  e89650d6: ['AUKEY EP-T21S', 'AUKEY'],
  d5f259d1: ['EarFun Air Pro 3', 'EarFun'],
  '821de2ea': ['Sony WF-C710N', 'Sony'],
  e7e3a226: ['Victor HA-A20T', 'JVC'],
  '2a5f9d61': ['NUARL N10 Pro', 'NUARL'],
  cd6a9906: ['Bose Ultra Open Earbuds', 'Bose'],
  '43c9394e': ['Bose QC Earbuds', 'Bose'],
  cb0101de: ['AUKEY EP-T27', 'AUKEY'],
  b41c556d: ['EarFun Air Pro 3（青）', 'EarFun'],
  '0858ede7': ['Sony LinkBuds', 'Sony'],
  ecb1d7cb: ['QCY T13', 'QCY'],
  f8e292b2: ['Galaxy Buds4 Pro', 'Samsung'],
  '2ef86843': ['Galaxy Buds3 Pro', 'Samsung'],
  '97550cef': ['GLIDiC TW-3000', 'GLIDiC'],
  de48fc4d: ['GLIDiC TW-3000（別色）', 'GLIDiC'],
  '59e2037e': ['Shokz OpenFit Pro', 'Shokz'],
  e3e9d2fc: ['Sony WF-1000XM5', 'Sony'],
  e41a54fa: ['Noble FoKus Rex5', 'Noble Audio'],
  '2cea7b9f': ['acoustune HSX1001', 'acoustune'],
  '992396b4': ['Bose Ultra Open（青）', 'Bose'],
  '78177f27': ['Technics EAH-AZ60M2', 'Technics'],
  '165b2aac': ['JBL Tour Pro 2', 'JBL'],
  '463cfbcf': ['Cleer ARC 5', 'Cleer'],
  f06092ae: ['Bose Ultra Open（紫）', 'Bose'],
  f91aa1ca: ['Yamaha TW-E3C', 'Yamaha'],
};
// 色違い・別出品（02 第10節、未解決）。この案では手でまとめ、レビューが最も多い出品を代表にする
// 合算はしない（同じレビューが両方に出ている可能性があるため）
export const VARIANTS = { d5f259d1: ['b41c556d'], cd6a9906: ['992396b4', 'f06092ae'], '97550cef': ['de48fc4d'] };
const HIDDEN = new Set(Object.values(VARIANTS).flat());

const byId = new Map(productsJson.products.map((p) => [p.productId, p]));
const short = (id) => id.slice(0, 8);

export const ALL = genre.products.map((a) => {
  const raw = byId.get(a.productId);
  const s = short(a.productId);
  const t = Object.fromEntries(a.aspects.map((x) => [x.key, x]));
  const pos = Object.fromEntries(KEYS.map((k) => [k, t[k]?.positive ?? 0]));
  const neg = Object.fromEntries(KEYS.map((k) => [k, t[k]?.negative ?? 0]));
  const tot = KEYS.reduce((sum, k) => sum + pos[k] + neg[k], 0);
  const read = a.reviewsRead;
  return {
    id: a.productId, s, name: NAME[s]?.[0] ?? raw.name, brand: NAME[s]?.[1] ?? raw.brand,
    price: raw.price, reviewCount: raw.reviewCount, read, tot, pos, neg, raw: a,
    variants: (VARIANTS[s] ?? []).length,
    thick: read >= 30 ? 'thick' : read >= 10 ? 'mid' : 'thin',
    open: raw.specs?.find((x) => x.key === 'openEar')?.value === true,
    ancSpec: raw.specs?.find((x) => x.key === 'anc')?.value,
    jan: raw.jan,
  };
});
export const P = ALL.filter((p) => !HIDDEN.has(p.s));
export const HIDDEN_COUNT = HIDDEN.size;
export const byShort = Object.fromEntries(ALL.map((p) => [p.s, p]));

// ---------- 数え方の実数 ----------
const beforeDedup = genre.products.reduce((s, p) => s + (p.dedup?.totalBeforeDedup ?? 0), 0);
const dupRemoved = genre.products.reduce((s, p) => s + (p.dedup?.duplicatesRemoved ?? 0), 0);
const quotes = genre.products.flatMap((p) => p.aspects.flatMap((t) => t.quotes)).length;
const aspectProducts = genre.products.map((p) => ({ id: p.productId, reviewsRead: p.reviewsRead, aspects: p.aspects }));
const cov = coverageOf(productsJson.products.length, aspectProducts);
const tallies = genre.products.flatMap((p) => p.aspects);
export const STATS = {
  total: productsJson.products.length,
  withReviews: productsJson.products.filter((p) => p.reviewCount > 0).length,
  noReviews: productsJson.products.filter((p) => p.reviewCount === 0).length,
  analysed: cov.analysed,
  read: cov.reviewsRead,
  beforeDedup, dupRemoved, quotes,
  tallies: tallies.length,
  bothSides: tallies.filter((t) => t.positive > 0 && t.negative > 0).length,
  thin: genre.products.filter((p) => p.reviewsRead < 10).length,
  top4share: Math.round(genre.products.map((p) => p.reviewsRead).sort((a, b) => b - a).slice(0, 4).reduce((a, b) => a + b, 0) / cov.reviewsRead * 100),
  generatedAt: productsJson.generatedAt.slice(0, 10),
  mapped: 0, // 下で埋める
};

export const AXES = offerableAxes(aspectProducts, DEFS);
export const PAIRS = axisPairs(AXES, aspectProducts);

// ---------- 地図の位置（案：褒められ方と不満の出方が似ているほど近い） ----------
// 1商品 = 観点ごとの「満足の割合」「不満の割合」20個。件数が少ないほど中央へ寄せる（収縮 +4）
const K = 4;
const vec = (p) => [...KEYS.map((k) => p.pos[k] / (p.tot + K)), ...KEYS.map((k) => p.neg[k] / (p.tot + K))];
function pca(X, n = 2) {
  const rows = X.length, d = X[0].length;
  const mean = Array(d).fill(0);
  X.forEach((r) => r.forEach((v, j) => (mean[j] += v / rows)));
  const Cx = X.map((r) => r.map((v, j) => v - mean[j]));
  const cov = Array.from({ length: d }, (_, i) => Array.from({ length: d }, (_, j) => Cx.reduce((s, r) => s + r[i] * r[j], 0) / (rows - 1)));
  const trace = cov.reduce((s, r, i) => s + r[i], 0);
  let M = cov.map((r) => r.slice());
  const comps = [];
  for (let c = 0; c < n; c++) {
    let v = Array(d).fill(0).map((_, i) => Math.cos(i * 1.7 + c));
    for (let it = 0; it < 1000; it++) {
      const w = M.map((r) => r.reduce((s, x, j) => s + x * v[j], 0));
      const nr = Math.hypot(...w) || 1;
      v = w.map((x) => x / nr);
    }
    const lam = v.reduce((s, vi, i) => s + vi * M[i].reduce((t, x, j) => t + x * v[j], 0), 0);
    comps.push({ v, ratio: lam / trace });
    M = M.map((r, i) => r.map((x, j) => x - lam * v[i] * v[j]));
  }
  return { comps, proj: Cx.map((r) => comps.map((c) => r.reduce((s, x, j) => s + x * c.v[j], 0))) };
}
const onMap = P.filter((p) => p.tot > 0);
const pc = pca(onMap.map(vec));
// 向きをそろえる：ノイキャンの満足が上、値段の満足が右へ来るように符号を決める
const idx = (key, side) => (side === 'pos' ? 0 : KEYS.length) + KEYS.indexOf(key);
if (pc.comps[1].v[idx('anc', 'pos')] < 0) { pc.comps[1].v = pc.comps[1].v.map((x) => -x); pc.proj.forEach((r) => (r[1] = -r[1])); }
if (pc.comps[0].v[idx('value', 'pos')] < 0) { pc.comps[0].v = pc.comps[0].v.map((x) => -x); pc.proj.forEach((r) => (r[0] = -r[0])); }
// 言及が少ない商品ほど中央へ（地図でも「証拠が多いほど外側」を守る。4件の商品が端に来ないように）
const EVIDENCE = 20;
const pulled = pc.proj.map((r, i) => { const f = onMap[i].tot / (onMap[i].tot + EVIDENCE); return [r[0] * f, r[1] * f]; });
const maxAbs = Math.max(...pulled.flat().map(Math.abs));
onMap.forEach((p, i) => { p.mx = pulled[i][0] / maxAbs; p.my = pulled[i][1] / maxAbs; });
STATS.mapped = onMap.length;
STATS.pcRatio = Math.round((pc.comps[0].ratio + pc.comps[1].ratio) * 100);
export const MAPPED = onMap;
export const OFFMAP = P.filter((p) => p.tot === 0);
// 方位（観点の矢印）：満足側の向きだけ、強いもの4つ
export const COMPASS = KEYS.map((k) => {
  const i = idx(k, 'pos');
  const x = pc.comps[0].v[i], y = pc.comps[1].v[i];
  return { key: k, label: SHORT[k], x, y, len: Math.hypot(x, y) };
}).sort((a, b) => b.len - a.len).slice(0, 4);

// 測定：同じブランドが近くに集まっていないか（前身の UMAP は 29.9%、偶然なら 4.2%）
function sameBrandRate(list, k = 3) {
  let same = 0, tot = 0;
  list.forEach((a) => {
    list.filter((b) => b !== a).map((b) => [b, Math.hypot(a.mx - b.mx, a.my - b.my)]).sort((x, y) => x[1] - y[1]).slice(0, k)
      .forEach(([b]) => { tot++; if (b.brand === a.brand) same++; });
  });
  return same / tot;
}
function brandChance(list) {
  let same = 0, tot = 0;
  list.forEach((a, i) => list.forEach((b, j) => { if (i !== j) { tot++; if (a.brand === b.brand) same++; } }));
  return same / tot;
}
STATS.sameBrand = Math.round(sameBrandRate(onMap) * 100);
STATS.brandChance = Math.round(brandChance(onMap) * 100);

// ---------- 2つの観点で並べる（今の四象限。本物の関数で） ----------
export function quad(xKey, yKey) {
  const list = P.map((p) => ({ id: p.s, reviewsRead: p.read, aspects: p.raw.aspects }));
  const { points, unspoken } = quadrantPoints(list, xKey, yKey);
  return { points: points.map((pt) => ({ ...pt, p: byShort[pt.id] })), unspoken: unspoken.map((s) => byShort[s]) };
}
export const score = (p, k) => (p.pos[k] + p.neg[k] ? shrunkScore(p.pos[k], p.neg[k]) : null);

// ---------- 似ているもの（起点からの近さと、違う観点） ----------
export function neighbors(anchor, n = 5) {
  return MAPPED.filter((p) => p !== anchor).map((p) => {
    let s = 0, w = 0, same = 0, both = 0;
    const diffs = [];
    for (const k of KEYS) {
      const ma = anchor.pos[k] + anchor.neg[k], mb = p.pos[k] + p.neg[k];
      if (!ma || !mb) continue;
      both++;
      const d = score(p, k) - score(anchor, k);
      const wt = Math.min(ma, mb) / (Math.min(ma, mb) + 2);
      s += wt * d * d; w += wt;
      if (Math.abs(d) < 0.15) same++;
      diffs.push({ k, d });
    }
    return { p, dist: w >= 1 ? Math.sqrt(s / w) : Infinity, both, same, diffs: diffs.sort((x, y) => Math.abs(y.d) - Math.abs(x.d)) };
  }).filter((x) => Number.isFinite(x.dist)).sort((a, b) => a.dist - b.dist).slice(0, n);
}

// ---------- 引用（データに満足・不満の区別が無いので、表示する分だけ手で分けた見本） ----------
export const Q = {
  '821de2ea': {
    fit: { pos: '耳から簡単に落ちる事もなく快適に使えています。', neg: '私の右耳にフィットしないので、じっとしてても度々落とすことです。' },
    anc: { pos: 'ノイズキャンセリングが優秀なところです。', neg: '右の方だけずっとノイキャン時も音楽時でも不規則にポコポコ？カタカナ？音が鳴ります。' },
    battery: { pos: 'バッテリーの長さも申し分ありません。', neg: '充電の減りは結構早い気がします。' },
    connection: { pos: '一度接続すると次使う時にすぐ接続されるから便利', neg: '毎回接続設定しないといけないのだるすぎ。' },
    value: { pos: 'このお値段でしっかりノイキャンがききます。', neg: null },
    sound: { pos: '音質は良いです。', neg: null },
    controls: { pos: '使い勝手もすごく良くて', neg: null },
  },
  '637e1dd6': {
    fit: { pos: '耳も痛くならないし', neg: null },
    anc: { pos: 'ノイキャンが優れているので', neg: null },
    connection: { pos: '通信も安定しているのがわかります', neg: '音飛びが結構します。' },
    calls: { pos: null, neg: '通話時に相手から声がこもっていると一度言われた' },
  },
  '0858ede7': {
    fit: { pos: 'つけてる感覚がなくとても良いです', neg: 'やっぱり痛くなる' },
    connection: { pos: 'すぐに繋がる', neg: '左側がまったく接続しない' },
  },
  d5f259d1: {
    anc: { pos: 'ノイキャン切っても遮音性高い', neg: '思っていたほどの効果は感じられず' },
    fit: { pos: 'フィット感も良く、装着を感じさせない自然さも気に入ってる', neg: null },
    controls: { pos: null, neg: 'イヤホンのタッチ操作の反応はもう少し改善の余地がある' },
  },
  cd6a9906: {
    fit: { pos: 'フィット感も良い', neg: 'やや耳がいたい' },
    anc: { pos: null, neg: '外の音がうるさ過ぎて綺麗な音が台無し' },
  },
  e7e3a226: {
    fit: { pos: '片耳約4.2gととにかく軽いため、長時間の着用でも耳が痛くなりにくく快適です。', neg: null },
    connection: { pos: '簡単に接続出来て', neg: '途中で片耳だけ途切れたりして不安定になることが頻回だと感じます。' },
  },
};

// ---------- その他の表示用 ----------
export const maxCount = (p) => Math.max(...KEYS.map((k) => Math.max(p.pos[k], p.neg[k])));
export const yen = (n) => `¥${n.toLocaleString('ja-JP')}`;
export function verdictOf(p, min = 2) {
  const lines = KEYS.map((k) => ({ k, pos: p.pos[k], neg: p.neg[k], tot: p.pos[k] + p.neg[k] })).filter((l) => l.tot >= min);
  return {
    praised: lines.filter((l) => l.pos > l.neg).sort((a, b) => b.pos - a.pos),
    blamed: lines.filter((l) => l.neg > 0).sort((a, b) => b.neg - a.neg),
  };
}
// 観点ごとの「迷わなくていい」：言及は多いが差が出ない観点
export const SAME = AXES.filter((a) => !a.offerable && a.products >= 12 && a.separation < 0.35);

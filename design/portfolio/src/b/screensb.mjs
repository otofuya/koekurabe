// 別案Bの画面（スマホ 390×844・PC 1440×900）。数字は data/ の実データ
import { C, F, SH, art, node, gauge, icon, num, sup, label, pill, roundBtn, iconBtn, aiNote, floatTab, searchPill, mark, esc, ASPECT_ICON } from './libb.mjs';
import { imageMap, wheel, mosaic, bundle, shelfGroups, positions, WHEEL } from './mapb.mjs';
import { P, MAPPED, STATS, AXES, SHORT, LABEL, POLE, KEYS, byShort, Q, yen, verdictOf, neighbors, score, SAME } from '../data.mjs';

const W = 390, H = 844;
const scr = (inner, { dark = false } = {}) => `<div style="position:relative; width:${W}px; height:${H}px; overflow:hidden; background:${dark ? C.dark : C.bg}; font-family:${F.jp}; color:${dark ? C.darkInk : C.ink};">${inner}</div>`;
const at = (x, y, html, { w = 0, z = 2 } = {}) => `<div style="position:absolute; left:${x}px; top:${y}px;${w ? ` width:${w}px;` : ''} z-index:${z};">${html}</div>`;
const WFC = byShort['821de2ea'], LIB = byShort['637e1dd6'];
const sumPos = (p) => KEYS.reduce((a, k) => a + p.pos[k], 0), sumNeg = (p) => KEYS.reduce((a, k) => a + p.neg[k], 0);

// 大きな数字のカード（好き10）
const statCard = (big, small, { w = 160, bg = C.tile, color = C.ink, extra = '' } = {}) => `<div style="width:${w}px; box-sizing:border-box; padding:16px; border-radius:22px; background:${bg}; display:flex; flex-direction:column; gap:4px;">${extra}<div style="font-family:${F.num}; font-weight:600; font-size:38px; line-height:1; letter-spacing:-.02em; color:${color};">${big}</div><div style="font-size:12px; color:${C.ink2}; line-height:1.4;">${small}</div></div>`;

// 観点の半円ゲージを大きく（数字つき）
export function bigGauge(pos, neg, { size = 150, read } = {}) {
  return `<div style="position:relative; width:${size + 30}px; height:${size / 2 + 50}px;"><div style="position:absolute; left:15px; top:15px; width:${size}px; height:${size}px;">${gauge(pos, neg, { size, sw: 10, gap: 0 })}</div><div style="position:absolute; left:0; right:0; top:${size / 2 - 16}px; text-align:center;"><div style="font-family:${F.num}; font-weight:600; font-size:30px; line-height:1;">${num(neg, { size: 30, w: 600, color: C.negText })}<span style="color:${C.faint}; font-weight:300;"> / </span>${num(pos, { size: 30, w: 600, color: C.satText })}</div><div style="font-size:11px; color:${C.muted}; margin-top:6px; white-space:nowrap;">不満 / 満足（読んだ${read}件）</div></div></div>`;
}

// ==========================================================================
// B01 ホーム：棚のタイル（好き5・6）
// ==========================================================================
const SHELVES = [
  ['完全ワイヤレスイヤホン', true, '637e1dd6'], ['ヘッドホン', false], ['ドライヤー', false], ['電動歯ブラシ', false], ['ロボット掃除機', false], ['枕', false],
];
const WORRY = [['耳が痛くならない', 'fit', 14], ['静かになる', 'anc', 15], ['周りの音が聞こえる', 'ambient', 11], ['操作に迷わない', 'controls', 17], ['値段に納得', 'value', 17]];
export function bHome() {
  const fit = AXES.find((a) => a.key === 'fit');
  let s = at(24, 58, `<div style="width:342px; display:flex; justify-content:space-between; align-items:center;">${mark(16)}${iconBtn('bell', 'お知らせ', { size: 40 })}</div>`);
  s += at(24, 118, `<div style="font-family:${F.jp}; font-weight:900; font-size:36px; line-height:1.18; letter-spacing:-.01em;">何を<br>くらべる？</div>`);
  s += at(24, 222, searchPill('悩みや商品名で探す'));
  s += at(24, 294, `<div style="width:342px; display:flex; justify-content:space-between; align-items:baseline;"><span style="font-size:17px; font-weight:700;">耳と音</span>${label('shelf 01')}</div>`);
  s += at(24, 326, `<div style="width:342px; display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:10px;">
<a href="#" style="grid-column:span 2; height:150px; border-radius:24px; background:${C.tile}; position:relative; overflow:hidden; text-decoration:none; color:${C.ink}; display:block;"><div style="position:absolute; left:18px; top:16px;"><div style="font-size:16px; font-weight:700;">完全ワイヤレスイヤホン</div><div style="font-size:12px; color:${C.ink2}; margin-top:4px;">${STATS.analysed}商品の声・のべ${STATS.read}件</div></div><div style="position:absolute; right:-6px; bottom:-10px; display:flex; align-items:flex-end;">${art('821de2ea', 96)}${art('637e1dd6', 112)}${art('d5f259d1', 88)}</div></a>
${SHELVES.slice(1, 3).map(([t]) => `<div style="height:112px; border-radius:24px; background:#F7F7F6; border:1px solid ${C.hair}; box-sizing:border-box; padding:14px 16px; display:flex; flex-direction:column; justify-content:space-between;"><span style="font-size:14px; font-weight:700; color:${C.muted};">${t}</span>${label('準備中', { color: C.faint })}</div>`).join('')}
</div>`);
  s += at(24, 612, `<div style="width:342px; display:flex; flex-direction:column; gap:10px;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><span style="font-size:17px; font-weight:700;">悩みから</span>${label('ワイヤレスイヤホン')}</div><div style="display:flex; flex-wrap:wrap; gap:8px;">${WORRY.slice(0, 3).map(([t, k, n]) => `<span style="display:inline-flex; align-items:center; gap:6px; height:38px; padding:0 14px; border-radius:19px; background:${C.tile}; font-size:13px; font-weight:700;">${icon(ASPECT_ICON[k], { size: 16 })}${t}${sup(n)}</span>`).join('')}</div></div>`);
  s += floatTab(0);
  return scr(s);
}

// ==========================================================================
// B02 ジャンル：読めた商品と、空のタイル（好き9）
// ==========================================================================
export function bGenre() {
  const m = mosaic({ cols: 10, cell: 29, gap: 5 });
  let s = at(24, 56, `<div style="width:342px; display:flex; align-items:center; gap:10px;">${iconBtn('back', '戻る', { size: 40 })}${label('earbuds')}</div>`);
  s += at(24, 110, `<div style="font-family:${F.jp}; font-weight:900; font-size:28px; line-height:1.25;">完全ワイヤレス<br>イヤホン</div>`);
  s += at(24, 196, `<div style="display:flex; align-items:baseline; gap:10px;"><span style="font-family:${F.num}; font-weight:600; font-size:52px; letter-spacing:-.03em; line-height:1;">${STATS.analysed}</span><span style="font-family:${F.num}; font-size:24px; color:${C.faint};">/ ${STATS.total}</span><span style="font-size:13px; color:${C.ink2}; margin-left:6px;">商品の声を<br>読めています</span></div>`);
  s += at(24, 274, m.html);
  s += at(24, 630, `<div style="width:342px; display:flex; gap:16px; font-size:12px; color:${C.ink2};"><span style="display:flex; align-items:center; gap:6px;"><span style="width:14px; height:14px; border-radius:5px; background:${C.tile};"></span>絵＝声を読めた</span><span style="display:flex; align-items:center; gap:6px;"><span style="width:14px; height:14px; border-radius:5px; background:#F7F7F6; border:1px solid ${C.hair}; box-sizing:border-box;"></span>空き＝まだ読めていない</span></div>`);
  s += at(24, 662, `<div style="width:342px; font-size:12px; color:${C.muted}; line-height:1.6;">空きのタイルを押すと商品名が出る。読めていないことは「悪い」ではない</div>`);
  s += at(24, 722, `<div style="width:342px; display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:10px;">${pill('地図で見る', { ic: 'map', h: 50, fs: 14 })}${pill('一覧', { kind: 'light', ic: 'list', h: 50, fs: 14 })}</div>`);
  return scr(s);
}

// ==========================================================================
// B03〜B05 地図
// ==========================================================================
const mapHead = (sub = '', { dark = false } = {}) => at(0, 0, `<div style="width:${W}px; padding:52px 24px 14px; box-sizing:border-box; background:linear-gradient(${dark ? C.dark : C.map} 68%, ${dark ? 'rgba(18,19,20,0)' : 'rgba(246,246,245,0)'}); display:flex; align-items:center; gap:12px;">${iconBtn('back', '戻る', { size: 40, bg: dark ? C.dark2 : '#fff', color: dark ? C.darkInk : C.ink })}<div style="min-width:0;"><div style="font-weight:900; font-size:18px;">完全ワイヤレスイヤホン</div><div style="font-size:11px; color:${dark ? '#A0A0A0' : C.muted}; margin-top:2px;">${sub}</div></div></div>`, { z: 20 });

export function bMap() {
  let s = `<div style="position:absolute; inset:0;">${imageMap({ w: W, h: H, top: 104, bottom: 250, min: 34, max: 62 })}</div>`;
  s += mapHead(`いちばん声が近い商品と点線でつなぐ。${STATS.mapped}商品`);
  s += wheel({ sel: null, baseY: 648 });
  s += at(0, 548, `<div style="width:${W}px; display:flex; justify-content:center;"><span style="display:flex; align-items:center; gap:8px; height:34px; padding:0 14px; border-radius:17px; background:#fff; box-shadow:${SH.soft}; font-size:12px; font-weight:700;">${icon('ear', { size: 16 })}下の輪を回すと、声が見える</span></div>`, { z: 20 });
  s += floatTab(0);
  return scr(s);
}

export function bLens() {
  const k = 'fit';
  const none = MAPPED.filter((p) => p.pos[k] + p.neg[k] === 0).length;
  let s = `<div style="position:absolute; inset:0;">${imageMap({ w: W, h: H, top: 140, bottom: 250, lens: k, min: 34, max: 60 })}</div>`;
  s += mapHead(`装着感で見ています`);
  s += at(24, 108, `<div style="display:flex; align-items:center; gap:12px; font-size:11px; color:${C.ink2}; white-space:nowrap;"><span style="display:flex; align-items:center; gap:5px;"><span style="width:16px; height:4px; background:${C.neg};"></span>${POLE[k].neg}</span><span style="display:flex; align-items:center; gap:5px;"><span style="width:16px; height:4px; background:${C.sat};"></span>${POLE[k].pos}</span><span>薄い＝ふれていない ${none}</span></div>`, { z: 20 });
  s += wheel({ sel: k, baseY: 648 });
  s += floatTab(0);
  return scr(s);
}

export function bPeek() {
  const p = WFC, k = 'fit';
  let s = `<div style="position:absolute; inset:0;">${imageMap({ w: W, h: 470, top: 110, bottom: 0, lens: k, sel: p.s, min: 30, max: 54 })}</div>`;
  s += mapHead('点線が太い＝声が近い5つ');
  s += at(0, 440, `<div style="width:${W}px; height:404px; box-sizing:border-box; padding:12px 24px 0; background:#fff; border-radius:30px 30px 0 0; box-shadow:${SH.sheet};"><div style="width:40px; height:5px; border-radius:3px; background:${C.tile2}; margin:0 auto 14px;"></div>
<div style="display:flex; gap:14px; align-items:center;">${node(p.s, { size: 64 })}<div style="min-width:0;"><div style="font-size:19px; font-weight:700;">${esc(p.name)}</div><div style="margin-top:3px; font-size:12px; color:${C.ink2};">${num(yen(p.price), { size: 14 })}　レビュー${p.reviewCount}件のうち${p.read}件を読んだ</div></div></div>
<div style="margin-top:14px; display:flex; align-items:center; gap:18px;">${bigGauge(p.pos.fit, p.neg.fit, { size: 128, read: p.read })}<div style="display:flex; flex-direction:column; gap:6px;"><div style="font-size:14px; font-weight:700;">装着感</div>${aiNote()}<div style="font-size:12px; color:${C.ink2};">ほかの不満：電池 ${p.neg.battery}・ノイキャン ${p.neg.anc}</div></div></div>
<div style="margin-top:14px; display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:8px;">${pill('詳しく', { h: 46, fs: 13 })}${pill('声の束', { kind: 'light', h: 46, fs: 13, ic: 'stack' })}${pill('くらべる', { kind: 'light', h: 46, fs: 13, ic: 'plus' })}</div>
</div>`, { z: 25 });
  return scr(s);
}

// ==========================================================================
// B06 商品（好き2・3・10）
// ==========================================================================
export function bProduct() {
  const p = WFC;
  const v = verdictOf(p);
  let s = `<div style="position:absolute; left:0; top:0; width:${W}px; height:380px; background:${C.tile};"></div>`;
  s += at(24, 56, `<div style="width:342px; display:flex; justify-content:space-between;">${iconBtn('back', '戻る', { size: 40, bg: '#fff' })}<div style="display:flex; gap:8px;">${iconBtn('save', '保存', { size: 40, bg: '#fff' })}${iconBtn('share', '共有', { size: 40, bg: '#fff' })}</div></div>`);
  s += at(75, 104, art(p.s, 240));
  s += at(24, 330, `<div style="display:flex; gap:6px;">${['●', '○', '○'].map((c, i) => `<span style="width:6px; height:6px; border-radius:50%; background:${i ? C.tile2 : C.ink};"></span>`).join('')}</div>`);
  s += at(24, 400, `<div style="width:342px; display:flex; justify-content:space-between; align-items:flex-start;"><div>${label(p.brand)}<div style="font-weight:900; font-size:26px; margin-top:6px;">${esc(p.name)}</div><div style="margin-top:6px;">${num(yen(p.price), { size: 20, w: 500 })}<span style="font-size:11px; color:${C.muted};">　${STATS.generatedAt}時点</span></div></div></div>`);
  s += at(24, 508, `<div style="width:342px; display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:10px;">
${statCard(`${p.read}`, `読んだレビュー<br>（${p.reviewCount}件のうち）`, { w: 166 })}
${statCard(`${v.blamed[0].neg}`, `いちばん多い不満<br>${LABEL[v.blamed[0].k]}（満足${v.blamed[0].pos}）`, { w: 166, bg: C.negSoft, color: C.negText })}
</div>`);
  s += at(24, 672, `<div style="width:342px; display:flex; align-items:center; justify-content:space-between; gap:14px;"><div style="font-size:12px; color:${C.ink2}; line-height:1.6;"><b style="color:${C.ink};">迷わなくていい：音質</b><br>${SAME[0].products}商品がふれ、ほぼ全員が満足</div>${roundBtn('買う', { size: 76 })}</div>`);
  return scr(s);
}

// ==========================================================================
// B07 声の束（好き11）
// ==========================================================================
export function bBundle() {
  const p = WFC, k = 'fit';
  const list = KEYS.filter((x) => p.pos[x] + p.neg[x] > 0).sort((a, b) => p.neg[b] - p.neg[a]);
  let s = at(24, 56, `<div style="width:342px; display:flex; align-items:center; gap:10px;">${iconBtn('back', '戻る', { size: 40 })}<div><div style="font-weight:900; font-size:18px;">声の束</div><div style="font-size:11px; color:${C.muted};">${esc(p.name)}・読んだ${p.read}件を1枚ずつ</div></div></div>`);
  s += at(12, 128, `<div style="position:relative; width:366px; height:300px;">${bundle({ read: p.read, pos: p.pos[k], neg: p.neg[k], w: 366, h: 300, pop: 3 })}</div>`);
  // 抜き出した1枚（不満の引用）
  s += at(150, 150, `<div style="width:210px; box-sizing:border-box; padding:14px; border-radius:18px; background:#fff; box-shadow:${SH.lift}; display:flex; flex-direction:column; gap:8px;"><div style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:700; color:${C.negText};"><span style="width:12px; height:4px; background:${C.neg};"></span>装着感・不満</div><div style="font-size:13px; line-height:1.6;">「${esc(Q['821de2ea'].fit.neg)}」</div><div style="font-size:11px; color:${C.muted}; text-decoration:underline;">楽天のレビューで確かめる</div></div>`, { z: 5 });
  s += at(24, 446, `<div style="width:342px; display:flex; gap:16px; font-size:12px; color:${C.ink2};"><span style="display:flex; align-items:center; gap:5px;"><span style="width:14px; height:14px; background:${C.neg}; border-radius:3px;"></span>不満 ${p.neg[k]}</span><span style="display:flex; align-items:center; gap:5px;"><span style="width:14px; height:14px; background:${C.sat}; border-radius:3px;"></span>満足 ${p.pos[k]}</span><span style="display:flex; align-items:center; gap:5px;"><span style="width:14px; height:14px; background:#E4E4E1; border-radius:3px;"></span>ふれていない</span></div>`);
  s += at(24, 486, `<div style="width:342px; display:flex; flex-direction:column;">${list.slice(0, 6).map((x) => `<div style="display:flex; justify-content:space-between; align-items:center; padding:11px 0; border-bottom:1px solid ${C.hair};"><span style="display:flex; align-items:center; gap:8px; font-size:14px; font-weight:${x === k ? 700 : 500};">${x === k ? `<span style="width:6px; height:6px; border-radius:50%; background:${C.ink};"></span>` : '<span style="width:6px;"></span>'}${LABEL[x]}</span><span style="font-size:13px;">${num(p.neg[x], { size: 14, color: C.negText })}<span style="color:${C.faint};"> / </span>${num(p.pos[x], { size: 14, color: C.satText })}</span></div>`).join('')}</div>`);
  s += at(24, 790, `<div style="width:342px; font-size:11px; color:${C.muted};">本文は載せない。原文と照合できた短い引用だけを、板を押すと出す</div>`);
  return scr(s);
}

// ==========================================================================
// B08 似ているもの（好き7）
// ==========================================================================
export function bSimilar() {
  const a = WFC;
  const nb = neighbors(a, 5);
  const cx = W / 2, cy = 330;
  let s = at(24, 56, `<div style="width:342px; display:flex; align-items:center; gap:10px;">${iconBtn('back', '戻る', { size: 40 })}<div><div style="font-weight:900; font-size:18px;">似ているもの</div><div style="font-size:11px; color:${C.muted};">声が近い5つ。線の近さ＝声の近さ</div></div></div>`);
  let g = `<svg width="${W}" height="520" aria-hidden="true" style="position:absolute; left:0; top:0;">`;
  const maxD = Math.max(...nb.map((n) => n.dist));
  const pts = nb.map((n, i) => { const ang = -Math.PI / 2 + (i * 2 * Math.PI) / nb.length + 0.3; const r = 104 + 56 * (n.dist / maxD); return { n, x: cx + Math.cos(ang) * r, y: cy - 60 + Math.sin(ang) * r }; });
  for (const q of pts) g += `<path d="M${cx} ${cy - 60} L${q.x.toFixed(1)} ${q.y.toFixed(1)}" stroke="${C.ink}" stroke-width="1.4" stroke-dasharray="2 4" stroke-linecap="round"></path>`;
  g += '</svg>';
  let h = g;
  for (const q of pts) {
    const up = q.n.diffs.find((d) => d.d > 0.1), dn = q.n.diffs.find((d) => d.d < -0.1);
    h += `<div style="position:absolute; left:${Math.round(q.x - 30)}px; top:${Math.round(q.y - 30)}px;">${node(q.n.p.s, { size: 60, thick: q.n.p.thick })}</div><div style="position:absolute; left:${Math.round(Math.min(W - 124, Math.max(4, q.x - 60)))}px; top:${Math.round(q.y + 34)}px; width:120px; text-align:center; font-size:11px; line-height:1.35;"><b style="font-size:12px;">${esc(q.n.p.name)}</b><br>${up ? `<span style="color:${C.satText};">${SHORT[up.k]}の満足↑</span>` : ''}${dn ? `<br><span style="color:${C.negText};">${SHORT[dn.k]}の不満↑</span>` : ''}</div>`;
  }
  h += `<div style="position:absolute; left:${cx - 48}px; top:${cy - 108}px;">${node(a.s, { size: 96, sel: true })}</div>`;
  s += at(0, 110, `<div style="position:relative; width:${W}px; height:520px; background:${C.map};">${h}</div>`);
  s += at(24, 648, `<div style="width:342px; font-size:12px; color:${C.ink2}; line-height:1.6;">比べたのは両方がふれている観点だけ。点線の輪の商品は声が少なく、近さは仮</div>`);
  s += floatTab(0);
  return scr(s);
}

// ==========================================================================
// B09 くらべる（好き2）
// ==========================================================================
export function bCompare() {
  const a = WFC, b = LIB;
  const rows = KEYS.map((k) => { const m = Math.min(a.pos[k] + a.neg[k], b.pos[k] + b.neg[k]); return { k, d: m ? Math.abs(score(a, k) - score(b, k)) * (m / (m + 5)) : -1 }; }).sort((x, y) => y.d - x.d).slice(0, 6);
  const side = (p, k, right) => { const t = p.pos[k] + p.neg[k]; if (!t) return `<div style="font-size:11px; color:${C.muted}; text-align:${right ? 'right' : 'left'};">ふれていない</div>`; const full = 118 * Math.min(1, (t / p.read) / 0.45); return `<div style="display:flex; flex-direction:column; gap:3px; align-items:${right ? 'flex-end' : 'flex-start'};"><div style="display:flex; height:6px; width:${Math.round(full)}px;"><span style="flex:${p.neg[k]}; background:${C.neg};"></span><span style="flex:${p.pos[k]}; background:${C.sat};"></span></div><span style="font-size:11px;">${num(p.neg[k], { size: 12, color: C.negText })} / ${num(p.pos[k], { size: 12, color: C.satText })}</span></div>`; };
  let s = at(24, 56, `<div style="display:flex; align-items:center; gap:10px;">${iconBtn('back', '戻る', { size: 40 })}<span style="font-weight:900; font-size:18px;">くらべる</span></div>`);
  s += at(24, 112, `<div style="width:342px; display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:10px;">${[a, b].map((p) => `<div style="height:190px; border-radius:26px; background:${C.tile}; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px;">${art(p.s, 110)}<div style="font-size:13px; font-weight:700; text-align:center;">${esc(p.name)}</div><div style="font-size:11px; color:${C.muted};">${num(yen(p.price), { size: 12 })}・読んだ${p.read}</div></div>`).join('')}</div>`);
  s += at(24, 324, `<div style="width:342px; display:flex; flex-direction:column;">${rows.map((r) => `<div style="display:grid; grid-template-columns:minmax(0,1fr) 78px minmax(0,1fr); align-items:center; padding:12px 0; border-bottom:1px solid ${C.hair};">${side(a, r.k, false)}<div style="text-align:center; font-size:12.5px; font-weight:700;">${SHORT[r.k]}</div>${side(b, r.k, true)}</div>`).join('')}</div>`);
  s += at(24, 648, `<div style="width:342px; font-size:11px; color:${C.muted};">違いがはっきりした順。長さは読んだレビューに対する割合</div>`);
  s += at(24, 680, `<div style="width:342px; display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:10px;">${pill('楽天で見る', { kind: 'line', h: 46, fs: 13 })}${pill('楽天で見る', { kind: 'line', h: 46, fs: 13 })}</div>`);
  return scr(s);
}

// ==========================================================================
// B10 言葉で探す（好き3）
// ==========================================================================
export function bSearch() {
  const list = P.filter((p) => p.pos.fit + p.neg.fit >= 8).sort((a, b) => a.neg.fit / (a.pos.fit + a.neg.fit) - b.neg.fit / (b.pos.fit + b.neg.fit)).slice(0, 4);
  let s = at(24, 56, `<div style="width:342px; display:flex; gap:10px; align-items:center;">${iconBtn('back', '戻る', { size: 44 })}<label style="flex:1; display:flex; align-items:center; gap:8px; height:50px; padding:0 16px; border-radius:25px; background:${C.tile}; box-sizing:border-box;">${icon('search', { size: 18 })}<input type="text" value="耳が痛く" aria-label="探す" style="border:none; outline:none; background:transparent; font-family:${F.jp}; font-size:15px; width:100%;"></label></div>`);
  s += at(24, 128, `<div style="font-weight:900; font-size:26px; line-height:1.3;">「耳が痛い」は<br>装着感の不満として<br>数えています</div>`);
  s += at(24, 250, `<div style="display:flex; gap:10px; align-items:baseline;">${label('装着感の不満が少ない')}<span style="font-size:11px; color:${C.muted};">8件以上ふれた商品</span></div>`);
  s += at(24, 278, `<div style="width:342px; display:flex; flex-direction:column; gap:12px;">${list.map((p) => `<a href="#" style="display:flex; gap:14px; align-items:center; text-decoration:none; color:${C.ink};"><span style="width:84px; height:84px; border-radius:22px; background:${C.tile}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${art(p.s, 78)}</span><div style="flex:1; min-width:0;"><div style="font-size:15px; font-weight:700;">${esc(p.name)}</div><div style="font-size:11px; color:${C.muted}; margin-top:3px;">読んだ${p.read}件</div></div><div style="text-align:right;">${num(p.neg.fit, { size: 26, w: 600, color: C.negText })}<div style="font-size:11px; color:${C.muted};">不満（満足${p.pos.fit}）</div></div></a>`).join('')}</div>`);
  s += floatTab(1);
  return scr(s);
}

// ==========================================================================
// B11 観点のページ：棚（四象限の代わり）
// ==========================================================================
export function bAspect() {
  const k = 'fit';
  const groups = shelfGroups(k);
  let s = at(24, 56, `<div>${label('イヤホン ／ 観点')}<div style="font-weight:900; font-size:30px; line-height:1.25; margin-top:8px;">装着感</div><div style="font-size:14px; color:${C.ink2}; margin-top:6px;">耳が痛くならない？ 買った人の声で</div></div>`);
  let y = 196;
  for (const [t, list, col] of groups) {
    if (!list.length) continue;
    s += at(24, y, `<div style="display:flex; align-items:center; gap:8px; font-size:14px; font-weight:700;"><span style="width:14px; height:4px; background:${col};"></span>${t}${sup(list.length)}</div>`);
    s += at(24, y + 28, `<div style="width:366px; display:flex; gap:10px; overflow:hidden;">${list.slice(0, 5).map((p) => `<div style="flex-shrink:0; width:92px; display:flex; flex-direction:column; align-items:center; gap:6px;"><span style="position:relative; display:inline-block; width:62px; height:62px; margin-top:8px;">${node(p.s, { size: 62, thick: p.thick, fade: t === 'ふれていない' })}${t === 'ふれていない' ? '' : gauge(p.pos[k], p.neg[k], { size: 62, sw: 3.5, gap: 4 })}</span><span style="font-size:11px; font-weight:700; text-align:center; line-height:1.3;">${esc(p.name)}</span></div>`).join('')}</div>`);
    y += 146;
  }
  s += floatTab(0);
  return scr(s);
}

// B12 暗い地図（好き9の暗い面）
export function bDark() {
  const k = 'anc';
  let s = `<div style="position:absolute; inset:0;">${imageMap({ w: W, h: H, top: 110, bottom: 250, lens: k, dark: true, min: 34, max: 60 })}</div>`;
  s += mapHead('ノイキャンで見ています', { dark: true });
  s += wheel({ sel: k, baseY: 648, dark: true });
  s += floatTab(0, { dark: true });
  return scr(s, { dark: true });
}

export const PHONE_B = [
  ['入口', [['SB01-Home', 'S01 ホーム（棚）', bHome], ['SB02-Genre', 'S02 読めた商品と空きタイル', bGenre], ['SB10-Search', 'S03 言葉で探す', bSearch]]],
  ['地図', [['SB03-Map', 'S04 物の地図', bMap], ['SB04-Lens', 'S05 ホイールで装着感', bLens], ['SB05-Peek', 'S06 押した（近い5つ）', bPeek], ['SB12-Dark', 'S07 暗い地図', bDark]]],
  ['商品と比較', [['SB06-Product', 'S08 商品', bProduct], ['SB07-Bundle', 'S09 声の束', bBundle], ['SB08-Similar', 'S10 似ているもの', bSimilar], ['SB09-Compare', 'S11 くらべる', bCompare]]],
  ['検索の受け口', [['SB11-Aspect', 'S12 観点のページ（棚）', bAspect]]],
];

// ==========================================================================
// PC
// ==========================================================================
const PW = 1440, PH = 900;
const pcScr = (inner) => `<div style="position:relative; width:${PW}px; height:${PH}px; overflow:hidden; background:${C.bg}; font-family:${F.jp}; color:${C.ink};">${inner}</div>`;
const pcHead = (a = 0) => `<header style="position:absolute; left:0; right:0; top:0; height:76px; padding:0 48px; box-sizing:border-box; display:flex; align-items:center; gap:32px; z-index:30;">${mark(18)}<nav aria-label="メイン" style="display:flex; gap:6px; padding:5px; border-radius:24px; background:${C.tile};">${['地図', 'くらべる', '保存', '数え方'].map((t, i) => `<a href="#" style="height:36px; padding:0 16px; border-radius:18px; display:flex; align-items:center; background:${i === a ? '#fff' : 'transparent'}; font-size:13px; font-weight:700; color:${C.ink}; text-decoration:none;">${t}</a>`).join('')}</nav><div style="margin-left:auto;">${searchPill('悩みや商品名で探す', { w: 420, h: 44 })}</div></header>`;

export function bdHome() {
  const m = mosaic({ cols: 20, cell: 30, gap: 6 });
  let s = pcHead(0);
  s += at(48, 128, `<div style="width:560px;"><div style="font-weight:900; font-size:64px; line-height:1.12; letter-spacing:-.02em;">何を<br>くらべる？</div><div style="font-size:16px; color:${C.ink2}; margin-top:18px; line-height:1.8;">買った人の声を数えて、商品を並べました。<br>輪を回すと、気になる声が見えます。</div><div style="margin-top:28px; display:flex; flex-wrap:wrap; gap:8px;">${WORRY.map(([t, k, n]) => `<span style="display:inline-flex; align-items:center; gap:6px; height:40px; padding:0 16px; border-radius:20px; background:${C.tile}; font-size:13px; font-weight:700;">${icon(ASPECT_ICON[k], { size: 16 })}${t}${sup(n)}</span>`).join('')}</div></div>`);
  s += at(700, 120, `<a href="#" style="display:block; width:692px; height:330px; border-radius:32px; background:${C.tile}; position:relative; overflow:hidden; text-decoration:none; color:${C.ink};"><div style="position:absolute; left:32px; top:28px;">${label('shelf 01 ・ 耳と音')}<div style="font-size:26px; font-weight:900; margin-top:8px;">完全ワイヤレスイヤホン</div><div style="font-size:14px; color:${C.ink2}; margin-top:6px;">${STATS.analysed}商品の声・のべ${STATS.read}件</div></div><div style="position:absolute; right:10px; bottom:-18px; display:flex; align-items:flex-end;">${['821de2ea', '637e1dd6', 'cd6a9906', 'd5f259d1'].map((x, i) => art(x, [150, 190, 150, 130][i])).join('')}</div></a>`);
  s += at(700, 470, `<div style="display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:14px; width:692px;">${['ヘッドホン', 'ドライヤー', '電動歯ブラシ'].map((t) => `<div style="height:120px; border-radius:26px; background:#F7F7F6; border:1px solid ${C.hair}; box-sizing:border-box; padding:18px; display:flex; flex-direction:column; justify-content:space-between;"><span style="font-size:15px; font-weight:700; color:${C.muted};">${t}</span>${label('準備中', { color: C.faint })}</div>`).join('')}</div>`);
  s += at(48, 640, `<div style="width:1344px; display:flex; gap:40px; align-items:flex-start;"><div style="width:230px; flex-shrink:0;">${label('coverage')}<div style="display:flex; align-items:baseline; gap:8px; margin-top:8px;"><span style="font-family:${F.num}; font-weight:600; font-size:56px; line-height:1;">${STATS.analysed}</span><span style="font-family:${F.num}; font-size:26px; color:${C.faint};">/ ${STATS.total}</span></div><div style="font-size:13px; color:${C.ink2}; margin-top:8px; line-height:1.6;">商品の声を読めています。<br>空きのタイルは、まだ読めていない商品</div></div>${m.html}</div>`);
  return pcScr(s);
}

export function bdMap() {
  const p = WFC, k = 'fit';
  let s = pcHead(0);
  s += at(0, 0, `<div style="position:relative; width:1010px; height:${PH}px;">${imageMap({ w: 1010, h: PH, top: 120, bottom: 40, lens: k, sel: p.s, min: 46, max: 88 })}</div>`, { z: 1 });
  s += at(1010, 76, `<div style="position:relative; width:430px; height:824px; background:#fff; box-sizing:border-box; padding:24px 32px;">
<div style="display:flex; justify-content:space-between; align-items:center;">${label('観点')}<span style="font-size:12px; color:${C.muted};">差がつかない：${SAME.map((a) => SHORT[a.key]).join('・')}</span></div>
<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;">${WHEEL.map((x) => `<span style="display:inline-flex; align-items:center; gap:6px; height:38px; padding:0 14px; border-radius:19px; background:${x === k ? C.ink : C.tile}; color:${x === k ? '#fff' : C.ink}; font-size:13px; font-weight:700;">${icon(x ? ASPECT_ICON[x] : 'all', { size: 15 })}${x ? SHORT[x] : 'すべて'}${x ? `<sup style="font-family:${F.num}; font-size:11px; margin-left:2px; opacity:.7;">${AXES.find((a) => a.key === x).products}</sup>` : ''}</span>`).join('')}</div>
<div style="margin-top:26px; height:220px; border-radius:26px; background:${C.tile}; display:flex; align-items:center; justify-content:center;">${art(p.s, 200)}</div>
<div style="margin-top:16px; font-size:22px; font-weight:900;">${esc(p.name)}</div>
<div style="margin-top:4px; font-size:13px; color:${C.ink2};">${num(yen(p.price), { size: 16 })}　レビュー${p.reviewCount}件のうち${p.read}件を読んだ</div>
<div style="margin-top:16px; display:flex; align-items:center; gap:18px;">${bigGauge(p.pos.fit, p.neg.fit, { size: 140, read: p.read })}<div style="display:flex; flex-direction:column; gap:6px;"><div style="font-size:15px; font-weight:700;">装着感</div>${aiNote()}</div></div>
<div style="margin-top:18px; display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:8px;">${pill('詳しく', { h: 46, fs: 13 })}${pill('声の束', { kind: 'light', h: 46, fs: 13 })}${pill('くらべる', { kind: 'light', h: 46, fs: 13 })}</div>
</div>`, { z: 5 });
  return pcScr(s);
}

export function bdProduct() {
  const p = WFC, k = 'fit';
  const v = verdictOf(p);
  let s = pcHead(0);
  s += at(48, 104, `<div style="width:620px; height:560px; border-radius:36px; background:${C.tile}; display:flex; align-items:center; justify-content:center;">${art(p.s, 440)}</div>`);
  s += at(48, 690, `<div>${label(p.brand)}<div style="font-weight:900; font-size:40px; margin-top:8px;">${esc(p.name)}</div><div style="margin-top:8px; display:flex; align-items:center; gap:18px;">${num(yen(p.price), { size: 24 })}<span style="font-size:12px; color:${C.muted};">${STATS.generatedAt}時点</span></div></div>`);
  s += at(560, 690, roundBtn('買う', { size: 96, fs: 15 }));
  s += at(720, 104, `<div style="width:672px; display:flex; flex-direction:column; gap:18px;">
<div style="display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:14px;">${statCard(`${p.read}`, `読んだレビュー（${p.reviewCount}件のうち）`, { w: 214 })}${statCard(`${v.blamed[0].neg}`, `いちばん多い不満：${LABEL[v.blamed[0].k]}`, { w: 214, bg: C.negSoft, color: C.negText })}${statCard(`${v.praised[0].pos}`, `いちばん多い満足：${LABEL[v.praised[0].k]}`, { w: 214, bg: C.satSoft, color: C.satText })}</div>
<div style="height:330px; border-radius:30px; background:${C.map}; position:relative; overflow:hidden;"><div style="position:absolute; left:24px; top:20px;">${label('声の束 ・ 装着感')}</div><div style="position:absolute; left:10px; top:40px;">${bundle({ read: p.read, pos: p.pos[k], neg: p.neg[k], w: 420, h: 280, step: 2.6 })}</div><div style="position:absolute; right:24px; top:70px; width:230px; padding:16px; border-radius:18px; background:#fff; box-shadow:${SH.lift}; box-sizing:border-box;"><div style="font-size:11px; font-weight:700; color:${C.negText};">装着感・不満</div><div style="font-size:13px; line-height:1.6; margin-top:6px;">「${esc(Q['821de2ea'].fit.neg)}」</div><div style="font-size:11px; color:${C.muted}; margin-top:6px; text-decoration:underline;">楽天のレビューで確かめる</div></div></div>
<div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:0 24px;">${KEYS.filter((x) => p.pos[x] + p.neg[x] > 0).sort((a, b) => p.neg[b] - p.neg[a]).slice(0, 6).map((x) => `<div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid ${C.hair}; font-size:14px;"><span style="font-weight:${x === k ? 700 : 500};">${LABEL[x]}</span><span>${num(p.neg[x], { size: 15, color: C.negText })}<span style="color:${C.faint};"> / </span>${num(p.pos[x], { size: 15, color: C.satText })}</span></div>`).join('')}</div>
</div>`);
  return pcScr(s);
}

export const PC_B = [['SBD01-Home', 'PC ホーム', bdHome], ['SBD02-Map', 'PC 地図', bdMap], ['SBD03-Product', 'PC 商品', bdProduct]];

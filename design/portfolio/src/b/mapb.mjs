// 別案Bの図：物で描く地図・観点のホイール・声の束・空のタイル
import { C, F, SH, art, node, gauge, icon, num, sup, label, esc, ASPECT_ICON } from './libb.mjs';
import { layoutMap, relax } from '../map.mjs';
import { MAPPED, P, ALL, STATS, AXES, SHORT, KEYS, neighbors, byShort } from '../data.mjs';

// 点線でつなぐ相手：いちばん声が近い1つ（案Aと同じ近さの計算）。押した商品は近い5つ
export const EDGES = (() => {
  const seen = new Set(), out = [];
  for (const p of MAPPED) for (const n of neighbors(p, 1)) {
    const k = [p.s, n.p.s].sort().join('-');
    if (!seen.has(k)) { seen.add(k); out.push([p.s, n.p.s]); }
  }
  return out;
})();

export function positions({ w, h, top = 0, bottom = 0, min = 34, max = 66, pad = 40 }) {
  const lay = layoutMap({ w, h, top, bottom, min, max, pad, labels: 'none' });
  // 物の丸は、ゲージのぶん広めに押し広げる（上下の余白の中に収める）
  const items = lay.map((it) => ({ ...it, r: it.size / 2 + 12 }));
  relax(items, { w, h: h - bottom, pad: 8, gap: 4, iter: 200 });
  for (const it of items) it.y = Math.max(top + it.size / 2 + 8, it.y);
  return Object.fromEntries(items.map((it) => [it.p.s, { x: it.x, y: it.y, size: it.size, p: it.p }]));
}

// 物で描く地図（好き7・8）。lens：観点キー（半円のゲージが出る、言及なしは退く）
export function imageMap({ w, h, top = 0, bottom = 0, lens = null, sel = null, dark = false, min = 34, max = 66, showSelLabel = true, grid = true } = {}) {
  const pos = positions({ w, h, top, bottom, min, max });
  const near = sel ? new Set(neighbors(byShort[sel], 5).map((n) => n.p.s)) : null;
  let s = `<div style="position:absolute; inset:0; background:${dark ? C.dark : C.map}; overflow:hidden;">`;
  if (grid) s += `<svg width="${w}" height="${h}" aria-hidden="true" style="position:absolute; left:0; top:0;"><defs><pattern id="bg${w}x${h}${dark ? 'd' : ''}" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="${dark ? '#232427' : C.grid}" stroke-width="1"></path></pattern></defs><rect width="${w}" height="${h}" fill="url(#bg${w}x${h}${dark ? 'd' : ''})"></rect></svg>`;
  // 点線
  s += `<svg width="${w}" height="${h}" aria-hidden="true" style="position:absolute; left:0; top:0;">`;
  for (const [a, b] of EDGES) {
    const A = pos[a], B = pos[b];
    if (!A || !B) continue;
    const hot = sel && (a === sel || b === sel);
    s += `<path d="M${A.x.toFixed(1)} ${A.y.toFixed(1)} L${B.x.toFixed(1)} ${B.y.toFixed(1)}" stroke="${hot ? (dark ? C.darkInk : C.ink) : (dark ? '#3A3B3F' : '#CFCFCC')}" stroke-width="${hot ? 1.6 : 1.2}" stroke-dasharray="2 4" stroke-linecap="round"></path>`;
  }
  if (sel) for (const t of near) { const A = pos[sel], B = pos[t]; if (A && B && !EDGES.some(([a, b]) => (a === sel && b === t) || (b === sel && a === t))) s += `<path d="M${A.x.toFixed(1)} ${A.y.toFixed(1)} L${B.x.toFixed(1)} ${B.y.toFixed(1)}" stroke="${dark ? C.darkInk : C.ink}" stroke-width="1.6" stroke-dasharray="2 4" stroke-linecap="round"></path>`; }
  s += '</svg>';
  for (const s2 of Object.keys(pos)) {
    const { x, y, p } = pos[s2];
    let size = pos[s2].size;
    const isSel = s2 === sel;
    if (isSel) size = Math.round(size * 1.45);
    const t = lens ? p.pos[lens] + p.neg[lens] : 1;
    const fade = (lens && t === 0) || (sel && !isSel && !near.has(s2));
    s += `<button type="button" aria-label="${esc(p.name)}" style="position:absolute; left:${Math.round(x - size / 2)}px; top:${Math.round(y - size / 2)}px; width:${size}px; height:${size}px; padding:0; border:none; background:transparent; border-radius:50%; z-index:${isSel ? 5 : 2};">${node(s2, { size, thick: p.thick, sel: isSel, fade, bg: dark ? C.dark2 : C.tile })}${lens && t ? gauge(p.pos[lens], p.neg[lens], { size, sw: size > 50 ? 4 : 3, gap: 4 }) : ''}</button>`;
    if (isSel && showSelLabel) s += `<div style="position:absolute; left:${Math.round(Math.min(w - 170, Math.max(4, x - 83)))}px; top:${Math.round(y + size / 2 + 8)}px; width:166px; text-align:center; z-index:6;"><span style="display:inline-block; padding:5px 10px; border-radius:14px; background:${dark ? C.darkInk : C.ink}; color:${dark ? C.dark : '#fff'}; font-size:12px; font-weight:700;">${esc(p.name)}</span></div>`;
  }
  s += '</div>';
  return s;
}

// 観点のホイール（好き1）。スマホは親指が届く下の弧に。真ん中が選んだもの、両側は傾いて薄くなる
export const WHEEL = [null, ...AXES.filter((a) => a.offerable).map((a) => a.key)];
export function wheel({ sel = null, w = 390, baseY = 640, dark = false } = {}) {
  const idx = WHEEL.indexOf(sel);
  const R = 420, cx = w / 2, cy = baseY + R;
  const STEP = 0.2;
  let s = `<div style="position:absolute; left:0; top:${baseY - 44}px; width:${w}px; height:150px; pointer-events:none; background:linear-gradient(${dark ? 'rgba(18,19,20,0)' : 'rgba(246,246,245,0)'}, ${dark ? 'rgba(18,19,20,.94)' : 'rgba(246,246,245,.96)'} 38%); z-index:15;"></div>`;
  s += `<div style="position:absolute; left:0; top:0; width:${w}px; height:${baseY + 110}px; pointer-events:none; z-index:16;">`;
  s += `<svg width="${w}" height="${baseY + 110}" aria-hidden="true" style="position:absolute; left:0; top:0;"><circle cx="${cx}" cy="${cy + 30}" r="${R + 30}" fill="none" stroke="${dark ? '#3A3B3F' : '#D6D6D3'}" stroke-width="1.2"></circle><path d="M${cx - 18} ${baseY - 42} h36" stroke="${dark ? C.darkInk : C.ink}" stroke-width="4" stroke-linecap="round"></path></svg>`;
  WHEEL.forEach((k, i) => {
    const d = i - idx;
    const a = d * STEP;
    const x = cx + Math.sin(a) * R, y = cy - Math.cos(a) * R;
    const on = d === 0;
    const op = Math.max(0.18, 1 - Math.abs(d) * 0.28);
    const t = k ? SHORT[k] : 'すべて';
    const cnt = k ? AXES.find((q) => q.key === k).products : null;
    const sz = on ? 54 : 46;
    const rot = (a * 180 / Math.PI).toFixed(1);
    s += `<div style="position:absolute; left:${Math.round(x - 45)}px; top:${Math.round(y - sz / 2)}px; width:90px; display:flex; flex-direction:column; align-items:center; gap:6px; opacity:${op}; transform:rotate(${rot}deg); transform-origin:50% 100%;"><button type="button" style="width:${sz}px; height:${sz}px; border-radius:${on ? 19 : 16}px; border:${on ? `2px solid ${dark ? C.darkInk : C.ink}` : 'none'}; background:${on ? (dark ? C.dark : '#fff') : dark ? C.dark2 : C.tile}; color:${dark ? C.darkInk : C.ink}; display:flex; align-items:center; justify-content:center; padding:0; pointer-events:auto;">${icon(k ? ASPECT_ICON[k] : 'all', { size: on ? 24 : 20 })}</button><span style="font-size:${on ? 13 : 11}px; font-weight:${on ? 700 : 500}; color:${dark ? C.darkInk : on ? C.ink : C.muted}; white-space:nowrap;">${t}${cnt ? sup(cnt) : ''}</span></div>`;
  });
  s += '</div>';
  return s;
}

// 空のタイル（好き9）：ジャンルの全商品。声を読めた商品は絵、まだの商品は空
export function mosaic({ cols = 8, cell = 38, gap = 6, dark = false } = {}) {
  const shown = ALL; // 声を読めた出品（色違いも別の出品として数える。STATS.analysed と同じ数）
  const total = STATS.total;
  const cells = [];
  // 読めた商品を散らす（決まった並び）
  const slots = [];
  for (let i = 0; i < total; i++) slots.push(i);
  const pick = shown.map((p, i) => ({ p, at: (i * 37 + 11) % total }));
  const used = new Map();
  for (const { p, at } of pick) { let a = at; while (used.has(a)) a = (a + 1) % total; used.set(a, p); }
  let s = `<div style="display:grid; grid-template-columns:repeat(${cols}, ${cell}px); gap:${gap}px;">`;
  for (let i = 0; i < total; i++) {
    const p = used.get(i);
    s += p ? `<span style="width:${cell}px; height:${cell}px; border-radius:${Math.round(cell * 0.3)}px; background:${dark ? C.dark2 : C.tile}; display:flex; align-items:center; justify-content:center;">${art(p.s, Math.round(cell * 0.95))}</span>` : `<span style="width:${cell}px; height:${cell}px; border-radius:${Math.round(cell * 0.3)}px; background:${dark ? '#17181A' : '#F7F7F6'}; border:1px solid ${dark ? '#26272A' : '#ECECEA'}; box-sizing:border-box;"></span>`;
  }
  s += '</div>';
  return { html: s, shown: shown.length, empty: total - shown.length };
}

// 声の束（好き11）：読んだレビューを薄い板で重ねる。観点の不満が手前、満足、残り
export function bundle({ read, pos, neg, w = 340, h = 230, pop = null, step = 0 } = {}) {
  const n = read;
  const sw = 74, sh = 96;
  const dx = step || Math.min(2.2, (w - 110) / n), dy = Math.min(dx * 0.62, (h - sh - 40) / n);
  const x0 = 12, y0 = h - sh - 12;
  let s = `<svg width="${w}" height="${h}" aria-hidden="true" style="display:block; overflow:visible;">`;
  // 奥から手前へ描く。手前（i=0）が不満、その次が満足、残りは灰
  for (let i = n - 1; i >= 0; i--) {
    const col = i < neg ? C.neg : i < neg + pos ? C.sat : '#E4E4E1';
    const x = x0 + i * dx, y = y0 - i * dy;
    if (pop != null && i === pop) continue;
    s += `<path d="M${x.toFixed(1)} ${(y + 14).toFixed(1)} l${sw} -14 l0 ${sh} l${-sw} 14 z" fill="${col}" stroke="#fff" stroke-width="0.6"></path>`;
  }
  s += '</svg>';
  return s;
}

// 棚（1つの観点で並べる。四象限の代わり）：満足が多い／割れている／不満が多い／ふれていない
export function shelfGroups(k) {
  const withM = P.filter((p) => p.pos[k] + p.neg[k] > 0);
  const sc = (p) => (p.pos[k] - p.neg[k]) / (p.pos[k] + p.neg[k] + 4);
  const by = (f) => withM.filter(f).sort((a, b) => (b.pos[k] + b.neg[k]) - (a.pos[k] + a.neg[k]));
  return [
    ['満足が多い', by((p) => sc(p) >= 0.3), C.sat],
    ['割れている', by((p) => sc(p) < 0.3 && sc(p) > -0.1), C.muted],
    ['不満が多い', by((p) => sc(p) <= -0.1), C.neg],
    ['ふれていない', P.filter((p) => p.pos[k] + p.neg[k] === 0), C.faint],
  ];
}

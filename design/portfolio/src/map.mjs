// 地図の描画（静的な HTML）。位置は data.mjs の実データから
import { C, F, SH, icon, productDot, esc } from './lib.mjs';
import { MAPPED, COMPASS, SHORT, POLE, KEYS, score, quad } from './data.mjs';

// 点の大きさ：語られた量（√）
export const dotSize = (tot, { min = 26, max = 58 } = {}) => {
  const top = Math.max(...MAPPED.map((p) => p.tot));
  return Math.round(min + Math.sqrt(tot / top) * (max - min));
};

// 重なりをほどく（押せない点をなくす）。決まった順で数回押し広げるだけ
export function relax(items, { w, h, pad = 8, gap = 4, iter = 80 } = {}) {
  for (let it = 0; it < iter; it++) {
    let moved = false;
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01;
      const need = a.r + b.r + gap;
      if (d < need) {
        const push = (need - d) / 2, ux = dx / d, uy = dy / d;
        a.x -= ux * push; a.y -= uy * push; b.x += ux * push; b.y += uy * push; moved = true;
      }
    }
    for (const a of items) { a.x = Math.min(w - pad - a.r, Math.max(pad + a.r, a.x)); a.y = Math.min(h - pad - a.r, Math.max(pad + a.r, a.y)); }
    if (!moved) break;
  }
  return items;
}

// 地図の配置を計算（px）。データの広がりに合わせて、見える範囲（上下の余白を除く）いっぱいに置く
export function layoutMap({ w, h, pad = 34, top = 0, bottom = 0, min = 26, max = 58, labels = 'thick' }) {
  const xs = MAPPED.map((p) => p.mx), ys = MAPPED.map((p) => p.my);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const items = MAPPED.map((p) => {
    const size = dotSize(p.tot, { min, max });
    const lab = labels === 'all' || (labels === 'thick' && p.thick !== 'thin');
    return { p, size, lab, r: size / 2 + (lab ? 9 : 3),
      x: pad + ((p.mx - x0) / (x1 - x0 || 1)) * (w - 2 * pad),
      y: top + pad + (1 - (p.my - y0) / (y1 - y0 || 1)) * (h - top - bottom - 2 * pad) };
  });
  return relax(items, { w, h, pad: 6, gap: 6 });
}

// 方位（観点の矢印）：その向きほど、その観点の満足が多い
export function compassRose({ size = 118, fs = 11 } = {}) {
  const c = size / 2, R = size / 2 - 8;
  let svg = `<svg width="${size}" height="${size}" aria-hidden="true" style="position:absolute; left:0; top:0;"><circle cx="${c}" cy="${c}" r="${R + 4}" fill="rgba(255,255,255,.85)" stroke="${C.line2}"></circle>`;
  let lab = '';
  for (const k of COMPASS) {
    const n = Math.hypot(k.x, k.y) || 1, ux = k.x / n, uy = -k.y / n;
    const ex = c + ux * R, ey = c + uy * R;
    svg += `<path d="M${c} ${c} L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${C.ink2}" stroke-width="1.6" stroke-linecap="round"></path><circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="2.6" fill="${C.ink2}"></circle>`;
    const lx = c + ux * (R + 6), ly = c + uy * (R + 6);
    const right = ux >= 0;
    lab += `<span style="position:absolute; ${right ? `left:${Math.round(lx + 2)}px;` : `right:${Math.round(size - lx + 2)}px;`} top:${Math.round(ly - 8)}px; font-size:${fs}px; font-weight:700; color:${C.ink2}; white-space:nowrap; text-shadow:0 0 3px #fff, 0 0 3px #fff;">${k.label}</span>`;
  }
  svg += `<circle cx="${c}" cy="${c}" r="3" fill="${C.ink}"></circle></svg>`;
  return `<div aria-label="方位：その向きほど、その観点の満足が多い" style="position:relative; width:${size}px; height:${size}px;">${svg}${lab}</div>`;
}

export function ringFor(p, lens) {
  if (!lens) {
    const pos = KEYS.reduce((s, k) => s + p.pos[k], 0), neg = KEYS.reduce((s, k) => s + p.neg[k], 0);
    return { pos, neg, hollow: false };
  }
  const pos = p.pos[lens], neg = p.neg[lens];
  return { pos, neg, hollow: pos + neg === 0 };
}

// 地図（背景・方位・点・名前）
export function mapView({ w, h, lens = null, sel = null, labels = 'thick', compass = false, compassAt = null, compassSize = 104, min = 26, max = 58, top = 0, bottom = 0, dimIds = [], ghost = false } = {}) {
  const items = layoutMap({ w, h, min, max, top, bottom, labels });
  let s = `<div style="position:absolute; inset:0; background:${C.map}; overflow:hidden;">`;
  // うすい方眼（距離に意味は無いので、目盛りは付けない）
  s += `<svg width="${w}" height="${h}" aria-hidden="true" style="position:absolute; left:0; top:0;"><defs><pattern id="g${w}${h}" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="${C.map2}" stroke-width="1"></path></pattern></defs><rect width="${w}" height="${h}" fill="url(#g${w}${h})"></rect></svg>`;
  if (compass) { const [cx, cy] = compassAt ?? [w - compassSize - 10, h - bottom - compassSize - 6]; s += `<div style="position:absolute; left:${cx}px; top:${cy}px; z-index:3;">${compassRose({ size: compassSize })}</div>`; }
  for (const it of items) {
    const { p, size } = it;
    const ring = ringFor(p, lens);
    const dim = dimIds.includes(p.s) || (ghost && p.s !== sel);
    const showLabel = it.lab || p.s === sel;
    s += `<button type="button" aria-label="${esc(p.name)}" style="position:absolute; left:${Math.round(it.x - size / 2)}px; top:${Math.round(it.y - size / 2)}px; width:${size}px; height:${size}px; padding:0; border:none; background:transparent; border-radius:50%; cursor:pointer;">${productDot({ size, pos: ring.pos, neg: ring.neg, thick: p.thick, sel: p.s === sel, dim, hollow: ring.hollow })}</button>`;
    if (showLabel) s += `<div style="position:absolute; left:${Math.round(Math.min(w - 122, Math.max(2, it.x - 60)))}px; top:${Math.round(it.y + size / 2 + 3)}px; width:120px; text-align:center; font-size:11px; font-weight:700; color:${dim ? C.faint : C.ink}; line-height:1.25; pointer-events:none; text-shadow:0 0 3px ${C.map}, 0 0 3px ${C.map};">${esc(p.name)}</div>`;
  }
  s += '</div>';
  return s;
}

// 2つの観点で並べる（今の四象限。原点は「意見が割れている」、言及なしは置かない）
export function axesView({ w, h, x = 'fit', y = 'anc', sel = null, min = 26, max = 54, labels = true } = {}) {
  const { points } = quad(x, y);
  const pad = 36;
  const items = points.map((pt) => {
    const size = dotSize(pt.p.tot, { min, max });
    return { p: pt.p, size, r: size / 2 + (pt.p.thick !== 'thin' ? 9 : 3), x: pad + ((pt.x + 1) / 2) * (w - 2 * pad), y: pad + (1 - (pt.y + 1) / 2) * (h - 2 * pad) };
  });
  relax(items, { w, h, pad: 6 });
  let s = `<div style="position:absolute; inset:0; background:${C.bg}; overflow:hidden;">`;
  s += `<div style="position:absolute; left:${w / 2}px; top:0; width:1px; height:${h}px; background:${C.line2};"></div><div style="position:absolute; top:${h / 2}px; left:0; height:1px; width:${w}px; background:${C.line2};"></div>`;
  const lab = (t, st) => `<div style="position:absolute; ${st} font-size:11px; font-weight:700; color:${C.muted}; white-space:nowrap;">${t}</div>`;
  if (labels) s += lab(`↑ ${SHORT[y]}：${POLE[y].pos}`, `left:${w / 2 + 8}px; top:8px;`) + lab(`↓ ${POLE[y].neg}`, `left:${w / 2 + 8}px; bottom:28px;`);
  if (labels) s += lab(`← ${POLE[x].neg}`, `left:8px; bottom:8px;`) + lab(`${SHORT[x]}：${POLE[x].pos} →`, `right:8px; bottom:8px;`);
  for (const it of items) {
    const { p, size } = it;
    s += `<button type="button" aria-label="${esc(p.name)}" style="position:absolute; left:${Math.round(it.x - size / 2)}px; top:${Math.round(it.y - size / 2)}px; width:${size}px; height:${size}px; padding:0; border:none; background:transparent; border-radius:50%;">${productDot({ size, pos: p.pos[x] + p.pos[y], neg: p.neg[x] + p.neg[y], thick: p.thick, sel: p.s === sel })}</button>`;
    if (labels && (p.thick !== 'thin' || p.s === sel)) s += `<div style="position:absolute; left:${Math.round(it.x - 60)}px; top:${Math.round(it.y + size / 2 + 3)}px; width:120px; text-align:center; font-size:11px; font-weight:700; color:${C.ink}; line-height:1.25;">${esc(p.name)}</div>`;
  }
  s += '</div>';
  return { html: s, placed: points.length };
}

// 凡例（地図の読み方）
export function legend({ w = 340, fs = 12 } = {}) {
  const row = (g, t) => `<div style="display:flex; align-items:center; gap:10px;"><span style="width:34px; display:flex; justify-content:center; flex-shrink:0;">${g}</span><span style="font-size:${fs}px; line-height:1.5; color:${C.ink2};">${t}</span></div>`;
  return `<div style="width:${w}px; display:flex; flex-direction:column; gap:8px;">
${row(`<span style="display:flex; gap:4px;"><span style="width:10px; height:10px; border-radius:50%; background:${C.ink};"></span><span style="width:10px; height:10px; border-radius:50%; background:${C.ink};"></span></span>`, '<b>近い</b>＝買った人の声が似ている')}
${row(productDot({ size: 30, pos: 7, neg: 3 }), '<b>リング</b>＝不満（オレンジ）が先、満足（青）が後')}
${row(`<span style="display:flex; align-items:center; gap:3px;"><span style="width:10px; height:10px; border-radius:50%; background:${C.muted};"></span><span style="width:18px; height:18px; border-radius:50%; background:${C.muted};"></span></span>`, '<b>大きさ</b>＝語られた量')}
${row(productDot({ size: 30, pos: 2, neg: 1, thick: 'thin' }), '<b>点線</b>＝声がまだ少なく、位置は仮')}
</div>`;
}

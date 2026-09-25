// ボード（1600×1000）の枠と部品
import { C, F, SH, icon, num, wordmark, phone, browser, esc } from './lib.mjs';

export const BW = 1600, BH = 1000, TOTAL = 21;

export function frame(n, title, body, { sub = '', bg = C.board } = {}) {
  return `<div style="position:relative; width:${BW}px; height:${BH}px; overflow:hidden; background:${bg}; font-family:${F.body}; color:${C.ink};">
<div style="position:absolute; left:72px; top:50px; display:flex; align-items:baseline; gap:16px; z-index:10;">${num(n, { size: 15, color: C.muted })}<span style="font-family:${F.disp}; font-weight:900; font-size:32px; line-height:1.2; white-space:nowrap;">${title}</span>${sub ? `<span style="font-size:15px; color:${C.ink2}; white-space:nowrap;">${sub}</span>` : ''}</div>
<div style="position:absolute; right:72px; top:58px; z-index:10; display:flex; align-items:center; gap:12px; font-size:12px; color:${C.muted};">${wordmark(15)}<span>UI デザイン案 ・ 2026-09</span></div>
${body}
<div style="position:absolute; left:72px; bottom:24px; font-size:11px; color:${C.muted}; z-index:10;">数字は data/（${'2026-08'} 取得・イヤホン97商品）から計算。見た目は仮（参考画像を見てから決める）</div>
${/^\d+$/.test(n) ? `<div style="position:absolute; right:72px; bottom:24px; z-index:10;">${num(`${n} / ${TOTAL}`, { size: 11, color: C.muted })}</div>` : ''}
</div>`;
}

export const at = (x, y, html, { w = 0, z = 4, style = '' } = {}) => `<div style="position:absolute; left:${x}px; top:${y}px;${w ? ` width:${w}px;` : ''} z-index:${z};${style ? ` ${style}` : ''}">${html}</div>`;
export const ph = (screen, x, y, s, o = {}) => at(x, y, phone(screen, { scale: s }), o);
export const pc = (screen, x, y, s, o = {}) => at(x, y, browser(screen, { scale: s }), o);
export const h = (t, { size = 18, w = 700, color = C.ink, disp = false } = {}) => `<div style="font-family:${disp ? F.disp : F.body}; font-size:${size}px; font-weight:${disp ? 900 : w}; line-height:1.4; color:${color};">${t}</div>`;
export const p = (t, { size = 13, color = C.ink2, lh = 1.7 } = {}) => `<div style="font-size:${size}px; line-height:${lh}; color:${color};">${t}</div>`;
export const kick = (t, color = C.muted) => `<div style="font-size:12.5px; font-weight:700; color:${color}; letter-spacing:.04em;">${t}</div>`;
export const dot = (n, { size = 24, bg = C.ink, fg = '#FFFFFF' } = {}) => `<span style="display:inline-flex; align-items:center; justify-content:center; width:${size}px; height:${size}px; border-radius:50%; background:${bg}; color:${fg}; font-family:${F.num}; font-weight:500; font-size:${Math.round(size * 0.5)}px; flex-shrink:0;">${n}</span>`;
export const box = (inner, { pad = 18, r = 18, bg = C.surf, shadow = SH.card, gap = 10, extra = '' } = {}) => `<div style="box-sizing:border-box; padding:${pad}px; border-radius:${r}px; background:${bg}; box-shadow:${shadow}; display:flex; flex-direction:column; gap:${gap}px; ${extra}">${inner}</div>`;
export const note = (n, title, body, { w = 0, size = 14.5 } = {}) => `<div style="${w ? `width:${w}px; ` : ''}display:flex; gap:10px;">${dot(n)}<div style="min-width:0;"><div style="font-size:${size}px; font-weight:700; line-height:1.45;">${title}</div>${body ? `<div style="font-size:12.5px; line-height:1.65; color:${C.ink2}; margin-top:3px;">${body}</div>` : ''}</div></div>`;
export const refs = (list) => `<span style="display:inline-flex; gap:4px; flex-wrap:wrap;">${list.map((r) => `<span style="display:inline-flex; align-items:center; height:20px; padding:0 7px; border-radius:6px; background:${C.bg2}; font-family:${F.num}; font-size:11px; color:${C.ink2}; white-space:nowrap;">${r}</span>`).join('')}</span>`;
export const bl = (list, { color = C.sat, ic = 'check', fs = 13 } = {}) => list.map((t) => `<div style="display:flex; gap:7px; font-size:${fs}px; line-height:1.55; color:${C.ink2};"><span style="margin-top:2px;">${icon(ic, { size: 15, color, sw: 2.2 })}</span><span>${t}</span></div>`).join('');

// 注記：対象の点から、番号つきの説明へ線を引く
export function callouts(list) {
  let svg = `<svg width="${BW}" height="${BH}" aria-hidden="true" style="position:absolute; left:0; top:0; z-index:8; pointer-events:none;">`;
  let html = '';
  for (const c of list) {
    const ax = c.side === 'left' ? c.lx + c.w + 12 : c.lx - 12, ay = c.ly + 12;
    svg += `<path d="M${ax} ${ay} L${c.tx} ${c.ty}" fill="none" stroke="${C.ink}" stroke-width="1.3" stroke-dasharray="3 4"></path><circle cx="${c.tx}" cy="${c.ty}" r="6" fill="${C.ink}" stroke="#FFFFFF" stroke-width="2.5"></circle><circle cx="${ax}" cy="${ay}" r="2.5" fill="${C.ink}"></circle>`;
    html += at(c.lx, c.ly, note(c.n, c.title, c.body, { w: c.w, size: c.size || 14.5 }), { z: 9 });
  }
  return svg + '</svg>' + html;
}

export const arrow = (x, y, w = 44, { color = C.faint } = {}) => `<svg width="${w}" height="20" viewBox="0 0 ${w} 20" aria-hidden="true" style="position:absolute; left:${x}px; top:${y}px; z-index:6;"><path d="M2 10H${w - 6}M${w - 13} 3l7 7-7 7" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;

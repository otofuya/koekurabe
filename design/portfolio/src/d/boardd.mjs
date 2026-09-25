// 別案C のボード（1600×1000）の枠と部品
import { C, F, SH, icon, num, mark, phone, browser } from './libd.mjs';

export const BW = 1600, BH = 1000, TOTAL = 11;

export function frame(n, title, body, { sub = '', src = 'none' } = {}) {
  const SRC = {
    ear: 'イヤホン：data/ の実データ（AI の分類）。シューズ・化粧水・コーヒー：単語の規則で数えた見本',
    list: '一覧の数字：楽天のカテゴリ一覧の1ページ目を読んで数えた（2026-09-25）。本文は読んでいない',
    cost: '料金は第三者の料金表（2026-09）。公式の確認はまだ。トークン数は推定',
    none: '設計の決めごと。数字は推定と書いたものだけ',
  }[src];
  return `<div style="position:relative; width:${BW}px; height:${BH}px; overflow:hidden; background:#fff; font-family:${F.jp}; color:${C.ink};">
<div style="position:absolute; left:72px; top:50px; display:flex; align-items:baseline; gap:16px; z-index:10;">${num(`D${n}`, { size: 15, color: C.muted })}<span style="font-weight:900; font-size:32px; line-height:1.2; white-space:nowrap; letter-spacing:.01em;">${title}</span>${sub ? `<span style="font-size:15px; color:${C.ink2}; white-space:nowrap;">${sub}</span>` : ''}</div>
<div style="position:absolute; right:72px; top:58px; z-index:10; display:flex; align-items:center; gap:12px; font-size:12px; color:${C.muted};">${mark(15)}<span>統合案（A＋B＋C） ・ 2026-09</span></div>
${body}
<div style="position:absolute; left:72px; bottom:24px; font-size:11px; color:${C.muted}; z-index:10;">${SRC}</div>
${/^\d+$/.test(n) ? `<div style="position:absolute; right:72px; bottom:24px; z-index:10;">${num(`${n} / ${TOTAL}`, { size: 11, color: C.muted })}</div>` : ''}
</div>`;
}

export const at = (x, y, html, { w = 0, z = 4, style = '' } = {}) => `<div style="position:absolute; left:${x}px; top:${y}px;${w ? ` width:${w}px;` : ''} z-index:${z};${style ? ` ${style}` : ''}">${html}</div>`;
export const ph = (screen, x, y, s, o = {}) => at(x, y, phone(screen, { scale: s }), o);
export const pc = (screen, x, y, s, o = {}) => at(x, y, browser(screen, { scale: s, ...(o.url ? { url: o.url } : {}) }), o);
export const h = (t, { size = 18, w = 700, color = C.ink } = {}) => `<div style="font-size:${size}px; font-weight:${w}; line-height:1.4; color:${color};">${t}</div>`;
export const p = (t, { size = 13, color = C.ink2, lh = 1.7 } = {}) => `<div style="font-size:${size}px; line-height:${lh}; color:${color};">${t}</div>`;
export const kick = (t, color = C.muted) => `<div style="font-size:12.5px; font-weight:700; color:${color}; letter-spacing:.04em;">${t}</div>`;
export const dot = (n, { size = 24, bg = C.ink, fg = '#FFFFFF' } = {}) => `<span style="display:inline-flex; align-items:center; justify-content:center; width:${size}px; height:${size}px; border-radius:50%; background:${bg}; color:${fg}; font-family:${F.num}; font-weight:500; font-size:${Math.round(size * 0.5)}px; flex-shrink:0;">${n}</span>`;
export const box = (inner, { pad = 18, r = 22, bg = '#fff', shadow = SH.soft, gap = 10, extra = '' } = {}) => `<div style="box-sizing:border-box; padding:${pad}px; border-radius:${r}px; background:${bg}; box-shadow:${shadow}; display:flex; flex-direction:column; gap:${gap}px; ${extra}">${inner}</div>`;
export const note = (n, title, body, { w = 0, size = 14.5 } = {}) => `<div style="${w ? `width:${w}px; ` : ''}display:flex; gap:10px;">${dot(n)}<div style="min-width:0;"><div style="font-size:${size}px; font-weight:700; line-height:1.45;">${title}</div>${body ? `<div style="font-size:12.5px; line-height:1.65; color:${C.ink2}; margin-top:3px;">${body}</div>` : ''}</div></div>`;
export const bl = (list, { color = C.ink, ic = 'check', fs = 13 } = {}) => list.map((t) => `<div style="display:flex; gap:7px; font-size:${fs}px; line-height:1.55; color:${C.ink2};"><span style="margin-top:2px;">${icon(ic, { size: 15, color, sw: 2.2 })}</span><span>${t}</span></div>`).join('');
export const arrow = (x, y, w = 44, { color = C.faint, rot = 0 } = {}) => `<svg width="${w}" height="20" viewBox="0 0 ${w} 20" aria-hidden="true" style="position:absolute; left:${x}px; top:${y}px; z-index:6;${rot ? ` transform:rotate(${rot}deg); transform-origin:0 50%;` : ''}"><path d="M2 10H${w - 6}M${w - 13} 3l7 7-7 7" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
// 大きな数字＋小さな説明（好き10）
export const bigNum = (n, t, { size = 44, color = C.ink, sub = '' } = {}) => `<div style="display:flex; flex-direction:column; gap:2px;"><div style="font-family:${F.num}; font-size:${size}px; font-weight:500; letter-spacing:-.02em; line-height:1; color:${color};">${n}${sub ? `<span style="font-size:${Math.round(size * 0.4)}px; color:${C.muted}; margin-left:4px;">${sub}</span>` : ''}</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.5;">${t}</div></div>`;

// 別案C（全ジャンル前提）— 共通の部品。紙と札：地は温かい白、モノの絵だけが色、声は帯と札で読む
import { icon as baseIcon, esc } from '../lib.mjs';
import { art as earArt } from '../b/libb.mjs';
export { esc, earArt };

export const C = {
  paper: '#F4F2ED', card: '#FFFFFF', tile: '#EAE7E0', tile2: '#DEDAD1', hair: '#E2DED6', line: '#CDC7BC',
  ink: '#1C1B19', ink2: '#47453F', muted: '#6C6860', faint: '#A39E94',
  neg: '#CC5236', negSoft: '#F5DDD5', negText: '#A33A22',
  pos: '#2E5EA4', posSoft: '#DBE4F2', posText: '#234E8C',
  side: '#C9C2B4', mid: '#1C1B19', rest: '#E8E4DC',
  board: '#E8E5DE',
};
export const F = {
  jp: "'IBM Plex Sans JP','Hiragino Sans','Yu Gothic',sans-serif",
  mono: "'IBM Plex Mono','IBM Plex Sans JP',ui-monospace,monospace",
};
export const FONT_LINK = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+JP:wght@400;500;700&amp;family=IBM+Plex+Mono:wght@400;500;600&amp;display=swap';
export const BASE_CSS = 'body{margin:0}';
export const SH = {
  card: '0 1px 2px rgba(28,27,25,.06), 0 6px 18px rgba(28,27,25,.06)',
  lift: '0 16px 36px rgba(28,27,25,.16), 0 3px 8px rgba(28,27,25,.06)',
  sheet: '0 -10px 30px rgba(28,27,25,.10)',
};

// ---------- アイコン ----------
const EXTRA = {
  loop: '<path d="M17 7.5A6.5 6.5 0 0 0 5.6 10"></path><path d="M17.5 4v3.8h-3.8"></path><path d="M7 16.5A6.5 6.5 0 0 0 18.4 14"></path><path d="M6.5 20v-3.8h3.8"></path>',
  person: '<circle cx="12" cy="8" r="3.5"></circle><path d="M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6"></path>',
  ruler: '<rect x="3" y="8" width="18" height="8" rx="2"></rect><path d="M7 8v3M11 8v4M15 8v3M19 8v2"></path>',
  tag: '<path d="M4 12.5V5.5A1.5 1.5 0 0 1 5.5 4h7l7.5 7.5-8.5 8.5z"></path><circle cx="8.5" cy="8.5" r="1.5"></circle>',
  shelf: '<path d="M4 6h16M4 12h16M4 18h16"></path><path d="M7 6v-2M14 12v-2M10 18v-2"></path>',
  dots: '<circle cx="7" cy="8" r="1.8"></circle><circle cx="16" cy="6.5" r="1.8"></circle><circle cx="11" cy="14" r="1.8"></circle><circle cx="18" cy="16" r="1.8"></circle><path d="M8.6 9.2 9.6 12.5" stroke-dasharray="1.2 1.6"></path>',
  gift: '<rect x="4.5" y="9" width="15" height="11" rx="1.5"></rect><path d="M4 9h16M12 9v11"></path><path d="M12 9c-3 0-4.5-1.3-4.5-2.8S9 3.6 12 9c3-5.4 4.5-4.3 4.5-2.8S15 9 12 9z"></path>',
  place: '<path d="M4 20V9.5L12 4l8 5.5V20z"></path><path d="M9.5 20v-6h5v6"></path>',
  alert: '<path d="M12 4 21 19H3z"></path><path d="M12 10v4M12 16.5v.2"></path>',
  truck: '<path d="M3.5 7h10v9h-10zM13.5 10h4l3 3v3h-7"></path><circle cx="7" cy="17.5" r="1.6"></circle><circle cx="17" cy="17.5" r="1.6"></circle>',
  flask: '<path d="M9.5 4h5M10.5 4v5L5 18.5A1.2 1.2 0 0 0 6 20h12a1.2 1.2 0 0 0 1-1.5L13.5 9V4"></path><path d="M7.5 15h9"></path>',
};
export function icon(name, o = {}) {
  if (EXTRA[name]) { const { size = 20, color = 'currentColor', sw = 1.8 } = o; return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block; flex-shrink:0;">${EXTRA[name]}</svg>`; }
  return baseIcon(name, o);
}

// ---------- モノの絵（カテゴリの入口に使う。実装では代表商品の画像） ----------
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * f)))); return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`; };
const OBJ = {
  kettle: (c) => `<path d="M30 76h40l-3-34a17 17 0 0 0-34 0z" fill="${c}"></path><path d="M70 50c9 0 12 5 12 11s-4 11-10 11" fill="none" stroke="${shade(c, .7)}" stroke-width="5"></path><path d="M31 49 18 40l-3 3 14 12" fill="${c}"></path><rect x="44" y="21" width="12" height="6" rx="3" fill="${shade(c, .6)}"></rect><rect x="30" y="72" width="40" height="5" rx="2" fill="${shade(c, .75)}"></rect>`,
  pan: (c) => `<ellipse cx="42" cy="62" rx="27" ry="10" fill="${shade(c, .72)}"></ellipse><path d="M15 56h54v6a27 10 0 0 1-54 0z" fill="${c}"></path><ellipse cx="42" cy="56" rx="27" ry="9" fill="${shade(c, .55)}"></ellipse><rect x="66" y="54" width="26" height="6" rx="3" fill="#3A3733" transform="rotate(-8 66 57)"></rect>`,
  bag: (c) => `<path d="M31 30h38l4 48H27z" fill="${c}"></path><path d="M31 30l3-8h32l3 8z" fill="${shade(c, .82)}"></path><circle cx="50" cy="55" r="9" fill="#F7F4EE"></circle><path d="M46 55h8" stroke="${shade(c, .6)}" stroke-width="2"></path>`,
  bottle: (c) => `<rect x="36" y="32" width="28" height="46" rx="8" fill="${c}"></rect><rect x="41" y="20" width="18" height="14" rx="3" fill="${shade(c, .55)}"></rect><rect x="41" y="48" width="18" height="16" rx="2" fill="rgba(255,255,255,.55)"></rect>`,
  dryer: (c) => `<rect x="24" y="30" width="46" height="24" rx="12" fill="${c}"></rect><rect x="68" y="34" width="10" height="16" rx="3" fill="${shade(c, .7)}"></rect><path d="M40 52l-3 26h11l4-26z" fill="${shade(c, .85)}"></path><circle cx="36" cy="42" r="5" fill="${shade(c, .8)}"></circle>`,
  brush: (c) => `<rect x="46" y="30" width="9" height="48" rx="4.5" fill="${c}"></rect><rect x="47" y="18" width="7" height="14" rx="2" fill="#F4F2ED"></rect><circle cx="50.5" cy="46" r="2.5" fill="${shade(c, .6)}"></circle>`,
  shoe: (c) => `<path d="M16 64c2-14 10-22 20-24l10 6c8 4 18 6 30 8 6 1 9 5 9 10z" fill="${c}"></path><path d="M14 64h72v6a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4z" fill="${lum(c) > .7 ? '#FFFFFF' : '#F1EFEA'}" stroke="rgba(0,0,0,.08)"></path><path d="M40 47l6 3M44 44l6 3M48 42l6 3" stroke="${lum(c) < .5 ? 'rgba(255,255,255,.55)' : 'rgba(0,0,0,.28)'}" stroke-width="2" stroke-linecap="round"></path>`,
  earbuds: (c) => `<rect x="22" y="40" width="26" height="34" rx="13" fill="${c}"></rect><rect x="52" y="34" width="26" height="34" rx="13" fill="${shade(c, .92)}"></rect><circle cx="35" cy="49" r="4" fill="${shade(c, .75)}"></circle><circle cx="65" cy="43" r="4" fill="${shade(c, .7)}"></circle>`,
  pack: (c) => `<rect x="28" y="28" width="44" height="50" rx="12" fill="${c}"></rect><path d="M40 28a10 10 0 0 1 20 0" fill="none" stroke="${shade(c, .6)}" stroke-width="4"></path><rect x="36" y="52" width="28" height="18" rx="5" fill="${shade(c, .86)}"></rect>`,
  vacuum: (c) => `<rect x="52" y="14" width="7" height="52" rx="3.5" fill="${shade(c, .7)}" transform="rotate(12 55 40)"></rect><rect x="54" y="20" width="16" height="18" rx="6" fill="${c}" transform="rotate(12 62 29)"></rect><path d="M30 70h32a4 4 0 0 1 0 8H30a4 4 0 0 1 0-8z" fill="${c}"></path>`,
  lamp: (c) => `<path d="M34 26h32l8 22H26z" fill="${c}"></path><rect x="48" y="48" width="4" height="26" fill="${shade(c, .55)}"></rect><rect x="36" y="74" width="28" height="5" rx="2.5" fill="${shade(c, .55)}"></rect>`,
  chair: (c) => `<rect x="30" y="22" width="40" height="30" rx="8" fill="${c}"></rect><rect x="26" y="52" width="48" height="12" rx="5" fill="${shade(c, .85)}"></rect><path d="M32 64l-4 16M68 64l4 16" stroke="${shade(c, .5)}" stroke-width="4" stroke-linecap="round"></path>`,
  pillow: (c) => `<path d="M22 40c8-8 48-8 56 0 4 6 4 18 0 24-8 8-48 8-56 0-4-6-4-18 0-24z" fill="${c}"></path><path d="M30 52h40" stroke="${shade(c, .88)}" stroke-width="2"></path>`,
  laptop: (c) => `<rect x="26" y="26" width="48" height="32" rx="3" fill="${c}"></rect><rect x="30" y="30" width="40" height="24" rx="1.5" fill="${shade(c, .55)}"></rect><path d="M18 60h64l-4 8H22z" fill="${shade(c, 1.05)}"></path>`,
  tee: (c) => `<path d="M36 22 22 30l6 12 8-4v38h28V38l8 4 6-12-14-8c-2 5-6 8-12 8s-10-3-12-8z" fill="${c}"></path>`,
  watch: (c) => `<rect x="42" y="16" width="16" height="68" rx="6" fill="${shade(c, .7)}"></rect><circle cx="50" cy="50" r="17" fill="${c}"></circle><circle cx="50" cy="50" r="12" fill="#F7F5F0"></circle><path d="M50 50V42M50 50l6 3" stroke="#1C1B19" stroke-width="2" stroke-linecap="round"></path>`,
  stroller: (c) => `<path d="M26 34a24 24 0 0 1 24 24H26z" fill="${c}"></path><path d="M26 58h40l6-24" fill="none" stroke="${shade(c, .55)}" stroke-width="4"></path><circle cx="32" cy="72" r="6" fill="#3A3733"></circle><circle cx="62" cy="72" r="6" fill="#3A3733"></circle>`,
  bowl: (c) => `<path d="M22 50h56a28 22 0 0 1-56 0z" fill="${c}"></path><ellipse cx="50" cy="50" rx="28" ry="6" fill="${shade(c, .75)}"></ellipse><ellipse cx="50" cy="49" rx="20" ry="3.5" fill="#B58B62"></ellipse>`,
  tent: (c) => `<path d="M50 22 16 76h68z" fill="${c}"></path><path d="M50 22 40 76h20z" fill="${shade(c, .7)}"></path>`,
  camera: (c) => `<rect x="22" y="34" width="56" height="38" rx="7" fill="${c}"></rect><rect x="30" y="28" width="14" height="8" rx="2" fill="${shade(c, .8)}"></rect><circle cx="52" cy="53" r="13" fill="${shade(c, .5)}"></circle><circle cx="52" cy="53" r="7" fill="${shade(c, .3)}"></circle>`,
};
export const OBJ_COL = { kettle: '#D8D3CA', pan: '#56524C', bag: '#B99A76', bottle: '#E3DDD2', dryer: '#E9E7E3', brush: '#DCE2E6', shoe: '#D9D4CB', earbuds: '#F0EFEC', pack: '#8A8F86', vacuum: '#C9CED3', lamp: '#E8DCC6', chair: '#B7AE9F', pillow: '#EFEBE3', laptop: '#BFC2C6', tee: '#DAD5CB', watch: '#C8C3BA', stroller: '#C7CCC2', bowl: '#D6CDBF', tent: '#C9B99A', camera: '#3E3C39' };
export function obj(name, { size = 64, col = OBJ_COL[name] } = {}) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true" style="display:block; flex-shrink:0;"><ellipse cx="50" cy="82" rx="30" ry="5" fill="rgba(28,27,25,.08)"></ellipse>${OBJ[name](col)}</svg>`;
}
// 測った商品の絵（色は商品名から推した代わりの絵）
export function shoeArt(s, size = 64) {
  const up = s.col, sole = s.sole || '#F2F1EE', th = s.thick ? 10 : 6;
  const lace = lum(up) < 0.5 ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.26)';
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true" style="display:block; flex-shrink:0;"><ellipse cx="50" cy="${76 + th / 2}" rx="36" ry="4" fill="rgba(28,27,25,.09)"></ellipse><path d="M14 ${70 - th}c2-16 11-25 22-27l10 6c8 4 19 6 31 8 7 1 10 6 10 ${13 - th / 2}z" fill="${up}"${lum(up) > 0.85 ? ' stroke="rgba(0,0,0,.12)"' : ''}></path><path d="M12 ${70 - th}h76v${th}a5 5 0 0 1-5 5H17a5 5 0 0 1-5-5z" fill="${sole}" stroke="rgba(0,0,0,.10)"></path><path d="M38 ${49 - th / 2}l7 3M42 ${46 - th / 2}l7 3M46 ${43 - th / 2}l7 3" stroke="${lace}" stroke-width="2.2" stroke-linecap="round"></path></svg>`;
}
export function bottleArt(s, size = 64) {
  const c = s.col;
  const set = s.note === 'セット';
  const one = (x, h, cc) => `<rect x="${x}" y="${78 - h}" width="22" height="${h}" rx="6" fill="${cc}" stroke="rgba(0,0,0,.08)"></rect><rect x="${x + 5}" y="${70 - h}" width="12" height="10" rx="2.5" fill="${shade(cc, .6)}"></rect>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true" style="display:block; flex-shrink:0;"><ellipse cx="50" cy="80" rx="28" ry="4" fill="rgba(28,27,25,.08)"></ellipse>${set ? one(24, 34, shade(c, 1.05)) + one(52, 44, c) : `<rect x="37" y="30" width="26" height="48" rx="8" fill="${c}" stroke="rgba(0,0,0,.08)"></rect><rect x="42" y="18" width="16" height="14" rx="3" fill="${shade(c, .55)}"></rect><rect x="42" y="46" width="16" height="16" rx="2" fill="rgba(255,255,255,.6)"></rect>`}</svg>`;
}
export function bagArt(s, size = 64) {
  const c = s.col, cap = s.id === 'dp-cap';
  const inner = cap ? `<rect x="28" y="36" width="44" height="40" rx="4" fill="${c}"></rect><circle cx="40" cy="56" r="5" fill="#C9A66B"></circle><circle cx="52" cy="56" r="5" fill="#9E6B4E"></circle><circle cx="64" cy="56" r="5" fill="#6C8B8A"></circle>` : `<path d="M31 30h38l4 48H27z" fill="${c}"></path><path d="M31 30l3-8h32l3 8z" fill="${shade(c, .82)}"></path><circle cx="50" cy="55" r="9" fill="#F7F4EE"></circle>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true" style="display:block; flex-shrink:0;"><ellipse cx="50" cy="80" rx="28" ry="4" fill="rgba(28,27,25,.08)"></ellipse>${inner}</svg>`;
}

// ---------- 小さな部品 ----------
export const num = (t, { size = 14, w = 500, color = C.ink } = {}) => `<span style="font-family:${F.mono}; font-size:${size}px; font-weight:${w}; color:${color}; letter-spacing:-.02em; font-variant-numeric:tabular-nums;">${t}</span>`;
export const label = (t, { color = C.muted, size = 11 } = {}) => `<span style="font-family:${F.mono}; font-size:${size}px; letter-spacing:.08em; color:${color}; white-space:nowrap;">${t}</span>`;
export const tile = (inner, { w = 64, h = w, r = 14, bg = C.tile } = {}) => `<span style="display:inline-flex; align-items:center; justify-content:center; width:${w}px; height:${h}px; border-radius:${r}px; background:${bg}; flex-shrink:0;">${inner}</span>`;
export function pill(t, { kind = 'dark', h = 46, fs = 14, full = false, ic = '' } = {}) {
  const st = { dark: `background:${C.ink}; color:#fff;`, light: `background:${C.tile}; color:${C.ink};`, line: `background:${C.card}; color:${C.ink}; border:1.5px solid ${C.ink};` }[kind];
  return `<button type="button" style="display:inline-flex; align-items:center; justify-content:center; gap:8px; height:${h}px; padding:0 ${Math.round(h * 0.42)}px; border-radius:${h / 2}px; border:none; ${st} font-family:${F.jp}; font-size:${fs}px; font-weight:700; white-space:nowrap; box-sizing:border-box;${full ? ' width:100%;' : ''}">${ic ? icon(ic, { size: fs + 3 }) : ''}${t}</button>`;
}
// 条件のチップ。on は黒地。人の印つき
export function cond(t, { on = false, h = 34, fs = 13, ic = true } = {}) {
  return `<button type="button" style="display:inline-flex; align-items:center; gap:6px; height:${h}px; padding:0 ${ic ? 12 : 14}px 0 ${ic ? 10 : 14}px; border-radius:${h / 2}px; border:${on ? 'none' : `1px solid ${C.line}`}; background:${on ? C.ink : C.card}; color:${on ? '#fff' : C.ink}; font-family:${F.jp}; font-size:${fs}px; font-weight:${on ? 700 : 500}; white-space:nowrap; box-sizing:border-box; flex-shrink:0;">${ic ? icon(on ? 'check' : 'person', { size: fs + 1, sw: 2 }) : ''}${t}</button>`;
}
export const aiNote = (t = 'AIが分類した件数', fs = 11) => `<span style="display:inline-flex; align-items:center; gap:4px; font-size:${fs}px; color:${C.muted}; white-space:nowrap;">${icon('info', { size: 13, sw: 2 })}${t}</span>`;
export const sampleNote = (t = '見本：単語の規則で数えた値（1商品30件）', fs = 11) => `<span style="display:inline-flex; align-items:center; gap:5px; height:22px; padding:0 9px; border-radius:11px; background:${C.tile}; font-size:${fs}px; color:${C.ink2}; white-space:nowrap;">${icon('flask', { size: 13, sw: 2 })}${t}</span>`;

// 段の印（0 名前だけ・1 声札・2 棚・3 地図）
export const TIERS = [
  { n: 0, name: '名前だけ', ic: 'list' }, { n: 1, name: '声札', ic: 'tag' }, { n: 2, name: '棚', ic: 'shelf' }, { n: 3, name: '地図', ic: 'dots' },
];
export function tierMark(n, { size = 'm', dark = false } = {}) {
  const t = TIERS[n];
  const h = size === 's' ? 22 : 26, fs = size === 's' ? 11 : 12;
  return `<span style="display:inline-flex; align-items:center; gap:5px; height:${h}px; padding:0 9px 0 7px; border-radius:${h / 2}px; background:${dark ? C.ink : C.card}; border:1px solid ${dark ? C.ink : C.line}; color:${dark ? '#fff' : C.ink}; font-size:${fs}px; font-weight:700; white-space:nowrap; box-sizing:border-box; flex-shrink:0;">${icon(t.ic, { size: fs + 2, sw: 2 })}段${n}・${t.name}</span>`;
}

// ---------- 声の帯（良し悪し）：左から不満、右から満足、真ん中は「ふれていない」。全体の長さ＝読んだ件数 ----------
export function voiceStrip({ pos, neg, read, w = 300, h = 10, labels = true, name = '', fs = 12, thin = false, muted = false } = {}) {
  const nw = Math.max(neg ? 3 : 0, Math.round((neg / read) * w)), pw = Math.max(pos ? 3 : 0, Math.round((pos / read) * w));
  const bar = `<div style="position:relative; width:${w}px; height:${h}px; border-radius:${h / 2}px; background:${C.rest}; overflow:hidden;${thin ? ` outline:1px dashed ${C.faint}; outline-offset:2px;` : ''}"><div style="position:absolute; left:0; top:0; width:${nw}px; height:${h}px; background:${muted ? '#DDB3A7' : C.neg};"></div><div style="position:absolute; right:0; top:0; width:${pw}px; height:${h}px; background:${muted ? '#AFC1DC' : C.pos};"></div></div>`;
  if (!labels) return bar;
  return `<div style="width:${w}px; display:flex; flex-direction:column; gap:5px;">${name ? `<div style="display:flex; justify-content:space-between; align-items:baseline; font-size:${fs}px;"><b style="font-weight:700;">${name}</b><span style="font-family:${F.mono}; font-size:11px; color:${C.muted};">${read}件中</span></div>` : ''}${bar}<div style="display:flex; justify-content:space-between; font-size:${Math.max(11, fs - 1)}px;"><span style="color:${C.negText};">不満 ${num(neg, { size: fs, color: C.negText, w: 600 })}</span><span style="color:${C.posText};">満足 ${num(pos, { size: fs, color: C.posText, w: 600 })}</span></div></div>`;
}
// ちょうどの帯（向き）：3つの区間。真ん中が「ちょうど」。良し悪しの色は使わない
export function justStrip({ counts, labels = ['小さめ', 'ちょうど', '大きめ'], w = 300, h = 10, fs = 12, name = '', read = 0, showNums = true } = {}) {
  const tot = counts.reduce((a, b) => a + (b || 0), 0) || 1;
  const three = counts.length === 3;
  const cols = three ? [C.side, C.mid, C.side] : [C.side, C.mid];
  const segs = counts.map((c, i) => `<div style="width:${((c || 0) / tot) * 100}%; height:${h}px; background:${cols[i]};${i ? ' border-left:2px solid #fff;' : ''} box-sizing:border-box;"></div>`).join('');
  const lab = counts.map((c, i) => `<span style="display:flex; align-items:baseline; gap:3px; ${i === counts.length - 1 ? 'justify-content:flex-end;' : i === 1 && three ? 'justify-content:center;' : ''} flex:1; min-width:0; white-space:nowrap;"><span style="color:${C.ink2};">${labels[i]}</span>${showNums ? num(c, { size: fs, w: 600 }) : ''}</span>`).join('');
  return `<div style="width:${w}px; display:flex; flex-direction:column; gap:5px;">${name ? `<div style="display:flex; justify-content:space-between; align-items:baseline; font-size:${fs}px;"><b>${name}</b>${read ? `<span style="font-family:${F.mono}; font-size:11px; color:${C.muted};">${read}件中 ${tot}件</span>` : ''}</div>` : ''}<div style="display:flex; width:${w}px; border-radius:${h / 2}px; overflow:hidden; background:${C.rest};">${segs}</div><div style="display:flex; font-size:${Math.max(11, fs - 1)}px;">${lab}</div></div>`;
}
// また買った（行動）
export function repeatLine(n, read, { fs = 12 } = {}) {
  return `<span style="display:inline-flex; align-items:center; gap:5px; font-size:${fs}px; white-space:nowrap;">${icon('loop', { size: fs + 3, sw: 2 })}また買った ${num(n, { size: fs + 1, w: 600 })}<span style="font-family:${F.mono}; font-size:11px; color:${C.muted};">/ ${read}件</span></span>`;
}

// ---------- 声札（こえふだ）：どのカテゴリでも同じ形 ----------
// lines：[{kind:'neg'|'pos', t, n}]、just：{counts, labels, name}、rep：n
export function voiceTag({ img, name, sub = '', read, total, lines = [], just = null, rep = null, w = 165, imgH = 104, thin = false, cond = '', sel = false } = {}) {
  const inner = w - 24;
  const L = lines.map((l) => `<div style="display:flex; align-items:baseline; gap:6px; font-size:12px; line-height:1.35; min-width:0;"><span style="flex-shrink:0; width:8px; height:8px; border-radius:2px; background:${l.kind === 'neg' ? C.neg : C.pos}; transform:translateY(-1px);"></span><span style="color:${l.kind === 'neg' ? C.negText : C.posText}; font-weight:700; flex-shrink:0;">${l.kind === 'neg' ? '不満' : '満足'}</span><span style="min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:${C.ink};">${l.t}</span>${num(l.n, { size: 12, w: 600 })}</div>`).join('');
  return `<div style="position:relative; width:${w}px; box-sizing:border-box; padding:12px; border-radius:16px; background:${C.card}; box-shadow:${sel ? `0 0 0 2px ${C.ink}, ${SH.lift}` : SH.card}; display:flex; flex-direction:column; gap:8px;${thin ? ` outline:1px dashed ${C.line}; outline-offset:-5px;` : ''}">
<span style="position:absolute; left:${w / 2 - 5}px; top:6px; width:10px; height:10px; border-radius:50%; background:${C.paper}; box-shadow:inset 0 1px 2px rgba(0,0,0,.18);"></span>
<div style="height:${imgH}px; border-radius:11px; background:${C.tile}; display:flex; align-items:center; justify-content:center; margin-top:8px;${thin ? ' opacity:.7;' : ''}">${img}</div>
<div><div style="font-size:13px; font-weight:700; line-height:1.35; min-height:${w < 200 ? 35 : 0}px;">${name}${sub ? `<span style="font-weight:500; color:${C.muted};"> ${sub}</span>` : ''}</div><div style="font-family:${F.mono}; font-size:11px; color:${C.muted}; margin-top:3px; white-space:nowrap;">読んだ ${read} / ${total.toLocaleString('ja-JP')}件</div>${cond ? `<div style="font-size:11px; color:${C.ink2}; margin-top:2px;">${cond}</div>` : ''}</div>
${L ? `<div style="display:flex; flex-direction:column; gap:4px;">${L}</div>` : ''}
${just ? justStrip({ ...just, labels: just.counts.length === 3 ? ['小', 'ちょうど', '大'] : just.labels, w: inner, h: 7, fs: 11 }) : ''}
${rep != null ? `<div>${repeatLine(rep, read, { fs: 11 })}</div>` : ''}
</div>`;
}

// ---------- 端末の枠 ----------
export function phone(screen, { scale = 1 } = {}) {
  const W = 390, H = 844, B = 10;
  return `<div style="width:${(W + B * 2) * scale}px; height:${(H + B * 2) * scale}px; flex-shrink:0;"><div style="width:${W + B * 2}px; height:${H + B * 2}px; transform:scale(${scale}); transform-origin:0 0; box-sizing:border-box; padding:${B}px; border-radius:58px; background:#1C1B19; box-shadow:0 30px 64px rgba(28,27,25,.20), 0 8px 18px rgba(28,27,25,.10);"><div style="width:${W}px; height:${H}px; border-radius:48px; overflow:hidden; position:relative; background:${C.paper};">${screen}</div></div></div>`;
}
export function browser(screen, { scale = 1, W = 1440, H = 900, url = 'koe.example' } = {}) {
  const bar = 40;
  return `<div style="width:${W * scale}px; height:${(H + bar) * scale}px; flex-shrink:0;"><div style="width:${W}px; height:${H + bar}px; transform:scale(${scale}); transform-origin:0 0; border-radius:16px; overflow:hidden; background:${C.paper}; box-shadow:0 30px 64px rgba(28,27,25,.16), 0 6px 16px rgba(28,27,25,.08);"><div style="height:${bar}px; display:flex; align-items:center; gap:8px; padding:0 16px; background:${C.tile};"><span style="width:11px; height:11px; border-radius:50%; background:${C.tile2};"></span><span style="width:11px; height:11px; border-radius:50%; background:${C.tile2};"></span><span style="width:11px; height:11px; border-radius:50%; background:${C.tile2};"></span><span style="margin-left:14px; height:24px; padding:0 14px; border-radius:12px; background:#fff; display:flex; align-items:center; font-family:${F.mono}; font-size:12px; color:${C.muted};">${url}</span></div><div style="width:${W}px; height:${H}px; position:relative; overflow:hidden;">${screen}</div></div></div>`;
}
// 下のナビ（ホーム・探す・並べる・わたし）
export function navBar(active = 0) {
  const items = [['home', 'ホーム'], ['search', '探す'], ['pair', '並べる'], ['person', 'わたし']];
  return `<nav aria-label="メイン" style="position:absolute; left:0; bottom:0; width:390px; height:84px; box-sizing:border-box; padding:8px 18px 22px; background:${C.card}; border-top:1px solid ${C.hair}; display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); z-index:30;">${items.map(([ic, t], i) => `<a href="#" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; color:${i === active ? C.ink : C.muted}; text-decoration:none; font-size:11px; font-weight:${i === active ? 700 : 500};">${icon(ic, { size: 22, sw: i === active ? 2.2 : 1.8 })}${t}</a>`).join('')}</nav>`;
}
export const statusBar = () => `<div style="position:absolute; left:0; top:0; width:390px; height:44px; display:flex; align-items:center; justify-content:space-between; padding:0 30px; box-sizing:border-box; font-family:${F.mono}; font-size:13px; font-weight:600; z-index:40;"><span>9:41</span><span style="display:flex; gap:5px; align-items:center;"><span style="width:17px; height:10px; border-radius:2px; border:1.5px solid ${C.ink};"></span></span></div>`;
export function searchBox(t = '商品名・カテゴリ・困りごと', { w = 342, h = 48 } = {}) {
  return `<label style="display:flex; align-items:center; gap:10px; width:${w}px; height:${h}px; padding:0 16px; border-radius:${h / 2}px; background:${C.card}; box-shadow:${SH.card}; box-sizing:border-box; color:${C.muted}; font-size:14px;">${icon('search', { size: 18 })}<input type="text" placeholder="${t}" aria-label="探す" style="border:none; outline:none; background:transparent; font-family:${F.jp}; font-size:14px; color:${C.ink}; width:100%;"></label>`;
}
// 仮の名前。印は「札」
export function mark(size = 18, { color = C.ink, text = '（名前は未定）' } = {}) {
  return `<span style="display:inline-flex; align-items:center; gap:${Math.round(size * 0.4)}px; white-space:nowrap;"><svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5V5.5A1.5 1.5 0 0 1 5.5 4h7l7.5 7.5-8.5 8.5z" fill="${color}"></path><circle cx="8.5" cy="8.5" r="1.7" fill="${C.paper}"></circle><path d="M11 14.5h2.4" stroke="${C.neg}" stroke-width="2.2"></path><path d="M13.4 14.5h2.6" stroke="${C.pos}" stroke-width="2.2"></path></svg><span style="font-family:${F.jp}; font-weight:700; font-size:${size}px; color:${color}; letter-spacing:.02em;">${text}</span></span>`;
}

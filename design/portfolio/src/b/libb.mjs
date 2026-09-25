// 別案B（参考から）— 共通の部品。物が主役、画面はほぼ白黒、声の2色は印だけに使う
import { icon as baseIcon, esc } from '../lib.mjs';
export { esc };

export const C = {
  bg: '#FFFFFF', tile: '#F2F2F1', tile2: '#E9E9E7', map: '#F6F6F5', grid: '#E8E8E6',
  ink: '#111111', ink2: '#4F4F4F', muted: '#6B6B6B', faint: '#A3A3A3', hair: '#E3E3E1',
  sat: '#6573F0', satSoft: '#E6E8FD', satText: '#4550C4',
  neg: '#F06A4C', negSoft: '#FDE5DF', negText: '#B23E1E',
  none: '#D6D6D4',
  board: '#EDEDEB',
  dark: '#121314', dark2: '#1D1E20', darkInk: '#F1F1F0',
};
export const F = {
  jp: "'Zen Kaku Gothic New','Hiragino Sans','Yu Gothic',sans-serif",
  num: "'Outfit','Zen Kaku Gothic New',sans-serif",
  mono: "'DM Mono',ui-monospace,Menlo,monospace",
};
export const FONT_LINK = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&amp;family=DM+Mono:wght@400;500&amp;family=Zen+Kaku+Gothic+New:wght@400;500;700;900&amp;display=swap';
export const BASE_CSS = `body{margin:0}`;
export const SH = {
  soft: '0 1px 2px rgba(17,17,17,.05), 0 8px 24px rgba(17,17,17,.06)',
  lift: '0 18px 40px rgba(17,17,17,.16), 0 3px 8px rgba(17,17,17,.06)',
  sheet: '0 -10px 34px rgba(17,17,17,.10)',
  obj: '0 10px 18px rgba(17,17,17,.10)',
};

// ---------- アイコン（観点の印も含む） ----------
const EXTRA = {
  ear: '<path d="M8 10a4 4 0 1 1 8 0c0 2.5-2 3.4-2.6 5-.5 1.4-.9 3-2.9 3-1.2 0-2-.8-2.2-1.8"></path><path d="M10.5 10.5a1.5 1.5 0 1 1 3 0"></path>',
  quiet: '<path d="M4 9.5h3l4-3.5v12l-4-3.5H4z"></path><path d="M15 9l5 6M20 9l-5 6"></path>',
  waves: '<path d="M4 9.5h3l4-3.5v12l-4-3.5H4z"></path><path d="M15 9.5a4 4 0 0 1 0 5M17.5 7a7.5 7.5 0 0 1 0 10"></path>',
  tap: '<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11"></path><path d="M12 10.5a1.5 1.5 0 0 1 3 0v1a1.5 1.5 0 0 1 3 0V15a5 5 0 0 1-5 5h-1.5a5 5 0 0 1-4.3-2.5L5 14.2a1.4 1.4 0 0 1 2.3-1.6L9 14"></path>',
  yen: '<path d="M7 5l5 7 5-7M12 12v7M8.5 13.5h7M8.5 16.5h7"></path>',
  all: '<circle cx="8" cy="8" r="2.4"></circle><circle cx="16" cy="8" r="2.4"></circle><circle cx="8" cy="16" r="2.4"></circle><circle cx="16" cy="16" r="2.4"></circle>',
  stack: '<path d="M5 8l7-3.5L19 8l-7 3.5z"></path><path d="M5 12l7 3.5 7-3.5M5 16l7 3.5 7-3.5"></path>',
  grid: '<rect x="4.5" y="4.5" width="6" height="6" rx="1.8"></rect><rect x="13.5" y="4.5" width="6" height="6" rx="1.8"></rect><rect x="4.5" y="13.5" width="6" height="6" rx="1.8"></rect><rect x="13.5" y="13.5" width="6" height="6" rx="1.8" stroke-dasharray="2 2"></rect>',
  link: '<circle cx="6" cy="12" r="2.2"></circle><circle cx="18" cy="6.5" r="2.2"></circle><circle cx="18" cy="17.5" r="2.2"></circle><path d="M8 11l8-3.6M8 13l8 3.6" stroke-dasharray="1.6 2"></path>',
};
export function icon(name, o = {}) {
  if (EXTRA[name]) { const { size = 20, color = 'currentColor', sw = 1.8 } = o; return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block; flex-shrink:0;">${EXTRA[name]}</svg>`; }
  return baseIcon(name, o);
}
export const ASPECT_ICON = { fit: 'ear', anc: 'quiet', ambient: 'waves', controls: 'tap', value: 'yen', sound: 'waves', connection: 'link', battery: 'stack', bass: 'waves', calls: 'waves' };

// ---------- 商品の絵（実装では楽天の商品画像。ここでは商品名の色から描いた絵） ----------
// 色は商品名（CLOUD WHITE・グラスブルー 等）から推定。形は3種（横長・四角・縦長＝耳にかける型）
export const ART = {
  '637e1dd6': ['pill', '#F3F3F1'], e89650d6: ['pill', '#F1C9D1'], d5f259d1: ['pill', '#2B2B2C'], '821de2ea': ['square', '#BCD1E6'],
  e7e3a226: ['pill', '#EFEFEC'], '2a5f9d61': ['pill', '#3A3A3E'], cd6a9906: ['tall', '#D9C4A1'], '43c9394e': ['pill', '#E7E7E3'],
  cb0101de: ['pill', '#232324'], '0858ede7': ['square', '#9C9C9E'], ecb1d7cb: ['pill', '#1F1F20'], f8e292b2: ['square', '#F2F2F0'],
  '2ef86843': ['square', '#C8CACD'], '97550cef': ['pill', '#7E8A7F'], '59e2037e': ['tall', '#2A2A2B'], e3e9d2fc: ['square', '#D6D3CD'],
  e41a54fa: ['pill', '#1C1C1D'], '2cea7b9f': ['pill', '#262627'], '78177f27': ['square', '#CFCFCF'], '463cfbcf': ['tall', '#2C2C2D'],
  '165b2aac': ['pill', '#1E1E1F'], f91aa1ca: ['pill', '#C9D6E4'],
};
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
export function art(s, size = 64) {
  const [shape, col] = ART[s] ?? ['pill', '#DADAD8'];
  const dark = lum(col) < 0.5;
  const seam = dark ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.16)';
  const hi = dark ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.75)';
  const edge = dark ? '' : ` stroke="rgba(0,0,0,${lum(col) > 0.85 ? '.16' : '.08'})" stroke-width="1.2"`;
  const body = {
    pill: `<rect x="20" y="36" width="60" height="40" rx="20" fill="${col}"${edge}></rect><path d="M22 52h56" stroke="${seam}" stroke-width="1.4"></path><ellipse cx="38" cy="43" rx="12" ry="3.5" fill="${hi}"></ellipse><circle cx="50" cy="66" r="1.8" fill="${dark ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.28)'}"></circle>`,
    square: `<rect x="27" y="30" width="46" height="46" rx="15" fill="${col}"${edge}></rect><path d="M29 47h42" stroke="${seam}" stroke-width="1.4"></path><ellipse cx="42" cy="37" rx="9" ry="3" fill="${hi}"></ellipse><circle cx="50" cy="67" r="1.8" fill="${dark ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.28)'}"></circle>`,
    tall: `<rect x="33" y="24" width="34" height="52" rx="15" fill="${col}"${edge}></rect><path d="M35 40h30" stroke="${seam}" stroke-width="1.4"></path><ellipse cx="44" cy="30" rx="6" ry="2.4" fill="${hi}"></ellipse><path d="M58 50c6 0 8 4 8 8s-2 8-8 8" fill="none" stroke="${seam}" stroke-width="2"></path>`,
  }[shape];
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true" style="display:block;"><ellipse cx="50" cy="82" rx="28" ry="5" fill="rgba(0,0,0,.09)"></ellipse>${body}</svg>`;
}

// 商品の丸（灰色の丸に絵）。thick=thin は点線の輪（声が少ない）。fade は言及なし
export function node(s, { size = 56, thick = 'thick', sel = false, fade = false, bg = C.tile } = {}) {
  const ring = thick === 'thin' ? `1px dashed ${C.faint}` : 'none';
  const op = fade ? 0.26 : thick === 'thin' ? 0.62 : 1;
  return `<span style="position:relative; display:inline-flex; align-items:center; justify-content:center; width:${size}px; height:${size}px; border-radius:50%; background:${bg}; box-shadow:${sel ? `0 0 0 3px #fff, 0 0 0 5px ${C.ink}, ${SH.lift}` : 'none'}; flex-shrink:0;"><span style="position:absolute; inset:-3px; border-radius:50%; border:${ring};"></span><span style="display:flex; opacity:${op}; filter:${fade ? 'grayscale(1)' : 'none'};">${art(s, Math.round(size * 0.92))}</span></span>`;
}

// 半円のゲージ（好き10）。左から不満（先）→ 満足 → 残り。太さは同じ
export function gauge(pos, neg, { size = 56, sw = 4, gap = 5 } = {}) {
  const r = size / 2 + gap, cx = size / 2 + gap + sw, cy = size / 2 + gap + sw, W = (r + sw) * 2;
  const t = pos + neg;
  const arc = (a0, a1, col) => { if (a1 - a0 < 0.5) return ''; const p = (a) => [cx + r * Math.cos(Math.PI + (a * Math.PI) / 180), cy + r * Math.sin(Math.PI + (a * Math.PI) / 180)]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="butt"></path>`; };
  const a = t ? (neg / t) * 180 : 0;
  return `<svg width="${W}" height="${W / 2 + sw}" aria-hidden="true" style="position:absolute; left:${-(gap + sw)}px; top:${-(gap + sw)}px; overflow:visible;">${t ? arc(0, a, C.neg) + arc(a, 180, C.sat) : arc(0, 180, C.none)}</svg>`;
}

// ---------- 小さな部品 ----------
export const num = (t, { size = 14, w = 500, color = C.ink } = {}) => `<span style="font-family:${F.num}; font-size:${size}px; font-weight:${w}; color:${color}; letter-spacing:-.01em; font-variant-numeric:tabular-nums;">${t}</span>`;
export const sup = (t) => `<sup style="font-family:${F.num}; font-size:11px; font-weight:500; margin-left:2px; color:${C.muted}; vertical-align:super; line-height:0;">${t}</sup>`;
export const label = (t, { color = C.muted, size = 11 } = {}) => `<span style="font-family:${F.mono}; font-size:${size}px; letter-spacing:.12em; color:${color}; text-transform:uppercase; white-space:nowrap;">${t}</span>`;
export function pill(t, { kind = 'dark', h = 48, fs = 15, full = false, ic = '' } = {}) {
  const st = { dark: `background:${C.ink}; color:#fff;`, light: `background:${C.tile}; color:${C.ink};`, line: `background:#fff; color:${C.ink}; border:1.5px solid ${C.ink};` }[kind];
  return `<button type="button" style="display:inline-flex; align-items:center; justify-content:center; gap:8px; height:${h}px; padding:0 ${Math.round(h * 0.45)}px; border-radius:${h / 2}px; border:none; ${st} font-family:${F.jp}; font-size:${fs}px; font-weight:700; white-space:nowrap; box-sizing:border-box;${full ? ' width:100%;' : ''}">${ic ? icon(ic, { size: fs + 3 }) : ''}${t}</button>`;
}
export const roundBtn = (t, { size = 72, bg = C.ink, fg = '#fff', fs = 13 } = {}) => `<button type="button" style="width:${size}px; height:${size}px; border-radius:50%; border:none; background:${bg}; color:${fg}; font-family:${F.jp}; font-size:${fs}px; font-weight:700; letter-spacing:.06em; flex-shrink:0;">${t}</button>`;
export const iconBtn = (name, lab, { size = 44, bg = C.tile, color = C.ink } = {}) => `<button type="button" aria-label="${lab}" style="width:${size}px; height:${size}px; border-radius:50%; border:none; background:${bg}; color:${color}; display:flex; align-items:center; justify-content:center; padding:0; flex-shrink:0;">${icon(name, { size: Math.round(size * 0.44) })}</button>`;
export const aiNote = (fs = 11) => `<span style="display:inline-flex; align-items:center; gap:4px; font-size:${fs}px; color:${C.muted}; white-space:nowrap;">${icon('info', { size: 13, sw: 2 })}AIが分類した件数</span>`;

// 浮いた丸いタブ（好き5）
export function floatTab(active = 0, { dark = false } = {}) {
  const items = [['map', '地図'], ['search', '探す'], ['pair', 'くらべる'], ['save', '保存']];
  return `<nav aria-label="メイン" style="position:absolute; left:24px; right:24px; bottom:26px; height:66px; border-radius:33px; background:${dark ? C.dark2 : '#fff'}; box-shadow:${SH.lift}; display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); padding:6px; box-sizing:border-box; z-index:30;">${items.map(([ic, t], i) => `<a href="#" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; border-radius:27px; background:${i === active ? (dark ? '#2C2D30' : C.tile) : 'transparent'}; color:${dark ? C.darkInk : C.ink}; text-decoration:none; font-size:11px; font-weight:${i === active ? 700 : 500}; opacity:${i === active ? 1 : 0.72};">${icon(ic, { size: 21 })}${t}</a>`).join('')}</nav>`;
}

export function searchPill(t = '悩みや商品名で探す', { w = 342, h = 50 } = {}) {
  return `<label style="display:flex; align-items:center; gap:10px; width:${w}px; height:${h}px; padding:0 18px; border-radius:${h / 2}px; background:${C.tile}; box-sizing:border-box; color:${C.muted}; font-size:14px;">${icon('search', { size: 18 })}<input type="text" placeholder="${t}" aria-label="探す" style="border:none; outline:none; background:transparent; font-family:${F.jp}; font-size:14px; color:${C.ink}; width:100%;"></label>`;
}

// 端末の枠（案Aと同じ比率。色だけBに）
export function phone(screen, { scale = 1, dark = false } = {}) {
  const W = 390, H = 844, B = 10;
  const fw = (W + B * 2) * scale, fh = (H + B * 2) * scale;
  return `<div style="width:${fw}px; height:${fh}px; flex-shrink:0;"><div style="width:${W + B * 2}px; height:${H + B * 2}px; transform:scale(${scale}); transform-origin:0 0; box-sizing:border-box; padding:${B}px; border-radius:58px; background:${dark ? '#2A2B2E' : '#161616'}; box-shadow:0 34px 70px rgba(17,17,17,.20), 0 8px 18px rgba(17,17,17,.10);"><div style="width:${W}px; height:${H}px; border-radius:48px; overflow:hidden; position:relative; background:${dark ? C.dark : C.bg};">${screen}</div></div></div>`;
}
export function browser(screen, { scale = 1, W = 1440, H = 900, url = 'koe.example/earbuds' } = {}) {
  const bar = 40;
  return `<div style="width:${W * scale}px; height:${(H + bar) * scale}px; flex-shrink:0;"><div style="width:${W}px; height:${H + bar}px; transform:scale(${scale}); transform-origin:0 0; border-radius:16px; overflow:hidden; background:${C.bg}; box-shadow:0 34px 70px rgba(17,17,17,.16), 0 6px 16px rgba(17,17,17,.08);"><div style="height:${bar}px; display:flex; align-items:center; gap:8px; padding:0 16px; background:${C.tile};"><span style="width:11px; height:11px; border-radius:50%; background:${C.tile2};"></span><span style="width:11px; height:11px; border-radius:50%; background:${C.tile2};"></span><span style="width:11px; height:11px; border-radius:50%; background:${C.tile2};"></span><span style="margin-left:14px; height:24px; padding:0 14px; border-radius:12px; background:#fff; display:flex; align-items:center; font-family:${F.mono}; font-size:12px; color:${C.muted};">${url}</span></div><div style="width:${W}px; height:${H}px; position:relative; overflow:hidden;">${screen}</div></div></div>`;
}

// 仮の名前（Bでも未定）。印は「半円のゲージ」
export function mark(size = 18, { color = C.ink, text = '（名前は未定）' } = {}) {
  return `<span style="display:inline-flex; align-items:center; gap:${Math.round(size * 0.4)}px; white-space:nowrap;"><svg width="${size * 1.3}" height="${size * 0.9}" viewBox="0 0 26 18" aria-hidden="true"><path d="M3 16a10 10 0 0 1 4-8" fill="none" stroke="${C.neg}" stroke-width="3.2"></path><path d="M7 8a10 10 0 0 1 16 8" fill="none" stroke="${C.sat}" stroke-width="3.2"></path></svg><span style="font-family:${F.jp}; font-weight:900; font-size:${size}px; color:${color}; letter-spacing:.02em;">${text}</span></span>`;
}

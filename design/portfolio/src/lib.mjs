// 共通の部品（色・文字・端末の枠・小さな部品）。すべてインラインスタイルの HTML 文字列を返す
// 見た目は仮（参考画像を見られていないため）。色と文字はここだけで決め、差し替えられるようにする

// ---------- 色（仮：地図アプリ型。白地・黒の文字・満足は青、不満はオレンジ） ----------
export const C = {
  bg: '#FFFFFF', bg2: '#F2F4F5', map: '#EAEEF0', map2: '#DFE5E8', surf: '#FFFFFF',
  ink: '#121417', ink2: '#3E444C', muted: '#5A616A', faint: '#9AA1A9', line: '#DDE1E5', line2: '#C9CFD5',
  sat: '#1D5FD1', satSoft: '#DCE7FA', satText: '#1A55BD',
  neg: '#EF7A2B', negSoft: '#FDE6D5', negText: '#A4460A',
  none: '#C4CAD0',
  white: '#FFFFFF',
  board: '#F4F5F2', // ボードの地
};
export const SH = {
  card: '0 1px 2px rgba(18,20,23,.08), 0 6px 18px rgba(18,20,23,.08)',
  sheet: '0 -8px 30px rgba(18,20,23,.14)',
  lift: '0 14px 34px rgba(18,20,23,.18), 0 2px 6px rgba(18,20,23,.08)',
  pt: '0 1px 2px rgba(18,20,23,.18), 0 3px 8px rgba(18,20,23,.10)',
};
export const F = {
  disp: "'Zen Kaku Gothic New','Hiragino Sans','Yu Gothic',sans-serif",
  body: "'BIZ UDPGothic','Hiragino Sans','Yu Gothic',sans-serif",
  num: "'DM Mono',ui-monospace,Menlo,Consolas,monospace",
};
export const FONT_LINK = 'https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&amp;family=DM+Mono:wght@400;500&amp;family=Zen+Kaku+Gothic+New:wght@500;700;900&amp;family=Shippori+Mincho+B1:wght@700;800&amp;display=swap';
export const BASE_CSS = `body{margin:0}
@keyframes kPulse{0%,100%{transform:scale(1);opacity:.55}50%{transform:scale(1.35);opacity:0}}
.pulse{animation:kPulse 2.2s ease-out infinite}
@media (prefers-reduced-motion: reduce){.pulse{animation:none !important}}`;

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- アイコン（線だけ） ----------
const IC = {
  search: '<circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4.5 4.5"></path>',
  back: '<path d="M14.5 5.5 8 12l6.5 6.5"></path>',
  close: '<path d="M6 6l12 12M18 6 6 18"></path>',
  map: '<path d="M3.5 6.5 9 4.5l6 2 5.5-2v13L15 19.5l-6-2-5.5 2z"></path><path d="M9 4.5v13M15 6.5v13"></path>',
  list: '<path d="M8 7h12M8 12h12M8 17h12"></path><circle cx="4.5" cy="7" r=".8"></circle><circle cx="4.5" cy="12" r=".8"></circle><circle cx="4.5" cy="17" r=".8"></circle>',
  axes: '<path d="M4 20V4M4 20h16"></path><circle cx="10" cy="11" r="1.6"></circle><circle cx="15" cy="7.5" r="1.6"></circle><circle cx="16.5" cy="14" r="1.6"></circle>',
  pair: '<rect x="3.5" y="6" width="7.5" height="12" rx="2"></rect><rect x="13" y="6" width="7.5" height="12" rx="2"></rect>',
  save: '<path d="M7 4h10v16l-5-3.6L7 20z"></path>',
  share: '<path d="M12 4v11M7.5 8.5 12 4l4.5 4.5"></path><path d="M5 13v6h14v-6"></path>',
  info: '<circle cx="12" cy="12" r="8.5"></circle><path d="M12 11v5.5M12 7.8v.2"></path>',
  lens: '<circle cx="10.5" cy="10.5" r="5.5"></circle><path d="M14.5 14.5 20 20"></path><path d="M8 10.5h5"></path>',
  target: '<circle cx="12" cy="12" r="7.5"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"></path>',
  scan: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"></path><path d="M7.5 8v8M10 8v8M12.5 8v8M15 8v5M16.5 8v8"></path>',
  bell: '<path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5z"></path><path d="M10 20.5h4"></path>',
  home: '<path d="M4 11 12 4.5 20 11v8.5h-5.5v-5h-5v5H4z"></path>',
  cart: '<path d="M4 5h2l2 10h10l2-7H7.2"></path><circle cx="9.5" cy="19" r="1.3"></circle><circle cx="17" cy="19" r="1.3"></circle>',
  arrow: '<path d="M5 12h13M13 6.5 18.5 12 13 17.5"></path>',
  up: '<path d="M12 19V6M6.5 11.5 12 6l5.5 5.5"></path>',
  check: '<path d="M5 12.5 10 17l9-10"></path>',
  plus: '<path d="M12 5v14M5 12h14"></path>',
  quote: '<path d="M6 17c0-4 1.2-7 4-9M13 17c0-4 1.2-7 4-9"></path>',
  sliders: '<path d="M5 7h9M18 7h1M5 17h3M12 17h7"></path><circle cx="16" cy="7" r="2"></circle><circle cx="10" cy="17" r="2"></circle>',
  compass: '<circle cx="12" cy="12" r="8.5"></circle><path d="m15.5 8.5-2 5-5 2 2-5z"></path>',
  sparkle: '<path d="M12 4v4M12 16v4M4 12h4M16 12h4"></path>',
  layers: '<path d="m12 4 8.5 4.5L12 13 3.5 8.5z"></path><path d="m3.5 12.5 8.5 4.5 8.5-4.5"></path>',
  store: '<path d="M4.5 9.5 6 4.5h12l1.5 5"></path><path d="M4.5 9.5c0 1.5 1.2 2.5 2.5 2.5s2.5-1 2.5-2.5c0 1.5 1.2 2.5 2.5 2.5s2.5-1 2.5-2.5c0 1.5 1.2 2.5 2.5 2.5s2.5-1 2.5-2.5"></path><path d="M6 12v7.5h12V12"></path>',
  earbud: '<path d="M9 5.5a4.5 4.5 0 0 1 4.5 4.5v1a3 3 0 0 1-3 3H10v4.5a1.5 1.5 0 0 1-3 0v-9A4 4 0 0 1 9 5.5z"></path><circle cx="10.5" cy="10" r="1.3"></circle>',
};
export function icon(name, { size = 20, color = 'currentColor', sw = 1.8 } = {}) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block; flex-shrink:0;">${IC[name]}</svg>`;
}

// ---------- 文字の部品 ----------
export const num = (t, { size = 13, color = C.ink, w = 500 } = {}) => `<span style="font-family:${F.num}; font-size:${size}px; font-weight:${w}; color:${color}; letter-spacing:-.01em; font-variant-numeric:tabular-nums;">${t}</span>`;
export const tag = (t, { bg = C.bg2, color = C.ink2, fs = 11, h = 22, bd = 'none' } = {}) => `<span style="display:inline-flex; align-items:center; height:${h}px; padding:0 8px; border-radius:${h / 2}px; background:${bg}; color:${color}; font-size:${fs}px; font-weight:700; white-space:nowrap; border:${bd}; box-sizing:border-box;">${t}</span>`;
export const aiMark = (fs = 11) => `<span style="display:inline-flex; align-items:center; gap:3px; height:20px; padding:0 7px; border-radius:10px; border:1px solid ${C.line2}; color:${C.muted}; font-size:${fs}px; font-weight:700; white-space:nowrap; box-sizing:border-box;">AI分類${icon('info', { size: 12, sw: 2 })}</span>`;

export function btn(label, { kind = 'primary', ic = '', h = 48, fs = 15, full = false, w = '' } = {}) {
  const k = {
    primary: `background:${C.ink}; color:${C.white};`,
    ghost: `background:${C.bg}; color:${C.ink}; border:1.5px solid ${C.ink};`,
    soft: `background:${C.bg2}; color:${C.ink};`,
    text: `background:transparent; color:${C.ink}; text-decoration:underline; text-underline-offset:3px;`,
  }[kind];
  return `<button type="button" style="display:inline-flex; align-items:center; justify-content:center; gap:8px; height:${h}px; padding:0 ${Math.round(h * 0.42)}px; border-radius:${h / 2}px; border:none; ${k} font-family:${F.body}; font-size:${fs}px; font-weight:700; white-space:nowrap; box-sizing:border-box; cursor:pointer;${full ? ' width:100%;' : ''}${w ? ` width:${w}px;` : ''}">${ic ? icon(ic, { size: Math.round(fs * 1.25) }) : ''}${label}</button>`;
}
export function iconBtn(name, label, { size = 44, bg = C.surf, color = C.ink, shadow = SH.card } = {}) {
  return `<button type="button" aria-label="${label}" style="width:${size}px; height:${size}px; border-radius:50%; border:none; background:${bg}; color:${color}; box-shadow:${shadow}; display:flex; align-items:center; justify-content:center; padding:0; cursor:pointer; flex-shrink:0;">${icon(name, { size: Math.round(size * 0.46) })}</button>`;
}
export function chip(t, { on = false, fs = 13, h = 36, dot = '' } = {}) {
  return `<button type="button" style="display:inline-flex; align-items:center; gap:6px; height:${h}px; padding:0 14px; border-radius:${h / 2}px; border:${on ? 'none' : `1px solid ${C.line2}`}; background:${on ? C.ink : C.surf}; color:${on ? C.white : C.ink}; font-family:${F.body}; font-size:${fs}px; font-weight:700; white-space:nowrap; flex-shrink:0; box-sizing:border-box; cursor:pointer;">${dot ? `<span style="width:8px; height:8px; border-radius:50%; background:${dot};"></span>` : ''}${t}</button>`;
}

// ---------- 声のリング：商品の丸の周りに、不満（先）→満足→言及なし ----------
// 不満を12時から先に描く（「不満が先に分かる」）。太さは満足も不満も同じ
export function ringBg(pos, neg, { none = 0 } = {}) {
  const t = pos + neg + none;
  if (!t) return `background:${C.none};`;
  const a = (neg / t) * 360, b = a + (pos / t) * 360;
  return `background:conic-gradient(${C.neg} 0deg ${a}deg, ${C.sat} ${a}deg ${b}deg, ${C.none} ${b}deg 360deg);`;
}
// 商品の丸（画像の代わりに図形）。thick: thick|mid|thin（根拠の厚さ）
export function productDot({ size = 44, pos = 0, neg = 0, thick = 'thick', ring = true, sel = false, dim = false, hollow = false, label = '' } = {}) {
  const rw = Math.max(3, Math.round(size * 0.11));
  const inner = size - rw * 2;
  const border = thick === 'thin' ? `1.5px dashed ${C.muted}` : thick === 'mid' ? `1.5px solid ${C.muted}` : `2px solid ${C.ink}`;
  const face = `<span style="position:absolute; left:${rw}px; top:${rw}px; width:${inner}px; height:${inner}px; border-radius:50%; background:${C.bg2}; display:flex; align-items:center; justify-content:center; color:${C.muted};">${icon('earbud', { size: Math.max(12, Math.round(inner * 0.5)), sw: 1.6 })}</span>`;
  const bg = hollow ? `background:${C.bg};` : ring ? ringBg(pos, neg) : `background:${C.bg};`;
  return `<span style="position:relative; display:inline-block; width:${size}px; height:${size}px; border-radius:50%; ${bg} box-shadow:${sel ? `0 0 0 3px ${C.bg}, 0 0 0 5.5px ${C.ink}` : SH.pt}; outline:${hollow ? `1.5px dashed ${C.muted}` : 'none'}; outline-offset:-1.5px; opacity:${dim ? 0.28 : 1}; flex-shrink:0;"><span style="position:absolute; inset:-3px; border-radius:50%; border:${border}; opacity:${thick === 'thick' ? 0 : 1};"></span>${face}${label}</span>`;
}

// 満足・不満のバー（分母つき）。左右対称：不満は左、満足は右、同じ太さ
export function voiceBar({ label, pos, neg, read, w = 320, compact = false, showRead = true, max = 0 } = {}) {
  const half = (w - 2) / 2;
  const scale = Math.max(pos, neg, max, 1); // max：同じ商品の中で目盛りをそろえる
  const pw = Math.round((pos / scale) * half), nw = Math.round((neg / scale) * half);
  return `<div style="display:flex; flex-direction:column; gap:5px; width:${w}px;">
<div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px;"><span style="font-size:${compact ? 13 : 14}px; font-weight:700; color:${C.ink};">${label}</span>${showRead ? `<span style="font-size:11px; color:${C.muted}; white-space:nowrap;">読んだ${read}件のうち</span>` : ''}</div>
<div style="display:flex; align-items:center; height:${compact ? 10 : 12}px;">
<div style="width:${half}px; display:flex; justify-content:flex-end;"><div style="width:${nw}px; height:100%; min-height:${compact ? 10 : 12}px; background:${C.neg}; border-radius:6px 0 0 6px;"></div></div>
<div style="width:2px; height:${compact ? 16 : 18}px; background:${C.ink};"></div>
<div style="width:${half}px;"><div style="width:${pw}px; height:${compact ? 10 : 12}px; background:${C.sat}; border-radius:0 6px 6px 0;"></div></div>
</div>
<div style="display:flex; justify-content:space-between; font-size:12px;"><span style="color:${C.negText}; font-weight:700;">不満 ${num(neg, { size: 13, color: C.negText, w: 500 })}</span><span style="color:${C.satText}; font-weight:700;">満足 ${num(pos, { size: 13, color: C.satText, w: 500 })}</span></div>
</div>`;
}

// 引用（満足・不満を1件ずつ。出典つき）
export function quotePair(q, { w = 320, fs = 13 } = {}) {
  const one = (t, side) => t ? `<div style="display:flex; gap:8px; align-items:flex-start;"><span style="margin-top:4px; width:8px; height:8px; border-radius:${side === 'neg' ? '1px' : '50%'}; background:${side === 'neg' ? C.neg : C.sat}; flex-shrink:0; transform:${side === 'neg' ? 'rotate(45deg)' : 'none'};"></span><div style="min-width:0;"><div style="font-size:${fs}px; line-height:1.6; color:${C.ink};">「${esc(t)}」</div><div style="font-size:11px; color:${C.muted}; margin-top:2px; text-decoration:underline; text-underline-offset:2px;">楽天のレビューで確かめる</div></div></div>` : `<div style="font-size:12px; color:${C.muted};">${side === 'neg' ? '不満の引用はありません' : '満足の引用はありません'}</div>`;
  return `<div style="width:${w}px; display:flex; flex-direction:column; gap:10px;">${one(q?.neg, 'neg')}${one(q?.pos, 'pos')}</div>`;
}

// ---------- 端末の枠 ----------
export function phone(screen, { scale = 1, shadow = true } = {}) {
  const W = 390, H = 844, B = 10;
  const fw = (W + B * 2) * scale, fh = (H + B * 2) * scale;
  return `<div style="width:${fw}px; height:${fh}px; flex-shrink:0;"><div style="width:${W + B * 2}px; height:${H + B * 2}px; transform:scale(${scale}); transform-origin:0 0; box-sizing:border-box; padding:${B}px; border-radius:58px; background:#16181B; ${shadow ? `box-shadow:0 30px 60px rgba(18,20,23,.22), 0 8px 18px rgba(18,20,23,.12);` : ''}"><div style="width:${W}px; height:${H}px; border-radius:48px; overflow:hidden; position:relative; background:${C.bg};">${screen}</div></div></div>`;
}
export function browser(screen, { scale = 1, W = 1440, H = 900, url = 'koe.example/earbuds' } = {}) {
  const bar = 40;
  const fw = W * scale, fh = (H + bar) * scale;
  return `<div style="width:${fw}px; height:${fh}px; flex-shrink:0;"><div style="width:${W}px; height:${H + bar}px; transform:scale(${scale}); transform-origin:0 0; border-radius:14px; overflow:hidden; background:${C.bg}; box-shadow:0 30px 60px rgba(18,20,23,.18), 0 6px 16px rgba(18,20,23,.1); border:1px solid ${C.line};"><div style="height:${bar}px; display:flex; align-items:center; gap:8px; padding:0 16px; background:${C.bg2}; border-bottom:1px solid ${C.line};"><span style="width:11px; height:11px; border-radius:50%; background:${C.line2};"></span><span style="width:11px; height:11px; border-radius:50%; background:${C.line2};"></span><span style="width:11px; height:11px; border-radius:50%; background:${C.line2};"></span><span style="margin-left:14px; height:24px; padding:0 14px; border-radius:12px; background:${C.bg}; display:flex; align-items:center; font-family:${F.num}; font-size:12px; color:${C.muted};">${url}</span></div><div style="width:${W}px; height:${H}px; position:relative; overflow:hidden;">${screen}</div></div></div>`;
}

// 仮の名前（名前は「10 名前の案」で決める。それまでは記号だけ）
export function wordmark(size = 20, { color = C.ink, text = '（名前は未定）' } = {}) {
  const r = Math.round(size * 0.5);
  return `<span style="display:inline-flex; align-items:center; gap:${Math.round(size * 0.35)}px; white-space:nowrap;"><span style="position:relative; width:${size * 1.1}px; height:${size * 1.1}px; flex-shrink:0;"><span style="position:absolute; inset:0; border-radius:50%; background:conic-gradient(${C.neg} 0 70deg, ${C.sat} 70deg 360deg);"></span><span style="position:absolute; left:${Math.round(size * 0.2)}px; top:${Math.round(size * 0.2)}px; width:${Math.round(size * 0.7)}px; height:${Math.round(size * 0.7)}px; border-radius:50%; background:${C.bg};"></span></span><span style="font-family:${F.disp}; font-weight:900; font-size:${size}px; color:${color}; letter-spacing:.01em; line-height:1;">${text}</span></span>`;
}

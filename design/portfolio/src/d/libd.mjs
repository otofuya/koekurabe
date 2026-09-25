// 統合案（A＋B＋C）— 共通の部品
// 見た目は B（白地・モノが主役・色は声の2色だけ・浮いた丸いタブ）、骨組みは C（区分・声の3つの型・わたしの条件・読めた深さ）、
// 「似ているもの」は A（起点を真ん中に置く）
import { icon as cIcon, obj, shoeArt, bottleArt, bagArt, OBJ_COL } from '../c/libc.mjs';
import { art as earArt } from '../b/libb.mjs';
export { obj, shoeArt, bottleArt, bagArt, earArt, OBJ_COL };

export const C = {
  bg: '#FFFFFF', tile: '#F3F3F1', tile2: '#E8E8E5', map: '#F7F7F5', hair: '#E6E6E3', line: '#D2D2CE',
  ink: '#141414', ink2: '#474745', muted: '#6B6B68', faint: '#A4A4A0',
  neg: '#E4583B', negSoft: '#FCE7E1', negText: '#B03C20',
  pos: '#5163E6', posSoft: '#E7EAFD', posText: '#3B48BE',
  side: '#D0D0CB', mid: '#141414', rest: '#ECECE9',
  board: '#EFEFEC',
};
export const F = {
  jp: "'Zen Kaku Gothic New','Hiragino Sans','Yu Gothic',sans-serif",
  num: "'Outfit','Zen Kaku Gothic New',sans-serif",
};
export const FONT_LINK = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&amp;family=Zen+Kaku+Gothic+New:wght@400;500;700;900&amp;display=swap';
export const BASE_CSS = 'body{margin:0}';
export const SH = {
  soft: '0 1px 2px rgba(20,20,20,.05), 0 8px 24px rgba(20,20,20,.06)',
  lift: '0 16px 36px rgba(20,20,20,.15), 0 3px 8px rgba(20,20,20,.06)',
  sheet: '0 -10px 32px rgba(20,20,20,.10)',
};
export const icon = cIcon;

// ---------- 小さな部品 ----------
export const num = (t, { size = 14, w = 500, color = C.ink } = {}) => `<span style="font-family:${F.num}; font-size:${size}px; font-weight:${w}; color:${color}; letter-spacing:-.01em; font-variant-numeric:tabular-nums;">${t}</span>`;
export const small = (t, { color = C.muted, size = 12 } = {}) => `<span style="font-size:${size}px; color:${color};">${t}</span>`;
export const tile = (inner, { w = 64, h = w, r = 16, bg = C.tile } = {}) => `<span style="display:inline-flex; align-items:center; justify-content:center; width:${w}px; height:${h}px; border-radius:${r}px; background:${bg}; flex-shrink:0;">${inner}</span>`;
export function pill(t, { kind = 'dark', h = 48, fs = 15, full = false, ic = '' } = {}) {
  const st = { dark: `background:${C.ink}; color:#fff;`, light: `background:${C.tile}; color:${C.ink};`, line: `background:#fff; color:${C.ink}; border:1.5px solid ${C.ink};` }[kind];
  return `<button type="button" style="display:inline-flex; align-items:center; justify-content:center; gap:8px; height:${h}px; padding:0 ${Math.round(h * 0.45)}px; border-radius:${h / 2}px; border:none; ${st} font-family:${F.jp}; font-size:${fs}px; font-weight:700; white-space:nowrap; box-sizing:border-box;${full ? ' width:100%;' : ''}">${ic ? icon(ic, { size: fs + 3 }) : ''}${t}</button>`;
}
// 質問のチップ（観点）。on は黒
export const qchip = (t, { on = false, flat = false, h = 36, fs = 13.5 } = {}) => `<button type="button" style="display:inline-flex; align-items:center; gap:6px; height:${h}px; padding:0 15px; border-radius:${h / 2}px; border:${flat ? `1px dashed ${C.line}` : 'none'}; background:${on ? C.ink : flat ? 'transparent' : C.tile}; color:${on ? '#fff' : flat ? C.muted : C.ink}; font-family:${F.jp}; font-size:${fs}px; font-weight:${on ? 700 : 500}; white-space:nowrap; flex-shrink:0;">${t}</button>`;
// わたしの条件のチップ（人の印）
export const cchip = (t, { on = false, h = 34, fs = 13 } = {}) => `<button type="button" style="display:inline-flex; align-items:center; gap:6px; height:${h}px; padding:0 13px 0 10px; border-radius:${h / 2}px; border:${on ? 'none' : `1px solid ${C.line}`}; background:${on ? C.ink : '#fff'}; color:${on ? '#fff' : C.ink}; font-family:${F.jp}; font-size:${fs}px; font-weight:${on ? 700 : 500}; white-space:nowrap; flex-shrink:0;">${icon(on ? 'check' : 'person', { size: fs + 1, sw: 2 })}${t}</button>`;
export const seg = (items, active = 0, { h = 36, w = 0, fs = 13, pad = 12 } = {}) => `<div style="display:inline-flex; padding:3px; border-radius:${h / 2 + 3}px; background:${C.tile};${w ? ` width:${w}px; box-sizing:border-box;` : ''}">${items.map((t, i) => `<span style="flex:1; display:inline-flex; align-items:center; justify-content:center; height:${h}px; padding:0 ${pad}px; border-radius:${h / 2}px; background:${i === active ? '#fff' : 'transparent'}; box-shadow:${i === active ? SH.soft : 'none'}; font-size:${fs}px; font-weight:${i === active ? 700 : 500}; white-space:nowrap;">${t}</span>`).join('')}</div>`;
export const aiNote = (t = 'AIがレビューを分類した件数', fs = 11) => `<span style="display:inline-flex; align-items:center; gap:4px; font-size:${fs}px; color:${C.muted}; white-space:nowrap;">${icon('info', { size: 13, sw: 2 })}${t}</span>`;
export const sample = (t = '見本の数字', fs = 11) => `<span style="display:inline-flex; align-items:center; gap:5px; height:22px; padding:0 9px; border-radius:11px; background:${C.tile}; font-size:${fs}px; color:${C.ink2}; white-space:nowrap;">${icon('flask', { size: 12, sw: 2 })}${t}</span>`;

// ---------- 商品の丸（B）：灰色の丸に絵。thin は点線（読めた量が少ない） ----------
export function node(img, { size = 52, thin = false, sel = false, dim = false, bg = C.tile } = {}) {
  return `<span style="position:relative; display:inline-flex; align-items:center; justify-content:center; width:${size}px; height:${size}px; border-radius:50%; background:${bg}; box-shadow:${sel ? `0 0 0 3px #fff, 0 0 0 5px ${C.ink}, ${SH.lift}` : 'none'};${thin ? ` outline:1.2px dashed ${C.faint}; outline-offset:2px;` : ''} flex-shrink:0;"><span style="display:flex; opacity:${dim ? 0.3 : thin ? 0.7 : 1}; filter:${dim ? 'grayscale(1)' : 'none'};">${img}</span></span>`;
}

// ---------- 声の帯（C）：左から不満・右から満足・全体の長さ＝読んだ件数 ----------
export function strip({ pos, neg, read, w = 300, h = 8, name = '', fs = 13, labels = true, faint = false } = {}) {
  const nw = Math.max(neg ? 3 : 0, Math.round((neg / read) * w)), pw = Math.max(pos ? 3 : 0, Math.round((pos / read) * w));
  const bar = `<div style="position:relative; width:${w}px; height:${h}px; border-radius:${h / 2}px; background:${C.rest}; overflow:hidden;"><div style="position:absolute; left:0; top:0; width:${nw}px; height:${h}px; background:${faint ? '#F0B6A8' : C.neg};"></div><div style="position:absolute; right:0; top:0; width:${pw}px; height:${h}px; background:${faint ? '#B8C0F3' : C.pos};"></div></div>`;
  if (!labels) return bar;
  return `<div style="width:${w}px; display:flex; flex-direction:column; gap:6px;">${name ? `<div style="display:flex; justify-content:space-between; align-items:baseline;"><b style="font-size:${fs}px;">${name}</b><span style="font-size:11px; color:${C.muted};">${read}件中</span></div>` : ''}${bar}<div style="display:flex; justify-content:space-between; font-size:${Math.max(11, fs - 1)}px;"><span style="color:${C.negText};">不満 ${num(neg, { size: fs, w: 600, color: C.negText })}</span><span style="color:${C.posText};">満足 ${num(pos, { size: fs, w: 600, color: C.posText })}</span></div></div>`;
}
// ちょうどの帯：3つの区間。真ん中の黒が「ちょうど」
export function just({ counts, labels = ['小さめ', 'ちょうど', '大きめ'], w = 300, h = 8, name = '', fs = 12, read = 0 } = {}) {
  const tot = counts.reduce((a, b) => a + b, 0) || 1, three = counts.length === 3;
  const cols = three ? [C.side, C.mid, C.side] : [C.side, C.mid];
  const segs = counts.map((c, i) => `<div style="width:${(c / tot) * 100}%; height:${h}px; background:${cols[i]};${i ? ' border-left:2px solid #fff;' : ''} box-sizing:border-box;"></div>`).join('');
  const lab = counts.map((c, i) => `<span style="flex:1; display:flex; gap:3px; align-items:baseline; ${i === counts.length - 1 ? 'justify-content:flex-end;' : i === 1 && three ? 'justify-content:center;' : ''} white-space:nowrap;"><span style="color:${C.ink2};">${labels[i]}</span>${num(c, { size: fs, w: 600 })}</span>`).join('');
  return `<div style="width:${w}px; display:flex; flex-direction:column; gap:6px;">${name ? `<div style="display:flex; justify-content:space-between; align-items:baseline;"><b style="font-size:${fs + 1}px;">${name}</b>${read ? `<span style="font-size:11px; color:${C.muted};">${read}件中 ${tot}件</span>` : ''}</div>` : ''}<div style="display:flex; width:${w}px; border-radius:${h / 2}px; overflow:hidden; background:${C.rest};">${segs}</div><div style="display:flex; font-size:${Math.max(11, fs - 1)}px;">${lab}</div></div>`;
}
export const again = (n, read, { fs = 12 } = {}) => `<span style="display:inline-flex; align-items:center; gap:5px; font-size:${fs}px; white-space:nowrap;">${icon('loop', { size: fs + 3, sw: 2 })}また買った ${num(n, { size: fs + 1, w: 600 })}<span style="font-size:11px; color:${C.muted};">/ ${read}件</span></span>`;

// 読めた量（B の空きタイル）：1マス＝1商品。塗り＝読めた
export function coverage(total, read, { cell = 6, gap = 2, cols = 49 } = {}) {
  const cells = Array.from({ length: total }, (_, i) => `<span style="width:${cell}px; height:${cell}px; border-radius:1.5px; background:${i < read ? C.ink : C.tile2};"></span>`).join('');
  return `<span style="display:grid; grid-template-columns:repeat(${cols}, ${cell}px); gap:${gap}px;">${cells}</span>`;
}

// ---------- 声札（C の形、B の見た目） ----------
export function tagCard({ img, name, sub = '', read, total, lines = [], justP = null, rep = null, w = 165, imgH = 96, note = '', sel = false } = {}) {
  const inner = w - 24;
  const L = lines.map((l) => `<div style="display:flex; align-items:baseline; gap:6px; font-size:12px; line-height:1.35; min-width:0;"><span style="flex-shrink:0; width:8px; height:8px; border-radius:2px; background:${l.kind === 'neg' ? C.neg : C.pos}; transform:translateY(-1px);"></span><span style="color:${l.kind === 'neg' ? C.negText : C.posText}; font-weight:700; flex-shrink:0;">${l.kind === 'neg' ? '不満' : '満足'}</span><span style="min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${l.t}</span>${num(l.n, { size: 12, w: 600 })}</div>`).join('');
  return `<div style="width:${w}px; box-sizing:border-box; padding:12px; border-radius:20px; background:#fff; box-shadow:${sel ? `0 0 0 2px ${C.ink}, ${SH.lift}` : SH.soft}; display:flex; flex-direction:column; gap:8px;">
<div style="height:${imgH}px; border-radius:14px; background:${C.tile}; display:flex; align-items:center; justify-content:center;">${img}</div>
<div><div style="font-size:13px; font-weight:700; line-height:1.35; min-height:${w < 200 ? 35 : 0}px;">${name}${sub ? `<span style="font-weight:500; color:${C.muted};"> ${sub}</span>` : ''}</div><div style="font-size:11px; color:${C.muted}; margin-top:3px; white-space:nowrap;">レビュー ${num(read, { size: 11, color: C.ink2 })} 件を読んだ${total ? `（全${total.toLocaleString('ja-JP')}件）` : ''}</div>${note ? `<div style="font-size:11px; color:${C.ink2}; margin-top:2px;">${note}</div>` : ''}</div>
${L ? `<div style="display:flex; flex-direction:column; gap:4px;">${L}</div>` : ''}
${justP ? just({ ...justP, labels: justP.counts.length === 3 ? ['小', 'ちょうど', '大'] : justP.labels, w: inner, h: 6, fs: 11 }) : ''}
${rep != null ? `<div>${again(rep, read, { fs: 11 })}</div>` : ''}
</div>`;
}

// ---------- 端末の枠と、浮いた丸いタブ（B） ----------
export function phone(screen, { scale = 1 } = {}) {
  const W = 390, H = 844, B = 10;
  return `<div style="width:${(W + B * 2) * scale}px; height:${(H + B * 2) * scale}px; flex-shrink:0;"><div style="width:${W + B * 2}px; height:${H + B * 2}px; transform:scale(${scale}); transform-origin:0 0; box-sizing:border-box; padding:${B}px; border-radius:58px; background:#161616; box-shadow:0 30px 64px rgba(20,20,20,.20), 0 8px 18px rgba(20,20,20,.10);"><div style="width:${W}px; height:${H}px; border-radius:48px; overflow:hidden; position:relative; background:#fff;">${screen}</div></div></div>`;
}
export function browser(screen, { scale = 1, W = 1440, H = 900, url = 'koe.example' } = {}) {
  const bar = 40;
  return `<div style="width:${W * scale}px; height:${(H + bar) * scale}px; flex-shrink:0;"><div style="width:${W}px; height:${H + bar}px; transform:scale(${scale}); transform-origin:0 0; border-radius:16px; overflow:hidden; background:#fff; box-shadow:0 30px 64px rgba(20,20,20,.16), 0 6px 16px rgba(20,20,20,.08);"><div style="height:${bar}px; display:flex; align-items:center; gap:8px; padding:0 16px; background:${C.tile};"><span style="width:11px; height:11px; border-radius:50%; background:${C.tile2};"></span><span style="width:11px; height:11px; border-radius:50%; background:${C.tile2};"></span><span style="width:11px; height:11px; border-radius:50%; background:${C.tile2};"></span><span style="margin-left:14px; height:24px; padding:0 14px; border-radius:12px; background:#fff; display:flex; align-items:center; font-family:${F.num}; font-size:12px; color:${C.muted};">${url}</span></div><div style="width:${W}px; height:${H}px; position:relative; overflow:hidden;">${screen}</div></div></div>`;
}
export function tabs(active = 0) {
  const items = [['home', 'ホーム'], ['search', 'さがす'], ['pair', 'くらべる'], ['person', 'わたし']];
  return `<nav aria-label="メイン" style="position:absolute; left:24px; right:24px; bottom:24px; height:64px; border-radius:32px; background:#fff; box-shadow:${SH.lift}; display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); padding:6px; box-sizing:border-box; z-index:30;">${items.map(([ic, t], i) => `<a href="#" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; border-radius:26px; background:${i === active ? C.tile : 'transparent'}; color:${C.ink}; text-decoration:none; font-size:11px; font-weight:${i === active ? 700 : 500}; opacity:${i === active ? 1 : 0.72};">${icon(ic, { size: 21 })}${t}</a>`).join('')}</nav>`;
}
export const status = () => `<div style="position:absolute; left:0; top:0; width:390px; height:44px; display:flex; align-items:center; justify-content:space-between; padding:0 30px; box-sizing:border-box; font-family:${F.num}; font-size:14px; font-weight:600; z-index:40;"><span>9:41</span><span style="width:17px; height:10px; border-radius:2px; border:1.5px solid ${C.ink};"></span></div>`;
export function searchPill(t = '商品名やカテゴリでさがす', { w = 342, h = 50 } = {}) {
  return `<label style="display:flex; align-items:center; gap:10px; width:${w}px; height:${h}px; padding:0 18px; border-radius:${h / 2}px; background:${C.tile}; box-sizing:border-box; color:${C.muted}; font-size:14px;">${icon('search', { size: 18 })}<input type="text" placeholder="${t}" aria-label="さがす" style="border:none; outline:none; background:transparent; font-family:${F.jp}; font-size:14px; color:${C.ink}; width:100%;"></label>`;
}
// 仮の名前。印は B の半円（左から不満・右へ満足）
export function mark(size = 18, { color = C.ink, text = '（名前は未定）' } = {}) {
  return `<span style="display:inline-flex; align-items:center; gap:${Math.round(size * 0.4)}px; white-space:nowrap;"><svg width="${size * 1.3}" height="${size * 0.9}" viewBox="0 0 26 18" aria-hidden="true"><path d="M3 16a10 10 0 0 1 4-8" fill="none" stroke="${C.neg}" stroke-width="3.2"></path><path d="M7 8a10 10 0 0 1 16 8" fill="none" stroke="${C.pos}" stroke-width="3.2"></path></svg><span style="font-family:${F.jp}; font-weight:900; font-size:${size}px; color:${color}; letter-spacing:.02em;">${text}</span></span>`;
}

// 統合案で足したモノの絵（シャンプーのポンプ・プロテインの容器）
const EXTRA_OBJ = {
  pump: (c) => `<rect x="35" y="36" width="30" height="42" rx="9" fill="${c}"></rect><rect x="45" y="24" width="10" height="14" rx="2" fill="#8F8B84"></rect><path d="M50 24h14v5h-6" fill="none" stroke="#8F8B84" stroke-width="4" stroke-linecap="round"></path><rect x="41" y="50" width="18" height="14" rx="2" fill="rgba(255,255,255,.6)"></rect>`,
  tub: (c) => `<rect x="30" y="34" width="40" height="44" rx="8" fill="${c}"></rect><rect x="28" y="28" width="44" height="10" rx="4" fill="#3C3A37"></rect><rect x="36" y="48" width="28" height="16" rx="3" fill="rgba(255,255,255,.7)"></rect>`,
};
const EXTRA_COL = { pump: '#D9E0DA', tub: '#CFC6B6' };
export function objD(name, { size = 64, col } = {}) {
  if (!EXTRA_OBJ[name]) return obj(name, { size, ...(col ? { col } : {}) });
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true" style="display:block; flex-shrink:0;"><ellipse cx="50" cy="82" rx="30" ry="5" fill="rgba(20,20,20,.08)"></ellipse>${EXTRA_OBJ[name](col || EXTRA_COL[name])}</svg>`;
}

// 数字の出どころの印：本人が選んだ欄（事実・AI なし）と、AI が本文を分類したもの
export const factTag = (t = '本人が選んだ欄', fs = 11) => `<span style="display:inline-flex; align-items:center; gap:4px; height:22px; padding:0 9px; border-radius:11px; border:1.2px solid ${C.ink}; font-size:${fs}px; font-weight:700; color:${C.ink}; white-space:nowrap;">${icon('check', { size: 12, sw: 2.4 })}${t}</span>`;
export const aiTag = (t = 'AIが本文を分類', fs = 11) => `<span style="display:inline-flex; align-items:center; gap:4px; height:22px; padding:0 9px; border-radius:11px; background:${C.tile}; font-size:${fs}px; color:${C.ink2}; white-space:nowrap;">${icon('info', { size: 12, sw: 2 })}${t}</span>`;
// 欄の件数（分母＝欄に答えた人）
export function fieldBar({ n, of, label, w = 300, fs = 12.5 } = {}) {
  return `<div style="width:${w}px; display:flex; flex-direction:column; gap:6px;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><b style="font-size:${fs + 0.5}px;">${label}</b><span style="font-size:11px; color:${C.muted};">欄に答えた ${of}人のうち</span></div><div style="width:${w}px; height:8px; border-radius:4px; background:${C.rest}; overflow:hidden;"><div style="width:${Math.round((n / of) * 100)}%; height:8px; background:${C.ink};"></div></div><div style="font-size:${fs}px;">${num(n, { size: fs + 1, w: 600 })} 人</div></div>`;
}

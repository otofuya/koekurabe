// 別案Bの触れる試作：眺める → 輪を回す → 押す（近い5つ）→ 声の束
// 状態は1つの板の中に持つ。位置・件数は build 時に実データから計算して埋め込む
import { C, F, SH, art, icon, label, ASPECT_ICON } from './libb.mjs';
import { positions, EDGES, WHEEL } from './mapb.mjs';
import { MAPPED, KEYS, SHORT, LABEL, POLE, STATS, AXES, neighbors, Q } from '../data.mjs';

const W = 390, H = 844, BASE = 648;

function data() {
  const pos = positions({ w: W, h: H, top: 104, bottom: 250, min: 34, max: 60 });
  const nodes = MAPPED.map((p) => ({ s: p.s, name: p.name, x: Math.round(pos[p.s].x), y: Math.round(pos[p.s].y), size: pos[p.s].size, thick: p.thick, pos: p.pos, neg: p.neg, read: p.read, rc: p.reviewCount, price: p.price, near: neighbors(p, 5).map((n) => n.p.s), q: Q[p.id.slice(0, 8)] || null }));
  const wheel = WHEEL.map((k) => ({ k, t: k ? SHORT[k] : 'すべて', cnt: k ? AXES.find((a) => a.key === k).products : '' }));
  return { nodes, edges: EDGES, wheel, keys: KEYS, labels: LABEL, short: SHORT, poles: POLE, col: { ink: C.ink, neg: C.neg, sat: C.sat, none: C.none, muted: C.muted, tile: C.tile, rest: '#E4E4E1' } };
}

const VALS = `function V(st, set) {
  var D = DATA, col = D.col, lens = st.lens, sel = st.sel, view = st.view;
  var byS = {}; D.nodes.forEach(function (n) { byS[n.s] = n; });
  var S = sel ? byS[sel] : null;
  var near = {}; if (S) S.near.forEach(function (x) { near[x] = true; });
  var gbg = function (pos, neg) { var t = pos + neg; if (!t) return 'conic-gradient(from 270deg, ' + col.none + ' 0deg 180deg, transparent 180deg)'; var a = (neg / t * 180).toFixed(1); return 'conic-gradient(from 270deg, ' + col.neg + ' 0deg ' + a + 'deg, ' + col.sat + ' ' + a + 'deg 180deg, transparent 180deg)'; };
  var nd = {};
  D.nodes.forEach(function (n) {
    var on = n.s === sel, size = on ? Math.round(n.size * 1.45) : n.size;
    var t = lens ? n.pos[lens] + n.neg[lens] : 1;
    var fade = (lens && t === 0) || (S && !on && !near[n.s]);
    var gs = size + 10;
    nd['p' + n.s] = {
      l: n.x - size / 2, t: n.y - size / 2, sz: size, z: on ? 8 : 2,
      op: fade ? 0.26 : (n.thick === 'thin' ? 0.62 : 1), gray: fade ? 'grayscale(1)' : 'none',
      ring: on ? '0 0 0 3px #fff, 0 0 0 5px ' + col.ink + ', 0 18px 40px rgba(17,17,17,.16)' : 'none',
      dash: n.thick === 'thin' ? '1px dashed #A3A3A3' : '0 solid transparent',
      g: lens && t ? gbg(n.pos[lens], n.neg[lens]) : 'transparent', gl: -5, gsz: gs, gop: lens && t ? 1 : 0,
      pick: function () { set({ sel: n.s, view: 'map' }); }
    };
  });
  var line = function (a, b, hot) { var A = byS[a], B = byS[b]; var dx = B.x - A.x, dy = B.y - A.y; return { l: A.x, t: A.y, w: Math.round(Math.sqrt(dx * dx + dy * dy)), r: (Math.atan2(dy, dx) * 180 / Math.PI).toFixed(1), c: hot ? col.ink : '#CFCFCC', bw: hot ? 1.6 : 1.2 }; };
  var edges = D.edges.map(function (e) { return line(e[0], e[1], S && (e[0] === sel || e[1] === sel)); });
  if (S) S.near.forEach(function (x) { if (!D.edges.some(function (e) { return (e[0] === sel && e[1] === x) || (e[1] === sel && e[0] === x); })) edges.push(line(sel, x, true)); });
  var idx = 0; D.wheel.forEach(function (w, i) { if (w.k === lens) idx = i; });
  var R = 420, cx = ${W} / 2, cy = ${BASE} + R;
  var wh = {};
  D.wheel.forEach(function (w, i) {
    var d = i - idx, a = d * 0.2, on = d === 0;
    var x = cx + Math.sin(a) * R, y = cy - Math.cos(a) * R, sz = on ? 54 : 46;
    wh['w' + i] = { l: Math.round(x - 45), t: Math.round(y - sz / 2), rot: (a * 180 / Math.PI).toFixed(1), op: Math.max(0.18, 1 - Math.abs(d) * 0.28), sz: sz, br: on ? '2px solid ' + col.ink : '0 solid transparent', bg: on ? '#fff' : col.tile, fs: on ? 13 : 11, fw: on ? 700 : 500, fc: on ? col.ink : col.muted,
      pick: function () { set({ lens: w.k }); } };
  });
  var bk = lens || (S ? D.keys.slice().sort(function (a, b) { return S.neg[b] - S.neg[a]; })[0] : 'fit');
  var sheet = { name: '', price: '', read: 0, rc: 0, neg: 0, pos: 0, label: '', g: 'transparent', worst: '' };
  if (S) {
    var sp = 0, sn = 0;
    if (lens) { sp = S.pos[lens]; sn = S.neg[lens]; } else { D.keys.forEach(function (k) { sp += S.pos[k]; sn += S.neg[k]; }); }
    sheet = { name: S.name, price: '¥' + S.price.toLocaleString('ja-JP'), read: S.read, rc: S.rc, neg: sn, pos: sp, label: lens ? D.labels[lens] : 'すべての観点（言及の合計）', g: gbg(sp, sn),
      worst: D.keys.slice().sort(function (a, b) { return S.neg[b] - S.neg[a]; }).filter(function (k) { return S.neg[k] > 0 && k !== lens; }).slice(0, 2).map(function (k) { return D.short[k] + ' ' + S.neg[k]; }).join('・') || 'なし' };
  }
  var slices = [];
  if (S && view === 'bundle') {
    var n = S.read, dx = Math.min(2.2, 250 / n), dy = dx * 0.62, neg = S.neg[bk], pos = S.pos[bk];
    for (var i = n - 1; i >= 0; i--) slices.push({ l: Math.round(24 + i * dx), t: Math.round(300 - i * dy), c: i < neg ? col.neg : i < neg + pos ? col.sat : col.rest });
  }
  var q = S && S.q && S.q[bk] ? S.q[bk] : null;
  return {
    nd: nd, edges: edges, wh: wh, slices: slices,
    isMap: view !== 'bundle', isBundle: view === 'bundle' && !!S, showSheet: !!S && view !== 'bundle', showHint: !lens && !S,
    showLens: !!lens && !S, lensLabel: lens ? D.labels[lens] : '', lensNeg: lens ? D.poles[lens].neg : '', lensPos: lens ? D.poles[lens].pos : '',
    sheet: sheet, bLabel: D.labels[bk], bNeg: S ? S.neg[bk] : 0, bPos: S ? S.pos[bk] : 0, bRead: S ? S.read : 0, bName: S ? S.name : '',
    hasQ: !!(q && (q.neg || q.pos)), qText: q ? (q.neg || q.pos) : '', qSide: q ? (q.neg ? '不満' : '満足') : '', qCol: q && q.neg ? col.neg : col.sat, noQ: !(q && (q.neg || q.pos)),
    close: function () { set({ sel: null, view: 'map' }); },
    openBundle: function () { set({ view: 'bundle' }); },
    back: function () { set({ view: 'map' }); }
  };
}`;

export function protoScreen() {
  const d = data();
  const nodes = d.nodes.map((n) => { const k = `nd.p${n.s}`; return `<button type="button" aria-label="${n.name}" onClick="{{${k}.pick}}" style="position:absolute; left:{{${k}.l}}px; top:{{${k}.t}}px; width:{{${k}.sz}}px; height:{{${k}.sz}}px; padding:0; border:none; border-radius:50%; background:${C.tile}; box-shadow:{{${k}.ring}}; z-index:{{${k}.z}}; transition:left .45s cubic-bezier(.3,.7,.2,1), top .45s cubic-bezier(.3,.7,.2,1), width .45s, height .45s, box-shadow .3s; cursor:pointer;"><span style="position:absolute; left:{{${k}.gl}}px; top:{{${k}.gl}}px; width:{{${k}.gsz}}px; height:{{${k}.gsz}}px; border-radius:50%; background:{{${k}.g}}; opacity:{{${k}.gop}}; -webkit-mask:radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3.5px)); mask:radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3.5px)); transition:opacity .35s;"></span><span style="position:absolute; inset:-3px; border-radius:50%; border:{{${k}.dash}};"></span><span style="position:absolute; inset:4%; display:flex; align-items:center; justify-content:center; opacity:{{${k}.op}}; filter:{{${k}.gray}}; transition:opacity .35s;">${art(n.s, 100).replace('width="100" height="100"', 'width="100%" height="100%"')}</span></button>`; }).join('');
  const wheelItems = d.wheel.map((w, i) => { const k = `wh.w${i}`; return `<div style="position:absolute; left:{{${k}.l}}px; top:{{${k}.t}}px; width:90px; display:flex; flex-direction:column; align-items:center; gap:6px; opacity:{{${k}.op}}; transform:rotate({{${k}.rot}}deg); transform-origin:50% 100%; transition:left .4s, top .4s, transform .4s, opacity .4s;"><button type="button" onClick="{{${k}.pick}}" aria-label="${w.t}" style="width:{{${k}.sz}}px; height:{{${k}.sz}}px; border-radius:17px; border:{{${k}.br}}; background:{{${k}.bg}}; color:${C.ink}; display:flex; align-items:center; justify-content:center; padding:0; cursor:pointer; transition:width .3s, height .3s;">${icon(w.k ? ASPECT_ICON[w.k] : 'all', { size: 22 })}</button><span style="font-size:{{${k}.fs}}px; font-weight:{{${k}.fw}}; color:{{${k}.fc}}; white-space:nowrap;">${w.t}${w.cnt ? `<sup style="font-family:${F.num}; font-size:11px; margin-left:2px; color:${C.muted};">${w.cnt}</sup>` : ''}</span></div>`; }).join('');
  return `<div style="position:relative; width:${W}px; height:${H}px; overflow:hidden; background:${C.map}; font-family:${F.jp}; color:${C.ink};">
<div style="position:absolute; inset:0; background-image:linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px); background-size:22px 22px;"></div>
<sc-if value="{{isMap}}" hint-placeholder-val="{{true}}">
<sc-for list="{{edges}}" as="e" hint-placeholder-count="20"><div style="position:absolute; left:{{e.l}}px; top:{{e.t}}px; width:{{e.w}}px; height:0; border-top:{{e.bw}}px dashed {{e.c}}; transform:rotate({{e.r}}deg); transform-origin:0 0; pointer-events:none;"></div></sc-for>
${nodes}
<div style="position:absolute; left:0; top:${BASE - 44}px; width:${W}px; height:150px; background:linear-gradient(rgba(246,246,245,0), rgba(246,246,245,.96) 38%); pointer-events:none;"></div>
<div style="position:absolute; left:${W / 2 - 18}px; top:${BASE - 44}px; width:36px; height:4px; border-radius:2px; background:${C.ink};"></div>
${wheelItems}
</sc-if>
<div style="position:absolute; left:0; top:0; width:${W}px; padding:48px 24px 12px; box-sizing:border-box; background:linear-gradient(${C.map} 70%, rgba(246,246,245,0)); z-index:20;"><div style="font-weight:900; font-size:18px;">完全ワイヤレスイヤホン</div><div style="font-size:11px; color:${C.muted}; margin-top:2px;">${STATS.total}商品のうち${STATS.analysed}商品の声・のべ${STATS.read}件</div></div>
<sc-if value="{{showHint}}" hint-placeholder-val="{{true}}"><div style="position:absolute; left:0; top:552px; width:${W}px; display:flex; justify-content:center; z-index:20;"><span style="display:flex; align-items:center; gap:8px; height:34px; padding:0 14px; border-radius:17px; background:#fff; box-shadow:${SH.soft}; font-size:12px; font-weight:700;">${icon('ear', { size: 16 })}下の輪を押すと、声が見える</span></div></sc-if>
<sc-if value="{{showLens}}" hint-placeholder-val="{{false}}"><div style="position:absolute; left:24px; top:98px; display:flex; gap:12px; font-size:11px; color:${C.ink2}; white-space:nowrap; z-index:20;"><b style="color:${C.ink};">{{lensLabel}}</b><span style="display:flex; align-items:center; gap:4px;"><span style="width:14px; height:4px; background:${C.neg};"></span>{{lensNeg}}</span><span style="display:flex; align-items:center; gap:4px;"><span style="width:14px; height:4px; background:${C.sat};"></span>{{lensPos}}</span></div></sc-if>
<sc-if value="{{showSheet}}" hint-placeholder-val="{{false}}"><div style="position:absolute; left:0; bottom:0; width:${W}px; height:318px; box-sizing:border-box; padding:14px 24px 0; background:#fff; border-radius:30px 30px 0 0; box-shadow:${SH.sheet}; z-index:30;">
<div style="display:flex; justify-content:space-between; align-items:flex-start;"><div><div style="font-size:19px; font-weight:700;">{{sheet.name}}</div><div style="font-size:12px; color:${C.ink2}; margin-top:3px;">{{sheet.price}}・レビュー{{sheet.rc}}件のうち{{sheet.read}}件を読んだ</div></div><button type="button" aria-label="閉じる" onClick="{{close}}" style="width:40px; height:40px; border-radius:50%; border:none; background:${C.tile}; display:flex; align-items:center; justify-content:center; padding:0; color:${C.ink};">${icon('close', { size: 18 })}</button></div>
<div style="margin-top:14px; display:flex; align-items:center; gap:18px;"><div style="position:relative; width:140px; height:84px;"><div style="position:absolute; left:0; top:0; width:140px; height:140px; border-radius:50%; background:{{sheet.g}}; -webkit-mask:radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9.5px)); mask:radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9.5px));"></div><div style="position:absolute; left:0; right:0; top:34px; text-align:center; font-family:${F.num}; font-weight:600; font-size:28px;"><span style="color:${C.negText};">{{sheet.neg}}</span><span style="color:${C.faint}; font-weight:300;"> / </span><span style="color:${C.satText};">{{sheet.pos}}</span></div></div><div style="display:flex; flex-direction:column; gap:6px;"><div style="font-size:14px; font-weight:700;">{{sheet.label}}</div><div style="font-size:11px; color:${C.muted};">不満 / 満足（AIが分類した件数）</div><div style="font-size:12px; color:${C.ink2};">ほかの不満：{{sheet.worst}}</div></div></div>
<div style="margin-top:14px; display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:8px;"><button type="button" onClick="{{openBundle}}" style="height:48px; border-radius:24px; border:none; background:${C.ink}; color:#fff; font-family:${F.jp}; font-size:14px; font-weight:700;">声の束を開く</button><button type="button" style="height:48px; border-radius:24px; border:none; background:${C.tile}; color:${C.ink}; font-family:${F.jp}; font-size:14px; font-weight:700;">くらべるに入れる</button></div>
</div></sc-if>
<sc-if value="{{isBundle}}" hint-placeholder-val="{{false}}"><div style="position:absolute; inset:0; background:#fff; z-index:40;">
<div style="position:absolute; left:24px; top:52px; display:flex; align-items:center; gap:10px;"><button type="button" aria-label="地図に戻る" onClick="{{back}}" style="width:40px; height:40px; border-radius:50%; border:none; background:${C.tile}; display:flex; align-items:center; justify-content:center; padding:0; color:${C.ink};">${icon('back', { size: 18 })}</button><div><div style="font-weight:900; font-size:18px;">声の束・{{bLabel}}</div><div style="font-size:11px; color:${C.muted};">{{bName}}・読んだ{{bRead}}件を1枚ずつ</div></div></div>
<sc-for list="{{slices}}" as="sl" hint-placeholder-count="40"><div style="position:absolute; left:{{sl.l}}px; top:{{sl.t}}px; width:74px; height:96px; background:{{sl.c}}; transform:skewY(-11deg); border-left:0.6px solid #fff;"></div></sc-for>
<sc-if value="{{hasQ}}" hint-placeholder-val="{{false}}"><div style="position:absolute; left:150px; top:150px; width:212px; box-sizing:border-box; padding:14px; border-radius:18px; background:#fff; box-shadow:${SH.lift};"><div style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:700;"><span style="width:12px; height:4px; background:{{qCol}};"></span>{{bLabel}}・{{qSide}}</div><div style="font-size:13px; line-height:1.6; margin-top:6px;">「{{qText}}」</div><div style="font-size:11px; color:${C.muted}; margin-top:6px; text-decoration:underline;">楽天のレビューで確かめる</div></div></sc-if>
<sc-if value="{{noQ}}" hint-placeholder-val="{{true}}"><div style="position:absolute; left:150px; top:170px; width:212px; font-size:12px; color:${C.muted}; line-height:1.6;">この商品の引用は、抽出のやり直し（満足・不満の区別）の後に出る</div></sc-if>
<div style="position:absolute; left:24px; top:450px; width:342px; display:flex; gap:16px; font-size:13px;"><span style="display:flex; align-items:center; gap:6px;"><span style="width:14px; height:14px; border-radius:3px; background:${C.neg};"></span>不満 {{bNeg}}</span><span style="display:flex; align-items:center; gap:6px;"><span style="width:14px; height:14px; border-radius:3px; background:${C.sat};"></span>満足 {{bPos}}</span><span style="display:flex; align-items:center; gap:6px;"><span style="width:14px; height:14px; border-radius:3px; background:#E4E4E1;"></span>ふれていない</span></div>
<div style="position:absolute; left:24px; top:494px; width:342px; font-size:12px; color:${C.ink2}; line-height:1.7;">1件＝1枚。手前から不満、満足、ふれていないレビュー。本文は載せず、照合できた短い引用だけ</div>
</div></sc-if>
</div>`;
}

export function logic() {
  return `class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { lens: null, sel: null, view: 'map' };
  }
  renderVals() {
    var DATA = ${JSON.stringify(data())};
    ${VALS}
    var self = this;
    return V(this.state, function (patch) { self.setState(patch); });
  }
}`;
}

export function renderStatic(markup, st) {
  const DATA = data();
  const V = new Function('DATA', `${VALS}; return V;`)(DATA);
  const vals = V({ lens: null, sel: null, view: 'map', ...st }, () => {});
  const get = (o, path) => path.trim().split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  let s = markup;
  s = s.replace(/<sc-for list="\{\{(\w+)\}\}" as="(\w+)"[^>]*>([\s\S]*?)<\/sc-for>/g, (_, list, as, body) => (vals[list] || []).map((item) => body.replace(new RegExp(`\\{\\{${as}\\.([\\w.]+)\\}\\}`, 'g'), (m, p) => String(get(item, p) ?? ''))).join(''));
  for (let n = 0; n < 5; n++) s = s.replace(/<sc-if value="\{\{([\w.]+)\}\}"[^>]*>((?:(?!<sc-if)[\s\S])*?)<\/sc-if>/g, (_, p, body) => (get(vals, p) ? body : ''));
  s = s.replace(/ on[A-Z]\w+="\{\{[\w.]+\}\}"/g, '');
  const left = [];
  s = s.replace(/\{\{([\w. ]+)\}\}/g, (m, p) => { const v = get(vals, p); if (v === undefined) left.push(p); return String(v ?? ''); });
  return { html: s, left };
}

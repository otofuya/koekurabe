// 別案C の触れる試作：ものさし → 観点を切り替える → 「足幅が広い」で数えなおす → 押して声札
// 数字はランニングシューズ8商品の見本（単語の規則・1商品30件）。位置は build 時に全状態ぶん計算して埋め込む
import { C, F, SH, icon, shoeArt, sampleNote, tierMark, navBar, statusBar } from './libc.mjs';
import { SHOES, ALL_DIR, WIDE_DIR, WIDE_TOTAL, LIGHT, CUSH, dirScore, shrink, sum } from './datac.mjs';

const W = 390, H = 844, RX = 24, RY = 300, RW = 342, RH = 250, FEW = 5;
const ASP = {
  size: { t: 'サイズ感', kind: 'just', lo: '小さめ', hi: '大きめ', get: (s, w) => (w ? s.wideDir : s.dir) },
  cushion: { t: 'クッション', kind: 'polar', lo: '硬い', hi: 'やわらかい', get: (s, w) => (w ? s.wideCush : s.cushion) },
  light: { t: '軽さ', kind: 'polar', lo: '重い', hi: '軽い', get: (s, w) => (w ? s.wideLight : s.light), flat: true },
};
const nOf = (a, c) => (ASP[a].kind === 'just' ? c[0] + c[1] + c[2] : c[0] + c[1]);
const scoreOf = (a, c) => (ASP[a].kind === 'just' ? dirScore(c) : shrink(c[0], c[1])) ?? 0;

function layout(a, wide) {
  const maxAbs = Math.max(0.05, ...SHOES.map((s) => Math.abs(scoreOf(a, ASP[a].get(s, false)))));
  const items = SHOES.map((s) => { const c = ASP[a].get(s, wide); const n = nOf(a, c); return { id: s.id, n, score: scoreOf(a, c), size: Math.round(34 + 26 * Math.sqrt(Math.min(n, 24) / 24)) }; });
  const placed = [];
  [...items].sort((x, y) => y.size - x.size).forEach((it) => {
    const x = Math.max(it.size / 2 + 10, Math.min(RW - it.size / 2 - 10, RW / 2 + (it.score / maxAbs) * (RW / 2 - 20 - it.size / 2)));
    const cy = RH / 2 - 14;
    let pos = { x, y: cy };
    for (let k = 0; k < 40; k++) {
      const y = cy + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 7;
      if (placed.every((p) => Math.hypot(p.x - x, p.y - y) >= (p.size + it.size) / 2 + 3) && y - it.size / 2 >= 8 && y + it.size / 2 <= RH - 40) { pos = { x, y }; break; }
    }
    placed.push({ ...it, ...pos });
  });
  return Object.fromEntries(placed.map((p) => [p.id, { l: Math.round(p.x - p.size / 2), t: Math.round(p.y - p.size / 2), sz: p.size, n: p.n, few: p.n < FEW }]));
}

function data() {
  const pos = {};
  for (const a of Object.keys(ASP)) for (const w of [0, 1]) pos[`${a}${w}`] = layout(a, !!w);
  const shoes = SHOES.map((s) => ({ id: s.id, name: s.name, sub: s.sub, read: s.read, total: s.total, wide: s.wide, rep: s.rep, v: Object.fromEntries(Object.keys(ASP).map((a) => [a, [ASP[a].get(s, false), ASP[a].get(s, true)]])) }));
  const cat = { size: [ALL_DIR, WIDE_DIR], cushion: [CUSH, [sum(SHOES, (s) => s.wideCush[0]), sum(SHOES, (s) => s.wideCush[1])]], light: [LIGHT, [sum(SHOES, (s) => s.wideLight[0]), sum(SHOES, (s) => s.wideLight[1])]] };
  return { pos, shoes, cat, asp: Object.fromEntries(Object.entries(ASP).map(([k, v]) => [k, { t: v.t, kind: v.kind, lo: v.lo, hi: v.hi, flat: !!v.flat }])), wideTotal: WIDE_TOTAL, catN: 240, col: { neg: C.neg, pos: C.pos, side: C.side, mid: C.mid, rest: C.rest, ink: C.ink, card: C.card, line: C.line } };
}

const VALS = `function V(st, set) {
  var D = DATA, a = st.asp, w = st.wide ? 1 : 0, sel = st.sel, A = D.asp[a], col = D.col;
  var P = D.pos[a + w];
  var seg = function (kind, c, n) {
    if (!n) return { s1: 0, s2: 100, s3: 0, c1: col.rest, c2: col.rest, c3: col.rest };
    if (kind === 'just') { var t = c[0] + c[1] + c[2] || 1; return { s1: c[0] / t * 100, s2: c[1] / t * 100, s3: c[2] / t * 100, c1: col.side, c2: col.mid, c3: col.side }; }
    return { s1: c[1] / n * 100, s2: Math.max(0, 100 - (c[0] + c[1]) / n * 100), s3: c[0] / n * 100, c1: col.neg, c2: col.rest, c3: col.pos };
  };
  var txt = function (kind, c) { return kind === 'just' ? '小さめ ' + c[0] + ' ・ ちょうど ' + c[1] + ' ・ 大きめ ' + c[2] : '不満 ' + c[1] + ' ・ 満足 ' + c[0]; };
  var nd = {};
  D.shoes.forEach(function (s) {
    var p = P[s.id], on = s.id === sel;
    nd['n' + s.id.replace(/-/g, '_')] = {
      l: p.l, t: p.t, sz: p.sz, z: on ? 8 : 2,
      op: p.few ? 0.45 : 1, dash: p.few ? '1px dashed #A39E94' : '0 solid transparent',
      ring: on ? '0 0 0 3px #fff, 0 0 0 5px ' + col.ink : 'none',
      pick: function () { set({ sel: s.id }); }
    };
  });
  var cc = D.cat[a][w], cn = A.kind === 'just' ? cc[0] + cc[1] + cc[2] : cc[0] + cc[1];
  var cs = seg(A.kind, cc, w ? D.wideTotal : D.catN);
  if (A.kind === 'just') cs = seg('just', cc, cn);
  var tab = function (k) { var on = k === a; return { bg: on ? col.ink : col.card, fg: on ? '#fff' : col.ink, bd: D.asp[k].flat ? '1px dashed ' + col.line : 'none', pick: function () { set({ asp: k }); } }; };
  var S = null; D.shoes.forEach(function (s) { if (s.id === sel) S = s; });
  var sheet = { name: '', sub: '', meta: '', r1n: '', r1t: '', r2n: '', r2t: '', few: '' , a: A.t };
  var r1 = seg('just', [0, 0, 0], 0), r2 = r1;
  if (S) {
    var c0 = S.v[a][0], c1 = S.v[a][1];
    var n0 = A.kind === 'just' ? c0[0] + c0[1] + c0[2] : S.read, n1 = A.kind === 'just' ? c1[0] + c1[1] + c1[2] : S.wide;
    r1 = seg(A.kind, c0, A.kind === 'just' ? n0 : S.read); r2 = seg(A.kind, c1, A.kind === 'just' ? n1 : S.wide);
    sheet = { name: S.name, sub: S.sub, meta: '読んだ ' + S.read + ' / ' + S.total + '件 ・ また買った ' + S.rep + '件', a: A.t,
      r1n: '全体（' + S.read + '件中' + (A.kind === 'just' ? ' ' + n0 + '件' : '') + '）', r1t: txt(A.kind, c0),
      r2n: '幅広と書いた人（' + S.wide + '件中' + (A.kind === 'just' ? ' ' + n1 + '件' : '') + '）', r2t: txt(A.kind, c1),
      few: (A.kind === 'just' ? n1 : S.wide) < ${FEW} ? 'まだ少ない。数字を小さく出す' : '' };
  }
  return {
    nd: nd, tabSize: tab('size'), tabCush: tab('cushion'), tabLight: tab('light'),
    wideBg: st.wide ? col.ink : col.card, wideFg: st.wide ? '#fff' : col.ink, wideIc: st.wide ? '✓' : '＋',
    toggleWide: function () { set({ wide: !st.wide }); },
    lo: '← ' + A.lo, hi: A.hi + ' →',
    catLabel: (w ? '幅広と書いた人（' + D.wideTotal + '件）' : '8商品ぜんたい（' + D.catN + '件）') + 'の' + A.t,
    catText: txt(A.kind, cc), c1w: cs.s1, c2w: cs.s2, c3w: cs.s3, c1c: cs.c1, c2c: cs.c2, c3c: cs.c3,
    isFlat: !!A.flat, notFlat: !A.flat,
    showSheet: !!S, sheet: sheet,
    r1a: r1.s1, r1b: r1.s2, r1c: r1.s3, r1x: r1.c1, r1y: r1.c2, r1z: r1.c3,
    r2a: r2.s1, r2b: r2.s2, r2c: r2.s3, r2x: r2.c1, r2y: r2.c2, r2z: r2.c3,
    hasFew: !!(S && sheet.few),
    close: function () { set({ sel: null }); }
  };
}`;

export function protoScreen() {
  const d = data();
  const nodes = SHOES.map((s) => { const k = `nd.n${s.id.replace(/-/g, '_')}`; return `<button type="button" aria-label="${s.name}${s.sub ? ' ' + s.sub : ''}" onClick="{{${k}.pick}}" style="position:absolute; left:{{${k}.l}}px; top:{{${k}.t}}px; width:{{${k}.sz}}px; height:{{${k}.sz}}px; padding:0; border:none; border-radius:50%; background:${C.tile}; box-shadow:{{${k}.ring}}; outline:{{${k}.dash}}; outline-offset:2px; z-index:{{${k}.z}}; transition:left .5s cubic-bezier(.3,.7,.2,1), top .5s cubic-bezier(.3,.7,.2,1), width .5s, height .5s; cursor:pointer;"><span style="position:absolute; inset:6%; display:flex; opacity:{{${k}.op}}; transition:opacity .4s;">${shoeArt(s, 100).replace('width="100" height="100"', 'width="100%" height="100%"')}</span></button>`; }).join('');
  const tab = (key, t) => `<button type="button" onClick="{{${key}.pick}}" style="height:34px; padding:0 14px; border-radius:17px; border:{{${key}.bd}}; background:{{${key}.bg}}; color:{{${key}.fg}}; box-shadow:${SH.card}; font-family:${F.jp}; font-size:13px; font-weight:700; white-space:nowrap; cursor:pointer;">${t}</button>`;
  const strip = (a, b, c, x, y, z, w = 314, hgt = 9) => `<div style="display:flex; width:${w}px; height:${hgt}px; border-radius:${hgt / 2}px; overflow:hidden; background:${C.rest};"><span style="width:{{${a}}}%; background:{{${x}}}; transition:width .4s;"></span><span style="width:{{${b}}}%; background:{{${y}}}; transition:width .4s;"></span><span style="width:{{${c}}}%; background:{{${z}}}; transition:width .4s;"></span></div>`;
  return `<div style="position:relative; width:${W}px; height:${H}px; overflow:hidden; background:${C.paper}; font-family:${F.jp}; color:${C.ink};">
${statusBar()}
<div style="position:absolute; left:24px; top:52px; width:342px; display:flex; align-items:center; gap:10px;"><div style="flex:1;"><div style="font-size:18px; font-weight:700;">ランニングシューズ</div><div style="font-family:${F.mono}; font-size:11px; color:${C.muted}; margin-top:1px;">8商品・240件を読んだ（見本）</div></div>${tierMark(1, { size: 's' })}</div>
<div style="position:absolute; left:24px; top:104px; display:flex; gap:8px; align-items:center;"><button type="button" onClick="{{toggleWide}}" style="display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 14px 0 12px; border-radius:17px; border:1px solid ${C.line}; background:{{wideBg}}; color:{{wideFg}}; font-family:${F.jp}; font-size:13px; font-weight:700; cursor:pointer; transition:background .3s;">{{wideIc}} 足幅が広い</button>${sampleNote('見本・単語の規則')}</div>
<div style="position:absolute; left:24px; top:152px; display:flex; gap:8px;">${tab('tabSize', 'サイズ感')}${tab('tabCush', 'クッション')}${tab('tabLight', '軽さ')}</div>
<div style="position:absolute; left:24px; top:200px; width:342px; box-sizing:border-box; padding:12px 14px; border-radius:16px; background:${C.card}; box-shadow:${SH.card};"><div style="font-size:12px; font-weight:700;">{{catLabel}}</div><div style="margin-top:8px;">${strip('c1w', 'c2w', 'c3w', 'c1c', 'c2c', 'c3c')}</div><div style="font-family:${F.mono}; font-size:11px; color:${C.ink2}; margin-top:6px;">{{catText}}</div></div>
<div style="position:absolute; left:${RX}px; top:${RY}px; width:${RW}px; height:${RH}px; border-radius:18px; background:${C.card}; box-shadow:${SH.card};"><div style="position:absolute; left:14px; right:14px; top:${RH / 2 - 14}px; border-top:1.5px solid ${C.hair};"></div><div style="position:absolute; left:${RW / 2}px; top:12px; height:${RH - 56}px; border-left:1px dashed ${C.line};"></div>${nodes}<div style="position:absolute; left:14px; right:14px; bottom:12px; display:flex; justify-content:space-between; font-size:12px; font-weight:700; white-space:nowrap;"><span>{{lo}}</span><span>{{hi}}</span></div></div>
<sc-if value="{{isFlat}}" hint-placeholder-val="{{false}}"><div style="position:absolute; left:24px; top:${RY + RH + 12}px; width:342px; box-sizing:border-box; padding:10px 12px; border-radius:12px; background:${C.ink}; color:#fff; font-size:12px; line-height:1.55;">全員が褒める（満足${LIGHT[0]}・不満${LIGHT[1]}）。差が出ないので、公開では棚にしない</div></sc-if>
<sc-if value="{{notFlat}}" hint-placeholder-val="{{true}}"><div style="position:absolute; left:24px; top:${RY + RH + 12}px; width:342px; font-size:11.5px; color:${C.muted}; line-height:1.6;">位置＝向きの点数（読めた量が少ないほど真ん中へ）。丸の大きさ＝ふれた件数。点線＝${FEW}件未満（見本は1商品30件なので目安を下げている。本番は20件）</div></sc-if>
${navBar(1)}
<sc-if value="{{showSheet}}" hint-placeholder-val="{{false}}"><div style="position:absolute; left:0; bottom:0; width:${W}px; height:340px; box-sizing:border-box; padding:16px 24px 0; background:${C.card}; border-radius:28px 28px 0 0; box-shadow:${SH.sheet}; z-index:40;">
<div style="display:flex; justify-content:space-between; align-items:flex-start;"><div><div style="font-size:17px; font-weight:700;">{{sheet.name}} <span style="font-size:13px; font-weight:500; color:${C.muted};">{{sheet.sub}}</span></div><div style="font-family:${F.mono}; font-size:11px; color:${C.ink2}; margin-top:3px;">{{sheet.meta}}</div></div><button type="button" aria-label="閉じる" onClick="{{close}}" style="width:38px; height:38px; border-radius:50%; border:none; background:${C.tile}; display:flex; align-items:center; justify-content:center; padding:0; color:${C.ink}; cursor:pointer;">${icon('close', { size: 17 })}</button></div>
<div style="font-size:13px; font-weight:700; margin-top:14px;">{{sheet.a}}</div>
<div style="margin-top:8px;"><div style="font-size:12px; color:${C.ink2};">{{sheet.r1n}}</div><div style="margin-top:5px;">${strip('r1a', 'r1b', 'r1c', 'r1x', 'r1y', 'r1z', 342, 9)}</div><div style="font-family:${F.mono}; font-size:11px; margin-top:4px;">{{sheet.r1t}}</div></div>
<div style="margin-top:12px;"><div style="font-size:12px; color:${C.ink2};">{{sheet.r2n}}</div><div style="margin-top:5px; opacity:.6;">${strip('r2a', 'r2b', 'r2c', 'r2x', 'r2y', 'r2z', 342, 7)}</div><div style="font-family:${F.mono}; font-size:11px; margin-top:4px; color:${C.ink2};">{{sheet.r2t}}</div></div>
<sc-if value="{{hasFew}}" hint-placeholder-val="{{false}}"><div style="font-size:11.5px; color:${C.muted}; margin-top:6px;">{{sheet.few}}</div></sc-if>
<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:14px;"><button type="button" style="height:46px; border-radius:23px; border:none; background:${C.ink}; color:#fff; font-family:${F.jp}; font-size:14px; font-weight:700;">楽天で見る</button><button type="button" style="height:46px; border-radius:23px; border:none; background:${C.tile}; color:${C.ink}; font-family:${F.jp}; font-size:14px; font-weight:700;">並べるに入れる</button></div>
</div></sc-if>
</div>`;
}

export function logic() {
  return `class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { asp: 'size', wide: false, sel: null };
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
  const vals = V({ asp: 'size', wide: false, sel: null, ...st }, () => {});
  const get = (o, path) => path.trim().split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  let s = markup;
  for (let n = 0; n < 5; n++) s = s.replace(/<sc-if value="\{\{([\w.]+)\}\}"[^>]*>((?:(?!<sc-if)[\s\S])*?)<\/sc-if>/g, (_, p, body) => (get(vals, p) ? body : ''));
  s = s.replace(/ on[A-Z]\w+="\{\{[\w.]+\}\}"/g, '');
  const left = [];
  s = s.replace(/\{\{([\w. ]+)\}\}/g, (m, p) => { const v = get(vals, p); if (v === undefined) left.push(p); return String(v ?? ''); });
  return { html: s, left };
}

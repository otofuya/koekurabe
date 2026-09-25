// 触れる試作：ジャンルの地図 → レンズ → 並べる（点が動く）→ 点を押す → 似ているもの（点が動く）
// 状態は1つの板の中に持つ。位置は build 時に実データから計算して埋め込む
import { C, F, SH, icon } from './lib.mjs';
import { layoutMap, dotSize, relax } from './map.mjs';
import { MAPPED, KEYS, SHORT, LABEL, POLE, STATS, AXES, SAME, quad, neighbors, maxCount } from './data.mjs';

const W = 390, H = 844, MAP_H = 610;

function data() {
  const lay = layoutMap({ w: W, h: MAP_H, top: 118, bottom: 0, min: 24, max: 50, labels: 'thick' });
  const pos = Object.fromEntries(lay.map((it) => [it.p.s, [Math.round(it.x), Math.round(it.y), it.size]]));
  // 並べる（装着感 × ノイキャン）
  const { points } = quad('fit', 'anc');
  const pad = 36, top = 150, ah = MAP_H - top - 10;
  const ax = points.map((pt) => { const size = dotSize(pt.p.tot, { min: 22, max: 46 }); return { s: pt.p.s, size, r: size / 2 + (pt.p.thick !== 'thin' ? 9 : 3), x: pad + ((pt.x + 1) / 2) * (W - 2 * pad), y: top + pad + (1 - (pt.y + 1) / 2) * (ah - 2 * pad) }; });
  relax(ax, { w: W, h: MAP_H, pad: 6 });
  const axes = Object.fromEntries(ax.map((it) => [it.s, [Math.round(it.x), Math.round(it.y)]]));
  // 似ているもの：起点ごとに、近い5商品の位置（方角＝起点より満足が多い観点）
  const dirs = KEYS.map((k, i) => ({ k, ang: -Math.PI / 2 + (i * 2 * Math.PI) / KEYS.length }));
  const cx = W / 2, cy = 330, R = 130;
  const ego = {};
  for (const a of MAPPED) {
    const nb = neighbors(a, 5);
    if (!nb.length) continue;
    const maxD = Math.max(...nb.map((n) => n.dist));
    const used = {};
    const items = nb.map((n) => {
      const up = n.diffs.find((d) => d.d > 0.1) ?? n.diffs[0];
      const off = (used[up.k] = (used[up.k] ?? -1) + 1);
      const ang = dirs.find((d) => d.k === up.k).ang + (off % 2 ? 1 : -1) * Math.ceil(off / 2) * 0.42;
      const r = R * (0.5 + 0.5 * (n.dist / maxD));
      return { s: n.p.s, up: SHORT[up.k], r: 30, x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r };
    });
    items.push({ fixed: true, s: a.s, r: 44, x: cx, y: cy });
    relax(items, { w: W, h: MAP_H, pad: 34, gap: 6 });
    ego[a.s] = Object.fromEntries(items.filter((i) => !i.fixed).map((i) => [i.s, [Math.round(i.x), Math.round(i.y), i.up]]));
  }
  const prods = MAPPED.map((p) => ({ s: p.s, name: p.name, tot: p.tot, read: p.read, rc: p.reviewCount, thick: p.thick, pos: p.pos, neg: p.neg, price: p.price, max: maxCount(p), size: pos[p.s][2], m: pos[p.s].slice(0, 2), a: axes[p.s] || null }));
  const lenses = [null, ...AXES.filter((a) => a.offerable).map((a) => a.key)].map((k) => ({ k, t: k ? SHORT[k] : 'すべて' }));
  return { prods, ego, lenses, labels: SHORT, full: LABEL, poles: POLE, keys: KEYS, cx, cy, col: { ink: C.ink, white: C.white, sat: C.sat, neg: C.neg, none: C.none, muted: C.muted, bg2: C.bg2, line2: C.line2, satText: C.satText, negText: C.negText }, same: SAME.map((a) => SHORT[a.key]).join('・'), placed: points.length };
}

// renderVals の本体（試作と、手元の静的確認で同じものを使う）
const VALS = `function V(st, set) {
  var D = DATA, col = D.col;
  var sel = st.sel, lens = st.lens, mode = st.mode;
  var egoMap = (mode === 'ego' && sel) ? D.ego[sel] : null;
  var ring = function (p) {
    var pos = 0, neg = 0;
    if (lens) { pos = p.pos[lens]; neg = p.neg[lens]; } else { for (var i = 0; i < D.keys.length; i++) { pos += p.pos[D.keys[i]]; neg += p.neg[D.keys[i]]; } }
    var t = pos + neg;
    if (!t) return { bg: '#FFFFFF', hollow: true, pos: 0, neg: 0 };
    var a = neg / t * 360;
    return { bg: 'conic-gradient(' + col.neg + ' 0deg ' + a.toFixed(1) + 'deg, ' + col.sat + ' ' + a.toFixed(1) + 'deg 360deg)', hollow: false, pos: pos, neg: neg };
  };
  var parked = 0;
  var pts = D.prods.map(function (p, i) {
    var r = ring(p), x = p.m[0], y = p.m[1], op = 1, show = p.thick !== 'thin', size = p.size, sub = '';
    if (mode === 'axes') {
      if (p.a) { x = p.a[0]; y = p.a[1]; } else { x = 24 + (parked % 12) * 29; y = ${MAP_H + 36}; op = 0.35; size = 22; show = false; parked++; }
    }
    if (egoMap) {
      if (p.s === sel) { x = D.cx; y = D.cy; size = 60; show = true; sub = '起点'; }
      else if (egoMap[p.s]) { x = egoMap[p.s][0]; y = egoMap[p.s][1]; show = true; sub = egoMap[p.s][2] + 'の満足↑'; }
      else { op = 0; show = false; }
    }
    var on = p.s === sel;
    var inner = Math.round(size - Math.max(3, Math.round(size * 0.11)) * 2);
    return {
      name: p.name, left: Math.round(x - size / 2), top: Math.round(y - size / 2), size: size, inner: inner, rw: Math.round((size - inner) / 2),
      bg: r.bg, bd: p.thick === 'thin' ? '1.5px dashed ' + col.muted : p.thick === 'mid' ? '1.5px solid ' + col.muted : '0 solid transparent',
      out: r.hollow ? '1.5px dashed ' + col.muted : 'none', op: op, pe: op ? 'auto' : 'none',
      ring: on ? '0 0 0 3px #FFFFFF, 0 0 0 5.5px ' + col.ink : '0 1px 2px rgba(18,20,23,.18), 0 3px 8px rgba(18,20,23,.10)',
      lx: Math.round(Math.min(${W} - 122, Math.max(2, x - 60))), ly: Math.round(y + size / 2 + 3), lop: (show || on) && op ? 1 : 0, sub: sub,
      pick: function () { set({ sel: p.s }); }
    };
  });
  var lenses = D.lenses.map(function (l) { var on = l.k === lens; return { t: l.t, bg: on ? col.ink : '#FFFFFF', fg: on ? col.white : col.ink, bd: on ? 'none' : '1px solid ' + col.line2, pick: function () { set({ lens: l.k }); } }; });
  var P = null; for (var j = 0; j < D.prods.length; j++) if (D.prods[j].s === sel) P = D.prods[j];
  var k = lens, bar = null;
  if (P) {
    var bpos = 0, bneg = 0;
    if (k) { bpos = P.pos[k]; bneg = P.neg[k]; } else { for (var q = 0; q < D.keys.length; q++) { bpos += P.pos[D.keys[q]]; bneg += P.neg[D.keys[q]]; } }
    var mx = Math.max(bpos, bneg, k ? P.max : 1, 1);
    var worst = D.keys.slice().sort(function (a, b) { return P.neg[b] - P.neg[a]; }).filter(function (x) { return P.neg[x] > 0 && x !== k; }).slice(0, 3).map(function (x) { return D.labels[x] + ' ' + P.neg[x]; }).join('、');
    bar = { label: k ? D.full[k] : 'すべての観点（言及の合計）', pos: bpos, neg: bneg, pw: Math.round(bpos / mx * 176), nw: Math.round(bneg / mx * 176), none: bpos + bneg === 0, worst: worst || 'なし' };
  }
  var mk = function (m) { return mode === m || (m === 'map' && mode === 'ego') ? { bg: col.ink, fg: col.white } : { bg: 'transparent', fg: col.ink }; };
  return {
    pts: pts, lenses: lenses,
    isMap: mode !== 'ego', isEgo: mode === 'ego', isAxes: mode === 'axes', notAxes: mode === 'map',
    showSheet: !!P && mode !== 'ego', showDock: !P || mode === 'ego',
    selName: P ? P.name : '', selRead: P ? P.read : 0, selRc: P ? P.rc : 0, selPrice: P ? '¥' + P.price.toLocaleString('ja-JP') : '',
    bar: bar || { label: '', pos: 0, neg: 0, pw: 0, nw: 0, none: false, worst: '' },
    lensNote: lens ? 'リングは「' + D.full[lens] + '」だけ。オレンジ＝' + D.poles[lens].neg + '、青＝' + D.poles[lens].pos + '。点線の丸＝ふれていない' : 'リングは全観点。不満（オレンジ）が先、満足（青）が後',
    axesNote: '横：装着感 ／ 縦：ノイズキャンセリング。' + D.placed + '商品を配置。どちらかにふれていない商品は下に（原点に置かない）',
    same: D.same, mMap: mk('map'), mAxes: mk('axes'),
    egoTitle: P ? P.name + ' を真ん中に' : '',
    toMap: function () { set({ mode: 'map' }); },
    toAxes: function () { set({ mode: 'axes' }); },
    toEgo: function () { set({ mode: 'ego' }); },
    close: function () { set({ sel: null, mode: st.mode === 'ego' ? 'map' : st.mode }); }
  };
}`;

const pill = (inner, st = '') => `<div style="display:inline-flex; padding:3px; border-radius:22px; background:#FFFFFF; box-shadow:${SH.card};${st}">${inner}</div>`;

export function protoScreen() {
  return `<div style="position:relative; width:${W}px; height:${H}px; overflow:hidden; background:${C.map}; font-family:${F.body}; color:${C.ink};">
<div style="position:absolute; left:0; top:0; width:${W}px; height:${MAP_H + 60}px; background-image:linear-gradient(${C.map2} 1px, transparent 1px), linear-gradient(90deg, ${C.map2} 1px, transparent 1px); background-size:48px 48px;"></div>
<sc-if value="{{isAxes}}" hint-placeholder-val="{{false}}"><div style="position:absolute; left:${W / 2}px; top:150px; width:1px; height:${MAP_H - 160}px; background:${C.line2};"></div><div style="position:absolute; left:0; top:${150 + (MAP_H - 160) / 2}px; width:${W}px; height:1px; background:${C.line2};"></div><div style="position:absolute; left:${W / 2 + 8}px; top:154px; font-size:11px; font-weight:700; color:${C.muted};">↑ ノイキャン：静かになる</div><div style="position:absolute; right:8px; top:${MAP_H - 30}px; font-size:11px; font-weight:700; color:${C.muted};">装着感：つけ心地が良い →</div><div style="position:absolute; left:8px; top:${MAP_H - 30}px; font-size:11px; font-weight:700; color:${C.muted};">← 合わない人がいる</div><div style="position:absolute; left:16px; top:${MAP_H + 4}px; font-size:11px; color:${C.muted};">図に置けない（どちらかにふれていない）</div></sc-if>
<sc-for list="{{pts}}" as="pt" hint-placeholder-count="20"><button type="button" aria-label="{{pt.name}}" onClick="{{pt.pick}}" style="position:absolute; left:{{pt.left}}px; top:{{pt.top}}px; width:{{pt.size}}px; height:{{pt.size}}px; padding:0; border:none; border-radius:50%; background:{{pt.bg}}; box-shadow:{{pt.ring}}; outline:{{pt.out}}; outline-offset:-1.5px; opacity:{{pt.op}}; pointer-events:{{pt.pe}}; transition:left .6s cubic-bezier(.3,.7,.2,1), top .6s cubic-bezier(.3,.7,.2,1), width .6s, height .6s, opacity .4s; cursor:pointer;"><span style="position:absolute; inset:-3px; border-radius:50%; border:{{pt.bd}};"></span><span style="position:absolute; left:{{pt.rw}}px; top:{{pt.rw}}px; width:{{pt.inner}}px; height:{{pt.inner}}px; border-radius:50%; background:${C.bg2}; display:flex; align-items:center; justify-content:center; color:${C.muted}; transition:width .6s, height .6s;">${icon('earbud', { size: 16, sw: 1.6 })}</span></button><div style="position:absolute; left:{{pt.lx}}px; top:{{pt.ly}}px; width:120px; text-align:center; font-size:11px; font-weight:700; line-height:1.25; color:${C.ink}; opacity:{{pt.lop}}; transition:left .6s, top .6s, opacity .3s; pointer-events:none;">{{pt.name}}<div style="color:${C.satText};">{{pt.sub}}</div></div></sc-for>
<div style="position:absolute; left:0; top:0; width:${W}px; padding:48px 16px 10px; box-sizing:border-box; background:linear-gradient(#FFFFFF 72%, rgba(255,255,255,0));">
<sc-if value="{{isMap}}" hint-placeholder-val="{{true}}"><div style="font-family:${F.disp}; font-weight:900; font-size:20px;">完全ワイヤレスイヤホン</div><div style="font-size:11px; color:${C.ink2}; margin-top:2px;">${STATS.total}商品のうち ${STATS.analysed}商品の声を読みました（のべ${STATS.read}件）</div></sc-if>
<sc-if value="{{isEgo}}" hint-placeholder-val="{{false}}"><div style="display:flex; align-items:center; gap:10px;"><button type="button" aria-label="地図に戻る" onClick="{{close}}" style="width:40px; height:40px; border-radius:50%; border:none; background:${C.bg2}; display:flex; align-items:center; justify-content:center; padding:0; color:${C.ink};">${icon('back', { size: 18 })}</button><div><div style="font-family:${F.disp}; font-weight:900; font-size:18px;">似ているもの</div><div style="font-size:11px; color:${C.muted};">{{egoTitle}}。近い＝声が似ている、向き＝満足が多い観点</div></div></div></sc-if>
</div>
<sc-if value="{{notAxes}}" hint-placeholder-val="{{true}}"><div style="position:absolute; left:16px; top:108px; width:358px; font-size:11px; line-height:1.5; color:${C.ink2};">{{lensNote}}</div></sc-if>
<sc-if value="{{isAxes}}" hint-placeholder-val="{{false}}"><div style="position:absolute; left:16px; top:108px; width:358px; font-size:11px; line-height:1.5; color:${C.ink2};">{{axesNote}}</div></sc-if>
<sc-if value="{{showDock}}" hint-placeholder-val="{{true}}"><div style="position:absolute; left:0; bottom:0; width:${W}px; padding:12px 0 30px 16px; box-sizing:border-box; background:#FFFFFF; border-top:1px solid ${C.line}; display:flex; flex-direction:column; gap:10px;">
<div style="display:flex; align-items:center; gap:10px;">${pill(`<button type="button" onClick="{{toMap}}" style="height:36px; padding:0 14px; border-radius:18px; border:none; background:{{mMap.bg}}; color:{{mMap.fg}}; font-family:${F.body}; font-size:13px; font-weight:700; white-space:nowrap;">地図</button><button type="button" onClick="{{toAxes}}" style="height:36px; padding:0 14px; border-radius:18px; border:none; background:{{mAxes.bg}}; color:{{mAxes.fg}}; font-family:${F.body}; font-size:13px; font-weight:700; white-space:nowrap;">並べる</button>`)}<span style="font-size:11px; color:${C.muted};">差がつかない：{{same}}</span></div>
<div style="display:flex; gap:8px; overflow-x:auto; padding-right:16px;"><sc-for list="{{lenses}}" as="l" hint-placeholder-count="6"><button type="button" onClick="{{l.pick}}" style="height:36px; padding:0 14px; border-radius:18px; border:{{l.bd}}; background:{{l.bg}}; color:{{l.fg}}; font-family:${F.body}; font-size:13px; font-weight:700; white-space:nowrap; flex-shrink:0;">{{l.t}}</button></sc-for></div>
</div></sc-if>
<sc-if value="{{showSheet}}" hint-placeholder-val="{{false}}"><div style="position:absolute; left:0; bottom:0; width:${W}px; height:300px; padding:12px 18px 0; box-sizing:border-box; background:#FFFFFF; border-radius:24px 24px 0 0; box-shadow:${SH.sheet};">
<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;"><div><div style="font-size:18px; font-weight:700;">{{selName}}</div><div style="font-size:12px; color:${C.ink2}; margin-top:3px;">{{selPrice}}・レビュー{{selRc}}件のうち{{selRead}}件を読みました</div></div><button type="button" aria-label="閉じる" onClick="{{close}}" style="width:40px; height:40px; border-radius:50%; border:none; background:${C.bg2}; display:flex; align-items:center; justify-content:center; padding:0; flex-shrink:0; color:${C.ink};">${icon('close', { size: 18 })}</button></div>
<div style="margin-top:14px; display:flex; justify-content:space-between; font-size:13px;"><b>{{bar.label}}</b><span style="font-size:11px; color:${C.muted};">読んだ{{selRead}}件のうち</span></div>
<div style="margin-top:6px; display:flex; align-items:center; height:14px;"><div style="width:176px; display:flex; justify-content:flex-end;"><div style="width:{{bar.nw}}px; height:12px; background:${C.neg}; border-radius:6px 0 0 6px; transition:width .4s;"></div></div><div style="width:2px; height:18px; background:${C.ink};"></div><div style="width:176px;"><div style="width:{{bar.pw}}px; height:12px; background:${C.sat}; border-radius:0 6px 6px 0; transition:width .4s;"></div></div></div>
<div style="margin-top:4px; display:flex; justify-content:space-between; font-size:12px; font-weight:700;"><span style="color:${C.negText};">不満 {{bar.neg}}</span><span style="color:${C.satText};">満足 {{bar.pos}}</span></div>
<div style="margin-top:10px; font-size:12px; color:${C.ink2};">ほかに不満が多い：{{bar.worst}}</div>
<div style="margin-top:14px; display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:8px;"><button type="button" onClick="{{toEgo}}" style="height:46px; border-radius:23px; border:none; background:${C.ink}; color:#FFFFFF; font-family:${F.body}; font-size:14px; font-weight:700;">似ているものを見る</button><button type="button" style="height:46px; border-radius:23px; border:1.5px solid ${C.ink}; background:#FFFFFF; color:${C.ink}; font-family:${F.body}; font-size:14px; font-weight:700;">くらべるに入れる</button></div>
</div></sc-if>
</div>`;
}

export function logic() {
  return `class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { mode: 'map', lens: null, sel: null };
  }
  renderVals() {
    var DATA = ${JSON.stringify(data())};
    ${VALS}
    var self = this;
    return V(this.state, function (patch) { self.setState(patch); });
  }
}`;
}

// 手元の確認：状態を与えて静的な HTML にする（{{}} と sc-* を展開）
export function renderStatic(markup, st) {
  const DATA = data();
  const V = new Function('DATA', `${VALS}; return V;`)(DATA);
  const vals = V({ mode: 'map', lens: null, sel: null, ...st }, () => {});
  const get = (o, path) => path.trim().split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  let s = markup;
  s = s.replace(/<sc-for list="\{\{(\w+)\}\}" as="(\w+)"[^>]*>([\s\S]*?)<\/sc-for>/g, (_, list, as, body) => (vals[list] || []).map((item) => body.replace(new RegExp(`\\{\\{${as}\\.([\\w.]+)\\}\\}`, 'g'), (m, p) => String(get(item, p) ?? ''))).join(''));
  for (let n = 0; n < 4; n++) s = s.replace(/<sc-if value="\{\{([\w.]+)\}\}"[^>]*>((?:(?!<sc-if)[\s\S])*?)<\/sc-if>/g, (_, p, body) => (get(vals, p) ? body : ''));
  s = s.replace(/ on[A-Z]\w+="\{\{[\w.]+\}\}"/g, '');
  const left = [];
  s = s.replace(/\{\{([\w. ]+)\}\}/g, (m, p) => { const v = get(vals, p); if (v === undefined) left.push(p); return String(v ?? ''); });
  return { html: s, left };
}

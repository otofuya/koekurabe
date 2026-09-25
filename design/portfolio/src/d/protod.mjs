// 統合案の触れる試作：ホーム → カテゴリ（はじめての説明 → 気になることを切り替える）→ 商品 → これに似たもの（押すと真ん中が入れ替わる）
// イヤホンの実データ。位置は build 時に、観点ごと・起点ごとに計算して埋め込む
import { C, F, SH, icon, objD, earArt, num, cchip, searchPill, mark, tabs, status, coverage } from './libd.mjs';
import { MAPPED, STATS, AXES, POLE, neighbors, byShort, yen, KEYS, UNITS, egoLayout, reasonOf, reasonText, reasonChip, shrink } from './datad.mjs';
import { QL } from './screensd.mjs';
import { swarm } from '../c/screensc.mjs';

const W = 390, H = 844, RW = 342, RH = 256, EW = 342, EH = 380;
const OFF = AXES.filter((a) => a.offerable).map((a) => a.key);
const ids = MAPPED.map((p) => p.s);
const sizeOf = (m) => Math.round(32 + 22 * Math.sqrt(Math.min(m, 50) / 50));

function data() {
  const ruler = {};
  for (const k of OFF) {
    const on = MAPPED.filter((p) => p.pos[k] + p.neg[k] > 0);
    const pts = swarm(on.map((p) => ({ id: p.s, score: shrink(p.pos[k], p.neg[k]), size: sizeOf(p.pos[k] + p.neg[k]) })), { w: RW, h: RH, pad: 22 });
    ruler[k] = Object.fromEntries(pts.map((q) => [q.id, { l: Math.round(q.x - q.size / 2), t: Math.round(q.y - q.size / 2), sz: q.size }]));
  }
  const ego = {};
  for (const a of ids) {
    if (neighbors(byShort[a], 5).length < 3) continue;
    const { pos } = egoLayout(a, { w: EW, h: EH });
    ego[a] = Object.fromEntries(Object.entries(pos).map(([s, p]) => [s, { l: Math.round(p.x - p.size / 2), t: Math.round(p.y - p.size / 2), sz: p.size, anchor: !!p.anchor, chip: p.anchor ? '' : reasonChip(p.r) }]));
  }
  const prod = Object.fromEntries(MAPPED.map((p) => {
    const rows = KEYS.filter((k) => p.pos[k] + p.neg[k] >= 1).sort((a, b) => p.neg[b] - p.neg[a] || p.pos[b] - p.pos[a]).slice(0, 3);
    const worst = KEYS.slice().sort((a, b) => p.neg[b] - p.neg[a])[0], best = KEYS.slice().sort((a, b) => p.pos[b] - p.pos[a])[0];
    const nb = neighbors(p, 5).slice(0, 2).map((n) => ({ name: n.p.name, text: reasonText(reasonOf(n)) }));
    return [p.s, { name: p.name, price: yen(p.price), rc: p.reviewCount, read: p.read, thin: p.read < 30,
      summary: (p.neg[worst] ? `不満がいちばん多いのは ${QL[worst]}（${p.neg[worst]}件）。` : '目立つ不満はまだ書かれていません。') + (p.pos[best] ? `満足がいちばん多いのは ${QL[best]}（${p.pos[best]}件）。` : ''),
      rows: rows.map((k) => ({ t: QL[k], neg: p.neg[k], pos: p.pos[k], nw: Math.max(p.neg[k] ? 3 : 0, Math.round((p.neg[k] / p.read) * 342)), pw: Math.max(p.pos[k] ? 3 : 0, Math.round((p.pos[k] / p.read) * 342)) })),
      k: Object.fromEntries(OFF.map((k) => [k, { neg: p.neg[k], pos: p.pos[k], nw: Math.max(p.neg[k] ? 3 : 0, Math.round((p.neg[k] / p.read) * 230)), pw: Math.max(p.pos[k] ? 3 : 0, Math.round((p.pos[k] / p.read) * 230)) }])),
      nb, hasEgo: false }];
  }));
  for (const a of Object.keys(ego)) prod[a].hasEgo = true;
  return { ruler, ego, prod, ids, off: OFF, ql: Object.fromEntries(OFF.map((k) => [k, QL[k]])), poles: Object.fromEntries(OFF.map((k) => [k, POLE[k]])), ink: C.ink, tile: C.tile };
}

const VALS = `function V(st, set) {
  var D = DATA, k = st.k, sel = st.sel, an = st.anchor;
  var R = D.ruler[k], E = D.ego[an] || {};
  var rn = {}, en = {};
  D.ids.forEach(function (s) {
    var r = R[s], e = E[s], on = s === sel;
    rn['p' + s] = r ? { l: r.l, t: r.t, sz: r.sz, op: 1, pe: 'auto', ring: on ? '0 0 0 3px #fff, 0 0 0 5px ' + D.ink : 'none', z: on ? 6 : 2, pick: function () { set({ sel: s }); } }
                    : { l: ${RW / 2 - 10}, t: ${RH / 2 - 10}, sz: 20, op: 0, pe: 'none', ring: 'none', z: 1, pick: function () {} };
    en['p' + s] = e ? { l: e.l, t: e.t, sz: e.sz, op: 1, pe: 'auto', ring: e.anchor ? '0 0 0 3px #fff, 0 0 0 5px ' + D.ink : 'none', chip: e.chip, chipOp: e.anchor ? 0 : 1, cl: Math.round(e.sz / 2 - 40), ct: e.sz + 4, pick: function () { if (!e.anchor && D.ego[s]) set({ anchor: s, sel: s }); } }
                    : { l: ${EW / 2 - 10}, t: ${EH / 2 - 10}, sz: 20, op: 0, pe: 'none', ring: 'none', chip: '', chipOp: 0, cl: 0, ct: 0, pick: function () {} };
  });
  var P = D.prod[sel], A = D.prod[an] || P, kk = P.k[k];
  var tabsQ = D.off.map(function (x) { return { t: D.ql[x], bg: x === k ? D.ink : D.tile, fg: x === k ? '#fff' : D.ink, fw: x === k ? 700 : 500, pick: function () { set({ k: x, sel: D.ruler[x][sel] ? sel : Object.keys(D.ruler[x])[0] }); } }; });
  return {
    isHome: st.screen === 'home', isCat: st.screen === 'cat', isProd: st.screen === 'product', isSim: st.screen === 'similar',
    showCoach: st.screen === 'cat' && st.coach,
    goCat: function () { set({ screen: 'cat' }); }, goHome: function () { set({ screen: 'home' }); },
    goProd: function () { set({ screen: 'product', anchor: sel }); }, backCat: function () { set({ screen: 'cat' }); },
    goSim: function () { if (D.ego[st.sel]) set({ screen: 'similar', anchor: st.sel }); },
    backProd: function () { set({ screen: 'product', sel: an }); },
    closeCoach: function () { set({ coach: false }); },
    rn: rn, en: en, tabsQ: tabsQ,
    lo: D.poles[k].neg, hi: D.poles[k].pos, qk: D.ql[k],
    sName: P.name, sRead: P.read, sNeg: kk.neg, sPos: kk.pos, sNw: kk.nw, sPw: kk.pw,
    pName: P.name, pPrice: P.price, pRc: P.rc, pRead: P.read, pSum: P.summary, pRows: P.rows, pHasEgo: P.hasEgo, pNoEgo: !P.hasEgo,
    aName: A.name, aNb: (D.prod[an] || P).nb
  };
}`;

export function protoScreen() {
  const d = data();
  const rNodes = ids.map((s) => { const k = `rn.p${s}`; const p = byShort[s]; return `<button type="button" aria-label="${p.name}" onClick="{{${k}.pick}}" style="position:absolute; left:{{${k}.l}}px; top:{{${k}.t}}px; width:{{${k}.sz}}px; height:{{${k}.sz}}px; padding:0; border:none; border-radius:50%; background:${C.tile}; opacity:{{${k}.op}}; pointer-events:{{${k}.pe}}; box-shadow:{{${k}.ring}}; z-index:{{${k}.z}};${p.read < 30 ? ` outline:1.2px dashed ${C.faint}; outline-offset:2px;` : ''} transition:left .55s cubic-bezier(.3,.7,.2,1), top .55s cubic-bezier(.3,.7,.2,1), width .55s, height .55s, opacity .35s; cursor:pointer;"><span style="position:absolute; inset:5%; display:flex; opacity:${p.read < 30 ? 0.7 : 1};">${earArt(s, 100).replace('width="100" height="100"', 'width="100%" height="100%"')}</span></button>`; }).join('');
  const eNodes = ids.map((s) => { const k = `en.p${s}`; const p = byShort[s]; return `<button type="button" aria-label="${p.name}" onClick="{{${k}.pick}}" style="position:absolute; left:{{${k}.l}}px; top:{{${k}.t}}px; width:{{${k}.sz}}px; height:{{${k}.sz}}px; padding:0; border:none; border-radius:50%; background:${C.tile}; opacity:{{${k}.op}}; pointer-events:{{${k}.pe}}; box-shadow:{{${k}.ring}};${p.read < 30 ? ` outline:1.2px dashed ${C.faint}; outline-offset:2px;` : ''} transition:left .6s cubic-bezier(.3,.7,.2,1), top .6s cubic-bezier(.3,.7,.2,1), width .6s, height .6s, opacity .35s; cursor:pointer;"><span style="position:absolute; inset:5%; display:flex;">${earArt(s, 100).replace('width="100" height="100"', 'width="100%" height="100%"')}</span><span style="position:absolute; left:{{${k}.cl}}px; top:{{${k}.ct}}px; width:80px; display:flex; justify-content:center; opacity:{{${k}.chipOp}}; transition:opacity .3s; pointer-events:none;"><span style="font-family:${F.jp}; font-size:11px; font-weight:700; color:${C.ink}; background:#fff; padding:2px 7px; border-radius:9px; box-shadow:${SH.soft}; white-space:nowrap;">{{${k}.chip}}</span></span></button>`; }).join('');
  const round = (fn, ic, lab) => `<button type="button" aria-label="${lab}" onClick="{{${fn}}}" style="width:40px; height:40px; border-radius:50%; border:none; background:${C.tile}; display:flex; align-items:center; justify-content:center; padding:0; color:${C.ink}; cursor:pointer; flex-shrink:0;">${icon(ic, { size: 18 })}</button>`;
  const tiles = UNITS.slice(0, 6).map((u) => { const inner = `<span style="display:flex; justify-content:center; height:78px; align-items:center; opacity:${u.state === 'real' ? 1 : 0.5};">${objD(u.obj, { size: 78 })}</span><span style="text-align:left;"><b style="display:block; font-size:14px; line-height:1.3;">${u.name}</b><span style="display:block; font-size:11px; color:${u.state === 'real' ? C.ink2 : C.muted}; margin-top:2px;">${u.state === 'real' ? `レビュー ${STATS.read}件・押せます` : u.state === 'sample' ? '見本で試し読み' : 'これから読みます'}</span></span>`; const st = `display:flex; flex-direction:column; justify-content:space-between; width:165px; height:148px; box-sizing:border-box; padding:12px 14px; border-radius:22px; background:${C.tile}; border:none; font-family:${F.jp}; color:${C.ink};`; return u.state === 'real' ? `<button type="button" onClick="{{goCat}}" style="${st} box-shadow:0 0 0 2px ${C.ink}; cursor:pointer;">${inner}</button>` : `<div style="${st}">${inner}</div>`; }).join('');
  return `<div style="position:relative; width:${W}px; height:${H}px; overflow:hidden; background:#fff; font-family:${F.jp}; color:${C.ink};">
${status()}
<sc-if value="{{isHome}}" hint-placeholder-val="{{true}}"><div style="position:absolute; inset:0;">
<div style="position:absolute; left:24px; top:56px;">${mark(17)}</div>
<div style="position:absolute; left:24px; top:104px; font-size:25px; font-weight:900; line-height:1.4;">買った人の声で、<br>自分に合うかを見る</div>
<div style="position:absolute; left:24px; top:192px;">${searchPill()}</div>
<div style="position:absolute; left:24px; top:258px; width:342px;"><b style="font-size:14px;">わたしの条件</b><div style="display:flex; gap:8px; margin-top:10px;">${cchip('足幅が広い', { on: true })}${cchip('敏感肌', { on: true })}</div></div>
<div style="position:absolute; left:24px; top:348px;"><b style="font-size:14px;">10のカテゴリ</b></div>
<div style="position:absolute; left:24px; top:378px; display:grid; grid-template-columns:repeat(2, 165px); gap:12px;">${tiles}</div>
</div></sc-if>
<sc-if value="{{isCat}}" hint-placeholder-val="{{false}}"><div style="position:absolute; inset:0;">
<div style="position:absolute; left:24px; top:50px; display:flex; align-items:center; gap:12px; width:342px;">${round('goHome', 'back', 'ホームへ')}<div style="font-size:17px; font-weight:900;">完全ワイヤレスイヤホン</div></div>
<div style="position:absolute; left:24px; top:100px; width:342px; display:flex; flex-direction:column; gap:6px;"><div style="font-size:12px; color:${C.ink2};">${STATS.total}商品のうち ${STATS.analysed}商品・レビュー ${STATS.read}件を読みました</div>${coverage(STATS.total, STATS.analysed, { cell: 5, gap: 2, cols: 49 })}</div>
<div style="position:absolute; left:24px; top:152px; width:366px;"><div style="font-size:15px; font-weight:900; margin-bottom:10px;">どこが気になりますか？</div><div style="display:flex; gap:8px; overflow:hidden;"><sc-for list="{{tabsQ}}" as="q" hint-placeholder-count="5"><button type="button" onClick="{{q.pick}}" style="height:36px; padding:0 15px; border-radius:18px; border:none; background:{{q.bg}}; color:{{q.fg}}; font-family:${F.jp}; font-size:13.5px; font-weight:{{q.fw}}; white-space:nowrap; flex-shrink:0; cursor:pointer; transition:background .25s;">{{q.t}}</button></sc-for></div></div>
<div style="position:absolute; left:24px; top:236px; width:${RW}px; height:${RH + 44}px; border-radius:24px; background:${C.map}; overflow:hidden;"><div style="position:absolute; left:16px; right:16px; top:${RH / 2}px; border-top:1.5px solid ${C.hair};"></div><div style="position:absolute; left:${RW / 2}px; top:14px; height:${RH - 28}px; border-left:1px dashed ${C.line};"></div><div style="position:absolute; left:0; top:0; width:${RW}px; height:${RH}px;">${rNodes}</div><div style="position:absolute; left:16px; right:16px; bottom:14px; display:flex; justify-content:space-between; font-size:12.5px; font-weight:700; white-space:nowrap;"><span style="display:flex; align-items:center; gap:6px; color:${C.negText};"><span style="width:10px; height:10px; border-radius:50%; background:${C.neg};"></span>{{lo}}</span><span style="display:flex; align-items:center; gap:6px; color:${C.posText};">{{hi}}<span style="width:10px; height:10px; border-radius:50%; background:${C.pos};"></span></span></div></div>
<button type="button" onClick="{{goProd}}" style="position:absolute; left:24px; top:548px; width:342px; box-sizing:border-box; padding:12px 14px; border-radius:20px; border:none; background:#fff; box-shadow:${SH.soft}; display:flex; flex-direction:column; gap:6px; text-align:left; font-family:${F.jp}; color:${C.ink}; cursor:pointer;"><div style="display:flex; justify-content:space-between; width:314px;"><b style="font-size:13px;">{{sName}}</b><span style="font-size:11px; color:${C.muted};">{{sRead}}件中・{{qk}}</span></div><div style="position:relative; width:314px; height:8px; border-radius:4px; background:${C.rest}; overflow:hidden;"><div style="position:absolute; left:0; top:0; height:8px; width:{{sNw}}px; background:${C.neg}; transition:width .4s;"></div><div style="position:absolute; right:0; top:0; height:8px; width:{{sPw}}px; background:${C.pos}; transition:width .4s;"></div></div><div style="display:flex; justify-content:space-between; width:314px; font-size:12px;"><span style="color:${C.negText};">不満 {{sNeg}}</span><span style="font-weight:700;">くわしく見る →</span><span style="color:${C.posText};">満足 {{sPos}}</span></div></button>
<div style="position:absolute; left:24px; top:648px; width:342px; font-size:11.5px; color:${C.muted}; line-height:1.6;">丸を押すと下に出ます。真ん中＝意見が割れている、または読めたレビューが少ない</div>
</div></sc-if>
<sc-if value="{{isProd}}" hint-placeholder-val="{{false}}"><div style="position:absolute; inset:0;">
<div style="position:absolute; left:24px; top:50px;">${round('backCat', 'back', 'カテゴリへ')}</div>
<div style="position:absolute; left:24px; top:100px; width:342px;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><span style="font-size:21px; font-weight:900;">{{pName}}</span><span style="font-family:${F.num}; font-size:17px;">{{pPrice}}</span></div><div style="font-size:12px; color:${C.ink2}; margin-top:4px;">楽天のレビュー {{pRc}}件のうち {{pRead}}件を読みました</div></div>
<div style="position:absolute; left:24px; top:164px; width:342px; box-sizing:border-box; padding:12px 14px; border-radius:18px; background:${C.tile}; font-size:13px; line-height:1.7;">{{pSum}}</div>
<div style="position:absolute; left:24px; top:262px; width:342px; display:flex; flex-direction:column; gap:14px;"><b style="font-size:15px;">買った人の声（不満の多い順）</b><sc-for list="{{pRows}}" as="r" hint-placeholder-count="3"><div style="display:flex; flex-direction:column; gap:6px;"><b style="font-size:13px;">{{r.t}}</b><div style="position:relative; width:342px; height:8px; border-radius:4px; background:${C.rest}; overflow:hidden;"><div style="position:absolute; left:0; top:0; height:8px; width:{{r.nw}}px; background:${C.neg};"></div><div style="position:absolute; right:0; top:0; height:8px; width:{{r.pw}}px; background:${C.pos};"></div></div><div style="display:flex; justify-content:space-between; font-size:12px;"><span style="color:${C.negText};">不満 {{r.neg}}</span><span style="color:${C.posText};">満足 {{r.pos}}</span></div></div></sc-for></div>
<sc-if value="{{pHasEgo}}" hint-placeholder-val="{{true}}"><button type="button" onClick="{{goSim}}" style="position:absolute; left:24px; top:560px; width:342px; height:56px; border-radius:28px; border:none; background:${C.ink}; color:#fff; font-family:${F.jp}; font-size:15px; font-weight:700; cursor:pointer;">これに似たものを見る</button></sc-if>
<sc-if value="{{pNoEgo}}" hint-placeholder-val="{{false}}"><div style="position:absolute; left:24px; top:560px; width:342px; font-size:12.5px; color:${C.muted};">読めたレビューが少なく、似ているものはまだ出せません</div></sc-if>
<div style="position:absolute; left:24px; top:630px; width:342px; height:48px; border-radius:24px; border:1.5px solid ${C.ink}; box-sizing:border-box; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700;">楽天で見る</div>
</div></sc-if>
<sc-if value="{{isSim}}" hint-placeholder-val="{{false}}"><div style="position:absolute; inset:0;">
<div style="position:absolute; left:24px; top:50px; display:flex; align-items:center; gap:12px; width:342px;">${round('backProd', 'back', '商品へ')}<div><div style="font-size:17px; font-weight:900;">これに似たもの</div><div style="font-size:11px; color:${C.muted};">真ん中：{{aName}}</div></div></div>
<div style="position:absolute; left:24px; top:104px; width:${EW}px; height:${EH}px; border-radius:26px; background:${C.map}; overflow:hidden;">${eNodes}</div>
<div style="position:absolute; left:24px; top:494px; width:342px; display:flex; justify-content:space-between; font-size:11.5px; color:${C.ink2};"><span>まわりを押すと、真ん中が入れ替わる</span><span>↑ 好評 ・ ↓ 不満寄り</span></div>
<div style="position:absolute; left:24px; top:526px; width:342px; display:flex; flex-direction:column; gap:8px;"><sc-for list="{{aNb}}" as="n" hint-placeholder-count="2"><div style="padding:10px 12px; border-radius:16px; background:#fff; box-shadow:${SH.soft};"><b style="font-size:12.5px;">{{n.name}}</b><div style="font-size:11.5px; color:${C.ink2}; line-height:1.5; margin-top:2px;">{{n.text}}</div></div></sc-for></div>
</div></sc-if>
<sc-if value="{{showCoach}}" hint-placeholder-val="{{false}}"><div style="position:absolute; inset:0; z-index:60;"><div style="position:absolute; inset:0; background:rgba(20,20,20,.55);"></div><div style="position:absolute; left:24px; top:236px; width:342px; height:300px; border-radius:24px; box-shadow:0 0 0 4px #fff;"></div><div style="position:absolute; left:24px; top:548px; width:342px; box-sizing:border-box; padding:16px 18px; border-radius:22px; background:#fff;"><div style="font-size:16px; font-weight:900;">はじめての方へ</div><div style="display:flex; flex-direction:column; gap:8px; margin-top:10px; font-size:13.5px; line-height:1.55;"><div style="display:flex; gap:8px;"><span style="width:10px; height:10px; border-radius:50%; background:${C.pos}; margin-top:6px; flex-shrink:0;"></span>右ほど「良かった」と書いた人が多い</div><div style="display:flex; gap:8px;"><span style="width:10px; height:10px; border-radius:50%; background:${C.neg}; margin-top:6px; flex-shrink:0;"></span>左ほど「不満」と書いた人が多い</div><div style="display:flex; gap:8px;"><span style="width:10px; height:10px; border-radius:50%; border:1.5px dashed ${C.faint}; box-sizing:border-box; margin-top:5px; flex-shrink:0;"></span>点線の丸は、読めたレビューがまだ少ない</div></div><button type="button" onClick="{{closeCoach}}" style="margin-top:14px; width:100%; height:44px; border-radius:22px; border:none; background:${C.ink}; color:#fff; font-family:${F.jp}; font-size:14px; font-weight:700; cursor:pointer;">わかった</button></div></div></sc-if>
${tabs(0)}
</div>`;
}

export function logic() {
  return `class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { screen: 'home', k: 'fit', sel: '821de2ea', anchor: '821de2ea', coach: true };
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
  const vals = V({ screen: 'home', k: 'fit', sel: '821de2ea', anchor: '821de2ea', coach: true, ...st }, () => {});
  const get = (o, path) => path.trim().split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  let s = markup;
  s = s.replace(/<sc-for list="\{\{([\w.]+)\}\}" as="(\w+)"[^>]*>([\s\S]*?)<\/sc-for>/g, (_, list, as, body) => (get(vals, list) || []).map((item) => body.replace(new RegExp(`\\{\\{${as}\\.([\\w.]+)\\}\\}`, 'g'), (m, p) => String(get(item, p) ?? ''))).join(''));
  for (let n = 0; n < 5; n++) s = s.replace(/<sc-if value="\{\{([\w.]+)\}\}"[^>]*>((?:(?!<sc-if)[\s\S])*?)<\/sc-if>/g, (_, p, body) => (get(vals, p) ? body : ''));
  s = s.replace(/ on[A-Z]\w+="\{\{[\w.]+\}\}"/g, '');
  const left = [];
  s = s.replace(/\{\{([\w. ]+)\}\}/g, (m, p) => { const v = get(vals, p); if (v === undefined) left.push(p); return String(v ?? ''); });
  return { html: s, left };
}

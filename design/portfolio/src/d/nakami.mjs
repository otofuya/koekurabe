// 新しい案「★の中身」：★の数では分からない「よかった・残念だった」を、数えて見せる
// イヤホンの実データ。★とレビュー数は楽天の商品の値、中身は AI がレビューを1件ずつ分類した件数をコードが数えたもの
// 触れる試作と実寸の画面は同じ部品から作る（画面は試作の状態を止めて書き出す）
import { readFileSync } from 'fs';
import { C, F, SH, icon, objD, earArt, num, small, tile, node, status, searchPill, mark, factTag, just } from './libd.mjs';
import { MAPPED, KEYS, yen, UNITS, QL, AXES, SKIN, FIELDS } from './datad.mjs';

const W = 390, H = 844;
const root = new URL('../../../../', import.meta.url);
const RAW = JSON.parse(readFileSync(new URL('data/genre-products.json', root), 'utf8')).products;
const ASP = JSON.parse(readFileSync(new URL('data/genre-aspects.json', root), 'utf8')).genres[0].products;
const raw = (s) => RAW.find((x) => x.productId.startsWith(s));
export const starOf = (s) => raw(s).reviewAverage;
export const rcOf = (s) => raw(s).reviewCount;
export const quotesOf = (s, k) => ASP.find((x) => x.productId.startsWith(s))?.aspects.find((a) => a.key === k)?.quotes || [];

// ---------- 判断（実装では lib/ の純粋関数にしてテストで固定する） ----------
export const WELL = MAPPED.filter((p) => p.read >= 30); // くわしく読めた商品（30件以上）
export const OFFER = AXES.filter((a) => a.offerable).map((a) => a.key); // 散らばりのゲートを通った観点だけ「何が気になる？」に出す
const M = 20;
const PRIOR = Object.fromEntries(KEYS.map((k) => [k, WELL.reduce((s, p) => s + p.neg[k], 0) / WELL.reduce((s, p) => s + p.read, 0)]));
export const sRate = (p, k) => (p.neg[k] + M * PRIOR[k]) / (p.read + M); // 並べる順だけに使う（件数の少ない商品を端に寄せない）。表示は N件中M件
export const talked = (p, k) => p.pos[k] + p.neg[k] >= 3; // ふれた声が3件未満は並べず「ふれていない」へ
export const topOf = (p, side, n = 3) => KEYS.filter((k) => p[side][k] > 0).sort((a, b) => p[side][b] - p[side][a]).slice(0, n);
export const FEWER = 2 / 3; // 乗り換え先は、並べる順の値が3分の1以上小さいものだけ（仮置き。検証で決める）
export const priceBand = (p) => [Math.round(p.price * 0.6), Math.round(p.price * 1.4)];
export function altsFor(p, k) {
  const [lo, hi] = priceBand(p);
  return WELL.filter((q) => q !== p && q.price >= lo && q.price <= hi && talked(q, k) && sRate(q, k) <= sRate(p, k) * FEWER).sort((a, b) => sRate(a, k) - sRate(b, k));
}
export function catOrder(k) {
  const on = WELL.filter((p) => talked(p, k)).sort((a, b) => sRate(a, k) - sRate(b, k));
  return { on, off: WELL.filter((p) => !talked(p, k)) };
}
export function compareOf(a, b) {
  const both = KEYS.filter((k) => talked(a, k) && talked(b, k));
  const rows = both.map((k) => ({ k, d: a.neg[k] / a.read - b.neg[k] / b.read })).sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
  return { diff: rows.filter((r) => Math.abs(r.d) >= 0.03).slice(0, 3), same: rows.filter((r) => Math.abs(r.d) < 0.03), only: KEYS.filter((k) => talked(a, k) !== talked(b, k)) };
}
// 見本のひとこと：今のデータの引用には「よかった・残念」の向きが無い。見本では人が読んで選んだ（両側にあるときだけ出す）
export const QPICK = {
  '821de2ea': { neg: ['fit', '私の右耳にフィットしないので、じっとしてても度々落とすことです。'], pos: ['sound', '音質は良いです。'] },
  '2a5f9d61': { neg: ['fit', '耳の穴にフィットしません。'], pos: ['sound', '音質はかなり良いと思います'] },
  e7e3a226: { neg: ['connection', '途中で片耳だけ途切れたりして不安定になることが頻回だと感じます。'], pos: ['sound', '音質も良いです。'] },
  e89650d6: { neg: ['connection', 'すぐ途切れる'], pos: ['value', '値段以上です。'] },
};
const urlOf = (s, k, t) => (quotesOf(s, k).find((q) => q.text.startsWith(t)) || quotesOf(s, k)[0] || {}).reviewUrl || '#';

// ---------- 部品 ----------
const svgUri = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))}`;
const img = (s, sz = 96) => svgUri(earArt(s, sz));
const starTxt = (s) => `★${starOf(s).toFixed(2)}（${rcOf(s)}件）`;
const short = (name) => name.replace(/^(soundcore|EarFun|Sony|Victor|NUARL|AUKEY) /, '');
const btnReset = `border:none; background:none; padding:0; font-family:${F.jp}; color:${C.ink}; text-align:left; cursor:pointer;`;
const roundBtn = (fn, ic, lab) => `<button type="button" aria-label="${lab}" onClick="{{${fn}}}" style="width:44px; height:44px; border-radius:50%; border:none; background:${C.tile}; display:flex; align-items:center; justify-content:center; padding:0; color:${C.ink}; cursor:pointer; flex-shrink:0;">${icon(ic, { size: 19 })}</button>`;
const dotC = (c, s = 10) => `<span style="width:${s}px; height:${s}px; border-radius:50%; background:${c}; flex-shrink:0;"></span>`;
export function tabsN(active = 0, { fn = ['goHomeTab', 'noop', 'goCmpTab'] } = {}) {
  const items = [['home', 'ホーム'], ['search', 'さがす'], ['pair', 'くらべる']];
  return `<nav aria-label="メイン" style="position:absolute; left:40px; right:40px; bottom:24px; height:64px; border-radius:32px; background:#fff; box-shadow:${SH.lift}; display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); padding:6px; box-sizing:border-box; z-index:30;">${items.map(([ic, t], i) => `<button type="button" onClick="{{${fn[i]}}}" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; border:none; border-radius:26px; background:${i === active ? C.tile : 'transparent'}; color:${C.ink}; font-family:${F.jp}; font-size:11px; font-weight:${i === active ? 700 : 500}; opacity:${i === active ? 1 : 0.72}; cursor:pointer;">${icon(ic, { size: 21 })}${t}</button>`).join('')}</nav>`;
}
// よかった／残念だった の列（同じ大きさで左右に）。rows は sc-for の名前
const colHead = (neg, readHole) => `<div style="display:flex; justify-content:space-between; align-items:center;"><span style="display:flex; align-items:center; gap:6px; font-size:14px; font-weight:900;">${dotC(neg ? C.neg : C.pos)}${neg ? '残念だった' : 'よかった'}</span><span style="font-size:11px; color:${C.muted};">${readHole}件中</span></div>`;
const colRows = (list, neg, { w = 141, pick = true } = {}) => `<sc-for list="{{${list}}}" as="r" hint-placeholder-count="3"><button type="button" ${pick ? 'onClick="{{r.pick}}" ' : ''}style="${btnReset} display:block; width:100%; padding:7px 0 6px;"><span style="display:flex; justify-content:space-between; align-items:baseline;"><span style="font-size:13.5px;">{{r.t}}</span><span style="font-family:${F.num}; font-size:18px; font-weight:600; color:${neg ? C.negText : C.posText};">{{r.n}}</span></span><span style="display:block; height:4px; border-radius:2px; background:${C.rest}; margin-top:4px; position:relative; overflow:hidden;"><span style="position:absolute; left:0; top:0; height:4px; width:{{r.bw}}px; background:${neg ? C.neg : C.pos};"></span></span></button></sc-for>`;

// ---------- 試作のデータ ----------
function pdata() {
  const prod = {};
  for (const p of WELL) {
    const row = (side, cw) => (k) => ({ t: QL[k], n: p[side][k], k, bw: Math.max(3, Math.round((p[side][k] / p.read) * cw)) });
    const q = QPICK[p.s];
    const worst = topOf(p, 'neg', 1)[0];
    prod[p.s] = {
      name: p.name, short: short(p.name), price: yen(p.price), star: starTxt(p.s), starN: starOf(p.s).toFixed(2), read: p.read,
      pos: topOf(p, 'pos').map(row('pos', 141)), neg: topOf(p, 'neg').map(row('neg', 141)),
      pos2: topOf(p, 'pos', 2).map(row('pos', 141)), neg2: topOf(p, 'neg', 2).map(row('neg', 141)),
      qNeg: q ? q.neg[1] : '', qNegK: q ? QL[q.neg[0]] : '', qNegU: q ? urlOf(p.s, q.neg[0], q.neg[1]) : '#', qPos: q ? q.pos[1] : '', qPosK: q ? QL[q.pos[0]] : '', qPosU: q ? urlOf(p.s, q.pos[0], q.pos[1]) : '#', hasQ: !!q,
      worst, worstT: QL[worst],
      others: KEYS.filter((k) => p.pos[k] + p.neg[k] > 0 && !topOf(p, 'pos').includes(k) && !topOf(p, 'neg').includes(k)).map((k) => ({ t: QL[k], k })),
      k: Object.fromEntries(KEYS.map((k) => {
        const alts = altsFor(p, k).slice(0, 3).map((a) => ({ s: a.s, name: a.name, star: `★${starOf(a.s).toFixed(2)}`, price: yen(a.price), n: a.neg[k], read: a.read, bw: Math.max(3, Math.round((a.neg[k] / a.read) * 60)) }));
        const [lo, hi] = priceBand(p);
        return [k, { t: QL[k], neg: p.neg[k], pos: p.pos[k], quotes: quotesOf(p.s, k).map((x) => ({ t: x.text, u: x.reviewUrl })), alts, band: `${yen(lo)}〜${yen(hi)}`, bw: Math.max(3, Math.round((p.neg[k] / p.read) * 90)) }];
      })),
    };
  }
  const cat = {};
  for (const k of OFFER) {
    const { on, off } = catOrder(k);
    const pos = {};
    on.forEach((p, i) => { pos[p.s] = { t: i * 86, op: 1 }; });
    const offTop = on.length * 86 + 34;
    off.forEach((p, i) => { pos[p.s] = { t: offTop + i * 86, op: 0.55 }; });
    cat[k] = { pos, offTop: offTop - 30, offOp: off.length ? 1 : 0, rows: Object.fromEntries(WELL.map((p) => [p.s, { neg: p.neg[k], pos: p.pos[k], bw: Math.max(p.neg[k] ? 3 : 0, Math.round((p.neg[k] / p.read) * 120)) }])) };
  }
  return { prod, cat, img: Object.fromEntries(WELL.map((p) => [p.s, img(p.s)])), ids: WELL.map((p) => p.s), offer: OFFER, ql: QL, ink: C.ink, tile: C.tile };
}

const VALS = `function V(st, set) {
  var D = DATA, withImg = function (s) { var o = {}, x = D.prod[s]; for (var key in x) o[key] = x[key]; o.img = D.img[s]; return o; };
  var P = withImg(st.sel), K = P.k[st.k], A = withImg(st.a), B = withImg(st.b);
  function go(patch) { var h = (st.hist || []).concat([{ screen: st.screen, sel: st.sel, k: st.k, a: st.a, b: st.b }]); patch.hist = h; set(patch); }
  function back() { var h = (st.hist || []).slice(); var last = h.pop() || { screen: 'home' }; last.hist = h; set(last); }
  var rowsOf = function (list) { return list.map(function (r) { return { t: r.t, n: r.n, bw: r.bw, pick: function () { go({ screen: 'aspect', k: r.k }); } }; }); };
  var cat = D.cat[st.ck] || D.cat.fit, cp = {};
  D.ids.forEach(function (s) { var pz = cat.pos[s], rw = cat.rows[s]; cp['p' + s] = { t: pz.t, op: pz.op, neg: rw.neg, pos: rw.pos, bw: rw.bw, pick: function () { go({ screen: 'product', sel: s }); } }; });
  var chips = D.offer.map(function (x) { return { t: D.ql[x], bg: x === st.ck ? D.ink : D.tile, fg: x === st.ck ? '#fff' : D.ink, fw: x === st.ck ? 700 : 500, pick: function () { set({ ck: x }); } }; });
  var alts = K.alts.map(function (x) { return { name: x.name, img: D.img[x.s], star: x.star, price: x.price, n: x.n, read: x.read, bw: x.bw, pick: function () { go({ screen: 'product', sel: x.s }); }, cmp: function () { go({ screen: 'compare', a: st.sel, b: x.s }); } }; });
  var C2 = D.cmp[st.a + '_' + st.b] || D.cmp[st.b + '_' + st.a] || { rows: [], same: '', lead: '' };
  return {
    isHome: st.screen === 'home', isProd: st.screen === 'product', isAsp: st.screen === 'aspect', isCat: st.screen === 'cat', isCmp: st.screen === 'compare',
    noop: function () {}, back: back,
    goHomeTab: function () { set({ screen: 'home', hist: [] }); }, goCmpTab: function () { go({ screen: 'compare' }); },
    goEx: function () { go({ screen: 'product', sel: '821de2ea' }); }, goCat: function () { go({ screen: 'cat' }); },
    goWorst: function () { go({ screen: 'aspect', k: P.worst }); },
    goCmpWith: function () { var x = (P.k[P.worst].alts[0] || {}).s || (st.sel === 'e7e3a226' ? '821de2ea' : 'e7e3a226'); go({ screen: 'compare', a: st.sel, b: x }); },
    p: P, pPos: rowsOf(P.pos), pNeg: rowsOf(P.neg),
    others: P.others.map(function (o) { return { t: o.t, pick: function () { go({ screen: 'aspect', k: o.k }); } }; }),
    kk: K, alts: alts, hasAlts: alts.length > 0, noAlts: alts.length === 0,
    chips: chips, cp: cp, ckT: D.ql[st.ck], offTop: cat.offTop, offOp: cat.offOp,
    A: A, B: B, cmp: C2
  };
}`;

function cmpData() {
  const out = {};
  for (const a of WELL) for (const b of WELL) {
    if (a === b) continue;
    const { diff, same } = compareOf(a, b);
    const hi = starOf(a.s) >= starOf(b.s) ? a : b, lo = hi === a ? b : a;
    const d0 = diff[0];
    let lead = '';
    if (d0) {
      const fewer = d0.d > 0 ? b : a, more = fewer === a ? b : a;
      lead = fewer === hi ? `★も「${QL[d0.k]}」の残念の少なさも、${hi.name} が上。` : `★は ${hi.name} が上（${starOf(hi.s).toFixed(2)}・${starOf(lo.s).toFixed(2)}）。でも「${QL[d0.k]}」の残念は ${fewer.name} が少ない（${fewer.read}件中${fewer.neg[d0.k]}件・${more.read}件中${more.neg[d0.k]}件）。`;
    }
    out[`${a.s}_${b.s}`] = {
      lead, same: same.map((r) => QL[r.k]).join('・'),
      rows: diff.map((r) => ({ t: QL[r.k], an: a.neg[r.k], ap: a.pos[r.k], ar: a.read, bn: b.neg[r.k], bp: b.pos[r.k], br: b.read,
        abw: Math.max(3, Math.round((a.neg[r.k] / a.read) * 130)), bbw: Math.max(3, Math.round((b.neg[r.k] / b.read) * 130)),
        aTag: r.d < 0 ? '少ない' : '', bTag: r.d > 0 ? '少ない' : '', aOp: r.d < 0 ? 1 : 0, bOp: r.d > 0 ? 1 : 0 })),
    };
  }
  return out;
}

// ---------- 試作の画面 ----------
export function protoN() {
  const D = pdata();
  const catCards = D.ids.map((s) => { const k = `cp.p${s}`; const p = D.prod[s]; return `<button type="button" onClick="{{${k}.pick}}" style="${btnReset} position:absolute; left:0; top:{{${k}.t}}px; opacity:{{${k}.op}}; width:342px; height:76px; box-sizing:border-box; padding:10px 12px; border-radius:20px; background:#fff; box-shadow:${SH.soft}; display:flex; gap:12px; align-items:center; transition:top .45s cubic-bezier(.3,.8,.3,1), opacity .3s;"><img src="${p.img}" width="52" height="52" alt="" style="border-radius:50%; background:${C.tile}; flex-shrink:0;"><span style="flex:1; min-width:0;"><span style="display:flex; justify-content:space-between; align-items:baseline; gap:6px;"><b style="font-size:13.5px; white-space:nowrap;">${p.name}</b><span style="font-family:${F.num}; font-size:13px;">${p.price}</span></span><span style="display:block; font-size:11.5px; color:${C.ink2}; margin-top:2px;">${p.star}</span><span style="display:flex; align-items:center; gap:8px; margin-top:5px;"><span style="font-size:12px; white-space:nowrap;"><span style="color:${C.negText};">残念 {{${k}.neg}}</span>・<span style="color:${C.posText};">よかった {{${k}.pos}}</span><span style="color:${C.muted};">（${p.read}件中）</span></span><span style="flex:1; height:4px; border-radius:2px; background:${C.rest}; position:relative; overflow:hidden;"><span style="position:absolute; left:0; top:0; height:4px; width:{{${k}.bw}}px; background:${C.neg};"></span></span></span></span></button>`; }).join('');
  const tiles = ['earbuds', 'lotion', 'run', 'coffee'].map((k) => UNITS.find((u) => u.key === k)).map((u, i) => `<button type="button" ${i === 0 ? 'onClick="{{goCat}}" ' : ''}style="${btnReset} display:flex; align-items:center; gap:10px; width:165px; height:64px; box-sizing:border-box; padding:6px 10px; border-radius:20px; background:${C.tile}; ${i ? 'opacity:.55;' : ''}">${objD(u.obj, { size: 46 })}<span><b style="display:block; font-size:13px;">${u.short}</b><span style="font-size:11px; color:${C.muted};">${u.state === 'real' ? '読めている' : '見本'}</span></span></button>`).join('');
  const quoteBox = (neg) => `<div style="margin-top:8px; padding-top:8px; border-top:1px solid ${C.hair};"><div style="font-size:11px; color:${C.muted};">{{p.q${neg ? 'Neg' : 'Pos'}K}}について</div><div style="font-size:11.5px; line-height:1.55; margin-top:2px;">「{{p.q${neg ? 'Neg' : 'Pos'}}}」</div><a href="{{p.q${neg ? 'Neg' : 'Pos'}U}}" target="_blank" style="font-size:11px; color:${C.muted};">出典</a></div>`;
  const column = (neg, rows) => `<div style="width:165px; box-sizing:border-box; padding:12px; border-radius:20px; background:#fff; box-shadow:${SH.soft};">${colHead(neg, '{{p.read}}')}${colRows(rows, neg)}<sc-if value="{{p.hasQ}}" hint-placeholder-val="{{true}}">${quoteBox(neg)}</sc-if></div>`;
  return `<div style="position:relative; width:${W}px; height:${H}px; overflow:hidden; background:#fff; font-family:${F.jp}; color:${C.ink};">
${status()}
<sc-if value="{{isHome}}" hint-placeholder-val="{{true}}"><div style="position:absolute; inset:0;">
<div style="position:absolute; left:24px; top:56px;">${mark(17)}</div>
<div style="position:absolute; left:24px; top:98px; font-size:27px; font-weight:900; line-height:1.4;">★の数では、<br>わからないこと。</div>
<div style="position:absolute; left:24px; top:184px; width:342px; font-size:13px; color:${C.ink2}; line-height:1.65;">買った人のレビューを読んで、<b style="color:${C.ink};">よかったこと・残念だったこと</b>を数えました</div>
<div style="position:absolute; left:24px; top:240px;">${searchPill('商品名、または楽天の商品ページの URL', { h: 52 })}</div>
<div style="position:absolute; left:24px; top:314px; font-size:12px; color:${C.muted}; font-weight:700;">たとえば</div>
<button type="button" onClick="{{goEx}}" style="${btnReset} position:absolute; left:24px; top:336px; width:342px; box-sizing:border-box; padding:14px; border-radius:24px; background:#fff; box-shadow:${SH.soft};">${exampleCard()}</button>
<div style="position:absolute; left:24px; top:566px; font-size:12px; color:${C.muted}; font-weight:700;">カテゴリから</div>
<div style="position:absolute; left:24px; top:588px; display:grid; grid-template-columns:repeat(2, 165px); gap:10px;">${tiles}</div>
</div></sc-if>
<sc-if value="{{isProd}}" hint-placeholder-val="{{false}}"><div style="position:absolute; inset:0;">
<div style="position:absolute; left:24px; top:50px; width:342px; display:flex; justify-content:space-between; align-items:center;">${roundBtn('back', 'back', '戻る')}<div style="display:flex; gap:8px;"><button type="button" onClick="{{goCmpWith}}" style="${btnReset} display:inline-flex; align-items:center; gap:4px; height:44px; padding:0 14px; border-radius:22px; border:1.5px solid ${C.ink}; box-sizing:border-box; font-size:12.5px; font-weight:700;">${icon('plus', { size: 13, sw: 2.4 })}くらべる</button><span style="display:inline-flex; align-items:center; gap:4px; height:44px; padding:0 14px; border-radius:22px; background:${C.tile}; font-size:12.5px; font-weight:700;">楽天で見る</span></div></div>
<div style="position:absolute; left:24px; top:106px; width:342px; display:flex; gap:14px; align-items:center;"><span style="width:92px; height:92px; border-radius:24px; background:${C.tile}; display:flex; align-items:center; justify-content:center; flex-shrink:0;"><img src="{{p.img}}" width="80" height="80" alt=""></span><div style="min-width:0;"><div style="font-size:19px; font-weight:900; line-height:1.3;">{{p.name}}</div><div style="display:flex; gap:10px; align-items:baseline; margin-top:6px;"><span style="font-family:${F.num}; font-size:17px; font-weight:600;">{{p.price}}</span><span style="font-size:13px; font-weight:700;">{{p.star}}</span></div></div></div>
<div style="position:absolute; left:24px; top:218px; width:342px; display:flex; justify-content:space-between; align-items:baseline;"><span style="font-size:18px; font-weight:900;">★{{p.starN}} の中身</span><span style="font-size:11.5px; color:${C.ink2};">{{p.read}}件を読んで数えました</span></div>
<div style="position:absolute; left:24px; top:254px; display:flex; gap:12px; align-items:stretch;">${column(false, 'pPos')}${column(true, 'pNeg')}</div>
<button type="button" onClick="{{goWorst}}" style="${btnReset} position:absolute; left:24px; top:562px; width:342px; height:52px; border-radius:26px; background:${C.ink}; color:#fff; display:flex; align-items:center; justify-content:center; gap:8px; font-size:14.5px; font-weight:700;">「{{p.worstT}}」の残念が少ないものを見る ${icon('arrow', { size: 16 })}</button>
<div style="position:absolute; left:24px; top:628px; width:366px;"><div style="font-size:12px; color:${C.muted}; font-weight:700; margin-bottom:8px;">ほかのことも見る</div><div style="display:flex; gap:6px; overflow:hidden;"><sc-for list="{{others}}" as="o" hint-placeholder-count="4"><button type="button" onClick="{{o.pick}}" style="${btnReset} height:36px; padding:0 14px; border-radius:18px; background:${C.tile}; font-size:12.5px; white-space:nowrap; flex-shrink:0;">{{o.t}}</button></sc-for></div></div>
<div style="position:absolute; left:24px; top:712px; width:342px; font-size:11px; color:${C.muted};">件数は AI がレビューを1件ずつ分類した数。★は楽天の値</div>
</div></sc-if>
<sc-if value="{{isAsp}}" hint-placeholder-val="{{false}}"><div style="position:absolute; inset:0;">
<div style="position:absolute; left:24px; top:50px; width:342px; display:flex; align-items:center; gap:12px;">${roundBtn('back', 'back', '戻る')}<div><div style="font-size:19px; font-weight:900;">{{kk.t}}</div><div style="font-size:11.5px; color:${C.muted};">{{p.name}}</div></div></div>
<div style="position:absolute; left:24px; top:110px; display:grid; grid-template-columns:165px 165px; gap:12px;">${[true, false].map((neg) => `<div style="padding:12px 14px; border-radius:20px; background:${C.tile};"><div style="display:flex; align-items:center; gap:6px; font-size:12.5px; font-weight:700;">${dotC(neg ? C.neg : C.pos)}${neg ? '残念だった' : 'よかった'}</div><div style="display:flex; align-items:baseline; gap:6px; margin-top:4px;"><span style="font-family:${F.num}; font-size:40px; font-weight:500; line-height:1.1; color:${neg ? C.negText : C.posText};">{{kk.${neg ? 'neg' : 'pos'}}}</span><span style="font-size:12px; color:${C.ink2};">{{p.read}}件中</span></div></div>`).join('')}</div>
<div style="position:absolute; left:24px; top:222px; width:342px;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><b style="font-size:14px;">ひとこと（原文から）</b><span style="font-size:11px; color:${C.muted};">よかった・残念の両方</span></div><div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;"><sc-for list="{{kk.quotes}}" as="q" hint-placeholder-count="3"><div style="padding:8px 12px; border-radius:14px; background:#fff; box-shadow:${SH.soft}; font-size:12.5px; line-height:1.55;">「{{q.t}}」 <a href="{{q.u}}" target="_blank" style="font-size:11px; color:${C.muted};">出典</a></div></sc-for></div></div>
<div style="position:absolute; left:24px; top:452px; width:342px;"><b style="font-size:14px;">「{{kk.t}}」の残念が少ないもの</b><div style="font-size:11.5px; color:${C.muted}; margin-top:2px;">同じくらいの値段（{{kk.band}}）から</div>
<sc-if value="{{hasAlts}}" hint-placeholder-val="{{true}}"><div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;"><sc-for list="{{alts}}" as="x" hint-placeholder-count="3"><div style="display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:18px; background:#fff; box-shadow:${SH.soft};"><button type="button" onClick="{{x.pick}}" style="${btnReset} flex:1; min-width:0; display:flex; align-items:center; gap:10px;"><img src="{{x.img}}" width="40" height="40" alt="" style="border-radius:50%; background:${C.tile}; flex-shrink:0;"><span style="min-width:0; flex:1;"><b style="display:block; font-size:13px; white-space:nowrap;">{{x.name}}</b><span style="display:block; font-size:11.5px; color:${C.ink2};">{{x.star}}・{{x.price}}</span><span style="display:flex; align-items:center; gap:6px; margin-top:3px; font-size:11.5px; white-space:nowrap;"><span><span style="color:${C.negText};">残念 </span><span style="color:${C.negText}; font-family:${F.num}; font-weight:600; font-size:14px;">{{x.n}}</span><span style="color:${C.muted};">／{{x.read}}件中</span></span><span style="width:60px; height:4px; border-radius:2px; background:${C.rest}; position:relative; overflow:hidden;"><span style="position:absolute; left:0; top:0; height:4px; width:{{x.bw}}px; background:${C.neg};"></span></span></span></span></button><button type="button" onClick="{{x.cmp}}" style="${btnReset} height:36px; padding:0 12px; border-radius:18px; border:1.5px solid ${C.ink}; font-size:12px; font-weight:700; white-space:nowrap; flex-shrink:0; box-sizing:border-box;">くらべる</button></div></sc-for></div></sc-if>
<sc-if value="{{noAlts}}" hint-placeholder-val="{{false}}"><div style="margin-top:10px; padding:12px 14px; border-radius:16px; background:${C.tile}; font-size:12.5px; color:${C.ink2}; line-height:1.6;">同じくらいの値段で、これより少ないものは見つかりませんでした（くわしく読めた${WELL.length}商品の中で）</div></sc-if></div>
</div></sc-if>
<sc-if value="{{isCat}}" hint-placeholder-val="{{false}}"><div style="position:absolute; inset:0;">
<div style="position:absolute; left:24px; top:50px; width:342px; display:flex; align-items:center; gap:12px;">${roundBtn('back', 'back', '戻る')}<div><div style="font-size:18px; font-weight:900;">ワイヤレスイヤホン</div><div style="font-size:11.5px; color:${C.muted};">97商品のうち、くわしく読めた${WELL.length}商品</div></div></div>
<div style="position:absolute; left:24px; top:110px; font-size:18px; font-weight:900;">何が気になる？</div>
<div style="position:absolute; left:24px; top:144px; width:366px; display:flex; gap:6px; overflow:hidden;"><sc-for list="{{chips}}" as="c" hint-placeholder-count="5"><button type="button" onClick="{{c.pick}}" style="${btnReset} height:40px; padding:0 16px; border-radius:20px; background:{{c.bg}}; color:{{c.fg}}; font-weight:{{c.fw}}; font-size:13.5px; white-space:nowrap; flex-shrink:0; transition:background .2s;">{{c.t}}</button></sc-for><span style="display:inline-flex; align-items:center; height:40px; padding:0 14px; border-radius:20px; border:1px dashed ${C.line}; color:${C.muted}; font-size:12.5px; white-space:nowrap; flex-shrink:0; box-sizing:border-box;">音質はどれも好評</span></div>
<div style="position:absolute; left:24px; top:196px; font-size:12px; color:${C.ink2};">「{{ckT}}」の残念が少ない順（順位ではありません）</div>
<div style="position:absolute; left:24px; top:224px; width:342px; height:532px; overflow:hidden;"><div style="position:relative; height:1000px;">${catCards}<div style="position:absolute; left:4px; top:{{offTop}}px; opacity:{{offOp}}; font-size:11.5px; color:${C.muted}; transition:top .45s;">「{{ckT}}」にふれた声が少ない（3件未満）</div></div></div>
</div></sc-if>
<sc-if value="{{isCmp}}" hint-placeholder-val="{{false}}"><div style="position:absolute; inset:0;">
<div style="position:absolute; left:24px; top:50px; width:342px; display:flex; align-items:center; gap:12px;">${roundBtn('back', 'back', '戻る')}<div style="font-size:19px; font-weight:900;">2つをくらべる</div></div>
<div style="position:absolute; left:24px; top:108px; display:grid; grid-template-columns:165px 165px; gap:12px;">${['A', 'B'].map((x) => `<div style="display:flex; flex-direction:column; align-items:center; gap:4px; text-align:center;"><span style="width:72px; height:72px; border-radius:50%; background:${C.tile}; display:flex; align-items:center; justify-content:center;"><img src="{{${x}.img}}" width="60" height="60" alt=""></span><b style="font-size:13.5px; line-height:1.3;">{{${x}.name}}</b><span style="font-size:12px;"><span style="font-family:${F.num}; font-weight:600;">{{${x}.price}}</span>・<b>★{{${x}.starN}}</b></span></div>`).join('')}</div>
<div style="position:absolute; left:24px; top:252px; width:342px; box-sizing:border-box; padding:12px 14px; border-radius:18px; background:${C.tile}; font-size:13px; line-height:1.65;">{{cmp.lead}}</div>
<div style="position:absolute; left:24px; top:346px; width:342px;"><div style="display:flex; justify-content:space-between;"><b style="font-size:14px;">ちがいが大きいこと</b><span style="font-size:11px; color:${C.muted};">「少ない」＝残念が少ないほう</span></div><sc-for list="{{cmp.rows}}" as="r" hint-placeholder-count="4"><div style="padding:9px 0; border-top:1px solid ${C.hair}; margin-top:6px;"><b style="font-size:13px;">{{r.t}}</b><div style="display:grid; grid-template-columns:165px 165px; gap:12px; margin-top:4px;">${['a', 'b'].map((x) => `<div><div style="display:flex; align-items:baseline; gap:4px; font-size:12px;"><span style="font-size:11.5px; color:${C.negText};">残念</span><span style="font-family:${F.num}; font-size:16px; font-weight:600; color:${C.negText};">{{r.${x}n}}</span><span style="color:${C.muted};">／{{r.${x}r}}件中</span><span style="margin-left:auto; opacity:{{r.${x}Op}}; font-size:11px; font-weight:700; padding:1px 7px; border-radius:9px; background:${C.ink}; color:#fff;">{{r.${x}Tag}}</span></div><div style="height:4px; border-radius:2px; background:${C.rest}; margin-top:4px; position:relative; overflow:hidden;"><div style="position:absolute; left:0; top:0; height:4px; width:{{r.${x}bw}}px; background:${C.neg};"></div></div><div style="font-size:11.5px; color:${C.posText}; margin-top:3px;">よかった {{r.${x}p}}</div></div>`).join('')}</div></div></sc-for><div style="font-size:12px; color:${C.ink2}; margin-top:10px;">同じくらい：{{cmp.same}}</div></div>
</div></sc-if>
${tabsN(0)}
</div>`;
}
// ホームの「たとえば」：本物の商品（Sony）の中身を小さく
function exampleCard() {
  const p = WELL.find((x) => x.s === '821de2ea');
  const mini = (side) => { const neg = side === 'neg'; return `<div><div style="display:flex; align-items:center; gap:6px; font-size:12.5px; font-weight:900;">${dotC(neg ? C.neg : C.pos, 9)}${neg ? '残念だった' : 'よかった'}</div>${topOf(p, side, 2).map((k) => `<div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:6px; font-size:13px;"><span>${QL[k]}</span><span style="font-family:${F.num}; font-size:16px; font-weight:600; color:${neg ? C.negText : C.posText};">${p[side][k]}</span></div>`).join('')}</div>`; };
  return `<span style="display:flex; gap:12px; align-items:center;"><img src="${img(p.s)}" width="52" height="52" alt="" style="border-radius:50%; background:${C.tile};"><span><b style="display:block; font-size:14.5px;">${p.name}</b><span style="font-size:12px; color:${C.ink2};">${starTxt(p.s)}・${p.read}件を読んだ</span></span></span><span style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:12px; padding-top:10px; border-top:1px solid ${C.hair};">${mini('pos')}${mini('neg')}</span><span style="display:flex; justify-content:flex-end; align-items:center; gap:4px; margin-top:10px; font-size:12px; font-weight:700;">中身を見る ${icon('arrow', { size: 14 })}</span>`;
}

const INIT = { screen: 'home', sel: '821de2ea', k: 'fit', ck: 'fit', a: '821de2ea', b: 'e7e3a226', hist: [] };
function allData() { return { ...pdata(), cmp: cmpData() }; }
export function logicN() {
  return `class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = ${JSON.stringify(INIT)};
  }
  renderVals() {
    var DATA = ${JSON.stringify(allData())};
    ${VALS}
    var self = this;
    return V(this.state, function (patch) { self.setState(patch); });
  }
}`;
}
// 状態を止めて、ふつうの HTML にする（実寸の画面・手元の確認用）
export function renderN(st) {
  const DATA = allData();
  const V = new Function('DATA', `${VALS}; return V;`)(DATA);
  const vals = V({ ...INIT, ...st }, () => {});
  const get = (o, path) => path.trim().split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  let s = protoN().replace(/ on[A-Z]\w+="\{\{[\w.]+\}\}"/g, '');
  s = s.replace(/<sc-for list="\{\{([\w.]+)\}\}" as="(\w+)"[^>]*>([\s\S]*?)<\/sc-for>/g, (_, list, as, body) => (get(vals, list) || []).map((item) => body.replace(new RegExp(`\\{\\{${as}\\.([\\w.]+)\\}\\}`, 'g'), (m, p) => String(get(item, p) ?? ''))).join(''));
  for (let n = 0; n < 5; n++) s = s.replace(/<sc-if value="\{\{([\w.]+)\}\}"[^>]*>((?:(?!<sc-if)[\s\S])*?)<\/sc-if>/g, (_, p, body) => (get(vals, p) ? body : ''));
  const left = [];
  s = s.replace(/\{\{([\w. ]+)\}\}/g, (m, p) => { const v = get(vals, p); if (v === undefined) left.push(p); return String(v ?? ''); });
  if (left.length) throw new Error(`埋まらない値: ${[...new Set(left)].slice(0, 6).join(', ')}`);
  return s;
}

// ---------- 見本：化粧水（本人が選んだ欄と、好みの向き） ----------
export function nLotion() {
  const s = SKIN.find((x) => x.id === 'lmt-uruoi'), f = FIELDS['lmt-uruoi'];
  const blk = (neg, t, n) => `<div style="width:165px; box-sizing:border-box; padding:12px; border-radius:20px; background:#fff; box-shadow:${SH.soft};"><div style="display:flex; justify-content:space-between; align-items:center;"><span style="display:flex; align-items:center; gap:6px; font-size:14px; font-weight:900;">${dotC(neg ? C.neg : C.pos)}${neg ? '残念だった' : 'よかった'}</span><span style="font-size:11px; color:${C.muted};">${s.read}件中</span></div><div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:10px;"><span style="font-size:13.5px;">${t}</span><span style="font-family:${F.num}; font-size:18px; font-weight:600; color:${neg ? C.negText : C.posText};">${n}</span></div></div>`;
  return `<div style="position:relative; width:${W}px; height:${H}px; overflow:hidden; background:#fff; font-family:${F.jp}; color:${C.ink};">${status()}
<div style="position:absolute; left:24px; top:50px; width:342px; display:flex; justify-content:space-between; align-items:center;"><span style="width:44px; height:44px; border-radius:50%; background:${C.tile}; display:flex; align-items:center; justify-content:center;">${icon('back', { size: 19 })}</span><span style="display:inline-flex; align-items:center; gap:5px; height:28px; padding:0 10px; border-radius:14px; background:${C.tile}; font-size:11.5px; color:${C.ink2};">${icon('flask', { size: 12, sw: 2 })}見本（30件・単語の規則）</span></div>
<div style="position:absolute; left:24px; top:106px; width:342px; display:flex; gap:14px; align-items:center;"><span style="width:92px; height:92px; border-radius:24px; background:${C.tile}; display:flex; align-items:center; justify-content:center;">${objD('bottle', { size: 78 })}</span><div><div style="font-size:19px; font-weight:900;">${s.name}</div><div style="font-size:12.5px; color:${C.ink2}; margin-top:4px;">化粧水・${s.read}件を読んだ</div></div></div>
<div style="position:absolute; left:24px; top:218px; font-size:18px; font-weight:900;">中身</div>
<div style="position:absolute; left:24px; top:254px; display:flex; gap:12px;">${blk(false, 'しみない', s.irr[0])}${blk(true, 'しみた', s.irr[1])}</div>
<div style="position:absolute; left:24px; top:360px; width:342px; box-sizing:border-box; padding:14px; border-radius:20px; background:#fff; box-shadow:${SH.soft};"><div style="display:flex; justify-content:space-between; align-items:center;"><b style="font-size:14px;">使い心地は？（好みの向き）</b><span style="font-size:11px; color:${C.muted};">よい・わるいではない</span></div><div style="margin-top:10px;">${just({ counts: s.dir, labels: ['さっぱり', 'しっとり'], w: 314, h: 8 })}</div></div>
<div style="position:absolute; left:24px; top:482px; width:342px; box-sizing:border-box; padding:14px; border-radius:20px; background:#fff; box-shadow:${SH.soft};"><div style="display:flex; justify-content:space-between; align-items:center;"><b style="font-size:14px;">また買った</b>${factTag('本人が選んだ欄')}</div><div style="display:flex; align-items:baseline; gap:8px; margin-top:6px;"><span style="font-family:${F.num}; font-size:40px; font-weight:500; line-height:1.1;">${f.rep}</span><span style="font-size:13px; color:${C.ink2};">件（使い道の欄に答えた ${f.attr}件中）</span></div><div style="font-size:11.5px; color:${C.muted}; margin-top:4px;">「リピート」がこの商品か、このお店かは確かめ中</div></div>
<div style="position:absolute; left:24px; top:620px; width:342px; font-size:12px; color:${C.ink2}; line-height:1.65;">同じ形のまま、化粧水では「好みの向き」と「また買った」が加わる。赤と青は、よい・わるいにだけ使う</div>
${tabsN(0).replace(/ onClick="\{\{\w+\}\}"/g, '')}</div>`;
}

// ---------- PC：商品 ----------
export function npProduct() {
  const p = WELL.find((x) => x.s === '821de2ea'), k = 'fit';
  const all = (side) => KEYS.filter((x) => p[side][x] > 0).sort((a, b) => p[side][b] - p[side][a]);
  const colL = (side) => { const neg = side === 'neg'; return `<div style="flex:1; padding:18px 20px; border-radius:24px; background:#fff; box-shadow:${SH.soft};"><div style="display:flex; justify-content:space-between; align-items:center;"><span style="display:flex; align-items:center; gap:8px; font-size:16px; font-weight:900;">${dotC(neg ? C.neg : C.pos, 11)}${neg ? '残念だった' : 'よかった'}</span><span style="font-size:12px; color:${C.muted};">${p.read}件中</span></div>${all(side).slice(0, 7).map((x) => `<div style="padding:8px 0; border-top:1px solid ${C.hair}; margin-top:6px;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><span style="font-size:14.5px; ${x === k ? 'font-weight:700;' : ''}">${QL[x]}</span><span style="font-family:${F.num}; font-size:20px; font-weight:600; color:${neg ? C.negText : C.posText};">${p[side][x]}</span></div><div style="height:5px; border-radius:3px; background:${C.rest}; margin-top:5px; position:relative; overflow:hidden;"><div style="position:absolute; left:0; top:0; height:5px; width:${Math.max(3, Math.round((p[side][x] / p.read) * 300))}px; background:${neg ? C.neg : C.pos};"></div></div></div>`).join('')}</div>`; };
  const alts = altsFor(p, k).slice(0, 3);
  return `<div style="position:relative; width:1440px; height:900px; overflow:hidden; background:#fff; font-family:${F.jp}; color:${C.ink};">
<div style="position:absolute; left:0; top:0; width:1440px; height:72px; box-sizing:border-box; padding:0 48px; display:flex; align-items:center; gap:28px; border-bottom:1px solid ${C.hair};">${mark(18)}${searchPill('商品名、または楽天の商品ページの URL', { w: 520, h: 44 })}<span style="flex:1;"></span><span style="display:inline-flex; align-items:center; gap:6px; font-size:13.5px; font-weight:700;">${icon('pair', { size: 18 })}くらべる</span></div>
<div style="position:absolute; left:48px; top:104px; width:300px;"><span style="width:300px; height:300px; border-radius:36px; background:${C.tile}; display:flex; align-items:center; justify-content:center;">${earArt(p.s, 230)}</span><div style="font-size:26px; font-weight:900; margin-top:20px;">${p.name}</div><div style="display:flex; gap:14px; align-items:baseline; margin-top:8px;"><span style="font-family:${F.num}; font-size:24px; font-weight:600;">${yen(p.price)}</span><span style="font-size:16px; font-weight:700;">${starTxt(p.s)}</span></div><div style="display:flex; gap:10px; margin-top:18px;"><span style="display:inline-flex; align-items:center; height:48px; padding:0 22px; border-radius:24px; background:${C.ink}; color:#fff; font-size:15px; font-weight:700;">楽天で見る</span><span style="display:inline-flex; align-items:center; gap:6px; height:48px; padding:0 20px; border-radius:24px; border:1.5px solid ${C.ink}; box-sizing:border-box; font-size:14px; font-weight:700;">${icon('plus', { size: 15, sw: 2.4 })}くらべる</span></div></div>
<div style="position:absolute; left:400px; top:104px; width:620px;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><span style="font-size:26px; font-weight:900;">★${starOf(p.s).toFixed(2)} の中身</span><span style="font-size:13px; color:${C.ink2};">${p.read}件を読んで数えました</span></div><div style="display:flex; gap:16px; margin-top:16px;">${colL('pos')}${colL('neg')}</div><div style="font-size:12px; color:${C.muted}; margin-top:12px;">件数は AI がレビューを1件ずつ分類した数。★とレビュー数は楽天の値</div></div>
<div style="position:absolute; left:1068px; top:104px; width:324px;"><div style="padding:20px; border-radius:24px; background:${C.tile};"><div style="font-size:12.5px; color:${C.ink2};">いちばん多い残念</div><div style="font-size:22px; font-weight:900; margin-top:2px;">${QL[k]}</div><div style="display:flex; align-items:baseline; gap:6px; margin-top:6px;"><span style="font-family:${F.num}; font-size:34px; font-weight:500; color:${C.negText};">${p.neg[k]}</span><span style="font-size:13px; color:${C.ink2};">／${p.read}件中（よかった ${p.pos[k]}）</span></div>${quotesOf(p.s, k).map((q) => `<div style="margin-top:8px; padding:8px 12px; border-radius:14px; background:#fff; font-size:12.5px; line-height:1.55;">「${q.text}」 <span style="font-size:11px; color:${C.muted}; text-decoration:underline;">出典</span></div>`).join('')}</div>
<div style="margin-top:22px;"><b style="font-size:15px;">「${QL[k]}」の残念が少ないもの</b><div style="font-size:12px; color:${C.muted}; margin-top:2px;">同じくらいの値段・30件以上読めた商品から</div>${alts.map((a) => `<div style="display:flex; align-items:center; gap:10px; padding:10px 0; border-top:1px solid ${C.hair}; margin-top:8px;">${node(earArt(a.s, 36), { size: 44 })}<div style="flex:1;"><b style="font-size:13.5px;">${a.name}</b><div style="font-size:12px; color:${C.ink2};">★${starOf(a.s).toFixed(2)}・${yen(a.price)}</div></div><div style="font-size:12.5px; text-align:right;"><span style="font-family:${F.num}; font-size:17px; font-weight:600; color:${C.negText};">${a.neg[k]}</span><span style="color:${C.muted};">／${a.read}件中</span></div></div>`).join('')}</div></div>
</div>`;
}

export const PROTO_STATES = [['NS01-Home', 'N01 ホーム：★の数では、わからないこと', {}], ['NS02-Product', 'N02 商品：★の中身', { screen: 'product' }], ['NS03-Aspect', 'N03 気になる残念を押すと', { screen: 'aspect' }], ['NS04-Category', 'N04 カテゴリ：何が気になる？', { screen: 'cat' }], ['NS05-Compare', 'N05 2つをくらべる', { screen: 'compare' }]];
export const PHONE_N = [...PROTO_STATES.map(([f, t, st]) => [f, t, () => renderN(st)]), ['NS06-Lotion', 'N06 見本：化粧水でも同じ形', nLotion]];
export const PC_N = [['NP01-Product', 'PC 商品：★の中身', npProduct]];

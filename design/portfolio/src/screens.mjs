// 実寸の画面（スマホ 390×844、PC 1440×900）。数字は data.mjs の実データ
import { C, F, SH, icon, num, tag, aiMark, btn, iconBtn, chip, productDot, voiceBar, quotePair, wordmark, esc } from './lib.mjs';
import { mapView, axesView, dotSize, ringFor, legend, relax } from './map.mjs';
import { P, MAPPED, OFFMAP, HIDDEN_COUNT, STATS, AXES, SHORT, LABEL, POLE, KEYS, byShort, Q, yen, maxCount, verdictOf, neighbors, score, SAME, quad } from './data.mjs';

const W = 390, H = 844;
const scr = (inner, { bg = C.bg } = {}) => `<div style="position:relative; width:${W}px; height:${H}px; overflow:hidden; background:${bg}; font-family:${F.body}; color:${C.ink};">${inner}</div>`;
const at = (x, y, html, { w = 0, z = 2, st = '' } = {}) => `<div style="position:absolute; left:${x}px; top:${y}px;${w ? ` width:${w}px;` : ''} z-index:${z};${st ? ` ${st}` : ''}">${html}</div>`;

const WFC = byShort['821de2ea'];
const LIB = byShort['637e1dd6'];
const LINK = byShort['0858ede7'];
const EAR = byShort.d5f259d1;
const offerable = AXES.filter((a) => a.offerable);
const unmapped = STATS.total - MAPPED.length - HIDDEN_COUNT; // 色違いで手でまとめた出品を除く

// ---------- 共通 ----------
export function tabBar(active = 0) {
  const items = [['map', '地図'], ['search', '探す'], ['pair', 'くらべる'], ['save', '保存']];
  return `<nav aria-label="メイン" style="position:absolute; left:0; right:0; bottom:0; height:82px; background:${C.bg}; border-top:1px solid ${C.line}; display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); padding:6px 8px 24px; box-sizing:border-box; z-index:20;">${items.map(([ic, t], i) => `<a href="#" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; text-decoration:none; color:${i === active ? C.ink : C.muted}; font-size:11px; font-weight:700;">${icon(ic, { size: 22, sw: i === active ? 2.2 : 1.8 })}${t}${i === 2 ? '' : ''}</a>`).join('')}</nav>`;
}
const searchPill = (t = '悩みや商品名で探す', { w = 358, h = 48 } = {}) => `<label style="display:flex; align-items:center; gap:10px; width:${w}px; height:${h}px; padding:0 16px; border-radius:${h / 2}px; background:${C.bg}; box-shadow:${SH.card}; box-sizing:border-box; color:${C.muted}; font-size:14px;">${icon('search', { size: 19 })}<input type="text" placeholder="${t}" aria-label="探す" style="border:none; outline:none; background:transparent; font-family:${F.body}; font-size:14px; color:${C.ink}; width:100%;"></label>`;
const coverageLine = (fs = 12) => `<span style="font-size:${fs}px; color:${C.ink2};">${num(STATS.total, { size: fs + 1 })}商品のうち ${num(STATS.analysed, { size: fs + 1 })}商品の声を読みました（のべ${num(STATS.read, { size: fs + 1 })}件）</span>`;
export const lensChips = (on = null, { extra = true } = {}) => `<div style="display:flex; gap:8px; overflow:hidden;">${chip('すべて', { on: on === null })}${offerable.map((a) => chip(SHORT[a.key], { on: on === a.key })).join('')}</div>`;
const sheet = (inner, { top = 420, pad = 18 } = {}) => `<div style="position:absolute; left:0; right:0; top:${top}px; bottom:0; background:${C.bg}; border-radius:24px 24px 0 0; box-shadow:${SH.sheet}; padding:10px ${pad}px 0; box-sizing:border-box; z-index:10;"><div style="width:40px; height:5px; border-radius:3px; background:${C.line2}; margin:0 auto 12px;"></div>${inner}</div>`;
const ptag = (p) => `${num(yen(p.price), { size: 13 })}<span style="font-size:11px; color:${C.muted};">（${STATS.generatedAt.slice(5).replace('-', '/')}時点）</span>`;

// ==========================================================================
// P01 ホーム：地図帳
// ==========================================================================
const WORRIES = [
  ['耳が痛くならない', 'fit', 'neg'], ['静かになる', 'anc', 'pos'], ['操作に迷わない', 'controls', 'neg'], ['値段に納得', 'value', 'pos'], ['周りの音が聞こえる', 'ambient', 'pos'],
];
export function pHome() {
  let s = '';
  s += at(16, 54, `<div style="width:358px; display:flex; justify-content:space-between; align-items:center;">${wordmark(19)}${iconBtn('bell', 'お知らせ', { size: 40, shadow: 'none', bg: C.bg2 })}</div>`);
  s += at(16, 108, `<div style="width:358px;"><div style="font-family:${F.disp}; font-weight:900; font-size:27px; line-height:1.3;">買った人の声で描いた、<br>商品の地図。</div><div style="font-size:13px; color:${C.ink2}; margin-top:8px; line-height:1.6;">似ている・違うが、ひと目で分かる。不満が先に見える。</div></div>`);
  s += at(16, 226, searchPill('悩みや商品名で探す（例：耳が痛くならない）'));
  // 今の地図（小さく）
  const mw = 358, mh = 214;
  s += at(16, 292, `<a href="#" style="display:block; position:relative; width:${mw}px; height:${mh + 58}px; border-radius:20px; overflow:hidden; box-shadow:${SH.card}; text-decoration:none; color:${C.ink};"><div style="position:relative; width:${mw}px; height:${mh}px;">${mapView({ w: mw, h: mh, labels: 'none', min: 14, max: 30 })}</div><div style="height:58px; padding:0 14px; display:flex; align-items:center; justify-content:space-between; background:${C.bg};"><div><div style="font-size:15px; font-weight:700;">完全ワイヤレスイヤホン</div><div style="font-size:11px; color:${C.muted}; margin-top:2px;">${STATS.analysed}商品の声・のべ${STATS.read}件</div></div>${icon('arrow', { size: 22 })}</div></a>`);
  s += at(16, 586, `<div style="width:358px; display:flex; flex-direction:column; gap:10px;"><div style="font-size:14px; font-weight:700;">悩みから探す</div><div style="display:flex; flex-wrap:wrap; gap:8px;">${WORRIES.map(([t, , side]) => chip(t, { dot: side === 'neg' ? C.neg : C.sat })).join('')}</div></div>`);
  s += at(16, 700, `<div style="width:358px; display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-radius:14px; background:${C.bg2}; box-sizing:border-box;"><span style="font-size:13px; font-weight:700;">ほかの棚（準備中）</span><span style="font-size:12px; color:${C.muted};">声が集まったジャンルから公開</span></div>`);
  s += tabBar(0);
  return scr(s);
}

// ==========================================================================
// P02 言葉で探す
// ==========================================================================
export function pSearch() {
  const low = P.filter((p) => p.pos.fit + p.neg.fit >= 8).map((p) => ({ p, share: p.neg.fit / (p.pos.fit + p.neg.fit) })).sort((a, b) => a.share - b.share).slice(0, 3);
  let s = '';
  s += at(16, 54, `<div style="width:358px; display:flex; gap:10px; align-items:center;">${iconBtn('back', '戻る', { size: 40, shadow: 'none', bg: C.bg2 })}<label style="flex:1; display:flex; align-items:center; gap:8px; height:44px; padding:0 14px; border-radius:22px; border:2px solid ${C.ink}; box-sizing:border-box;">${icon('search', { size: 18 })}<input type="text" value="耳が痛く" aria-label="探す" style="border:none; outline:none; background:transparent; font-family:${F.body}; font-size:15px; color:${C.ink}; width:100%;"></label></div>`);
  s += at(16, 118, `<div style="width:358px; box-sizing:border-box; padding:14px; border-radius:16px; background:${C.negSoft}; display:flex; flex-direction:column; gap:6px;"><div style="font-size:12px; color:${C.negText}; font-weight:700;">この言葉の数え方</div><div style="font-size:14px; line-height:1.6;">「耳が痛い」は、<b>装着感</b>の<b style="color:${C.negText};">不満</b>として数えています</div></div>`);
  s += at(16, 222, `<div style="width:358px; display:flex; flex-direction:column; gap:10px;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><span style="font-size:14px; font-weight:700;">装着感の不満が少ない</span><span style="font-size:11px; color:${C.muted};">装着感に8件以上ふれた商品</span></div>
${low.map(({ p }) => `<a href="#" style="display:flex; gap:12px; align-items:center; padding:12px; border-radius:16px; box-shadow:${SH.card}; text-decoration:none; color:${C.ink};">${productDot({ size: 46, pos: p.pos.fit, neg: p.neg.fit, thick: p.thick })}<div style="flex:1; min-width:0;"><div style="font-size:14px; font-weight:700;">${esc(p.name)}</div><div style="font-size:12px; color:${C.ink2}; margin-top:3px;">装着感 不満 ${num(p.neg.fit, { size: 12, color: C.negText })}・満足 ${num(p.pos.fit, { size: 12, color: C.satText })}<span style="color:${C.muted};">（読んだ${p.read}件）</span></div></div>${icon('arrow', { size: 18, color: C.muted })}</a>`).join('')}
</div>`);
  s += at(16, 560, `<div style="width:358px; display:flex; flex-direction:column; gap:10px;"><div style="font-size:14px; font-weight:700;">地図で見る</div>${btn('装着感のレンズで地図を開く', { kind: 'ghost', ic: 'lens', full: true, h: 48 })}</div>`);
  s += at(16, 668, `<div style="width:358px; font-size:12px; color:${C.muted}; line-height:1.6;">近い言葉：つけ心地・フィット・落ちる・蒸れる</div>`);
  s += tabBar(1);
  return scr(s);
}

// ==========================================================================
// P03 ジャンルの地図（主役）
// ==========================================================================
const mapHeader = (title = '完全ワイヤレスイヤホン') => at(0, 0, `<div style="width:${W}px; padding:52px 16px 12px; box-sizing:border-box; background:linear-gradient(${C.bg} 70%, rgba(255,255,255,0));"><div style="display:flex; align-items:center; gap:10px;">${iconBtn('back', '戻る', { size: 40, shadow: 'none', bg: C.bg2 })}<div style="flex:1; min-width:0;"><div style="font-family:${F.disp}; font-weight:900; font-size:19px;">${title}</div><div style="margin-top:2px; line-height:1.4;">${coverageLine(11)}</div></div>${iconBtn('share', '共有', { size: 40, shadow: 'none', bg: C.bg2 })}</div></div>`, { z: 12 });
const modeSeg = (m = 0) => `<div role="group" aria-label="表示" style="display:inline-flex; padding:3px; border-radius:22px; background:${C.bg}; box-shadow:${SH.card};">${[['map', '地図'], ['axes', '並べる'], ['list', '一覧']].map(([ic, t], i) => `<button type="button" style="display:flex; align-items:center; gap:5px; height:38px; padding:0 12px; border-radius:19px; border:none; white-space:nowrap; background:${i === m ? C.ink : 'transparent'}; color:${i === m ? C.white : C.ink}; font-family:${F.body}; font-size:13px; font-weight:700;">${icon(ic, { size: 16 })}${t}</button>`).join('')}</div>`;
const lensDock = (on = null, { top = 668 } = {}) => at(0, top, `<div style="width:${W}px; padding:12px 0 12px 16px; box-sizing:border-box; background:${C.bg}; border-top:1px solid ${C.line}; display:flex; flex-direction:column; gap:10px;"><div style="display:flex; align-items:center; gap:8px; font-size:12px; font-weight:700; color:${C.ink2};">${icon('lens', { size: 16 })}気になる観点<span style="font-weight:400; color:${C.muted};">差がつかない：${SAME.map((a) => SHORT[a.key]).join('・')}</span></div>${lensChips(on)}</div>`, { z: 12 });

export function pMap() {
  let s = `<div style="position:absolute; left:0; top:0; width:${W}px; height:${H}px;">${mapView({ w: W, h: 600, top: 112, bottom: 0, labels: 'thick', min: 24, max: 54, compass: true, compassAt: [300, 500], compassSize: 60 })}</div>`;
  s += mapHeader();
  s += at(16, 604, `<div style="width:358px; display:flex; justify-content:space-between; align-items:center;">${modeSeg(0)}<button type="button" style="height:40px; padding:0 12px; border-radius:20px; border:none; background:${C.bg}; box-shadow:${SH.card}; font-family:${F.body}; font-size:12px; font-weight:700; color:${C.ink};">まだ地図にない ${num(unmapped, { size: 12 })}</button></div>`, { z: 12 });
  s += lensDock(null, { top: 662 });
  s += tabBar(0);
  return scr(s);
}

// P04 レンズ：装着感（不満が先）
export function pLens() {
  const lens = 'fit';
  const list = MAPPED.filter((p) => p.pos[lens] + p.neg[lens] > 0).sort((a, b) => b.neg[lens] - a.neg[lens]).slice(0, 3);
  const none = MAPPED.filter((p) => p.pos[lens] + p.neg[lens] === 0).length;
  let s = `<div style="position:absolute; left:0; top:0; width:${W}px; height:${H}px;">${mapView({ w: W, h: 600, top: 272, bottom: 0, lens, labels: 'thick', min: 20, max: 46 })}</div>`;
  s += mapHeader();
  s += at(16, 130, `<div style="width:358px; box-sizing:border-box; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,.94); box-shadow:${SH.card}; display:flex; flex-direction:column; gap:8px;"><div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-size:14px; font-weight:700;">装着感のレンズ</span>${aiMark()}</div><div style="font-size:12px; color:${C.ink2}; line-height:1.6;">リングは装着感だけ。オレンジ＝「${POLE.fit.neg}」、青＝「${POLE.fit.pos}」。点線の丸＝装着感にふれていない（${none}商品）</div><div style="display:flex; flex-direction:column; gap:4px;">${list.map((p) => `<div style="display:flex; justify-content:space-between; font-size:12px;"><span style="font-weight:700;">${esc(p.name)}</span><span>不満 ${num(p.neg[lens], { size: 12, color: C.negText })}・満足 ${num(p.pos[lens], { size: 12, color: C.satText })}</span></div>`).join('')}</div></div>`, { z: 12 });
  s += at(16, 604, modeSeg(0), { z: 12 });
  s += lensDock(lens, { top: 662 });
  s += tabBar(0);
  return scr(s);
}

// P05 点を押した（下からのシート）
export function pPeek() {
  const p = WFC, lens = 'fit';
  let s = `<div style="position:absolute; left:0; top:0; width:${W}px; height:${H}px;">${mapView({ w: W, h: 392, top: 108, bottom: 0, lens, sel: p.s, labels: 'thick', min: 18, max: 40 })}</div>`;
  s += mapHeader();
  const v = verdictOf(p);
  s += sheet(`<div style="display:flex; gap:12px; align-items:center;">${productDot({ size: 58, pos: p.pos[lens], neg: p.neg[lens], thick: p.thick })}<div style="flex:1; min-width:0;"><div style="font-size:17px; font-weight:700;">${esc(p.name)}</div><div style="margin-top:3px; display:flex; gap:6px; align-items:baseline;">${ptag(p)}</div><div style="font-size:11px; color:${C.muted}; margin-top:2px;">レビュー${p.reviewCount}件のうち${p.read}件を読みました</div></div></div>
<div style="margin-top:14px; display:flex; flex-direction:column; gap:12px;">${voiceBar({ label: '装着感', pos: p.pos.fit, neg: p.neg.fit, read: p.read, w: 354 })}${quotePair(Q[p.id.slice(0, 8)].fit, { w: 354, fs: 12.5 })}</div>
<div style="margin-top:12px; font-size:12px; color:${C.ink2};">ほかに不満が多い：${v.blamed.slice(0, 3).filter((l) => l.k !== 'fit').map((l) => `${SHORT[l.k]} ${num(l.neg, { size: 12, color: C.negText })}`).join('、')}</div>
<div style="margin-top:14px; display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:8px;">${btn('詳しく', { h: 44, fs: 13 })}${btn('似ている', { kind: 'ghost', h: 44, fs: 13 })}${btn('くらべる', { kind: 'ghost', ic: 'plus', h: 44, fs: 13 })}</div>`, { top: 386 });
  return scr(s);
}

// P06 並べる（2つの観点）
export function pAxes() {
  const { html, placed } = axesView({ w: W, h: 456, x: 'fit', y: 'anc' });
  const { unspoken } = quad('fit', 'anc');
  let s = mapHeader();
  s += at(16, 136, `<div style="width:358px; display:flex; flex-direction:column; gap:8px;"><div style="font-size:12px; font-weight:700; color:${C.ink2};">問いを選ぶ</div><div style="display:flex; gap:8px; overflow:hidden;">${chip('着け心地 × 静かさ', { on: true })}${chip('静かさ × 外の音')}${chip('操作 × 値段')}</div></div>`, { z: 12 });
  s += at(0, 218, `<div style="position:relative; width:${W}px; height:456px;">${html}</div>`);
  s += at(16, 684, `<div style="width:358px; display:flex; flex-direction:column; gap:6px;"><div style="font-size:13px;"><b>${placed}商品</b>を配置。原点は「意見が割れている」</div><div style="font-size:12px; color:${C.muted};">どちらかにふれていない ${unspoken.length}商品は、図に置かずに下へ（原点に置かない）</div></div>`);
  s += tabBar(0);
  return scr(s);
}

// ==========================================================================
// P07・P08 商品ページ
// ==========================================================================
export function pProduct() {
  const p = WFC;
  const v = verdictOf(p);
  const rows = v.blamed.slice(0, 3);
  let s = at(0, 0, `<div style="width:${W}px; padding:52px 16px 0; box-sizing:border-box; display:flex; justify-content:space-between;">${iconBtn('back', '戻る', { size: 40, shadow: 'none', bg: C.bg2 })}<div style="display:flex; gap:8px;">${iconBtn('save', '保存', { size: 40, shadow: 'none', bg: C.bg2 })}${iconBtn('share', '共有', { size: 40, shadow: 'none', bg: C.bg2 })}</div></div>`);
  s += at(16, 106, `<div style="width:358px; display:flex; gap:14px; align-items:center;">${productDot({ size: 86, pos: KEYS.reduce((a, k) => a + p.pos[k], 0), neg: KEYS.reduce((a, k) => a + p.neg[k], 0), thick: p.thick })}<div style="min-width:0;"><div style="font-size:11px; color:${C.muted};">${p.brand}</div><div style="font-family:${F.disp}; font-weight:900; font-size:21px; line-height:1.3;">${esc(p.name)}</div><div style="margin-top:4px;">${ptag(p)}</div></div></div>`);
  s += at(16, 214, `<div style="width:358px; display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-radius:12px; background:${C.bg2}; box-sizing:border-box;"><span style="font-size:12px;">レビュー${p.reviewCount}件のうち <b>${p.read}件</b>を読みました</span>${aiMark()}</div>`);
  s += at(16, 272, `<div style="width:358px; display:flex; flex-direction:column; gap:14px;"><div style="display:flex; align-items:baseline; gap:8px;"><span style="font-family:${F.disp}; font-weight:900; font-size:18px;">不満が先</span><span style="font-size:12px; color:${C.muted};">不満の件数が多い順</span></div>
${rows.map((l) => `<div style="display:flex; flex-direction:column; gap:10px; padding-bottom:14px; border-bottom:1px solid ${C.line};">${voiceBar({ label: LABEL[l.k], pos: l.pos, neg: l.neg, read: p.read, w: 358, max: maxCount(p) })}${Q['821de2ea'][l.k] ? quotePair(Q['821de2ea'][l.k], { w: 358, fs: 12.5 }) : ''}</div>`).join('')}
</div>`);
  s += tabBar(0);
  return scr(s);
}

export function pProduct2() {
  const p = WFC;
  const nb = neighbors(p, 3);
  let s = at(16, 50, `<div style="width:358px; display:flex; flex-direction:column; gap:10px;"><div style="font-family:${F.disp}; font-weight:900; font-size:18px;">褒められている</div>
${verdictOf(p).praised.slice(0, 3).map((l) => `<div style="display:flex; justify-content:space-between; font-size:13px; padding:8px 0; border-bottom:1px solid ${C.line};"><span style="font-weight:700;">${LABEL[l.k]}</span><span>満足 ${num(l.pos, { size: 13, color: C.satText })}・不満 ${num(l.neg, { size: 13, color: C.negText })}</span></div>`).join('')}
<div style="font-size:12px; color:${C.ink2}; line-height:1.6; padding:10px 12px; border-radius:12px; background:${C.bg2};"><b>迷わなくていい：音質。</b>このジャンルでは${SAME[0].products}商品が音質にふれ、ほぼ全員が満足。差がつきません</div></div>`);
  s += at(16, 322, `<div style="width:358px; display:flex; flex-direction:column; gap:10px;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><span style="font-family:${F.disp}; font-weight:900; font-size:18px;">似ているもの</span><a href="#" style="font-size:12px; color:${C.ink}; font-weight:700;">地図で見る</a></div>
${nb.map((n) => { const up = n.diffs.find((d) => d.d > 0.1), dn = n.diffs.find((d) => d.d < -0.1); return `<a href="#" style="display:flex; gap:10px; align-items:center; padding:10px 12px; border-radius:14px; box-shadow:${SH.card}; text-decoration:none; color:${C.ink};">${productDot({ size: 40, pos: KEYS.reduce((a, k) => a + n.p.pos[k], 0), neg: KEYS.reduce((a, k) => a + n.p.neg[k], 0), thick: n.p.thick })}<div style="flex:1; min-width:0;"><div style="font-size:13px; font-weight:700;">${esc(n.p.name)}</div><div style="font-size:11.5px; color:${C.ink2}; margin-top:2px;">${up ? `<span style="color:${C.satText};">${SHORT[up.k]}は満足が多め</span>` : ''}${up && dn ? '・' : ''}${dn ? `<span style="color:${C.negText};">${SHORT[dn.k]}は不満が多め</span>` : ''}</div></div>${n.p.thick === 'thin' ? tag('声が少ない', { fs: 11, h: 20 }) : ''}</a>`; }).join('')}
</div>`);
  s += at(16, 590, `<div style="width:358px; display:flex; flex-direction:column; gap:8px;"><div style="font-family:${F.disp}; font-weight:900; font-size:18px;">買う</div><div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:8px;">${btn('楽天で見る', { h: 48, fs: 14 })}${btn('Amazonで見る', { kind: 'ghost', h: 48, fs: 14 })}</div><div style="font-size:11px; color:${C.muted};">価格は${STATS.generatedAt}時点。購入で当サイトに紹介料が入ることがあります</div></div>`);
  s += at(16, 708, `<div style="width:358px; height:44px; border-radius:10px; border:1px dashed ${C.line2}; display:flex; align-items:center; justify-content:center; gap:6px; font-size:11px; color:${C.muted}; box-sizing:border-box;">${tag('広告', { fs: 11, h: 20 })}ここだけ（区切り）</div>`);
  s += tabBar(0);
  return scr(s);
}

// ==========================================================================
// P09 似ているもの（起点の地図）
// ==========================================================================
export function pSimilar() {
  const a = WFC;
  const nb = neighbors(a, 5);
  const cx = W / 2, cy = 330, R = 128;
  let s = at(0, 0, `<div style="width:${W}px; padding:52px 16px 0; box-sizing:border-box; display:flex; align-items:center; gap:10px;">${iconBtn('back', '戻る', { size: 40, shadow: 'none', bg: C.bg2 })}<div><div style="font-family:${F.disp}; font-weight:900; font-size:18px;">似ているもの</div><div style="font-size:11px; color:${C.muted};">${esc(a.name)} を真ん中に</div></div></div>`);
  s += at(0, 110, `<div style="position:relative; width:${W}px; height:440px; background:${C.map};">
<svg width="${W}" height="440" aria-hidden="true" style="position:absolute; left:0; top:0;">${[0.5, 1].map((f) => `<circle cx="${cx}" cy="${cy - 110}" r="${R * f}" fill="none" stroke="${C.map2}" stroke-width="1.5" stroke-dasharray="4 5"></circle>`).join('')}</svg>
${(() => {
  let h = '';
  const ccx = cx, ccy = cy - 110;
  const maxD = Math.max(...nb.map((n) => n.dist));
  // 方角：観点ごとに向きを固定。その観点で起点より満足が多い商品を、その向きに置く
  const dirs = KEYS.map((k, i) => ({ k, ang: -Math.PI / 2 + (i * 2 * Math.PI) / KEYS.length }));
  for (const d of dirs) h += `<div style="position:absolute; left:${Math.round(ccx + Math.cos(d.ang) * (R + 26) - 36)}px; top:${Math.round(ccy + Math.sin(d.ang) * (R + 26) - 8)}px; width:72px; text-align:center; font-size:11px; font-weight:700; color:${C.muted};">${SHORT[d.k]}</div>`;
  const used = {};
  const items = nb.map((n) => {
    const up = n.diffs.find((d) => d.d > 0.1) ?? n.diffs[0];
    const base = dirs.find((d) => d.k === up.k).ang;
    const off = (used[up.k] = (used[up.k] ?? -1) + 1);
    const ang = base + (off % 2 ? 1 : -1) * Math.ceil(off / 2) * 0.42;
    const r = R * (0.5 + 0.5 * (n.dist / maxD));
    const sz = dotSize(n.p.tot, { min: 28, max: 46 });
    return { n, up, sz, r: sz / 2 + 16, x: ccx + Math.cos(ang) * r, y: ccy + Math.sin(ang) * r };
  });
  items.push({ fixed: true, r: 50, x: ccx, y: ccy });
  relax(items, { w: W, h: 440, pad: 30, gap: 6 });
  for (const it of items.filter((i) => !i.fixed)) {
    const { n, up, sz, x, y } = it;
    h += `<div style="position:absolute; left:${Math.round(x - sz / 2)}px; top:${Math.round(y - sz / 2)}px;">${productDot({ size: sz, pos: KEYS.reduce((q, k) => q + n.p.pos[k], 0), neg: KEYS.reduce((q, k) => q + n.p.neg[k], 0), thick: n.p.thick })}</div><div style="position:absolute; left:${Math.round(Math.min(W - 112, Math.max(4, x - 54)))}px; top:${Math.round(y + sz / 2 + 2)}px; width:108px; text-align:center; font-size:11px; line-height:1.3;"><b>${esc(n.p.name)}</b><br><span style="color:${C.satText};">${SHORT[up.k]}の満足↑</span></div>`;
  }
  const sz = 60;
  h += `<div style="position:absolute; left:${ccx - sz / 2}px; top:${ccy - sz / 2}px;">${productDot({ size: sz, pos: KEYS.reduce((q, k) => q + a.pos[k], 0), neg: KEYS.reduce((q, k) => q + a.neg[k], 0), thick: a.thick, sel: true })}</div><div style="position:absolute; left:${ccx - 80}px; top:${ccy + sz / 2 + 6}px; width:160px; text-align:center; font-size:11px; font-weight:700;">${esc(a.name)}（起点）</div>`;
  return h;
})()}
</div>`);
  s += at(16, 566, `<div style="width:358px; display:flex; flex-direction:column; gap:8px;"><div style="font-size:13px; line-height:1.6;"><b>近いほど</b>、買った人の満足と不満の出方が似ています。<b>向き</b>は、起点より満足が多い観点</div><div style="font-size:12px; color:${C.muted}; line-height:1.6;">比べられるのは、両方がふれている観点だけ。点線の丸は声が少なく、近さは仮です</div></div>`);
  s += at(16, 676, `<div style="width:358px; display:flex; gap:8px;">${chip('装着感を重く見る')}${chip('ノイキャンを重く見る')}</div>`);
  s += tabBar(0);
  return scr(s);
}

// 違いの大きさ × 根拠の厚さで並べる（件数が少ない差を上に出さない）
function compareRows(a, b) {
  return KEYS.map((k) => {
    const ma = a.pos[k] + a.neg[k], mb = b.pos[k] + b.neg[k];
    const m = Math.min(ma, mb);
    return { k, ma, mb, d: ma && mb ? Math.abs(score(a, k) - score(b, k)) * (m / (m + 5)) : -1 + (ma + mb) / 1000 };
  }).sort((x, y) => y.d - x.d);
}

// ==========================================================================
// P10 くらべる（2商品）
// ==========================================================================
export function pCompare() {
  const a = WFC, b = LIB;
  const rows = compareRows(a, b);
  const maxRate = Math.max(...rows.flatMap((r) => [(a.pos[r.k] + a.neg[r.k]) / a.read, (b.pos[r.k] + b.neg[r.k]) / b.read]));
  const bar = (p, k, side) => {
    const t = p.pos[k] + p.neg[k];
    if (!t) return `<div style="font-size:11px; color:${C.muted}; text-align:${side};">言及なし</div>`;
    const full = 120 * (t / p.read) / maxRate;
    const nw = Math.round(full * p.neg[k] / t), pw = Math.round(full * p.pos[k] / t);
    return `<div style="display:flex; flex-direction:column; gap:3px; align-items:${side === 'right' ? 'flex-end' : 'flex-start'};"><div style="display:flex; gap:2px; height:10px;">${nw ? `<span style="width:${nw}px; background:${C.neg}; border-radius:3px;"></span>` : ''}${pw ? `<span style="width:${pw}px; background:${C.sat}; border-radius:3px;"></span>` : ''}</div><div style="font-size:11px;">${num(p.neg[k], { size: 11, color: C.negText })}<span style="color:${C.muted};"> / </span>${num(p.pos[k], { size: 11, color: C.satText })}</div></div>`;
  };
  let s = at(0, 0, `<div style="width:${W}px; padding:52px 16px 0; box-sizing:border-box; display:flex; align-items:center; gap:10px;">${iconBtn('back', '戻る', { size: 40, shadow: 'none', bg: C.bg2 })}<div style="font-family:${F.disp}; font-weight:900; font-size:18px;">くらべる</div></div>`);
  s += at(16, 106, `<div style="width:358px; display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:10px;">${[a, b].map((p) => `<div style="display:flex; flex-direction:column; align-items:center; gap:6px; padding:12px; border-radius:16px; background:${C.bg2};">${productDot({ size: 52, pos: KEYS.reduce((q, k) => q + p.pos[k], 0), neg: KEYS.reduce((q, k) => q + p.neg[k], 0), thick: p.thick })}<div style="font-size:13px; font-weight:700; text-align:center;">${esc(p.name)}</div><div>${num(yen(p.price), { size: 12 })}</div><div style="font-size:11px; color:${C.muted};">読んだ${p.read}件</div></div>`).join('')}</div>`);
  s += at(16, 290, `<div style="width:358px; display:flex; justify-content:space-between; align-items:baseline;"><span style="font-size:14px; font-weight:700;">違いがはっきりした順</span><span style="font-size:11px; color:${C.muted};">不満 / 満足（件）</span></div>`);
  s += at(16, 318, `<div style="width:358px; display:flex; flex-direction:column;">${rows.slice(0, 7).map((r) => `<div style="display:grid; grid-template-columns:minmax(0,1fr) 92px minmax(0,1fr); align-items:center; gap:6px; padding:9px 0; border-bottom:1px solid ${C.line};">${bar(a, r.k, 'left')}<div style="text-align:center; font-size:12px; font-weight:700;">${SHORT[r.k]}</div>${bar(b, r.k, 'right')}</div>`).join('')}</div>`);
  s += at(16, 660, `<div style="width:358px; display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:8px;">${btn('楽天で見る', { kind: 'ghost', h: 44, fs: 13 })}${btn('楽天で見る', { kind: 'ghost', h: 44, fs: 13 })}</div>`);
  s += at(16, 714, `<div style="width:358px; font-size:11px; color:${C.muted};">長さは読んだレビューに対する割合。両方の購入ボタンは同じ形</div>`);
  s += tabBar(2);
  return scr(s);
}

// ==========================================================================
// P11 観点のページ（検索の受け口）
// ==========================================================================
export function pAspect() {
  const k = 'fit';
  const withM = P.filter((p) => p.pos[k] + p.neg[k] > 0);
  const band = (f) => withM.filter(f).sort((x, y) => (y.pos[k] + y.neg[k]) - (x.pos[k] + x.neg[k]));
  const good = band((p) => score(p, k) >= 0.3), split = band((p) => score(p, k) < 0.3 && score(p, k) > -0.1), bad = band((p) => score(p, k) <= -0.1);
  const none = P.length - withM.length;
  const grp = (t, list, col) => `<div style="display:flex; flex-direction:column; gap:6px;"><div style="display:flex; align-items:center; gap:6px; font-size:13px; font-weight:700;"><span style="width:10px; height:10px; border-radius:50%; background:${col};"></span>${t}<span style="font-weight:400; color:${C.muted};">${list.length}商品</span></div><div style="display:flex; flex-wrap:wrap; gap:6px;">${list.slice(0, 6).map((p) => `<a href="#" style="display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 10px 0 4px; border-radius:17px; background:${C.bg2}; text-decoration:none; color:${C.ink}; font-size:12px; font-weight:700;">${productDot({ size: 26, pos: p.pos[k], neg: p.neg[k], thick: p.thick })}${esc(p.name)}</a>`).join('')}${list.length > 6 ? `<span style="font-size:12px; color:${C.muted}; align-self:center;">ほか${list.length - 6}</span>` : ''}</div></div>`;
  let s = at(16, 54, `<div style="width:358px;"><div style="font-size:12px; color:${C.muted};">完全ワイヤレスイヤホン ＞ 観点</div><div style="font-family:${F.disp}; font-weight:900; font-size:23px; line-height:1.35; margin-top:6px;">装着感：耳が痛くならない？<br>買った人の声で見る</div><div style="margin-top:8px; font-size:12px; color:${C.ink2};">${withM.length}商品が装着感にふれています（読んだレビューのべ${withM.reduce((q, p) => q + p.read, 0)}件）${aiMark()}</div></div>`);
  s += at(0, 208, `<div style="position:relative; width:${W}px; height:200px;">${mapView({ w: W, h: 200, lens: k, labels: 'none', min: 14, max: 30 })}</div>`);
  s += at(16, 424, `<div style="width:358px; display:flex; flex-direction:column; gap:14px;">${grp('満足が多い', good, C.sat)}${grp('割れている', split, C.muted)}${grp('不満が多い', bad, C.neg)}<div style="font-size:12px; color:${C.muted};">装着感にふれていない${none}商品は、順位に入れず別に</div></div>`);
  s += tabBar(0);
  return scr(s);
}

// ==========================================================================
// P12 数え方
// ==========================================================================
export function pHow() {
  const step = (n, t, b) => `<div style="display:flex; gap:12px;"><span style="width:28px; height:28px; border-radius:50%; background:${C.ink}; color:${C.white}; font-family:${F.num}; font-size:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${n}</span><div style="min-width:0;"><div style="font-size:14px; font-weight:700;">${t}</div><div style="font-size:12px; color:${C.ink2}; line-height:1.6; margin-top:2px;">${b}</div></div></div>`;
  let s = at(16, 54, `<div style="width:358px;"><div style="font-family:${F.disp}; font-weight:900; font-size:23px;">数え方</div><div style="font-size:13px; color:${C.ink2}; margin-top:6px; line-height:1.6;">このサイトの数字は、すべて「読んだレビューの数」と一緒に出します。</div></div>`);
  s += at(16, 160, `<div style="width:358px; display:flex; flex-direction:column; gap:16px;">
${step(1, '楽天のレビューを読む', `${STATS.total}商品のうち、レビューがあるのは${STATS.withReviews}商品。読めたのは${STATS.analysed}商品`)}
${step(2, '同じレビューを1回に', `製品ページと店舗ページで同じ文が出るため、${num(STATS.beforeDedup.toLocaleString(), { size: 12 })}件 → ${num(STATS.read, { size: 12 })}件`)}
${step(3, 'AI が観点ごとに分ける', '1件ずつ「装着感に満足」「接続に不満」などを判定。件数はプログラムが数える')}
${step(4, '引用は原文と照合', '別々のレビューをつないだ文が混ざるため、照合を通らない引用は件数ごと捨てる（初回は138件中17件）')}
${step(5, '差が出ない観点は並べない', '音質は24商品がふれ、ほぼ全員が満足。並べても差が出ないので、順位を作らない')}
</div>`);
  s += at(16, 618, `<div style="width:358px; box-sizing:border-box; padding:12px 14px; border-radius:14px; background:${C.bg2}; font-size:12px; line-height:1.6; color:${C.ink2};">本文は載せません。引用は短く、出典のレビューへのリンクを付けます。</div>`);
  s += tabBar(0);
  return scr(s);
}

// ==========================================================================
// P13 保存と、変化
// ==========================================================================
export function pSaved() {
  const list = [WFC, LIB, LINK];
  let s = at(16, 54, `<div style="width:358px;"><div style="font-family:${F.disp}; font-weight:900; font-size:23px;">保存</div><div style="font-size:12px; color:${C.muted}; margin-top:4px;">この端末の中だけに保存（登録なし）</div></div>`);
  s += at(16, 128, `<div style="width:358px; display:flex; flex-direction:column; gap:10px;">${list.map((p) => `<div style="display:flex; gap:12px; align-items:center; padding:12px; border-radius:16px; box-shadow:${SH.card};">${productDot({ size: 48, pos: KEYS.reduce((q, k) => q + p.pos[k], 0), neg: KEYS.reduce((q, k) => q + p.neg[k], 0), thick: p.thick })}<div style="flex:1; min-width:0;"><div style="font-size:14px; font-weight:700;">${esc(p.name)}</div><div style="font-size:12px; margin-top:3px;">${num(yen(p.price), { size: 12 })}</div><div style="font-size:11.5px; color:${C.muted}; margin-top:3px;">［週次更新の後：今週増えた不満・価格の変化が入る］</div></div></div>`).join('')}</div>`);
  s += at(16, 432, `<div style="width:358px; display:flex; flex-direction:column; gap:10px;"><div style="font-size:14px; font-weight:700;">保存した2つをくらべる</div>${btn('Sony WF-C710N と soundcore Liberty 4', { kind: 'ghost', ic: 'pair', full: true, h: 48, fs: 13 })}</div>`);
  s += at(16, 560, `<div style="width:358px; box-sizing:border-box; padding:14px; border-radius:16px; background:${C.bg2}; display:flex; gap:12px; align-items:center;">${icon('bell', { size: 22 })}<div style="flex:1;"><div style="font-size:13px; font-weight:700;">変化を知らせる（アプリ）</div><div style="font-size:12px; color:${C.ink2}; margin-top:2px;">値下がり・不満が増えたとき</div></div>${btn('オン', { h: 36, fs: 12 })}</div>`);
  s += tabBar(3);
  return scr(s);
}

// ==========================================================================
// P14 アプリ：店頭でバーコードを読む
// ==========================================================================
export function pScan() {
  const p = LIB;
  let s = `<div style="position:absolute; inset:0; background:#1A1D21;"></div>`;
  s += at(16, 54, `<div style="width:358px; display:flex; justify-content:space-between; align-items:center; color:${C.white};">${iconBtn('close', '閉じる', { size: 40, shadow: 'none', bg: 'rgba(255,255,255,.14)', color: C.white })}<span style="font-size:14px; font-weight:700;">バーコードを読む</span><span style="width:40px;"></span></div>`);
  s += at(55, 150, `<div style="width:280px; height:170px; border-radius:20px; border:3px solid ${C.white}; box-sizing:border-box; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,.6);">${icon('scan', { size: 64, sw: 1.4 })}</div>`);
  s += at(16, 336, `<div style="width:358px; text-align:center; font-size:12px; color:rgba(255,255,255,.75);">お店の箱の JAN コード（${p.jan}）</div>`);
  s += sheet(`<div style="display:flex; gap:12px; align-items:center;">${productDot({ size: 56, pos: KEYS.reduce((q, k) => q + p.pos[k], 0), neg: KEYS.reduce((q, k) => q + p.neg[k], 0), thick: p.thick })}<div style="flex:1; min-width:0;"><div style="font-size:16px; font-weight:700;">${esc(p.name)}</div><div style="font-size:11px; color:${C.muted}; margin-top:2px;">読んだ${p.read}件・ネットの価格 ${yen(p.price)}</div></div></div>
<div style="margin-top:12px; display:flex; flex-direction:column; gap:10px;"><div style="font-size:13px; font-weight:700;">不満が先</div>${verdictOf(p).blamed.slice(0, 3).map((l) => voiceBar({ label: LABEL[l.k], pos: l.pos, neg: l.neg, read: p.read, w: 354, compact: true, showRead: false, max: maxCount(p) })).join('')}</div>
<div style="margin-top:14px; display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:8px;">${btn('似ているもの', { kind: 'ghost', h: 44, fs: 13 })}${btn('保存', { h: 44, fs: 13, ic: 'save' })}</div>`, { top: 380 });
  return scr(s);
}

export const PHONE_SCREENS = [
  ['入口', [['S01-Home', '01 ホーム', pHome], ['S02-Search', '02 言葉で探す', pSearch]]],
  ['地図', [['S03-Map', '03 ジャンルの地図', pMap], ['S04-Lens', '04 レンズ（装着感）', pLens], ['S05-Peek', '05 点を押した', pPeek], ['S06-Axes', '06 並べる（2つの観点）', pAxes]]],
  ['商品と比較', [['S07-Product', '07 商品（不満が先）', pProduct], ['S08-Product2', '08 商品（似ている・買う）', pProduct2], ['S09-Similar', '09 似ているもの', pSimilar], ['S10-Compare', '10 くらべる', pCompare]]],
  ['検索の受け口と信頼', [['S11-Aspect', '11 観点のページ', pAspect], ['S12-How', '12 数え方', pHow], ['S13-Saved', '13 保存', pSaved], ['S14-Scan', '14 アプリ：バーコード', pScan]]],
];

// ==========================================================================
// PC（1440×900）
// ==========================================================================
const PW = 1440, PH = 900;
const pcScr = (inner) => `<div style="position:relative; width:${PW}px; height:${PH}px; overflow:hidden; background:${C.bg}; font-family:${F.body}; color:${C.ink};">${inner}</div>`;
const pcHeader = (active = 0) => `<header style="position:absolute; left:0; right:0; top:0; height:68px; padding:0 40px; box-sizing:border-box; display:flex; align-items:center; gap:28px; background:${C.bg}; border-bottom:1px solid ${C.line}; z-index:20;">${wordmark(20)}<nav aria-label="メイン" style="display:flex; gap:22px;">${['地図', 'くらべる', '保存', '数え方'].map((t, i) => `<a href="#" style="font-size:14px; font-weight:700; color:${i === active ? C.ink : C.muted}; text-decoration:none;">${t}</a>`).join('')}</nav><div style="margin-left:auto;">${searchPill('悩みや商品名で探す（例：耳が痛くならない）', { w: 440, h: 42 })}</div></header>`;

export function dHome() {
  let s = pcHeader(0);
  s += at(40, 108, `<div style="width:560px;"><div style="font-family:${F.disp}; font-weight:900; font-size:46px; line-height:1.25;">買った人の声で描いた、<br>商品の地図。</div><div style="font-size:16px; color:${C.ink2}; margin-top:16px; line-height:1.7;">似ている・違うが、ひと目で分かる。不満が先に見える。<br>数字はすべて「読んだレビューの数」と一緒に。</div><div style="margin-top:26px; display:flex; flex-direction:column; gap:10px;"><div style="font-size:14px; font-weight:700;">悩みから探す</div><div style="display:flex; flex-wrap:wrap; gap:8px;">${WORRIES.map(([t, , side]) => chip(t, { dot: side === 'neg' ? C.neg : C.sat })).join('')}</div></div></div>`);
  s += at(660, 100, `<a href="#" style="display:block; width:740px; border-radius:24px; overflow:hidden; box-shadow:${SH.card}; text-decoration:none; color:${C.ink};"><div style="position:relative; width:740px; height:470px;">${mapView({ w: 740, h: 470, labels: 'thick', min: 20, max: 50, compass: true, compassAt: [560, 300], compassSize: 104 })}</div><div style="height:72px; padding:0 22px; display:flex; align-items:center; justify-content:space-between;"><div><div style="font-size:18px; font-weight:700;">完全ワイヤレスイヤホン</div><div style="margin-top:3px;">${coverageLine(12)}</div></div>${btn('地図を開く', { ic: 'map', h: 44, fs: 14 })}</div></a>`);
  s += at(40, 700, `<div style="width:1360px; display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:16px;">${[['地図を読む', '近い＝声が似ている。リングは不満が先'], ['レンズで見る', '気になる観点だけで、満足と不満を色分け'], ['似ているものへ', '好きな商品を真ん中に、違いを方角で'], ['数え方', `のべ${STATS.read}件。重複を除き、引用は原文と照合`]].map(([t, b]) => `<div style="padding:18px; border-radius:18px; background:${C.bg2};"><div style="font-size:15px; font-weight:700;">${t}</div><div style="font-size:13px; color:${C.ink2}; margin-top:6px; line-height:1.6;">${b}</div></div>`).join('')}</div>`);
  return pcScr(s);
}

export function dMap() {
  const p = WFC, lens = 'fit';
  let s = pcHeader(0);
  s += at(0, 68, `<div style="position:relative; width:1000px; height:832px;">${mapView({ w: 1000, h: 832, top: 150, bottom: 150, lens, sel: p.s, labels: 'thick', min: 26, max: 62 })}</div>`, { z: 1 });
  s += at(24, 92, `<div style="display:flex; flex-direction:column; gap:10px; padding:14px 16px; border-radius:18px; background:rgba(255,255,255,.95); box-shadow:${SH.card};"><div style="font-family:${F.disp}; font-weight:900; font-size:22px;">完全ワイヤレスイヤホン</div>${coverageLine(12)}<div style="display:flex; gap:8px;">${modeSeg(0)}</div></div>`, { z: 5 });
  s += at(24, 760, `<div style="padding:12px 16px; border-radius:16px; background:rgba(255,255,255,.95); box-shadow:${SH.card};">${legend({ w: 560, fs: 12 }).replace('flex-direction:column', 'flex-direction:row; flex-wrap:wrap; column-gap:18px; row-gap:6px')}</div>`, { z: 5 });
  // 右の面
  s += at(1000, 68, `<div style="width:440px; height:832px; box-sizing:border-box; padding:22px 26px; border-left:1px solid ${C.line}; background:${C.bg}; display:flex; flex-direction:column; gap:16px;">
<div style="display:flex; flex-direction:column; gap:10px;"><div style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700;">${icon('lens', { size: 16 })}気になる観点</div><div style="display:flex; flex-wrap:wrap; gap:8px;">${chip('すべて')}${offerable.map((a) => chip(SHORT[a.key], { on: a.key === lens })).join('')}</div><div style="font-size:11.5px; color:${C.muted};">差がつかない：${SAME.map((a) => SHORT[a.key]).join('・')}（ほぼ全員の評価がそろう）</div></div>
<div style="height:1px; background:${C.line};"></div>
<div style="display:flex; gap:14px; align-items:center;">${productDot({ size: 64, pos: p.pos[lens], neg: p.neg[lens], thick: p.thick, sel: true })}<div><div style="font-size:19px; font-weight:700;">${esc(p.name)}</div><div style="margin-top:3px;">${ptag(p)}</div><div style="font-size:12px; color:${C.muted}; margin-top:2px;">レビュー${p.reviewCount}件のうち${p.read}件を読みました ${aiMark()}</div></div></div>
${voiceBar({ label: '装着感', pos: p.pos.fit, neg: p.neg.fit, read: p.read, w: 388 })}
${quotePair(Q['821de2ea'].fit, { w: 388 })}
<div style="font-size:12.5px; color:${C.ink2};">ほかに不満が多い：電池 ${num(p.neg.battery, { size: 12, color: C.negText })}・ノイキャン ${num(p.neg.anc, { size: 12, color: C.negText })}・操作 ${num(p.neg.controls, { size: 12, color: C.negText })}</div>
<div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:8px; margin-top:auto;">${btn('詳しく', { h: 44, fs: 13 })}${btn('似ている', { kind: 'ghost', h: 44, fs: 13 })}${btn('くらべる', { kind: 'ghost', ic: 'plus', h: 44, fs: 13 })}</div>
</div>`, { z: 6 });
  return pcScr(s);
}

export function dProduct() {
  const p = WFC;
  const v = verdictOf(p);
  let s = pcHeader(0);
  s += at(120, 100, `<div style="width:1200px; display:flex; gap:28px; align-items:center;">${productDot({ size: 120, pos: KEYS.reduce((q, k) => q + p.pos[k], 0), neg: KEYS.reduce((q, k) => q + p.neg[k], 0), thick: p.thick })}<div><div style="font-size:13px; color:${C.muted};">完全ワイヤレスイヤホン ＞ ${p.brand}</div><div style="font-family:${F.disp}; font-weight:900; font-size:36px;">${esc(p.name)}</div><div style="margin-top:6px; display:flex; gap:14px; align-items:center;">${ptag(p)}<span style="font-size:13px;">レビュー${p.reviewCount}件のうち <b>${p.read}件</b>を読みました</span>${aiMark()}</div></div><div style="margin-left:auto; display:flex; gap:8px;">${btn('保存', { kind: 'ghost', ic: 'save', h: 44, fs: 14 })}${btn('くらべる', { kind: 'ghost', ic: 'plus', h: 44, fs: 14 })}</div></div>`);
  s += at(120, 262, `<div style="width:740px; display:flex; flex-direction:column; gap:18px;"><div style="display:flex; align-items:baseline; gap:10px;"><span style="font-family:${F.disp}; font-weight:900; font-size:24px;">不満が先</span><span style="font-size:13px; color:${C.muted};">不満の件数が多い順。引用は満足と不満を1件ずつ</span></div>
${v.blamed.slice(0, 3).map((l) => `<div style="display:grid; grid-template-columns:330px minmax(0,1fr); gap:26px; padding-bottom:16px; border-bottom:1px solid ${C.line};">${voiceBar({ label: LABEL[l.k], pos: l.pos, neg: l.neg, read: p.read, w: 330, max: maxCount(p) })}${Q['821de2ea'][l.k] ? quotePair(Q['821de2ea'][l.k], { w: 380, fs: 13 }) : ''}</div>`).join('')}</div>`);
  s += at(900, 262, `<div style="width:420px; display:flex; flex-direction:column; gap:14px;"><div style="position:relative; width:420px; height:280px; border-radius:18px; overflow:hidden;">${mapView({ w: 420, h: 280, top: 40, sel: p.s, labels: 'none', min: 14, max: 30 })}<div style="position:absolute; left:12px; top:12px; height:28px; padding:0 10px; border-radius:14px; background:${C.bg}; display:flex; align-items:center; font-size:12px; font-weight:700;">地図のどこにいるか</div></div>
<div style="padding:18px; border-radius:18px; box-shadow:${SH.card}; display:flex; flex-direction:column; gap:10px;"><div style="font-size:15px; font-weight:700;">買う</div><div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:8px;">${btn('楽天で見る', { h: 46, fs: 14 })}${btn('Amazonで見る', { kind: 'ghost', h: 46, fs: 14 })}</div><div style="font-size:11.5px; color:${C.muted};">価格は${STATS.generatedAt}時点。紹介料が入ることがあります</div></div>
<div style="height:120px; border-radius:14px; border:1px dashed ${C.line2}; display:flex; align-items:center; justify-content:center; gap:8px; font-size:12px; color:${C.muted};">${tag('広告', { fs: 11, h: 20 })}区切りの位置だけ</div></div>`);
  return pcScr(s);
}

export function dCompare() {
  const a = WFC, b = LIB;
  const rows = compareRows(a, b);
  const side = (p, k, align) => {
    const t = p.pos[k] + p.neg[k];
    if (!t) return `<div style="font-size:13px; color:${C.muted}; text-align:${align};">言及なし</div>`;
    return voiceBar({ label: '', pos: p.pos[k], neg: p.neg[k], read: p.read, w: 440, compact: true, showRead: false });
  };
  let s = pcHeader(1);
  s += at(120, 100, `<div style="width:1200px; display:grid; grid-template-columns:minmax(0,1fr) 160px minmax(0,1fr); gap:24px; align-items:center;">${[a, b].map((p, i) => `<div style="display:flex; gap:16px; align-items:center; ${i ? 'grid-column:3;' : ''}">${productDot({ size: 72, pos: KEYS.reduce((q, k) => q + p.pos[k], 0), neg: KEYS.reduce((q, k) => q + p.neg[k], 0), thick: p.thick })}<div><div style="font-size:20px; font-weight:700;">${esc(p.name)}</div><div style="margin-top:3px;">${num(yen(p.price), { size: 14 })}</div><div style="font-size:12px; color:${C.muted};">レビュー${p.reviewCount}件のうち${p.read}件を読みました</div></div></div>`).join('<div style="text-align:center; font-family:' + F.disp + '; font-weight:900; font-size:22px;">くらべる</div>')}</div>`);
  s += at(120, 222, `<div style="width:1200px; display:flex; flex-direction:column;">${rows.map((r) => `<div style="display:grid; grid-template-columns:minmax(0,1fr) 160px minmax(0,1fr); gap:24px; align-items:center; padding:10px 0; border-bottom:1px solid ${C.line};">${side(a, r.k, 'right')}<div style="text-align:center; font-size:14px; font-weight:700;">${LABEL[r.k]}</div>${side(b, r.k, 'left')}</div>`).join('')}</div>`);
  s += at(120, 812, `<div style="width:1200px; display:grid; grid-template-columns:minmax(0,1fr) 160px minmax(0,1fr); gap:24px;">${btn('楽天で見る', { kind: 'ghost', h: 46, fs: 14, full: true })}<span></span>${btn('楽天で見る', { kind: 'ghost', h: 46, fs: 14, full: true })}</div>`);
  return pcScr(s);
}

export const PC_SCREENS = [['D01-Home', 'PC ホーム', dHome], ['D02-Map', 'PC 地図とレンズ', dMap], ['D03-Product', 'PC 商品', dProduct], ['D04-Compare', 'PC くらべる', dCompare]];

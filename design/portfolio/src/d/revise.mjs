// 統合案の改訂（使いやすさ）：条件で絞る → 声で決める。「くらべる（候補）」を中心に
// イヤホンの実データ（値段・仕様・声）。仕様は data/genre-products.json の値と出どころ（公式・販売ページ・推定）
import { readFileSync } from 'fs';
import { C, F, SH, icon, objD, earArt, num, small, tile, pill, qchip, cchip, seg, node, strip, status, searchPill, mark, factTag, aiTag } from './libd.mjs';
import { frame, at, ph, pc, h, p, kick, dot, box, note, bl, arrow, bigNum } from './boardd.mjs';
import { MAPPED, byShort, yen, KEYS, shrink, UNITS, QL, POLE } from './datad.mjs';
import { dCategory } from './screensd.mjs';

const W = 390, H = 844;
const products = JSON.parse(readFileSync(new URL('../../../../data/genre-products.json', import.meta.url), 'utf8')).products;
const rawOf = (s) => products.find((x) => x.productId.startsWith(s));
const specOf = (s, key) => (rawOf(s)?.specs || []).find((x) => x.key === key);
const PROV = { official: '公式', ec_api: '販売ページ', llm_inferred: '推定' };
const provTag = (sp) => (sp ? `<span style="display:inline-flex; height:18px; align-items:center; padding:0 6px; border-radius:9px; font-size:11px; ${sp.provenance === 'llm_inferred' ? `background:${C.tile}; color:${C.ink2};` : `border:1px solid ${C.line}; color:${C.muted};`}">${PROV[sp.provenance] || sp.provenance}</span>` : '');
const ANC = (x) => (x.specs || []).find((s) => s.key === 'anc')?.value;
const inBudget = products.filter((x) => x.price <= 10000);
const FILTER = { all: products.length, budget: inBudget.length, match: inBudget.filter((x) => ANC(x) === true).length, unknown: inBudget.filter((x) => ANC(x) === undefined).length };
const LIST = MAPPED.filter((p) => p.price <= 10000 && specOf(p.s, 'anc')?.value === true);
FILTER.voiced = LIST.length;
// 仕様の掲載数（97商品のうち）と出どころ
const has = (x, k) => (x.specs || []).some((s) => s.key === k);
export const SPEC_COV = { anc: products.filter((x) => has(x, 'anc')).length, openEar: products.filter((x) => has(x, 'openEar')).length, water: products.filter((x) => has(x, 'waterResistant') || has(x, 'waterproof')).length, playback: products.filter((x) => has(x, 'playback')).length, weight: products.filter((x) => has(x, 'weight')).length, multipoint: products.filter((x) => has(x, 'multipoint')).length, ambient: products.filter((x) => has(x, 'ambient')).length };
export const SPEC_PROV = products.flatMap((x) => x.specs || []).reduce((a, s) => ((a[s.provenance] = (a[s.provenance] || 0) + 1), a), {});

const scr = (body, { tab = 1, tray = 0, badge = 3 } = {}) => `<div style="position:relative; width:${W}px; height:${H}px; overflow:hidden; background:#fff; font-family:${F.jp}; color:${C.ink};">${status()}${body}${tray ? trayBar(tray) : ''}${tabsR(tab, badge)}</div>`;
const A = (x, y, html, { z = 2 } = {}) => `<div style="position:absolute; left:${x}px; top:${y}px; z-index:${z};">${html}</div>`;
const round = (ic, lab, { size = 40 } = {}) => `<button type="button" aria-label="${lab}" style="width:${size}px; height:${size}px; border-radius:50%; border:none; background:${C.tile}; display:flex; align-items:center; justify-content:center; padding:0; color:${C.ink}; flex-shrink:0;">${icon(ic, { size: Math.round(size * 0.45) })}</button>`;
const shortName = (p) => p.name.replace(/^(soundcore|EarFun|Sony|Technics|NUARL|GLIDiC) /, '');
export const CAND = ['637e1dd6', 'd5f259d1', '821de2ea'];
export function tabsR(active = 0, badge = 3) {
  const items = [['home', 'ホーム'], ['search', 'さがす'], ['pair', '候補'], ['person', 'わたし']];
  return `<nav aria-label="メイン" style="position:absolute; left:24px; right:24px; bottom:24px; height:64px; border-radius:32px; background:#fff; box-shadow:${SH.lift}; display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); padding:6px; box-sizing:border-box; z-index:30;">${items.map(([ic, t], i) => `<a href="#" style="position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; border-radius:26px; background:${i === active ? C.tile : 'transparent'}; color:${C.ink}; text-decoration:none; font-size:11px; font-weight:${i === active ? 700 : 500}; opacity:${i === active ? 1 : 0.72};">${icon(ic, { size: 21 })}${t}${i === 2 && badge ? `<span style="position:absolute; top:4px; right:22px; min-width:18px; height:18px; border-radius:9px; background:${C.ink}; color:#fff; font-family:${F.num}; font-size:11px; font-weight:600; display:flex; align-items:center; justify-content:center;">${badge}</span>` : ''}</a>`).join('')}</nav>`;
}
// 候補のトレイ：一覧の上に浮かぶ。押すと「くらべる」へ
function trayBar(n) {
  return `<a href="#" style="position:absolute; left:24px; right:24px; bottom:100px; height:56px; border-radius:28px; background:${C.ink}; color:#fff; display:flex; align-items:center; gap:10px; padding:0 8px 0 10px; box-sizing:border-box; text-decoration:none; z-index:29; box-shadow:${SH.lift};"><span style="display:flex;">${CAND.slice(0, n).map((s, i) => `<span style="width:38px; height:38px; border-radius:50%; background:#fff; display:flex; align-items:center; justify-content:center; margin-left:${i ? -10 : 0}px; box-shadow:0 0 0 2px ${C.ink};">${earArt(s, 32)}</span>`).join('')}</span><span style="flex:1; font-size:14px; font-weight:700; white-space:nowrap;">候補 ${n}つ</span><span style="height:40px; padding:0 18px; border-radius:20px; background:#fff; color:${C.ink}; display:flex; align-items:center; font-size:13px; font-weight:700;">くらべる</span></a>`;
}
const addBtn = (on = false) => `<button type="button" aria-pressed="${on}" style="height:34px; padding:0 13px; border-radius:17px; border:${on ? 'none' : `1.5px solid ${C.ink}`}; background:${on ? C.ink : '#fff'}; color:${on ? '#fff' : C.ink}; font-family:${F.jp}; font-size:12.5px; font-weight:700; white-space:nowrap; display:inline-flex; align-items:center; gap:4px; flex-shrink:0;">${icon(on ? 'check' : 'plus', { size: 13, sw: 2.4 })}候補</button>`;
const buyLink = (t = '楽天で見る', { h = 34, fs = 12 } = {}) => `<a href="#" style="display:inline-flex; align-items:center; justify-content:center; gap:4px; height:${h}px; padding:0 12px; border-radius:${h / 2}px; background:${C.tile}; color:${C.ink}; font-size:${fs}px; font-weight:700; text-decoration:none; white-space:nowrap;">${t}${icon('arrow', { size: 12, sw: 2.2 }).replace('display:block;', 'display:block; transform:rotate(-45deg);')}</a>`;
// 推定の値だけに印（公式・販売ページは印なし。脚注で出どころを書く）
const estMark = (sp) => (sp && sp.provenance === 'llm_inferred' ? ` <span style="display:inline-flex; height:18px; align-items:center; padding:0 5px; border-radius:9px; background:${C.tile}; color:${C.ink2}; font-size:11px; vertical-align:1px;">推定</span>` : '');
const fmtPlay = (v) => v.replace(/\s*\(.*$/, '').replace('最大', '');
const fmtWeight = (v) => v.replace(/\s*\(.*$/, '').replace('約', '').replace(/\s*g\s*x\s*/, 'g×').replace(/\s/g, '');

// ---------- R01 ホーム ----------
export function rHome() {
  const tiles = ['earbuds', 'lotion', 'run', 'coffee'].map((k) => UNITS.find((u) => u.key === k)).map((u) => `<a href="#" style="display:flex; align-items:center; gap:10px; width:165px; height:72px; box-sizing:border-box; padding:8px 10px; border-radius:20px; background:${C.tile}; color:${C.ink}; text-decoration:none;">${objD(u.obj, { size: 50 })}<span style="font-size:13px; font-weight:700; line-height:1.3;">${u.short}</span></a>`).join('');
  return scr(`
${A(24, 56, mark(17))}
${A(24, 104, `<div style="font-size:24px; font-weight:900; line-height:1.4;">スペックで分からないことを、<br>買った人の声で。</div>`)}
${A(24, 190, searchPill('商品名やカテゴリでさがす'))}
${A(24, 256, `<a href="#" style="display:flex; align-items:center; gap:14px; width:342px; box-sizing:border-box; padding:16px 18px; border-radius:24px; background:${C.ink}; color:#fff; text-decoration:none;">${icon('pair', { size: 26 })}<span style="flex:1;"><b style="display:block; font-size:16px;">迷っている商品をくらべる</b><span style="display:block; font-size:12px; opacity:.75; margin-top:3px;">価格.com などで絞った候補を、商品名で入れるだけ</span></span>${icon('arrow', { size: 18 })}</a>`)}
${A(24, 366, `<div style="display:flex; justify-content:space-between; align-items:baseline; width:342px;"><b style="font-size:14px;">カテゴリから</b>${small('10カテゴリ', { size: 12 })}</div>`)}
${A(24, 396, `<div style="display:grid; grid-template-columns:repeat(2, 165px); gap:12px;">${tiles}</div>`)}
${A(24, 572, `<a href="#" style="display:flex; align-items:center; gap:12px; width:342px; box-sizing:border-box; padding:12px 14px; border-radius:20px; background:#fff; box-shadow:${SH.soft}; color:${C.ink}; text-decoration:none;"><span style="display:flex;">${CAND.map((s, i) => `<span style="width:36px; height:36px; border-radius:50%; background:${C.tile}; display:flex; align-items:center; justify-content:center; margin-left:${i ? -8 : 0}px; box-shadow:0 0 0 2px #fff;">${earArt(s, 30)}</span>`).join('')}</span><span style="flex:1;"><b style="display:block; font-size:13.5px;">続きから：候補 3つ</b><span style="font-size:11.5px; color:${C.muted};">この端末にだけ残っています</span></span>${icon('arrow', { size: 16 })}</a>`)}
${A(24, 656, `<div style="width:342px; font-size:12px; color:${C.muted}; line-height:1.6;">条件（予算・形・必要な機能）で絞ってから、残った候補を「買った人の不満と満足」でくらべます</div>`)}
`, { tab: 0 });
}

// ---------- R02 カテゴリ：条件で絞る → 気になることで並べる ----------
const cardRow = (p, k, { added = false } = {}) => `<div style="display:flex; gap:12px; align-items:center; padding:12px; border-radius:20px; background:#fff; box-shadow:${SH.soft};">${node(earArt(p.s, 48), { size: 56, thin: p.read < 30 })}<div style="flex:1; min-width:0;"><div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px;"><b style="font-size:13.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</b>${num(yen(p.price), { size: 13 })}</div><div style="margin-top:7px;">${strip({ pos: p.pos[k], neg: p.neg[k], read: p.read, w: 250, h: 7, labels: false })}</div><div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px; gap:6px;"><span style="font-size:12px; white-space:nowrap;"><span style="color:${C.negText};">不満 ${p.neg[k]}</span>・<span style="color:${C.posText};">満足 ${p.pos[k]}</span><span style="color:${C.muted};">（${p.read}件中）</span></span>${addBtn(added)}</div></div></div>`;
const fchip = (t, onn) => `<span style="display:inline-flex; align-items:center; gap:5px; height:34px; padding:0 13px; border-radius:17px; background:${onn ? C.ink : C.tile}; color:${onn ? '#fff' : C.ink}; font-size:12.5px; font-weight:${onn ? 700 : 500}; white-space:nowrap; flex-shrink:0;">${onn ? icon('check', { size: 13, sw: 2.4 }) : ''}${t}</span>`;
function catBody({ k = 'fit', added = 2 } = {}) {
  const on = LIST.filter((p) => p.pos[k] + p.neg[k] > 0).sort((a, b) => shrink(b.pos[k], b.neg[k]) - shrink(a.pos[k], a.neg[k]));
  return `
${A(24, 50, `<div style="display:flex; align-items:center; gap:12px; width:342px;">${round('back', '戻る')}<div style="flex:1; font-size:17px; font-weight:900; white-space:nowrap;">ワイヤレスイヤホン</div>${seg(['一覧', '図で見る'], 0, { h: 28, fs: 12, pad: 9 })}</div>`)}
${A(24, 102, `<div style="width:342px;"><div style="display:flex; justify-content:space-between; align-items:center;"><b style="font-size:14px;">条件</b><span style="display:inline-flex; align-items:center; gap:4px; height:32px; font-size:12.5px; font-weight:700;">${icon('sliders', { size: 15 })}条件を変える</span></div><div style="display:flex; gap:6px; margin-top:6px; width:366px; overflow:hidden;">${fchip('1万円まで', true)}${fchip('ノイキャンあり', true)}${fchip('耳をふさがない', false)}${fchip('防水', false)}</div><div style="font-size:12px; color:${C.ink2}; margin-top:8px; line-height:1.55;"><b style="color:${C.ink};">${FILTER.match}商品</b>が当てはまる（声を読めたのは ${FILTER.voiced}商品）<br>ノイキャンの掲載が無い ${FILTER.unknown}商品は、外さずに一番下へ</div></div>`)}
${A(24, 236, `<div style="width:342px;"><div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-size:15px; font-weight:900;">どこが気になりますか？</span><span style="display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 13px; border-radius:17px; border:1.5px solid ${C.ink}; font-size:12.5px; font-weight:700;">${QL[k]} ${icon('arrow', { size: 12 }).replace('display:block;', 'display:inline-block; transform:rotate(90deg);')}</span></div><div style="font-size:11.5px; color:${C.muted}; margin-top:4px;">${QL[k]}の評判がいい順。順位ではありません</div></div>`)}
${A(24, 306, `<div style="display:flex; flex-direction:column; gap:10px; width:342px;">${on.slice(0, 4).map((p, i) => cardRow(p, k, { added: i < added })).join('')}</div>`)}
`;
}
export function rCategory() {
  return scr(catBody(), { tab: 1, tray: 2, badge: 2 });
}

// ---------- R03 条件で絞る（下から出る板） ----------
export function rFilter() {
  const row = (t, items, onIdx) => `<div><div style="font-size:13px; font-weight:700; margin-bottom:8px;">${t}</div><div style="display:flex; gap:6px; flex-wrap:wrap;">${items.map((x, i) => `<span style="display:inline-flex; align-items:center; gap:5px; height:36px; padding:0 14px; border-radius:18px; background:${onIdx.includes(i) ? C.ink : C.tile}; color:${onIdx.includes(i) ? '#fff' : C.ink}; font-size:13px; font-weight:${onIdx.includes(i) ? 700 : 500};">${onIdx.includes(i) ? icon('check', { size: 13, sw: 2.4 }) : ''}${x}</span>`).join('')}</div></div>`;
  return scr(`${catBody()}
${A(0, 0, `<div style="width:${W}px; height:${H}px; background:rgba(20,20,20,.42);"></div>`, { z: 31 })}
${A(0, 210, `<div style="width:${W}px; height:${H - 210}px; box-sizing:border-box; padding:22px 24px 28px; border-radius:30px 30px 0 0; background:#fff; box-shadow:${SH.sheet}; display:flex; flex-direction:column; gap:20px;"><div style="display:flex; justify-content:space-between; align-items:center;"><b style="font-size:18px;">条件で絞る</b>${round('close', '閉じる', { size: 40 })}</div>
${row('予算', ['〜5千円', '〜1万円', '〜2万円', '上限なし'], [1])}
${row('必要な機能', ['ノイキャン', '防水'], [0])}
${row('形', ['耳に入れる', '耳をふさがない'], [])}
<div style="font-size:12px; color:${C.ink2}; line-height:1.6; padding:10px 12px; border-radius:14px; background:${C.tile};">条件にするのは、<b style="color:${C.ink};">半分以上の商品に掲載がある仕様だけ</b>（ノイキャン ${SPEC_COV.anc}・形 ${SPEC_COV.openEar}・防水 ${SPEC_COV.water} / ${FILTER.all}商品）。掲載が無い商品は外さず、一番下に残します</div>
<div style="margin-top:auto; display:flex; gap:10px; align-items:center;">${pill('すべて外す', { kind: 'light', h: 52, fs: 14 })}<div style="flex:1;">${pill(`${FILTER.match}商品を見る`, { h: 52, fs: 15, full: true })}</div></div></div>`, { z: 32 })}
`, { tab: 1, badge: 2 }).replace('z-index:30;">', 'z-index:30; display:none;">');
}

// ---------- R04 商品：買う前の最終チェック ----------
export function rProduct() {
  const s = byShort['821de2ea'];
  const negTop = KEYS.filter((k) => s.neg[k]).sort((a, b) => s.neg[b] - s.neg[a]).slice(0, 3);
  const posTop = KEYS.filter((k) => s.pos[k]).sort((a, b) => s.pos[b] - s.pos[a]).slice(0, 3);
  const alt = MAPPED.filter((p) => p !== s && p.price >= s.price * 0.6 && p.price <= s.price * 1.4 && p.pos.fit + p.neg.fit >= 5 && shrink(p.pos.fit, p.neg.fit) > shrink(s.pos.fit, s.neg.fit)).slice(0, 2);
  const pb = specOf(s.s, 'playback'), an = specOf(s.s, 'anc');
  const miniBar = (k) => `<div style="display:grid; grid-template-columns:78px 1fr 64px; align-items:center; gap:8px; font-size:12.5px;"><b>${QL[k]}</b>${strip({ pos: s.pos[k], neg: s.neg[k], read: s.read, w: 180, h: 7, labels: false })}<span style="font-family:${F.num}; font-size:12.5px; text-align:right;"><span style="color:${C.negText};">${s.neg[k]}</span> / <span style="color:${C.posText};">${s.pos[k]}</span></span></div>`;
  const specCard = (sp, t, v, k) => `<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:10px 14px; border-radius:16px; background:#fff; box-shadow:${SH.soft}; font-size:12.5px; align-items:center;"><div><div style="color:${C.muted}; font-size:11px;">${t}（仕様）</div><div style="display:flex; gap:6px; align-items:center; margin-top:3px;"><b style="font-size:13.5px;">${v}</b>${provTag(sp)}</div></div><div><div style="color:${C.muted}; font-size:11px;">買った人は</div><div style="margin-top:3px; font-size:13px;"><span style="color:${C.negText};">不満 ${s.neg[k]}</span>・<span style="color:${C.posText};">満足 ${s.pos[k]}</span></div></div></div>`;
  return scr(`
${A(24, 50, `<div style="display:flex; justify-content:space-between; align-items:center; width:342px;">${round('back', '戻る')}<div style="display:flex; gap:8px; align-items:center;">${buyLink()}${addBtn(true)}</div></div>`)}
${A(24, 104, `<div style="display:flex; gap:14px; width:342px; align-items:center;">${tile(earArt(s.s, 72), { w: 84, r: 22 })}<div style="min-width:0;"><div style="font-size:18px; font-weight:900;">${s.name}</div><div style="display:flex; gap:10px; align-items:baseline; margin-top:4px;">${num(yen(s.price), { size: 16 })}<span style="font-size:11.5px; color:${C.ink2};">レビュー ${s.read}件を読んだ</span></div></div></div>`)}
${A(24, 204, `<div style="width:342px; box-sizing:border-box; padding:13px 16px; border-radius:20px; background:${C.tile};"><div style="font-size:12px; color:${C.ink2};">買う前に知っておくこと</div><div style="font-size:15.5px; font-weight:900; line-height:1.5; margin-top:3px;">いちばん多い不満は「${QL[negTop[0]]}」</div><div style="font-size:12.5px; color:${C.ink2}; margin-top:1px;">${s.read}件中 ${num(s.neg[negTop[0]], { size: 13, w: 600 })}件。${s.pos[negTop[0]] >= s.neg[negTop[0]] ? `満足も ${num(s.pos[negTop[0]], { size: 13, w: 600 })}件あり、合う人と合わない人に分かれる` : `満足は ${num(s.pos[negTop[0]], { size: 13, w: 600 })}件`}</div></div>`)}
${A(24, 318, `<div style="width:342px; display:flex; flex-direction:column; gap:9px;"><div style="display:flex; justify-content:space-between;"><b style="font-size:14px;">不満が多いこと</b>${small('不満 / 満足', { size: 11 })}</div>${negTop.map(miniBar).join('')}<div style="font-size:12px; color:${C.ink2};">満足が多いこと：${posTop.map((k) => `${QL[k]} ${s.pos[k]}`).join('・')}</div></div>`)}
${A(24, 462, `<div style="width:342px; display:flex; flex-direction:column; gap:8px;"><b style="font-size:14px;">仕様と、買った人の声</b>${specCard(pb, '連続再生', fmtPlay(pb.displayValue), 'battery')}${specCard(an, 'ノイキャン', an.displayValue, 'anc')}</div>`)}
${A(24, 628, `<div style="width:342px;"><b style="font-size:14px;">同じくらいの値段で、${QL.fit}の不満が少ないもの</b><div style="display:flex; gap:8px; margin-top:8px;">${alt.map((p) => `<div style="flex:1; display:flex; gap:8px; align-items:center; padding:8px 10px; border-radius:16px; background:${C.tile};">${node(earArt(p.s, 30), { size: 36, bg: '#fff' })}<div style="min-width:0;"><b style="font-size:12.5px; white-space:nowrap;">${shortName(p)}</b><div style="font-size:11px; color:${C.ink2};">${yen(p.price)}・不満 ${p.neg.fit}/${p.read}</div></div></div>`).join('')}</div></div>`)}
`, { tab: 1, badge: 3 });
}

// ---------- R05 くらべる（候補3つ） ----------
function compareData() {
  const ps = CAND.map((s) => byShort[s]);
  const both = KEYS.filter((k) => ps.every((p) => p.pos[k] + p.neg[k] >= 2));
  const spread = both.map((k) => { const sc = ps.map((p) => shrink(p.pos[k], p.neg[k])); return { k, sc, range: Math.max(...sc) - Math.min(...sc) }; }).sort((a, b) => b.range - a.range);
  const diff = spread.filter((x) => x.range >= 0.15), same = spread.filter((x) => x.range < 0.15);
  const best = (x) => ps[x.sc.indexOf(Math.max(...x.sc))];
  const groups = [];
  for (const x of diff.slice(0, 2)) { const b = best(x); const g = groups.find((y) => y.p === b); if (g) g.ks.push(x.k); else groups.push({ p: b, ks: [x.k] }); }
  const lead = `${groups.map((g) => `${g.ks.map((k) => QL[k]).join('・')}は <b>${shortName(g.p)}</b>`).join('、')} が好評。${same.length ? `${same.map((x) => QL[x.k]).join('・')}は同じくらい` : ''}`;
  return { ps, diff, same, lead };
}
export function rCompare() {
  const { ps, diff, lead } = compareData();
  const G = `62px repeat(3, 92px)`;
  const specRow = (t, key, fmt = (v) => v) => `<div style="display:grid; grid-template-columns:${G}; align-items:center; min-height:34px; border-top:1px solid ${C.hair}; font-size:12.5px;"><span style="color:${C.muted}; font-size:12px;">${t}</span>${ps.map((p) => { const sp = specOf(p.s, key); return `<span style="text-align:center;">${sp ? `${fmt(sp.displayValue)}${estMark(sp)}` : `<span style="color:${C.faint}; font-size:11.5px;">掲載なし</span>`}</span>`; }).join('')}</div>`;
  const voiceRow = (x) => `<div style="display:grid; grid-template-columns:${G}; align-items:center; padding:8px 0; border-top:1px solid ${C.hair};"><b style="font-size:12.5px;">${QL[x.k]}</b>${ps.map((p) => `<div style="display:flex; flex-direction:column; align-items:center; gap:3px;">${strip({ pos: p.pos[x.k], neg: p.neg[x.k], read: p.read, w: 76, h: 6, labels: false })}<span style="font-family:${F.num}; font-size:11.5px;"><span style="color:${C.negText};">${p.neg[x.k]}</span> / <span style="color:${C.posText};">${p.pos[x.k]}</span></span></div>`).join('')}</div>`;
  return scr(`
${A(24, 50, `<div style="display:flex; align-items:center; gap:12px; width:342px;">${round('back', '戻る')}<div style="flex:1; font-size:17px; font-weight:900;">候補をくらべる</div>${round('share', '共有', { size: 40 })}</div>`)}
${A(24, 104, `<div style="display:grid; grid-template-columns:${G}; width:338px;"><span style="font-size:11px; color:${C.muted}; align-self:end; line-height:1.4;">読んだ<br>レビュー</span>${ps.map((p) => `<div style="display:flex; flex-direction:column; align-items:center; gap:4px;">${node(earArt(p.s, 46), { size: 54, thin: p.read < 30 })}<b style="font-size:12px; white-space:nowrap;">${shortName(p)}</b><span style="font-size:11px; color:${C.muted};">${p.read}件</span></div>`).join('')}</div>`)}
${A(24, 214, `<div style="width:342px; box-sizing:border-box; padding:10px 14px; border-radius:16px; background:${C.tile}; font-size:13px; line-height:1.6;">${lead}</div>`)}
${A(24, 286, `<div style="width:338px;"><div style="display:grid; grid-template-columns:${G}; align-items:center; min-height:34px; font-size:12px;"><span style="color:${C.muted};">値段</span>${ps.map((p) => `<span style="text-align:center; font-family:${F.num}; font-size:13.5px; font-weight:600;">${yen(p.price)}</span>`).join('')}</div>${specRow('ノイキャン', 'anc')}${specRow('連続再生', 'playback', fmtPlay)}${specRow('重さ', 'weight', fmtWeight)}<div style="font-size:11px; color:${C.muted}; margin-top:5px;">「推定」は掲載が無く、AI が推し量った値</div></div>`)}
${A(24, 462, `<div style="width:338px;"><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><b style="font-size:13.5px;">買った人の声（違いが大きい順）</b>${small('不満 / 満足', { size: 11 })}</div>${diff.slice(0, 4).map(voiceRow).join('')}</div>`)}
${A(24, 680, `<div style="display:grid; grid-template-columns:${G}; width:338px; align-items:center;"><span style="font-size:11px; color:${C.muted};">お店で見る</span>${ps.map(() => `<div style="display:flex; justify-content:center;">${buyLink('楽天', { h: 44, fs: 13 })}</div>`).join('')}</div>`)}
`, { tab: 2, badge: 3 });
}

// ---------- PC：くらべる ----------
export function rpCompare() {
  const { ps, diff, same, lead } = compareData();
  const G = `200px repeat(3, 320px) 150px`;
  const specRow = (t, key, fmt = (v) => v) => `<div style="display:grid; grid-template-columns:${G}; min-height:46px; border-top:1px solid ${C.hair}; font-size:14px; align-items:center;"><span style="color:${C.muted};">${t}</span>${ps.map((p) => { const sp = specOf(p.s, key); return `<span style="display:flex; gap:8px; align-items:center;">${sp ? `${fmt(sp.displayValue)} ${provTag(sp)}` : `<span style="color:${C.faint};">掲載なし</span>`}</span>`; }).join('')}<span></span></div>`;
  const vRow = (x) => `<div style="display:grid; grid-template-columns:${G}; padding:11px 0; border-top:1px solid ${C.hair}; align-items:center;"><b style="font-size:14.5px;">${QL[x.k]}</b>${ps.map((p) => `<div style="display:flex; flex-direction:column; gap:5px;">${strip({ pos: p.pos[x.k], neg: p.neg[x.k], read: p.read, w: 260, h: 8, labels: false })}<span style="font-size:12.5px;"><span style="color:${C.negText};">不満 ${p.neg[x.k]}</span>・<span style="color:${C.posText};">満足 ${p.pos[x.k]}</span> <span style="color:${C.muted};">（${p.read}件中）</span></span></div>`).join('')}<span></span></div>`;
  return `<div style="position:relative; width:1440px; height:900px; overflow:hidden; background:#fff; font-family:${F.jp}; color:${C.ink};">
<div style="position:absolute; left:0; top:0; width:1440px; height:72px; box-sizing:border-box; padding:0 48px; display:flex; align-items:center; gap:28px; border-bottom:1px solid ${C.hair};">${mark(18)}${searchPill('商品名を入れて候補に足す', { w: 460, h: 44 })}<span style="flex:1;"></span><span style="display:inline-flex; align-items:center; gap:6px; font-size:13.5px; font-weight:700;">${icon('pair', { size: 18 })}候補 3</span></div>
<div style="position:absolute; left:48px; top:96px; width:1344px;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><span style="font-size:28px; font-weight:900;">候補をくらべる</span><span style="display:inline-flex; align-items:center; gap:8px; font-size:13px; color:${C.ink2};">${icon('share', { size: 16 })}この比較の URL：/vs/${CAND.join('/')}</span></div>
<div style="display:grid; grid-template-columns:${G}; margin-top:18px; align-items:center;"><span style="font-size:12.5px; color:${C.muted};">価格.com などで絞った候補も、<br>商品名で足せます</span>${ps.map((p) => `<div style="display:flex; gap:12px; align-items:center;">${node(earArt(p.s, 58), { size: 68, thin: p.read < 30 })}<div><b style="font-size:15px;">${p.name}</b><div style="font-family:${F.num}; font-size:17px; font-weight:600; margin-top:2px;">${yen(p.price)}</div><div style="font-size:12px; color:${C.muted};">レビュー ${p.read}件を読んだ</div></div></div>`).join('')}<div style="height:68px; border-radius:20px; border:1.5px dashed ${C.line}; display:flex; align-items:center; justify-content:center; gap:6px; font-size:13px; font-weight:700; color:${C.ink2};">${icon('plus', { size: 16 })}候補を足す</div></div>
<div style="margin-top:16px; padding:12px 18px; border-radius:16px; background:${C.tile}; font-size:15px;">${lead}</div>
<div style="margin-top:14px;"><div style="font-size:13px; font-weight:700; color:${C.muted}; margin-bottom:6px;">仕様</div>${specRow('ノイキャン', 'anc')}${specRow('連続再生', 'playback', fmtPlay)}${specRow('重さ', 'weight', fmtWeight)}</div>
<div style="margin-top:16px;"><div style="display:flex; justify-content:space-between; width:1160px; margin-bottom:6px;"><span style="font-size:13px; font-weight:700; color:${C.muted};">買った人の声（違いが大きい順）</span><span style="font-size:12px; color:${C.muted};">AI がレビューを分類した件数</span></div>${diff.slice(0, 4).map(vRow).join('')}</div>
<div style="display:grid; grid-template-columns:${G}; margin-top:16px; align-items:center;"><span style="font-size:12.5px; color:${C.muted};">声を読んでから</span>${ps.map(() => `<div>${buyLink('楽天で見る', { h: 44, fs: 13.5 })}</div>`).join('')}<span></span></div>
</div></div>`;
}

// ---------- R06 図で見る（寄り道）：一覧の右上「図」から ----------
function rMap() {
  const segOld = seg(['線', '一覧'], 0, { h: 28, fs: 12, pad: 9 }), segNew = seg(['一覧', '図で見る'], 1, { h: 28, fs: 12, pad: 9 });
  return dCategory().replace('>完全ワイヤレスイヤホン<', '>ワイヤレスイヤホン<').replace(segOld, segNew).replace(/<nav aria-label="メイン"[\s\S]*?<\/nav>/, tabsR(1, 2));
}

export const PHONE_R = [['RS01-Home', 'R01 ホーム（改訂）', rHome], ['RS02-Category', 'R02 条件で絞る → 気になることで並べる', rCategory], ['RS03-Filter', 'R03 条件を変える（下から出る板）', rFilter], ['RS04-Product', 'R04 商品：買う前の最終チェック', rProduct], ['RS05-Compare', 'R05 候補をくらべる', rCompare], ['RS06-Map', 'R06 図で見る（寄り道）', rMap]];
export const PC_R = [['RD01-Compare', 'PC 候補をくらべる', rpCompare]];
export { FILTER, LIST };

// 統合案の PC 画面（1440×900）
import { C, F, SH, icon, objD, earArt, num, small, tile, pill, qchip, cchip, seg, aiNote, sample, node, strip, coverage, tagCard, searchPill, mark } from './libd.mjs';
import { MAPPED, STATS, AXES, LABEL, POLE, neighbors, byShort, yen, KEYS, Q, MEASURE, WIDE_DIR, WIDE_TOTAL, UNITS, reasonOf, reasonText } from './datad.mjs';
import { ALL } from '../data.mjs';
import { QL, ruler, earItems } from './screensd.mjs';

const W = 1440, H = 900;
const A = (x, y, html, { w = 0, z = 2 } = {}) => `<div style="position:absolute; left:${x}px; top:${y}px;${w ? ` width:${w}px;` : ''} z-index:${z};">${html}</div>`;
const page = (body) => `<div style="position:relative; width:${W}px; height:${H}px; overflow:hidden; background:#fff; font-family:${F.jp}; color:${C.ink};">${body}</div>`;
const card = (inner, { pad = 22, r = 24, bg = '#fff', shadow = SH.soft } = {}) => `<div style="box-sizing:border-box; padding:${pad}px; border-radius:${r}px; background:${bg}; box-shadow:${shadow};">${inner}</div>`;
const bar = () => A(0, 0, `<div style="width:${W}px; height:76px; box-sizing:border-box; padding:0 48px; display:flex; align-items:center; gap:28px; border-bottom:1px solid ${C.hair};">${mark(18)}${searchPill('商品名やカテゴリでさがす', { w: 460, h: 44 })}<span style="flex:1;"></span><span style="font-size:13px; color:${C.ink2};">わたしの条件</span>${cchip('足幅が広い', { on: true, h: 32, fs: 12.5 })}${cchip('敏感肌', { on: true, h: 32, fs: 12.5 })}<span style="display:flex; gap:20px; font-size:13.5px; font-weight:500;"><span>くらべる</span><span>保存</span></span></div>`);

export function pdHome() {
  const tiles = UNITS.map((u) => `<a href="#" style="display:flex; flex-direction:column; justify-content:space-between; height:196px; box-sizing:border-box; padding:14px 16px; border-radius:24px; background:${C.tile}; color:${C.ink}; text-decoration:none;"><span style="display:flex; justify-content:center; align-items:center; height:104px; opacity:${u.state === 'todo' ? 0.55 : 1};">${objD(u.obj, { size: 100 })}</span><span><b style="display:block; font-size:15px;">${u.name}</b><span style="display:block; font-size:12px; color:${u.state === 'real' ? C.ink2 : C.muted}; margin-top:3px;">${u.state === 'real' ? `レビュー ${STATS.read}件を読みました` : u.state === 'sample' ? '見本で試し読み' : 'これから読みます'}</span></span></a>`).join('');
  const soundAll = ALL.filter((p) => p.pos.sound + p.neg.sound > 0);
  const I = MEASURE.irritation;
  const facts = [
    ['イヤホン', `音質は${soundAll.length}商品のうち${soundAll.filter((p) => p.pos.sound > p.neg.sound).length}商品で満足のほうが多い。差が出るのは、つけ心地とノイキャン`, false],
    ['化粧水', `敏感肌と書いた人は、刺激の不満が多め（${I.sensitive.n}件中${I.sensitive.neg}件。全体は${I.all.n}件中${I.all.neg}件）`, true],
    ['ランニングシューズ', `足幅が広いと書いた人は「小さめ」が多め（${WIDE_DIR.reduce((a, b) => a + b, 0)}件中${WIDE_DIR[0]}件）`, true],
  ].map(([t, s, smp]) => `<div style="padding:14px 0; border-top:1px solid ${C.hair};"><div style="display:flex; justify-content:space-between; align-items:center;"><b style="font-size:14px;">${t}</b>${smp ? sample('見本') : ''}</div><div style="font-size:13px; color:${C.ink2}; line-height:1.7; margin-top:4px;">${s}</div></div>`).join('');
  return page(`${bar()}
${A(48, 116, `<div style="font-size:38px; font-weight:900; line-height:1.35;">買った人の声で、自分に合うかを見る</div><div style="font-size:15px; color:${C.ink2}; margin-top:10px;">順位は付けません。何人が何を書いたかを、そのまま並べます。</div>`)}
${A(48, 262, `<div style="display:grid; grid-template-columns:repeat(5, 184px); gap:14px;">${tiles}</div>`)}
${A(1048, 116, `<div style="width:344px;">${card(`<div style="font-size:17px; font-weight:900;">読んでわかったこと</div><div style="font-size:12px; color:${C.muted}; margin:2px 0 6px;">件数から自動で作る文。AI の要約ではありません</div>${facts}`, { pad: 22 })}</div>`)}
${A(1048, 610, `<div style="width:344px;">${card(`<div style="font-size:14px; font-weight:700;">いま読めている量</div><div style="margin-top:12px;">${coverage(STATS.total, STATS.analysed, { cell: 7, gap: 3, cols: 30 })}</div><div style="font-size:12px; color:${C.ink2}; margin-top:10px; line-height:1.6;">イヤホン ${STATS.total}商品のうち ${STATS.analysed}商品。ほかの9カテゴリは、これから読みます</div>`, { pad: 20, bg: C.tile, shadow: 'none' })}</div>`)}
`);
}

export function pdCategory({ k = 'fit' } = {}) {
  const s = byShort['821de2ea'];
  const nb = neighbors(s, 3);
  const off = MAPPED.filter((p) => !(p.pos[k] + p.neg[k]));
  const qs = AXES.filter((a) => a.offerable).map((a) => `<div style="display:flex; justify-content:space-between; align-items:center; height:44px; padding:0 16px; border-radius:22px; background:${a.key === k ? C.ink : 'transparent'}; color:${a.key === k ? '#fff' : C.ink}; font-size:14.5px; font-weight:${a.key === k ? 700 : 500};"><span>${QL[a.key]}</span><span style="font-size:12px; opacity:.7;">${a.products}商品</span></div>`).join('');
  const flat = AXES.filter((a) => !a.offerable).map((a) => `<div style="display:flex; justify-content:space-between; height:30px; align-items:center; padding:0 16px; font-size:13px; color:${C.muted};"><span>${QL[a.key]}</span><span style="font-size:12px;">${a.products < 8 ? 'まだ少ない' : a.separation < 0.35 ? 'みんな同じ' : 'まだ少ない'}</span></div>`).join('');
  return page(`${bar()}
${A(48, 104, `<div style="width:300px;"><div style="font-size:26px; font-weight:900;">完全ワイヤレスイヤホン</div><div style="font-size:12.5px; color:${C.ink2}; margin-top:8px; line-height:1.7;">${STATS.total}商品のうち ${STATS.analysed}商品・レビュー ${STATS.read}件を読みました</div><div style="margin-top:8px;">${coverage(STATS.total, STATS.analysed, { cell: 5, gap: 2, cols: 40 })}</div></div>`)}
${A(40, 262, `<div style="width:308px;"><div style="font-size:15px; font-weight:900; margin:0 16px 10px;">どこが気になりますか？</div>${qs}<div style="font-size:12px; color:${C.muted}; margin:14px 16px 4px;">並べても差が出ないもの</div>${flat}</div>`)}
${A(376, 104, `<div style="width:700px;"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;"><span style="font-size:20px; font-weight:900;">${QL[k]}は、どうでしたか</span>${seg(['線', '一覧'], 0, { h: 32 })}</div>${ruler(earItems(k), { w: 700, h: 470, lo: POLE[k].neg, hi: POLE[k].pos, sel: s.s })}<div style="display:flex; justify-content:space-between; margin-top:12px; font-size:12.5px; color:${C.ink2};"><span>右ほど「${POLE[k].pos}」と書いた人が多い。丸の大きさ＝書いた人の数。点線＝読めたレビューが少ない</span></div><div style="display:flex; align-items:center; gap:8px; margin-top:16px; font-size:12.5px; color:${C.ink2};">${QL[k]}にふれていない ${off.length}商品 ${off.map((p) => node(earArt(p.s, 26), { size: 30 })).join('')}<span style="margin-left:auto; color:${C.muted};">まだ読めていない ${STATS.total - STATS.analysed}商品 →</span></div></div>`)}
${A(1108, 104, `<div style="width:284px; display:flex; flex-direction:column; gap:14px;">${tagCard({ img: earArt(s.s, 116), name: s.name, read: s.read, total: s.reviewCount, lines: [{ kind: 'neg', t: QL[k], n: s.neg[k] }, { kind: 'pos', t: QL[k], n: s.pos[k] }], w: 284, imgH: 132, sel: true })}${card(`<div style="font-size:14px; font-weight:700; margin-bottom:6px;">これに似たもの</div>${nb.map((n) => `<div style="display:flex; gap:10px; align-items:center; padding:7px 0; border-top:1px solid ${C.hair};">${node(earArt(n.p.s, 30), { size: 34, thin: n.p.read < 30 })}<div style="min-width:0;"><b style="font-size:12.5px;">${n.p.name}</b><div style="font-size:11px; color:${C.ink2}; line-height:1.45;">${reasonText(reasonOf(n))}</div></div></div>`).join('')}`, { pad: 16 })}</div>`)}
`);
}

export function pdProduct() {
  const s = byShort['821de2ea'], q = Q['821de2ea'];
  const rows = KEYS.filter((k) => s.pos[k] + s.neg[k] >= 2).sort((a, b) => s.neg[b] - s.neg[a]);
  const worst = rows[0], best = KEYS.slice().sort((a, b) => s.pos[b] - s.pos[a])[0];
  const nb = neighbors(s, 4);
  const quote = (k, side) => `<div style="padding:10px 0; border-top:1px solid ${C.hair};"><div style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700;"><span style="width:8px; height:8px; border-radius:2px; background:${side === 'neg' ? C.neg : C.pos};"></span>${QL[k]}・${side === 'neg' ? '不満' : '満足'}</div><div style="font-size:13px; line-height:1.65; margin-top:4px;">「${q[k][side]}」</div></div>`;
  return page(`${bar()}
${A(48, 104, `<div style="width:400px;"><div style="width:400px; height:300px; border-radius:30px; background:${C.tile}; display:flex; align-items:center; justify-content:center;">${earArt(s.s, 250)}</div><div style="font-size:28px; font-weight:900; margin-top:20px;">${s.name}</div><div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:6px;"><span style="font-size:13px; color:${C.ink2};">楽天のレビュー ${s.reviewCount}件のうち ${s.read}件を読みました</span>${num(yen(s.price), { size: 20 })}</div><div style="margin-top:16px; padding:14px 16px; border-radius:20px; background:${C.tile}; font-size:14px; line-height:1.75;">不満がいちばん多いのは <b style="color:${C.negText};">${QL[worst]}</b>（${s.neg[worst]}件）。満足がいちばん多いのは <b style="color:${C.posText};">${QL[best]}</b>（${s.pos[best]}件）。</div></div>`)}
${A(488, 104, `<div style="width:520px;">${card(`<div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:16px;"><span style="font-size:20px; font-weight:900;">買った人の声</span>${aiNote()}</div><div style="display:flex; flex-direction:column; gap:16px;">${rows.slice(0, 8).map((k) => strip({ pos: s.pos[k], neg: s.neg[k], read: s.read, w: 476, h: 9, name: QL[k], fs: 13.5 })).join('')}</div><div style="margin-top:22px;">${pill('楽天で見る', { h: 48, fs: 15, full: true })}</div><div style="font-size:11.5px; color:${C.muted}; margin-top:8px; text-align:center;">購入の案内は、声を読んだあとに1か所だけ</div>`, { pad: 22 })}</div>`)}
${A(1040, 104, `<div style="width:352px; display:flex; flex-direction:column; gap:16px;">${card(`<div style="font-size:15px; font-weight:900; margin-bottom:6px;">これに似たもの</div>${nb.map((n) => `<div style="display:flex; gap:10px; align-items:center; padding:8px 0; border-top:1px solid ${C.hair};">${node(earArt(n.p.s, 34), { size: 40, thin: n.p.read < 30 })}<div style="min-width:0;"><b style="font-size:13px;">${n.p.name}</b><div style="font-size:11.5px; color:${C.ink2}; line-height:1.45;">${reasonText(reasonOf(n))}</div></div></div>`).join('')}<div style="text-align:right; font-size:12.5px; font-weight:700; margin-top:8px;">これを真ん中にして見る →</div>`, { pad: 18 })}${card(`<div style="display:flex; justify-content:space-between; align-items:baseline;"><span style="font-size:15px; font-weight:900;">レビューから短く</span>${small('原文と照合済み', { size: 11 })}</div>${quote('fit', 'neg')}${quote('fit', 'pos')}`, { pad: 18 })}</div>`)}
`);
}

export const PC_D = [['DD01-Home', 'PC ホーム', pdHome], ['DD02-Category', 'PC カテゴリ（線で見る）', () => pdCategory()], ['DD03-Product', 'PC 商品', pdProduct]];

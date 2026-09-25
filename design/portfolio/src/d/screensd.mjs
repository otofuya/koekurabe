// 統合案のスマホ画面（390×844）
// イヤホン＝data/ の実データ。化粧水・シューズ・コーヒー＝単語の規則で数えた見本。ホームのカテゴリの状態は今の実際（読めたのはイヤホンだけ）
import { C, F, SH, icon, objD, earArt, shoeArt, bottleArt, bagArt, num, small, tile, pill, qchip, cchip, seg, aiNote, sample, node, strip, just, again, coverage, tagCard, tabs, status, searchPill, mark, factTag, aiTag, fieldBar } from './libd.mjs';
import { MAPPED, STATS, AXES, SHORT, LABEL, POLE, neighbors, byShort, yen, KEYS, Q, SHOES, SKIN, COFFEE, MEASURE, ALL_DIR, WIDE_DIR, WIDE_TOTAL, LIGHT, shrink, dirScore, UNITS, egoLayout, reasonOf, reasonText, reasonChip, QL, FIELDS } from './datad.mjs';
import { swarm } from '../c/screensc.mjs';

const W = 390, H = 844;
export { QL };
const scr = (body, { tab = -1, bg = '#fff' } = {}) => `<div style="position:relative; width:${W}px; height:${H}px; overflow:hidden; background:${bg}; font-family:${F.jp}; color:${C.ink};">${status()}${body}${tab >= 0 ? tabs(tab) : ''}</div>`;
const A = (x, y, html, { w = 0, z = 2 } = {}) => `<div style="position:absolute; left:${x}px; top:${y}px;${w ? ` width:${w}px;` : ''} z-index:${z};">${html}</div>`;
const round = (ic, lab, { size = 40, bg = C.tile } = {}) => `<button type="button" aria-label="${lab}" style="width:${size}px; height:${size}px; border-radius:50%; border:none; background:${bg}; display:flex; align-items:center; justify-content:center; padding:0; color:${C.ink}; flex-shrink:0;">${icon(ic, { size: Math.round(size * 0.45) })}</button>`;
const top = (title, sub = '', right = '') => A(24, 50, `<div style="display:flex; align-items:center; gap:12px; width:342px;">${round('back', '戻る')}<div style="flex:1; min-width:0;"><div style="font-size:17px; font-weight:900; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${title}</div>${sub ? `<div style="font-size:11px; color:${C.muted}; margin-top:1px; white-space:nowrap;">${sub}</div>` : ''}</div>${right}</div>`);
export const unitImg = (u, size) => objD(u.obj, { size });
const ear = (s, size) => earArt(s, size);
const thin = (p) => p.read < 30;

// ものさし（1本の軸）。items：{ id, img(size), score, n, thin }
export function ruler(items, { w = 342, h = 300, lo = '', hi = '', sel = null, bg = C.map, hint = false, neutral = false } = {}) {
  const cl = neutral ? C.ink2 : C.negText, cr = neutral ? C.ink2 : C.posText, dl = neutral ? C.side : C.neg, dr = neutral ? C.side : C.pos;
  const pts = swarm(items.map((i) => ({ ...i, size: Math.round(32 + 22 * Math.sqrt(Math.min(i.n, 50) / 50)) })), { w, h: h - 44, pad: 22 });
  const nodes = pts.map((q) => `<span style="position:absolute; left:${Math.round(q.x - q.size / 2)}px; top:${Math.round(q.y - q.size / 2)}px;">${node(q.img(Math.round(q.size * 0.9)), { size: q.size, thin: q.thin, sel: q.id === sel })}</span>`).join('');
  return `<div style="position:relative; width:${w}px; height:${h}px; border-radius:24px; background:${bg}; overflow:hidden;"><div style="position:absolute; left:16px; right:16px; top:${(h - 44) / 2}px; border-top:1.5px solid ${C.hair};"></div><div style="position:absolute; left:${w / 2}px; top:14px; height:${h - 72}px; border-left:1px dashed ${C.line};"></div>${nodes}<div style="position:absolute; left:16px; right:16px; bottom:14px; display:flex; justify-content:space-between; align-items:center; font-size:12.5px; font-weight:700; white-space:nowrap;"><span style="display:flex; align-items:center; gap:6px; color:${cl};"><span style="width:10px; height:10px; border-radius:50%; background:${dl};"></span>${lo}</span>${hint ? `<span style="font-size:11px; color:${C.muted}; font-weight:500;">真ん中＝意見が割れている</span>` : ''}<span style="display:flex; align-items:center; gap:6px; color:${cr};">${hi}<span style="width:10px; height:10px; border-radius:50%; background:${dr};"></span></span></div></div>`;
}
export const earItems = (k) => MAPPED.filter((p) => p.pos[k] + p.neg[k] > 0).map((p) => ({ id: p.s, img: (sz) => ear(p.s, sz), score: shrink(p.pos[k], p.neg[k]), n: p.pos[k] + p.neg[k], thin: thin(p) }));
const offerable = () => AXES.filter((a) => a.offerable).map((a) => a.key);

// ---------- ホーム ----------
export function dHome() {
  const tiles = UNITS.slice(0, 6).map((u) => {
    const st = u.state === 'real' ? `レビュー ${num(STATS.read, { size: 12, w: 600 })} 件` : u.state === 'sample' ? '見本で試し読み' : 'これから読みます';
    return `<a href="#" style="display:flex; flex-direction:column; justify-content:space-between; width:165px; height:150px; box-sizing:border-box; padding:12px 14px; border-radius:22px; background:${C.tile}; color:${C.ink}; text-decoration:none;"><span style="display:flex; justify-content:center; height:80px; align-items:center; opacity:${u.state === 'todo' ? 0.55 : 1};">${unitImg(u, 80)}</span><span><b style="display:block; font-size:14px; line-height:1.3;">${u.name}</b><span style="display:block; font-size:11px; color:${u.state === 'real' ? C.ink2 : C.muted}; margin-top:2px;">${st}</span></span></a>`;
  }).join('');
  return scr(`
${A(24, 56, `<div style="display:flex; justify-content:space-between; align-items:center; width:342px;">${mark(17)}${round('bell', 'お知らせ')}</div>`)}
${A(24, 108, `<div style="font-size:25px; font-weight:900; line-height:1.4;">買った人の声で、<br>自分に合うかを見る</div>`)}
${A(24, 196, searchPill())}
${A(24, 264, `<div style="width:342px;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><b style="font-size:14px;">わたしの条件</b>${small('この端末の中だけ', { size: 11 })}</div><div style="display:flex; gap:8px; margin-top:10px;">${cchip('足幅が広い', { on: true })}${cchip('敏感肌', { on: true })}<button type="button" style="height:34px; padding:0 14px; border-radius:17px; border:1px dashed ${C.line}; background:#fff; font-family:${F.jp}; font-size:13px; color:${C.ink2};">＋ 足す</button></div></div>`)}
${A(24, 356, `<div style="display:flex; justify-content:space-between; align-items:baseline; width:342px;"><b style="font-size:14px;">10のカテゴリ</b>${small('すべて見る', { size: 12 })}</div>`)}
${A(24, 386, `<div style="display:grid; grid-template-columns:repeat(2, 165px); gap:12px;">${tiles}</div>`)}
`, { tab: 0 });
}

// ---------- カテゴリ（線で見る・実データ） ----------
export function dCategory({ k = 'fit', sel = '821de2ea', coach = false } = {}) {
  const on = MAPPED.filter((p) => p.pos[k] + p.neg[k] > 0), off = MAPPED.filter((p) => !(p.pos[k] + p.neg[k]));
  const s = byShort[sel];
  const chips = offerable().map((x) => qchip(QL[x], { on: x === k })).join('') + qchip('音質はみんな満足', { flat: true, fs: 12.5 });
  const coachLayer = coach ? `<div style="position:absolute; inset:0; background:rgba(20,20,20,.55); z-index:50;"></div>
<div style="position:absolute; left:24px; top:236px; width:342px; height:300px; border-radius:24px; box-shadow:0 0 0 4px #fff; z-index:51;"></div>
<div style="position:absolute; left:24px; top:548px; width:342px; box-sizing:border-box; padding:16px 18px; border-radius:22px; background:#fff; z-index:52;"><div style="font-size:16px; font-weight:900;">はじめての方へ</div><div style="display:flex; flex-direction:column; gap:8px; margin-top:10px; font-size:13.5px; line-height:1.55;"><div style="display:flex; gap:8px;"><span style="width:10px; height:10px; border-radius:50%; background:${C.pos}; margin-top:6px; flex-shrink:0;"></span>右ほど「つけ心地が良い」と書いた人が多い</div><div style="display:flex; gap:8px;"><span style="width:10px; height:10px; border-radius:50%; background:${C.neg}; margin-top:6px; flex-shrink:0;"></span>左ほど「合わない」と書いた人が多い</div><div style="display:flex; gap:8px;"><span style="width:10px; height:10px; border-radius:50%; border:1.5px dashed ${C.faint}; margin-top:5px; flex-shrink:0; box-sizing:border-box;"></span>点線の丸は、読めたレビューがまだ少ない</div></div><div style="margin-top:14px;">${pill('わかった', { h: 44, fs: 14, full: true })}</div></div>` : '';
  return scr(`
${top('完全ワイヤレスイヤホン', '', seg(['線', '一覧'], 0, { h: 28, fs: 12, pad: 9 }))}
${A(24, 100, `<div style="width:342px; display:flex; flex-direction:column; gap:6px;"><div style="font-size:12px; color:${C.ink2};">${STATS.total}商品のうち ${num(STATS.analysed, { size: 12, w: 600 })} 商品・レビュー ${num(STATS.read, { size: 12, w: 600 })} 件を読みました</div>${coverage(STATS.total, STATS.analysed, { cell: 5, gap: 2, cols: 49 })}</div>`)}
${A(24, 152, `<div style="width:342px;"><div style="font-size:15px; font-weight:900; margin-bottom:10px;">どこが気になりますか？</div><div style="display:flex; gap:8px; width:366px; overflow:hidden;">${chips}</div></div>`)}
${A(24, 236, ruler(earItems(k), { lo: POLE[k].neg, hi: POLE[k].pos, sel }))}
${A(24, 548, `<div style="width:342px; box-sizing:border-box; padding:12px 14px; border-radius:20px; background:#fff; box-shadow:${SH.soft}; display:flex; gap:12px; align-items:center;">${node(ear(s.s, 50), { size: 54 })}<div style="flex:1; min-width:0;">${strip({ pos: s.pos[k], neg: s.neg[k], read: s.read, w: 230, h: 7, name: s.name, fs: 12.5 })}</div></div>`)}
${A(24, 646, `<div style="width:342px; font-size:11.5px; color:${C.muted}; margin-bottom:8px;">真ん中＝意見が割れている、または読めたレビューが少ない</div>`)}
${A(24, 676, `<div style="display:flex; align-items:center; gap:6px; width:342px;">${small(`${QL[k]}にふれていない ${off.length}商品`, { size: 12, color: C.ink2 })}${off.map((p) => node(ear(p.s, 24), { size: 28 })).join('')}</div>`)}
${coachLayer}
`, { tab: 1 });
}

// ---------- カテゴリ（札で見る） ----------
export function dCategoryTags() {
  const list = [...MAPPED].sort((a, b) => b.read - a.read).slice(0, 4);
  const card = (p) => { const neg = KEYS.filter((k) => p.neg[k]).sort((a, b) => p.neg[b] - p.neg[a])[0]; const pos = KEYS.filter((k) => p.pos[k]).sort((a, b) => p.pos[b] - p.pos[a])[0]; return tagCard({ img: ear(p.s, 88), name: p.name, read: p.read, lines: [neg ? { kind: 'neg', t: QL[neg], n: p.neg[neg] } : null, pos ? { kind: 'pos', t: QL[pos], n: p.pos[pos] } : null].filter(Boolean), w: 165, imgH: 92 }); };
  return scr(`
${top('完全ワイヤレスイヤホン', '', seg(['線', '一覧'], 1, { h: 28, fs: 12, pad: 9 }))}
${A(24, 104, `<div style="display:flex; justify-content:space-between; align-items:center; width:342px;">${small('読めたレビューの多い順（順位ではありません）', { size: 12, color: C.ink2 })}</div>`)}
${A(24, 136, `<div style="display:grid; grid-template-columns:repeat(2, 165px); gap:12px;">${list.map(card).join('')}</div>`)}
`, { tab: 1 });
}

// ---------- カテゴリ＋わたしの条件（見本：シューズ） ----------
export function dCategoryCond({ wide = true } = {}) {
  const items = SHOES.map((s) => { const c = wide ? s.wideDir : s.dir; const n = c[0] + c[1] + c[2]; return { id: s.id, img: (sz) => shoeArt(s, sz), score: dirScore(c) ?? 0, n, thin: n < 5 }; });
  return scr(`
${top('ランニングシューズ', '', sample())}
${A(24, 104, `<div style="width:342px; box-sizing:border-box; padding:12px 14px; border-radius:20px; background:${wide ? C.ink : C.tile}; color:${wide ? '#fff' : C.ink}; display:flex; align-items:center; gap:10px;">${icon('person', { size: 20 })}<div style="flex:1;"><div style="font-size:13.5px; font-weight:700;">わたしと同じ「足幅が広い」人だけ</div><div style="font-size:11.5px; opacity:.75; margin-top:2px;">${wide ? `${WIDE_TOTAL}件で数えなおしています（全体 ${MEASURE.cats[1].n}件）` : 'オンにすると、同じ条件を書いた人だけで数えます'}</div></div><span style="width:44px; height:26px; border-radius:13px; background:${wide ? '#fff' : C.line}; position:relative;"><span style="position:absolute; top:3px; ${wide ? 'right:3px' : 'left:3px'}; width:20px; height:20px; border-radius:50%; background:${wide ? C.ink : '#fff'};"></span></span></div>`)}
${A(24, 184, `<div style="width:342px;"><div style="font-size:15px; font-weight:900; margin-bottom:10px;">サイズは合いますか？</div><div style="display:flex; gap:8px;">${qchip('サイズ感', { on: true })}${qchip('クッション')}${qchip('軽さはみんな満足', { flat: true, fs: 12.5 })}</div></div>`)}
${A(24, 268, `<div style="width:342px; box-sizing:border-box; padding:12px 14px; border-radius:20px; background:#fff; box-shadow:${SH.soft};">${just({ counts: wide ? WIDE_DIR : ALL_DIR, w: 314, h: 8, name: wide ? '足幅が広い人のサイズ感' : 'みんなのサイズ感', read: wide ? WIDE_TOTAL : MEASURE.cats[1].n })}</div>`)}
${A(24, 372, ruler(items, { lo: '小さめ', hi: '大きめ', h: 270, neutral: true }))}
${A(24, 652, `<div style="width:342px; font-size:11.5px; color:${C.muted}; line-height:1.6;">真ん中＝「ちょうど」が多い。サイズは良し悪しではないので、青と赤を使わない。点線＝同じ条件の声がまだ少ない</div>`)}
`, { tab: 1 });
}

// ---------- 読めていないカテゴリ ----------
export function dTodo() {
  const u = UNITS.find((x) => x.key === 'shampoo');
  const cells = Array.from({ length: 48 }, () => `<span style="width:36px; height:36px; border-radius:10px; background:${C.tile};"></span>`).join('');
  return scr(`
${top('シャンプー', '')}
${A(24, 106, `<div style="width:342px; display:flex; gap:14px; align-items:center;">${tile(unitImg(u, 64), { w: 76, r: 20 })}<div><div style="font-size:17px; font-weight:900; line-height:1.45;">これから読みます</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.6; margin-top:2px;">買った人の声を読めた商品から、ここに並びます。順位も「おすすめ」も付けません。</div></div></div>`)}
${A(24, 214, `<div style="display:grid; grid-template-columns:repeat(8, 36px); gap:7px; width:342px;">${cells}</div>`)}
${A(24, 480, `<div style="width:342px; font-size:12px; color:${C.muted};">1マス＝1商品。読めた商品から絵が入ります</div>`)}
${A(24, 520, `<div style="width:342px; box-sizing:border-box; padding:16px; border-radius:20px; background:#fff; box-shadow:${SH.soft};"><div style="font-size:14px; font-weight:700;">先に読んでほしいですか？</div><div style="font-size:12.5px; color:${C.ink2}; margin-top:4px; line-height:1.6;">押された数は、読む順番を決めるときに使います</div><div style="margin-top:12px;">${pill('先に読んでほしい', { kind: 'line', h: 44, fs: 14, full: true })}</div></div>`)}
`, { tab: 1 });
}

// ---------- 商品 ----------
export function dProduct() {
  const s = byShort['821de2ea'];
  const rows = KEYS.filter((k) => s.pos[k] + s.neg[k] >= 2).sort((a, b) => s.neg[b] - s.neg[a]).slice(0, 4);
  const worst = rows[0], best = KEYS.slice().sort((a, b) => s.pos[b] - s.pos[a])[0];
  return scr(`
${A(24, 50, `<div style="display:flex; justify-content:space-between; width:342px;">${round('back', '戻る')}<span style="display:flex; gap:8px;">${round('pair', '並べる')}${round('save', '保存')}</span></div>`)}
${A(24, 100, `<div style="width:342px; height:170px; border-radius:26px; background:${C.tile}; display:flex; align-items:center; justify-content:center;">${ear(s.s, 160)}</div>`)}
${A(24, 284, `<div style="width:342px;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><span style="font-size:21px; font-weight:900;">${s.name}</span>${num(yen(s.price), { size: 17 })}</div><div style="font-size:12px; color:${C.ink2}; margin-top:4px;">楽天のレビュー ${s.reviewCount}件のうち ${num(s.read, { size: 12, w: 600 })} 件を読みました</div></div>`)}
${A(24, 348, `<div style="width:342px; box-sizing:border-box; padding:12px 14px; border-radius:18px; background:${C.tile}; font-size:13px; line-height:1.7;">不満がいちばん多いのは <b style="color:${C.negText};">${QL[worst]}</b>（${s.neg[worst]}件）。満足がいちばん多いのは <b style="color:${C.posText};">${QL[best]}</b>（${s.pos[best]}件）。</div>`)}
${A(24, 432, `<div style="width:342px; display:flex; flex-direction:column; gap:14px;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><b style="font-size:15px;">買った人の声</b>${aiNote()}</div>${rows.map((k) => strip({ pos: s.pos[k], neg: s.neg[k], read: s.read, w: 342, h: 8, name: QL[k] })).join('')}</div>`)}
`, { tab: 1 });
}

export function dProduct2() {
  const s = byShort['821de2ea'], q = Q['821de2ea'];
  const nb = neighbors(s, 3);
  const quote = (k, side) => `<div style="padding:10px 0; border-bottom:1px solid ${C.hair};"><div style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700;"><span style="width:8px; height:8px; border-radius:2px; background:${side === 'neg' ? C.neg : C.pos};"></span>${QL[k]}・${side === 'neg' ? '不満' : '満足'}</div><div style="font-size:13px; line-height:1.6; margin-top:4px;">「${q[k][side]}」</div></div>`;
  return scr(`
${A(24, 56, `<div style="font-size:12px; color:${C.muted};">Sony WF-C710N（つづき）</div>`)}
${A(24, 84, `<div style="width:342px;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><b style="font-size:15px;">レビューから短く</b>${small('原文と照合済み', { size: 11 })}</div>${quote('fit', 'neg')}${quote('fit', 'pos')}<div style="font-size:12px; color:${C.ink2}; margin-top:8px; text-decoration:underline;">楽天のレビューで全文を読む</div></div>`)}
${A(24, 330, `<div style="width:342px;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><b style="font-size:15px;">これに似たもの</b>${small('声の出方が近い', { size: 11 })}</div><div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">${nb.map((n) => `<div style="display:flex; gap:12px; align-items:center; padding:8px 10px; border-radius:18px; background:${C.tile};">${node(ear(n.p.s, 38), { size: 44, thin: thin(n.p) })}<div style="min-width:0;"><b style="font-size:13px;">${n.p.name}</b><div style="font-size:11.5px; color:${C.ink2}; line-height:1.5; margin-top:1px;">${reasonText(reasonOf(n))}</div></div></div>`).join('')}</div><div style="margin-top:8px; text-align:right; font-size:12.5px; font-weight:700;">これを真ん中にして見る →</div></div>`)}
${A(24, 676, `<div style="width:342px;">${pill('楽天で見る', { h: 50, fs: 15, full: true })}<div style="font-size:11px; color:${C.muted}; text-align:center; margin-top:6px;">購入の案内は、声を読んだあとに1か所だけ</div></div>`)}
`, { tab: 1 });
}

// ---------- 似ているもの（A の起点） ----------
export function dSimilar(anchor = '821de2ea') {
  const { pos, nb } = egoLayout(anchor, { w: 342, h: 380 });
  const a = byShort[anchor];
  const lines = nb.map((n) => { const p = pos[n.p.s], q = pos[anchor]; return `<path d="M${q.x.toFixed(1)} ${q.y.toFixed(1)} L${p.x.toFixed(1)} ${p.y.toFixed(1)}" stroke="#C9C9C5" stroke-width="1.4" stroke-dasharray="2 5" stroke-linecap="round"></path>`; }).join('');
  const nodes = Object.entries(pos).map(([sid, p]) => `<span style="position:absolute; left:${Math.round(p.x - p.size / 2)}px; top:${Math.round(p.y - p.size / 2)}px; display:flex; flex-direction:column; align-items:center; gap:4px;">${node(ear(sid, Math.round(p.size * 0.9)), { size: p.size, thin: !p.anchor && thin(byShort[sid]), sel: !!p.anchor })}${p.anchor ? '' : `<span style="font-size:11px; font-weight:700; background:#fff; padding:2px 7px; border-radius:9px; box-shadow:${SH.soft}; white-space:nowrap;">${reasonChip(p.r)}</span>`}</span>`).join('');
  return scr(`
${top('これに似たもの', `真ん中：${a.name}`)}
${A(24, 104, `<div style="position:relative; width:342px; height:380px; border-radius:26px; background:${C.map}; overflow:hidden;"><svg width="342" height="380" aria-hidden="true" style="position:absolute; left:0; top:0;">${lines}</svg>${nodes}</div>`)}
${A(24, 494, `<div style="width:342px; display:flex; justify-content:space-between; font-size:11.5px; color:${C.ink2};"><span>近いほど、声の出方が似ている</span><span>↑ こちらが好評 ・ ↓ こちらが不満寄り</span></div>`)}
${A(24, 526, `<div style="width:342px; display:flex; flex-direction:column; gap:8px;">${nb.slice(0, 3).map((n) => `<div style="display:flex; gap:10px; align-items:center; padding:8px 12px; border-radius:16px; background:#fff; box-shadow:${SH.soft};">${node(ear(n.p.s, 30), { size: 34, thin: thin(n.p) })}<div style="min-width:0;"><b style="font-size:12.5px;">${n.p.name}</b><div style="font-size:11px; color:${C.ink2};">${reasonText(reasonOf(n))}</div></div></div>`).join('')}</div>`)}
`, { tab: 1 });
}

// ---------- くらべる ----------
export function dCompare() {
  const a = byShort['821de2ea'], b = byShort['637e1dd6'];
  const both = KEYS.filter((k) => a.pos[k] + a.neg[k] >= 2 && b.pos[k] + b.neg[k] >= 2);
  const d = both.map((k) => ({ k, d: shrink(a.pos[k], a.neg[k]) - shrink(b.pos[k], b.neg[k]) }));
  const diff = d.filter((x) => Math.abs(x.d) >= 0.15).sort((x, y) => Math.abs(y.d) - Math.abs(x.d)).slice(0, 5);
  const same = d.filter((x) => Math.abs(x.d) < 0.15);
  const row = (k) => `<div style="display:grid; grid-template-columns:128px 86px 128px; align-items:center;"><div style="display:flex; flex-direction:column; align-items:flex-end; gap:3px;">${strip({ pos: a.pos[k], neg: a.neg[k], read: a.read, w: 120, h: 7, labels: false })}<span style="font-family:${F.num}; font-size:11px;"><span style="color:${C.negText};">${a.neg[k]}</span> / <span style="color:${C.posText};">${a.pos[k]}</span></span></div><div style="text-align:center; font-size:12.5px; font-weight:700;">${QL[k]}</div><div style="display:flex; flex-direction:column; gap:3px;">${strip({ pos: b.pos[k], neg: b.neg[k], read: b.read, w: 120, h: 7, labels: false })}<span style="font-family:${F.num}; font-size:11px;"><span style="color:${C.negText};">${b.neg[k]}</span> / <span style="color:${C.posText};">${b.pos[k]}</span></span></div></div>`;
  const hd = (p) => `<div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">${tile(ear(p.s, 76), { w: 110, h: 84, r: 20 })}<b style="font-size:13px; text-align:center;">${p.name}</b><span style="font-size:11px; color:${C.muted};">${p.read}件を読んだ</span></div>`;
  return scr(`
${top('くらべる', '違うところから先に')}
${A(24, 104, `<div style="display:flex; gap:12px; width:342px;">${hd(a)}${hd(b)}</div>`)}
${A(24, 262, `<div style="width:342px; display:flex; flex-direction:column; gap:12px;"><div style="display:flex; justify-content:space-between;"><b style="font-size:15px;">違うところ</b>${small('不満 / 満足', { size: 11 })}</div>${diff.map((x) => row(x.k)).join('')}</div>`)}
${A(24, 300 + diff.length * 44, `<div style="width:342px; font-size:12.5px; color:${C.ink2}; line-height:1.7;"><b style="color:${C.ink};">同じくらい：</b>${same.map((x) => QL[x.k]).join('・') || 'なし'}</div>`)}
`, { tab: 2 });
}

// ---------- わたし ----------
export function dMe() {
  const saved = [byShort['821de2ea'], byShort['d5f259d1']];
  const cf = COFFEE[2];
  return scr(`
${A(24, 56, `<div style="font-size:22px; font-weight:900;">わたし</div>`)}
${A(24, 96, `<div style="width:342px;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><b style="font-size:14px;">わたしの条件</b>${small('この端末の中だけ・登録なし', { size: 11 })}</div><div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">${cchip('40代', { on: true, h: 32, fs: 12.5 })}${cchip('女性', { on: true, h: 32, fs: 12.5 })}${cchip('足幅が広い', { on: true, h: 32, fs: 12.5 })}${cchip('敏感肌', { h: 32, fs: 12.5 })}</div><div style="font-size:11.5px; color:${C.muted}; margin-top:8px; line-height:1.6;">年代・性別はレビューの欄から、足幅・肌は本文から（AI）。同じ人だけで数えなおします</div></div>`)}
${A(24, 262, `<div style="width:342px;"><b style="font-size:14px;">保存したもの</b><div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">${saved.map((p) => `<div style="display:flex; gap:12px; align-items:center; padding:10px 12px; border-radius:18px; background:${C.tile};">${node(ear(p.s, 40), { size: 46, bg: '#fff' })}<div style="flex:1;"><b style="font-size:13px;">${p.name}</b><div style="font-size:11.5px; color:${C.ink2}; margin-top:2px;">レビュー ${p.read}件を読んだ</div></div>${icon('arrow', { size: 16 })}</div>`).join('')}<div style="display:flex; gap:12px; align-items:center; padding:10px 12px; border-radius:18px; background:${C.tile};">${tile(bagArt(cf, 40), { w: 46, r: 23, bg: '#fff' })}<div style="flex:1;"><b style="font-size:13px;">ドリップパック</b><div style="font-size:11.5px; color:${C.ink2}; margin-top:2px;">${icon('loop', { size: 13, sw: 2 }).replace('display:block;', 'display:inline-block; vertical-align:-2px; margin-right:3px;')}リピート ${FIELDS['sw-drip'].rep}人／欄に答えた${FIELDS['sw-drip'].attr}人</div></div>${pill('また買う', { kind: 'line', h: 34, fs: 12.5 })}</div></div></div>`)}
${A(24, 566, `<div style="width:342px;"><b style="font-size:14px;">今週かわったこと</b><div style="margin-top:10px; padding:12px 14px; border-radius:18px; background:#fff; box-shadow:${SH.soft}; font-size:12.5px; line-height:1.7;">保存したものの声が増えたら、ここに出します。<span style="color:${C.muted};">（週に1回、レビューを読み直します）</span></div></div>`)}
`, { tab: 3 });
}

// ---------- さがす ----------
export function dSearch() {
  const u = UNITS.find((x) => x.key === 'run');
  const sh = SHOES.find((s) => s.id === 'hk-bondi9w');
  const grp = (t) => `<div style="font-size:12px; font-weight:700; color:${C.muted}; margin-top:16px;">${t}</div>`;
  const row = (img, t, s, r = '') => `<div style="display:flex; gap:12px; align-items:center; padding:10px 0; border-bottom:1px solid ${C.hair};">${img}<div style="flex:1; min-width:0;"><b style="font-size:14px;">${t}</b><div style="font-size:12px; color:${C.ink2}; margin-top:2px; line-height:1.5;">${s}</div></div>${r}</div>`;
  return scr(`
${A(24, 52, `<div style="display:flex; gap:10px; align-items:center; width:342px;">${round('back', '戻る')}<label style="flex:1; display:flex; align-items:center; gap:8px; height:46px; padding:0 16px; border-radius:23px; background:${C.tile}; font-size:14px;">${icon('search', { size: 17 })}ランニングシューズ 幅広</label></div>`)}
${A(24, 104, `<div style="width:342px;">${grp('カテゴリ')}${row(tile(objD('shoe', { size: 42 }), { w: 50, r: 14 }), 'ランニングシューズ', `「足幅が広い」人の声 ${WIDE_TOTAL}件で見る`, sample('見本'))}${grp('気になること')}${row(tile(icon('ruler', { size: 22 }), { w: 50, r: 14 }), 'サイズは合う？', `足幅が広い人では 小さめ ${WIDE_DIR[0]}・ちょうど ${WIDE_DIR[1]}・大きめ ${WIDE_DIR[2]}`)}${grp('商品')}${row(node(shoeArt(sh, 44), { size: 50 }), sh.name, `「足幅が広い」と書いた人 ${sh.wide} / ${sh.read}件`)}</div>`)}
`, { tab: 1 });
}

// ---------- 欄と AI を見分ける（化粧水・見本） ----------
export function dFacts() {
  const s = SKIN.find((x) => x.id === 'sbc-lotion'), f = FIELDS['sbc-lotion'];
  return scr(`
${A(24, 50, `<div style="display:flex; justify-content:space-between; align-items:center; width:342px;">${round('back', '戻る')}${sample()}</div>`)}
${A(24, 100, `<div style="display:flex; gap:14px; width:342px; align-items:center;">${tile(bottleArt(s, 72), { w: 84, r: 20 })}<div style="min-width:0;"><div style="font-size:17px; font-weight:900; line-height:1.35;">${s.name}</div><div style="font-size:12px; color:${C.ink2}; margin-top:4px;">レビュー ${s.read}件を読んだ（全${s.total.toLocaleString('ja-JP')}件）</div></div></div>`)}
${A(24, 202, `<div style="width:342px; box-sizing:border-box; padding:14px 16px; border-radius:20px; background:#fff; box-shadow:${SH.soft}; display:flex; flex-direction:column; gap:12px;"><div style="display:flex; justify-content:space-between; align-items:center;"><b style="font-size:14px;">本人が選んだ欄から</b>${factTag('事実・AIなし')}</div>${fieldBar({ n: f.rep, of: f.attr, label: 'また買った（リピート）', w: 310 })}<div style="font-size:12px; color:${C.ink2}; line-height:1.6;">わたしと同じ「40代・女性」は <b style="color:${C.ink};">${f.f40}人</b>（年代と性別を出した${f.ga}人のうち）。まだ少ない</div></div>`)}
${A(24, 420, `<div style="width:342px; box-sizing:border-box; padding:14px 16px; border-radius:20px; background:#fff; box-shadow:${SH.soft}; display:flex; flex-direction:column; gap:12px;"><div style="display:flex; justify-content:space-between; align-items:center;"><b style="font-size:14px;">本文から</b>${aiTag()}</div>${strip({ pos: s.irr[0], neg: s.irr[1], read: s.read, w: 310, h: 8, name: '刺激' })}${just({ counts: s.dir, labels: ['さっぱり', 'しっとり'], w: 310, h: 8, name: '使用感', read: s.read })}<div style="font-size:12px; color:${C.ink2}; line-height:1.6;">「敏感肌」と本文に書いた人は ${s.sens[0]}人。まだ少ない</div></div>`)}
${A(24, 688, `<div style="width:342px; font-size:11.5px; color:${C.muted}; line-height:1.6;">黒い枠の印＝本人が選んだ欄（事実）。灰色の印＝AIが本文を読んで分けた数。同じ画面でも見分けられるように</div>`)}
`, { tab: 1 });
}

export const PHONE_D = [
  ['はじめて開く', [['SD01-Home', 'S01 ホーム', dHome], ['SD02-Coach', 'S02 はじめての説明', () => dCategory({ coach: true })], ['SD03-Category', 'S03 カテゴリ（線で見る）', () => dCategory()], ['SD04-Tags', 'S04 カテゴリ（一覧で見る）', dCategoryTags]]],
  ['自分に合うか', [['SD05-Cond', 'S05 わたしと同じ人だけ（見本）', () => dCategoryCond()], ['SD06-Product', 'S06 商品', dProduct], ['SD07-Product2', 'S07 商品（つづき）', dProduct2], ['SD08-Similar', 'S08 これに似たもの', () => dSimilar()], ['SD13-Facts', 'S13 欄とAIを見分ける（見本）', dFacts]]],
  ['くらべる・戻ってくる', [['SD09-Compare', 'S09 くらべる', dCompare], ['SD10-Me', 'S10 わたし', dMe], ['SD11-Search', 'S11 さがす', dSearch], ['SD12-Todo', 'S12 これから読むカテゴリ', dTodo]]],
];

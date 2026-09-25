// 別案C のスマホ画面（390×844）
// イヤホン＝data/ の実データ。シューズ・化粧水・コーヒー＝測った見本（単語の規則・1商品30件）。ホーム・場所・検索の件数は将来を描いた見本
import { C, F, SH, icon, obj, tile, earArt, shoeArt, bottleArt, bagArt, num, label, pill, cond, aiNote, sampleNote, tierMark, voiceStrip, justStrip, repeatLine, voiceTag, navBar, statusBar, searchBox, mark } from './libc.mjs';
import { MAPPED, STATS, AXES, SHORT, LABEL, POLE, neighbors, byShort, yen, KEYS, SHOES, SKIN, COFFEE, MEASURE, ALL_DIR, WIDE_DIR, WIDE_TOTAL, shrink, dirScore, PLACES } from './datac.mjs';

const W = 390, H = 844;
const scr = (body, { nav = 0, bg = C.paper } = {}) => `<div style="position:relative; width:${W}px; height:${H}px; overflow:hidden; background:${bg}; font-family:${F.jp}; color:${C.ink};">${statusBar()}${body}${nav >= 0 ? navBar(nav) : ''}</div>`;
const A = (x, y, html, { w = 0, z = 2, style = '' } = {}) => `<div style="position:absolute; left:${x}px; top:${y}px;${w ? ` width:${w}px;` : ''} z-index:${z};${style ? ` ${style}` : ''}">${html}</div>`;
const sec = (t, right = '') => `<div style="display:flex; justify-content:space-between; align-items:baseline; width:342px;"><span style="font-size:15px; font-weight:700;">${t}</span>${right ? `<span style="font-size:12px; color:${C.muted};">${right}</span>` : ''}</div>`;
const iconBtn = (ic, lab, { size = 40, bg = C.card } = {}) => `<button type="button" aria-label="${lab}" style="width:${size}px; height:${size}px; border-radius:50%; border:none; background:${bg}; box-shadow:${bg === C.card ? SH.card : 'none'}; display:flex; align-items:center; justify-content:center; padding:0; color:${C.ink}; flex-shrink:0;">${icon(ic, { size: Math.round(size * 0.45) })}</button>`;
const head = (title, { sub = '', tier = null, back = true } = {}) => A(24, 52, `<div style="display:flex; align-items:center; gap:10px; width:342px;">${back ? iconBtn('back', '戻る', { size: 36 }) : ''}<div style="flex:1; min-width:0;"><div style="font-size:18px; font-weight:700; line-height:1.3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${title}</div>${sub ? `<div style="font-family:${F.mono}; font-size:11px; color:${C.muted}; margin-top:1px; white-space:nowrap;">${sub}</div>` : ''}</div>${tier != null ? tierMark(tier, { size: 's' }) : ''}</div>`);

// 1本の軸に商品を並べる（重ならないよう上下へ逃がす）
export function swarm(items, { w, h, pad = 24 }) {
  const cy = h / 2, maxAbs = Math.max(0.05, ...items.map((i) => Math.abs(i.score)));
  const placed = [];
  [...items].sort((a, b) => b.size - a.size).forEach((it) => {
    const x = w / 2 + (it.score / maxAbs) * (w / 2 - pad - it.size / 2);
    for (let k = 0; k < 40; k++) {
      const dy = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 7;
      const y = cy + dy;
      if (placed.every((p) => Math.hypot(p.x - x, p.y - y) >= (p.size + it.size) / 2 + 3) && y - it.size / 2 >= 4 && y + it.size / 2 <= h - 4) { placed.push({ ...it, x, y }); return; }
    }
    placed.push({ ...it, x, y: cy });
  });
  return placed;
}
const sizeOf = (m, lo = 30, hi = 50, max = 50) => Math.round(lo + (hi - lo) * Math.sqrt(Math.min(m, max) / max));

// ---------- 探す ----------
export function sHome() {
  const places = PLACES.slice(0, 6);
  const tiles = places.map((pl, i) => `<div style="width:165px; height:112px; box-sizing:border-box; padding:10px 12px; border-radius:16px; background:${C.card}; box-shadow:${SH.card}; display:flex; flex-direction:column; justify-content:space-between;"><div style="display:flex; gap:2px; height:52px; align-items:flex-end;">${pl.objs.slice(0, 3).map((o) => obj(o, { size: 50 })).join('')}</div><div style="display:flex; justify-content:space-between; align-items:baseline;"><b style="font-size:14px;">${pl.name}</b><span style="font-family:${F.mono}; font-size:11px; color:${C.muted};">読めた ${[7, 12, 9, 6, 4, 8][i]}/${[42, 38, 51, 29, 18, 33][i]}</span></div></div>`).join('');
  return scr(`
${A(24, 56, mark(17))}
${A(318, 50, iconBtn('bell', 'お知らせ', { size: 40 }))}
${A(24, 104, `<div style="font-size:22px; font-weight:700; line-height:1.35;">似た人の、買ったあと。</div><div style="font-size:12px; color:${C.ink2}; margin-top:4px;">買った人の声を、どのカテゴリでも同じ読み方で</div>`)}
${A(24, 172, searchBox())}
${A(24, 238, sec('わたしの条件', '端末の中だけ'))}
${A(24, 266, `<div style="display:flex; gap:8px; flex-wrap:wrap; width:342px;">${cond('足幅が広い', { on: true })}${cond('敏感肌', { on: true })}${cond('一人暮らし')}${`<button type="button" style="height:34px; padding:0 12px; border-radius:17px; border:1px dashed ${C.line}; background:transparent; font-family:${F.jp}; font-size:13px; color:${C.ink2};">＋ 足す</button>`}</div>`)}
${A(24, 356, sec('暮らしの場所から', 'すべて 10'))}
${A(24, 384, `<div style="display:grid; grid-template-columns:repeat(2, 165px); gap:12px;">${tiles}</div>`)}
`, { nav: 0 });
}

export function sPlace() {
  const rows = [
    { o: 'bottle', n: '化粧水', tier: 1, t: '8商品・240件を読んだ', c: '敏感肌と書いた声 14件' },
    { o: 'dryer', n: 'ドライヤー', tier: 0 },
    { o: 'brush', n: '電動歯ブラシ', tier: 0 },
    { o: 'bottle', n: 'シャンプー', tier: 0, col: '#D9E0DA' },
    { o: 'bottle', n: '日焼け止め', tier: 0, col: '#F0E6C8' },
    { o: 'bottle', n: '洗顔料', tier: 0, col: '#E6E0EA' },
  ];
  const list = rows.map((r) => `<div style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:16px; background:${r.tier ? C.card : 'transparent'}; box-shadow:${r.tier ? SH.card : 'none'}; border:${r.tier ? 'none' : `1px dashed ${C.line}`};">${tile(obj(r.o, { size: 48, ...(r.col ? { col: r.col } : {}) }), { w: 56, r: 12, bg: r.tier ? C.tile : C.paper })}<div style="flex:1; min-width:0;"><div style="display:flex; justify-content:space-between; align-items:center; gap:8px;"><b style="font-size:15px; ${r.tier ? '' : `color:${C.ink2};`}">${r.n}</b>${tierMark(r.tier, { size: 's' })}</div><div style="font-size:12px; color:${C.muted}; margin-top:3px;">${r.tier ? `${r.t}<br><span style="color:${C.ink};">${icon('person', { size: 12, sw: 2 }).replace('display:block;', 'display:inline-block; vertical-align:-1px; margin-right:3px;')}${r.c}</span>` : 'まだ読めていない（名前と値段だけ）'}</div></div></div>`).join('');
  return scr(`
${head('洗面所', { sub: '18カテゴリ・読めているのは1' })}
${A(24, 108, `<div style="display:flex; gap:8px;">${cond('敏感肌', { on: true })}${cond('脂性肌')}${cond('乾燥肌')}</div>`)}
${A(24, 158, `<div style="display:flex; flex-direction:column; gap:10px; width:342px;">${list}</div>`)}
`, { nav: 1 });
}

export function sConditions() {
  const groups = [
    ['着る・履く', ['足幅が広い', '足幅が狭い', '甲が高い', '普段 24cm前後'], [0]],
    ['肌と髪に使う', ['敏感肌', '乾燥肌', '脂性肌', '混合肌'], [0]],
    ['食べる・飲む', ['ブラック派', 'ミルクを入れる', '酸味が苦手'], []],
    ['暮らし', ['一人暮らし', '家族4人', '犬がいる', '猫がいる'], []],
    ['体を動かす', ['はじめたばかり', 'フルマラソン'], []],
  ];
  const g = groups.map(([t, list, on]) => `<div style="display:flex; flex-direction:column; gap:6px;"><div style="font-size:12px; font-weight:700; color:${C.muted};">${t}</div><div style="display:flex; gap:6px; flex-wrap:wrap;">${list.map((x, i) => cond(x, { on: on.includes(i), h: 30, fs: 12 })).join('')}</div></div>`).join('');
  return scr(`
${head('わたしの条件', { sub: '選んだ条件で、どのカテゴリでも数えなおす' })}
${A(24, 112, `<div style="width:342px; box-sizing:border-box; padding:12px 14px; border-radius:14px; background:${C.card}; box-shadow:${SH.card}; font-size:12.5px; line-height:1.65; color:${C.ink2};">同じ条件を<b style="color:${C.ink};">レビューに自分で書いた人</b>の声だけで、件数を数えなおします。全体の件数も並べたまま。<br><span style="color:${C.muted}; font-size:11.5px;">条件はAIがレビューから拾ったもの。書いている人は1〜2割（見本の3カテゴリで10〜24%）</span></div>`)}
${A(24, 232, `<div style="display:flex; flex-direction:column; gap:12px; width:342px;">${g}<div style="display:flex; align-items:center; justify-content:space-between; font-size:12px; color:${C.muted}; margin-top:4px;"><span style="display:flex; align-items:center; gap:6px;">${icon('info', { size: 14 })}この端末の中だけ。登録はいりません</span><span style="color:${C.ink}; text-decoration:underline;">すべて外す</span></div></div>`)}
`, { nav: 3 });
}

export function sSearch() {
  const row = (ic, t, s, right = '') => `<div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid ${C.hair};">${ic}<div style="flex:1; min-width:0;"><div style="font-size:14px; font-weight:700;">${t}</div><div style="font-size:12px; color:${C.muted}; margin-top:2px;">${s}</div></div>${right}</div>`;
  const grp = (t) => `<div style="font-family:${F.mono}; font-size:11px; letter-spacing:.08em; color:${C.muted}; margin-top:14px;">${t}</div>`;
  const sh = SHOES.find((s) => s.id === 'hk-bondi9w'), ua = SHOES.find((s) => s.id === 'ua-cp3a');
  return scr(`
${A(24, 56, `<div style="display:flex; gap:10px; align-items:center; width:342px;">${iconBtn('back', '戻る', { size: 36 })}<label style="flex:1; display:flex; align-items:center; gap:8px; height:44px; padding:0 14px; border-radius:22px; background:${C.card}; box-shadow:${SH.card}; font-size:14px;">${icon('search', { size: 17 })}ランニングシューズ 幅広</label></div>`)}
${A(24, 112, `<div style="width:342px;">
${grp('カテゴリ × わたしの条件')}
${row(tile(obj('shoe', { size: 42 }), { w: 48, r: 12 }), 'ランニングシューズ × 足幅が広い', `幅広と書いた声 ${WIDE_TOTAL}件（全体 ${MEASURE.cats[1].n}件）`, tierMark(1, { size: 's' }))}
${grp('観点')}
${row(tile(icon('ruler', { size: 22 }), { w: 48, r: 12 }), 'サイズ感（小さめ↔大きめ）', `ちょうどよさ・幅広の人では 小さめ ${WIDE_DIR[0]}／ちょうど ${WIDE_DIR[1]}／大きめ ${WIDE_DIR[2]}`)}
${grp('困りごと')}
${row(tile(icon('alert', { size: 22 }), { w: 48, r: 12 }), 'サイズが合わない', '着る・履く の共通の観点。読めているのは1カテゴリ')}
${grp('商品')}
${row(tile(shoeArt(sh, 44), { w: 48, r: 12 }), sh.name, `幅広と書いた人 ${sh.wide} / ${sh.read}件`)}
${row(tile(shoeArt(ua, 44), { w: 48, r: 12 }), ua.name, `幅広と書いた人 ${ua.wide} / ${ua.read}件・同じ型がもう1ページ`)}
</div>`)}
${A(24, 700, sampleNote())}
`, { nav: 1 });
}

// ---------- カテゴリ（段0〜3） ----------
export function sTier0() {
  const rows = Array.from({ length: 5 }, (_, i) => `<div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid ${C.hair};">${tile(obj('bowl', { size: 44, col: ['#D6CDBF', '#CFC6B6', '#E0D8CB', '#C8BEAD', '#DDD3C4', '#D2C9BA'][i] }), { w: 52, r: 12 })}<div style="flex:1;"><div style="height:11px; width:${[190, 160, 210, 140, 180, 170][i]}px; border-radius:6px; background:${C.tile2};"></div><div style="height:9px; width:70px; border-radius:5px; background:${C.tile}; margin-top:8px;"></div></div><span style="font-size:11px; color:${C.muted};">声は まだ</span></div>`).join('');
  return scr(`
${head('キャットフード', { sub: '48商品・読めた商品 0', tier: 0 })}
${A(24, 112, `<div style="width:342px; box-sizing:border-box; padding:14px; border-radius:16px; border:1px dashed ${C.line}; display:flex; gap:12px; align-items:flex-start;">${icon('tag', { size: 22 })}<div style="font-size:13px; line-height:1.65; color:${C.ink2};"><b style="color:${C.ink};">まだレビューを読めていません。</b>読んだ商品から声札が付きます。順位も「おすすめ」も付けません。</div></div>`)}
${A(24, 222, `<div style="display:flex; align-items:center; justify-content:space-between; width:342px;"><span style="font-size:13px; color:${C.ink2};">このカテゴリを先に読んでほしい</span>${pill('読んでほしい', { kind: 'line', h: 38, fs: 13 })}</div>`)}
${A(24, 272, `<div style="width:342px;">${rows}</div>`)}
${A(24, 648, `<div style="font-size:11px; color:${C.muted}; width:342px; line-height:1.6;">名前と値段は楽天の商品一覧から。押された数は、読む順番（需要）に使う。検索には出さない（noindex）</div>`)}
`, { nav: 1 });
}

export function sTier1Shoes() {
  const tag = (s) => voiceTag({ img: shoeArt(s, 92), name: s.name, sub: s.sub, read: s.read, total: s.total, lines: [{ kind: 'pos', t: '軽さ', n: s.light[0] }, ...(s.cushion[1] ? [{ kind: 'neg', t: 'クッション', n: s.cushion[1] }] : [{ kind: 'pos', t: 'クッション', n: s.cushion[0] }])], just: { counts: s.dir, labels: ['小さめ', 'ちょうど', '大きめ'] }, w: 165, imgH: 84 });
  return scr(`
${head('ランニングシューズ', { sub: `8商品・${MEASURE.cats[1].n}件を読んだ`, tier: 1 })}
${A(24, 104, `<div style="display:flex; gap:8px; align-items:center;">${cond('足幅が広い')}${sampleNote('見本・単語の規則')}</div>`)}
${A(24, 150, `<div style="display:grid; grid-template-columns:repeat(2, 165px); gap:12px;">${SHOES.slice(0, 4).map(tag).join('')}</div>`)}
`, { nav: 1 });
}

export function sTier2Ear({ k = 'fit' } = {}) {
  const on = MAPPED.filter((p) => p.pos[k] + p.neg[k] > 0);
  const off = MAPPED.filter((p) => !(p.pos[k] + p.neg[k]));
  const RW = 342, RH = 250;
  const pts = swarm(on.map((p) => ({ id: p.s, score: shrink(p.pos[k], p.neg[k]), size: sizeOf(p.pos[k] + p.neg[k], 30, 50, 50), thin: p.read < 30 })), { w: RW, h: RH });
  const nodes = pts.map((q) => `<span style="position:absolute; left:${Math.round(q.x - q.size / 2)}px; top:${Math.round(q.y - q.size / 2)}px; width:${q.size}px; height:${q.size}px; border-radius:50%; background:${C.tile}; display:flex; align-items:center; justify-content:center; box-shadow:${q.id === '821de2ea' ? `0 0 0 2px #fff, 0 0 0 4px ${C.ink}` : 'none'};${q.thin ? ` outline:1px dashed ${C.faint}; outline-offset:2px; opacity:.72;` : ''}">${earArt(q.id, Math.round(q.size * 0.9))}</span>`).join('');
  const offerable = AXES.filter((a) => a.offerable).map((a) => a.key);
  const flat = ['sound', 'connection'];
  const chips = offerable.map((x) => `<span style="display:inline-flex; align-items:center; height:32px; padding:0 13px; border-radius:16px; background:${x === k ? C.ink : C.card}; color:${x === k ? '#fff' : C.ink}; box-shadow:${x === k ? 'none' : SH.card}; font-size:13px; font-weight:${x === k ? 700 : 500}; white-space:nowrap; flex-shrink:0;">${SHORT[x]}</span>`).join('') + flat.map((x) => `<span style="display:inline-flex; align-items:center; height:32px; padding:0 12px; border-radius:16px; border:1px dashed ${C.line}; color:${C.muted}; font-size:12px; white-space:nowrap; flex-shrink:0;">${SHORT[x]}・差が出ない</span>`).join('');
  const s = byShort['821de2ea'];
  const thick = MAPPED.filter((p) => p.read >= 30).length;
  return scr(`
${head('完全ワイヤレスイヤホン', { sub: `${STATS.total}商品のうち${STATS.analysed}商品・のべ${STATS.read}件`, tier: 2 })}
${A(24, 104, `<div style="width:342px; display:flex; align-items:center; gap:10px;"><span style="font-size:12px; color:${C.ink2}; white-space:nowrap;">地図まで</span><div style="flex:1; height:6px; border-radius:3px; background:${C.rest}; overflow:hidden;"><div style="width:${(thick / 12) * 100}%; height:6px; background:${C.ink};"></div></div><span style="font-family:${F.mono}; font-size:11px; color:${C.muted}; white-space:nowrap;">30件以上 ${thick} / 12商品</span></div>`)}
${A(24, 132, `<div style="display:flex; gap:7px; width:366px; overflow:hidden;">${chips}</div>`)}
${A(24, 182, `<div style="position:relative; width:${RW}px; height:${RH + 56}px; border-radius:18px; background:${C.card}; box-shadow:${SH.card};"><div style="position:absolute; left:14px; right:14px; top:${RH / 2 + 18}px; height:0; border-top:1.5px solid ${C.hair};"></div><div style="position:absolute; left:${RW / 2}px; top:26px; height:${RH - 16}px; border-left:1px dashed ${C.line};"></div><div style="position:absolute; left:0; top:18px; width:${RW}px; height:${RH}px;">${nodes}</div><div style="position:absolute; left:14px; right:14px; bottom:14px; display:flex; justify-content:space-between; font-size:12px; font-weight:700; white-space:nowrap;"><span style="color:${C.negText};">← ${POLE[k].neg}</span><span style="color:${C.posText};">${POLE[k].pos} →</span></div></div>`)}
${A(24, 500, `<div style="width:342px; font-size:11.5px; color:${C.muted}; line-height:1.6;">位置＝満足と不満の差。真ん中＝割れている、または読めた量が少ない・丸の大きさ＝${LABEL[k]}にふれた件数・点線＝30件未満・ふれていない商品は最下位でなく別に並べる</div>`)}
${A(24, 548, `<div style="display:flex; align-items:center; gap:5px; width:342px;"><span style="font-size:12px; color:${C.ink2}; margin-right:4px; white-space:nowrap;">ふれていない ${off.length}商品</span>${off.map((p) => `<span style="display:inline-flex; width:28px; height:28px; border-radius:50%; background:${C.card}; align-items:center; justify-content:center;">${earArt(p.s, 24)}</span>`).join('')}</div>`)}
${A(24, 600, `<div style="width:342px; box-sizing:border-box; padding:12px 14px; border-radius:16px; background:${C.card}; box-shadow:${SH.card}; display:flex; gap:12px; align-items:center;">${tile(earArt(s.s, 52), { w: 56, r: 12 })}<div style="flex:1; min-width:0;">${voiceStrip({ pos: s.pos[k], neg: s.neg[k], read: s.read, w: 246, h: 8, name: s.name, fs: 12 })}</div></div>`)}
`, { nav: 1 });
}

export function sTier3Map() {
  // 2つの名前のある軸（装着感 × ノイキャン）。見本：イヤホンはまだ段2
  const MW = 342, MH = 360, pad = 30;
  const on = MAPPED.filter((p) => p.pos.fit + p.neg.fit > 0 && p.pos.anc + p.neg.anc > 0);
  const xs = on.map((p) => shrink(p.pos.fit, p.neg.fit)), ys = on.map((p) => shrink(p.pos.anc, p.neg.anc));
  const mx = Math.max(...xs.map(Math.abs)), my = Math.max(...ys.map(Math.abs));
  const nodes = on.map((p, i) => { const sz = sizeOf(p.pos.fit + p.neg.fit + p.pos.anc + p.neg.anc, 30, 52, 80); const x = MW / 2 + (xs[i] / mx) * (MW / 2 - pad - sz / 2), y = MH / 2 - (ys[i] / my) * (MH / 2 - pad - sz / 2); return `<span style="position:absolute; left:${Math.round(x - sz / 2)}px; top:${Math.round(y - sz / 2)}px; width:${sz}px; height:${sz}px; border-radius:50%; background:${C.tile}; display:flex; align-items:center; justify-content:center;${p.read < 30 ? ` outline:1px dashed ${C.faint}; outline-offset:2px; opacity:.72;` : ''}">${earArt(p.s, Math.round(sz * 0.9))}</span>`; }).join('');
  const offCount = MAPPED.length - on.length;
  return scr(`
${head('地図', { sub: '完全ワイヤレスイヤホン（見本）', tier: 3 })}
${A(24, 102, `<div style="width:342px; box-sizing:border-box; padding:9px 12px; border-radius:12px; background:${C.ink}; color:#fff; font-size:12px; line-height:1.55;">見本：イヤホンはまだ段2。30件以上読めた商品が12を超えたら、この地図になる</div>`)}
${A(24, 162, `<div style="position:relative; width:${MW}px; height:${MH}px; border-radius:18px; background:${C.card}; box-shadow:${SH.card}; overflow:hidden;"><div style="position:absolute; left:${MW / 2}px; top:14px; bottom:14px; border-left:1px solid ${C.hair};"></div><div style="position:absolute; top:${MH / 2}px; left:14px; right:14px; border-top:1px solid ${C.hair};"></div>${nodes}
<span style="position:absolute; left:${MW / 2 + 8}px; top:10px; font-size:11px; font-weight:700; color:${C.posText};">↑ ${POLE.anc.pos}</span><span style="position:absolute; left:${MW / 2 + 8}px; bottom:10px; font-size:11px; font-weight:700; color:${C.negText};">↓ ${POLE.anc.neg}</span><span style="position:absolute; right:12px; top:${MH / 2 + 6}px; font-size:11px; font-weight:700; color:${C.posText};">${POLE.fit.pos} →</span><span style="position:absolute; left:12px; top:${MH / 2 + 6}px; font-size:11px; font-weight:700; color:${C.negText};">← ${POLE.fit.neg}</span></div>`)}
${A(24, 536, `<div style="display:flex; gap:10px; align-items:center; width:342px;"><span style="font-size:13px; font-weight:700;">横</span><span style="display:inline-flex; height:30px; align-items:center; padding:0 12px; border-radius:15px; background:${C.card}; box-shadow:${SH.card}; font-size:13px;">装着感</span><span style="font-size:13px; font-weight:700; margin-left:6px;">縦</span><span style="display:inline-flex; height:30px; align-items:center; padding:0 12px; border-radius:15px; background:${C.card}; box-shadow:${SH.card}; font-size:13px;">ノイキャン</span></div>`)}
${A(24, 584, `<div style="width:342px; font-size:12px; color:${C.ink2}; line-height:1.65;">軸は必ず名前の言える観点。ちょうどよさの観点があれば、そちらを先に使う（例：小さめ↔大きめ）。どちらかにふれていない ${offCount}商品は、原点に置かず下に並べる</div>`)}
`, { nav: 1 });
}

// ---------- 商品と声 ----------
export function sProductEar() {
  const s = byShort['821de2ea'];
  const rows = KEYS.filter((k) => s.pos[k] + s.neg[k] >= 2).sort((a, b) => s.neg[b] - s.neg[a]).slice(0, 4);
  const near = neighbors(s, 3);
  const reason = (n) => { const same = n.diffs.filter((d) => Math.abs(d.d) < 0.15).map((d) => SHORT[d.k]).slice(0, 2); const diff = n.diffs[0]; return `${same.length ? `近い：${same.join('・')}` : ''}${diff ? `${same.length ? '／' : ''}違う：${SHORT[diff.k]}` : ''}`; };
  return scr(`
${A(24, 52, `<div style="display:flex; justify-content:space-between; width:342px;">${iconBtn('back', '戻る', { size: 36 })}<span style="display:flex; gap:8px;">${iconBtn('pair', '並べる', { size: 36 })}${iconBtn('save', '保存', { size: 36 })}</span></div>`)}
${A(24, 98, `<div style="width:342px; height:150px; border-radius:20px; background:${C.tile}; display:flex; align-items:center; justify-content:center;">${earArt(s.s, 150)}</div>`)}
${A(24, 262, `<div style="width:342px;"><div style="display:flex; justify-content:space-between; align-items:baseline;"><span style="font-size:20px; font-weight:700;">${s.name}</span>${num(yen(s.price), { size: 15 })}</div><div style="display:flex; justify-content:space-between; margin-top:4px;"><span style="font-family:${F.mono}; font-size:11px; color:${C.ink2};">楽天のレビュー ${s.reviewCount}件のうち ${s.read}件を読んだ</span>${aiNote()}</div></div>`)}
${A(24, 318, `<div style="width:342px; display:flex; flex-direction:column; gap:12px;"><div style="font-size:13px; font-weight:700;">声札 <span style="font-weight:500; color:${C.muted}; font-size:12px;">不満の多い順・${s.read}件中</span></div>${rows.map((k) => voiceStrip({ pos: s.pos[k], neg: s.neg[k], read: s.read, w: 342, h: 8, name: LABEL[k], fs: 12 })).join('')}</div>`)}
${A(24, 612, `<div style="width:342px;"><div style="font-size:13px; font-weight:700; margin-bottom:8px;">声が似ているもの <span style="font-weight:500; color:${C.muted}; font-size:12px;">近い理由つき</span></div><div style="display:flex; gap:8px;">${near.map((n) => `<div style="flex:1; min-width:0; box-sizing:border-box; padding:8px; border-radius:12px; background:${C.card}; box-shadow:${SH.card}; display:flex; flex-direction:column; gap:3px;"><div style="display:flex; align-items:center; gap:6px;">${earArt(n.p.s, 26)}<b style="font-size:11.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${n.p.name.replace(/^(Sony|AUKEY) /, '')}</b></div><div style="font-size:11px; color:${C.ink2}; line-height:1.4;">${reason(n)}</div></div>`).join('')}</div></div>`)}
`, { nav: 1 });
}

export function sProductSkin() {
  const s = SKIN.find((x) => x.id === 'sbc-lotion');
  const I = MEASURE.irritation;
  const col = (t, n, pos, neg, faint) => `<div style="flex:1; min-width:0; box-sizing:border-box; padding:10px 12px; border-radius:14px; background:${faint ? 'transparent' : C.card}; border:${faint ? `1px dashed ${C.line}` : 'none'}; box-shadow:${faint ? 'none' : SH.card};"><div style="font-size:12px; font-weight:700; ${faint ? `color:${C.ink2};` : ''}">${t}</div><div style="font-family:${F.mono}; font-size:11px; color:${C.muted}; margin:2px 0 8px;">${n}件中</div>${voiceStrip({ pos, neg, read: n, w: 140, h: 7, labels: false, muted: faint })}<div style="display:flex; justify-content:space-between; margin-top:6px; font-size:${faint ? 11 : 12}px;"><span style="color:${C.negText};">不満 ${neg}</span><span style="color:${C.posText};">満足 ${pos}</span></div></div>`;
  return scr(`
${A(24, 52, `<div style="display:flex; justify-content:space-between; width:342px;">${iconBtn('back', '戻る', { size: 36 })}${sampleNote('見本・単語の規則・30件')}</div>`)}
${A(24, 98, `<div style="display:flex; gap:14px; width:342px; align-items:center;">${tile(bottleArt(s, 84), { w: 96, r: 16 })}<div style="min-width:0;"><div style="font-size:17px; font-weight:700; line-height:1.35;">${s.name}</div><div style="font-family:${F.mono}; font-size:11px; color:${C.ink2}; margin-top:4px;">読んだ ${s.read} / ${s.total.toLocaleString('ja-JP')}件</div><div style="margin-top:8px;">${cond('敏感肌', { on: true, h: 30, fs: 12 })}</div></div></div>`)}
${A(24, 222, `<div style="width:342px;"><div style="font-size:14px; font-weight:700; margin-bottom:8px;">刺激 <span style="font-size:12px; font-weight:500; color:${C.muted};">しみた・ピリピリ ↔ しみない</span></div><div style="display:flex; gap:10px;">${col('全体', s.read, s.irr[0], s.irr[1], false)}${col('敏感肌と書いた人', s.sens[0], s.sens[1], s.sens[2], true)}</div><div style="font-size:11.5px; color:${C.muted}; margin-top:6px;">敏感肌と書いた人は ${s.sens[0]}件だけ。20件に届くまで、数字を小さく出す</div></div>`)}
${A(24, 408, `<div style="width:342px; box-sizing:border-box; padding:14px; border-radius:16px; background:${C.ink}; color:#fff;"><div style="font-size:12px; opacity:.8;">化粧水 8商品ぜんたいでは</div><div style="display:flex; gap:18px; margin-top:8px; align-items:flex-end;"><div><div style="font-family:${F.mono}; font-size:26px; font-weight:500;">${I.all.neg}<span style="font-size:13px; opacity:.7;"> / ${I.all.n}件</span></div><div style="font-size:11.5px; opacity:.8;">全体の、刺激の不満</div></div><div><div style="font-family:${F.mono}; font-size:26px; font-weight:500; color:#F2A38F;">${I.sensitive.neg}<span style="font-size:13px; color:#fff; opacity:.7;"> / ${I.sensitive.n}件</span></div><div style="font-size:11.5px; opacity:.8;">敏感肌と書いた人の、刺激の不満</div></div></div><div style="font-size:11px; opacity:.72; margin-top:8px; line-height:1.5;">14件は目安の20件に届かない。公開では小さく出す</div></div>`)}
${A(24, 562, `<div style="width:342px; display:flex; flex-direction:column; gap:14px;">${justStrip({ counts: s.dir, labels: ['さっぱり', 'しっとり'], w: 342, h: 8, name: '使用感（ちょうどよさ）', read: s.read })}<div>${repeatLine(s.rep, s.read)}</div></div>`)}
${A(24, 670, `<div style="font-size:11px; color:${C.muted}; width:342px; line-height:1.6;">条件はレビューに本人が書いたもの（本番はAIが拾う）。全体の件数は消さずに並べる</div>`)}
`, { nav: 1 });
}

export function sJust({ wideOn = false } = {}) {
  const list = [...SHOES].map((s) => ({ s, sc: dirScore(wideOn ? s.wideDir : s.dir) })).sort((a, b) => (a.sc ?? 0) - (b.sc ?? 0));
  const rows = list.map(({ s }) => { const c = wideOn ? s.wideDir : s.dir; const n = c.reduce((a, b) => a + b, 0); const few = n < 5; return `<div style="display:flex; align-items:center; gap:10px; ${few ? 'opacity:.55;' : ''}">${tile(shoeArt(s, 38), { w: 42, r: 10 })}<div style="flex:1; min-width:0;"><div style="display:flex; justify-content:space-between; font-size:12px;"><b style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.name}${s.sub ? ` <span style="font-weight:500; color:${C.muted};">${s.sub}</span>` : ''}</b><span style="font-family:${F.mono}; font-size:11px; color:${C.muted}; white-space:nowrap;">${n}件</span></div>${justStrip({ counts: c, w: 280, h: 7, fs: 11, showNums: true })}</div></div>`; }).join('');
  const seg = (t, on) => `<span style="flex:1; display:flex; align-items:center; justify-content:center; height:34px; border-radius:17px; background:${on ? C.ink : 'transparent'}; color:${on ? '#fff' : C.ink}; font-size:13px; font-weight:${on ? 700 : 500};">${t}</span>`;
  return scr(`
${head('サイズ感', { sub: `ランニングシューズ・ちょうどよさ・${MEASURE.cats[1].n}件` })}
${A(24, 104, `<div style="display:flex; width:342px; padding:3px; box-sizing:border-box; border-radius:20px; background:${C.card}; box-shadow:${SH.card};">${seg('全体', !wideOn)}${seg(`幅広と書いた人 ${WIDE_TOTAL}件`, wideOn)}</div>`)}
${A(24, 156, `<div style="width:342px; box-sizing:border-box; padding:12px 14px; border-radius:16px; background:${C.card}; box-shadow:${SH.card};">${justStrip({ counts: wideOn ? WIDE_DIR : ALL_DIR, w: 314, h: 10, name: wideOn ? '幅広と書いた人の、サイズ感' : '8商品ぜんたいの、サイズ感', read: wideOn ? WIDE_TOTAL : MEASURE.cats[1].n })}</div>`)}
${A(24, 258, `<div style="font-size:12px; color:${C.ink2}; width:342px;">小さめ寄り → 大きめ寄りの順（順位ではない）</div>`)}
${A(24, 284, `<div style="display:flex; flex-direction:column; gap:10px; width:342px;">${rows}</div>`)}
${A(24, 738, sampleNote())}
`, { nav: 1 });
}

export function sCompare() {
  const a = byShort['821de2ea'], b = byShort['637e1dd6'];
  const both = KEYS.filter((k) => a.pos[k] + a.neg[k] >= 2 && b.pos[k] + b.neg[k] >= 2);
  const d = both.map((k) => ({ k, d: shrink(a.pos[k], a.neg[k]) - shrink(b.pos[k], b.neg[k]) }));
  const diff = d.filter((x) => Math.abs(x.d) >= 0.15).sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
  const same = d.filter((x) => Math.abs(x.d) < 0.15);
  const none = KEYS.filter((k) => !(a.pos[k] + a.neg[k]) && !(b.pos[k] + b.neg[k]));
  const one = KEYS.filter((k) => !both.includes(k) && !none.includes(k));
  const row = (k) => `<div style="display:grid; grid-template-columns:130px 82px 130px; align-items:center; gap:0;"><div style="display:flex; flex-direction:column; align-items:flex-end; gap:3px;">${voiceStrip({ pos: a.pos[k], neg: a.neg[k], read: a.read, w: 124, h: 7, labels: false })}<span style="font-family:${F.mono}; font-size:11px;"><span style="color:${C.negText};">${a.neg[k]}</span> / <span style="color:${C.posText};">${a.pos[k]}</span></span></div><div style="text-align:center; font-size:11.5px; font-weight:700; white-space:nowrap;">${SHORT[k]}</div><div style="display:flex; flex-direction:column; gap:3px;">${voiceStrip({ pos: b.pos[k], neg: b.neg[k], read: b.read, w: 124, h: 7, labels: false })}<span style="font-family:${F.mono}; font-size:11px;"><span style="color:${C.negText};">${b.neg[k]}</span> / <span style="color:${C.posText};">${b.pos[k]}</span></span></div></div>`;
  const head2 = (p) => `<div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">${tile(earArt(p.s, 70), { w: 96, h: 80, r: 16 })}<b style="font-size:13px; text-align:center;">${p.name}</b><span style="font-family:${F.mono}; font-size:11px; color:${C.muted};">${p.read}件を読んだ</span></div>`;
  return scr(`
${head('並べる', { sub: '違うところから先に' })}
${A(24, 104, `<div style="display:flex; gap:12px; width:342px;">${head2(a)}${head2(b)}</div>`)}
${A(24, 262, `<div style="width:342px; display:flex; flex-direction:column; gap:12px;"><div style="font-size:13px; font-weight:700;">違うところ <span style="font-weight:500; color:${C.muted}; font-size:12px;">不満 / 満足（読んだ件数の中で）</span></div>${diff.map((x) => row(x.k)).join('')}</div>`)}
${A(24, 262 + 38 + diff.length * 44, `<div style="width:342px; display:flex; flex-direction:column; gap:8px; font-size:12.5px; color:${C.ink2}; line-height:1.6;"><div><b style="color:${C.ink};">同じくらい：</b>${same.map((x) => SHORT[x.k]).join('・') || 'なし'}</div><div><b style="color:${C.ink};">片方だけ言及：</b>${one.map((k) => SHORT[k]).join('・') || 'なし'}</div><div><b style="color:${C.ink};">どちらも言及なし：</b>${none.map((k) => SHORT[k]).join('・') || 'なし'}</div></div>`)}
`, { nav: 2 });
}

export function sCoffee() {
  const tag = (s) => voiceTag({ img: bagArt(s, 88), name: s.name, cond: `お店${s.shop}`, read: s.read, total: s.total, lines: [], just: s.dir[0] + s.dir[1] ? { counts: s.dir, labels: ['酸味', '苦味'] } : null, rep: s.rep, w: 165, imgH: 80 });
  const ship = COFFEE.reduce((a, s) => a + s.ship, 0);
  return scr(`
${head('コーヒー', { sub: `8商品・${MEASURE.cats[2].n}件を読んだ`, tier: 1 })}
${A(24, 104, `<div style="width:342px; box-sizing:border-box; padding:10px 12px; border-radius:14px; background:${C.card}; box-shadow:${SH.card}; display:flex; flex-direction:column; gap:6px; font-size:12px; color:${C.ink2};"><span style="display:flex; gap:6px; align-items:center;">${icon('store', { size: 15 })}<span>この8商品のうち<b style="color:${C.ink};">5つが同じお店（S）</b>。お店ごとに上限を置く</span></span><span style="display:flex; gap:6px; align-items:center;">${icon('truck', { size: 15 })}<span>お店と配送の声<b style="color:${C.ink};"> ${ship}件</b>は数えていない</span></span></div>`)}
${A(24, 196, `<div style="display:grid; grid-template-columns:repeat(2, 165px); gap:12px;">${COFFEE.slice(0, 4).map(tag).join('')}</div>`)}
${A(24, 738, sampleNote())}
`, { nav: 1 });
}

export const PHONE_C = [
  ['探す', [['SC01-Home', 'S01 ホーム（件数は見本）', sHome], ['SC02-Place', 'S02 暮らしの場所：洗面所', sPlace], ['SC03-Conditions', 'S03 わたしの条件', sConditions], ['SC04-Search', 'S04 検索（条件の言葉）', sSearch]]],
  ['カテゴリ（読めた深さの4段）', [['SC05-Tier0', 'S05 段0 名前だけ', sTier0], ['SC06-Tier1', 'S06 段1 声札（シューズ・見本）', sTier1Shoes], ['SC07-Tier2', 'S07 段2 棚・ものさし（イヤホン）', () => sTier2Ear()], ['SC08-Tier3', 'S08 段3 地図（見本）', sTier3Map]]],
  ['商品と声', [['SC09-Product', 'S09 商品（イヤホン）', sProductEar], ['SC10-Cond', 'S10 条件で数えなおす（化粧水・見本）', sProductSkin], ['SC11-Just', 'S11 ちょうどよさ（シューズ・見本）', () => sJust()], ['SC12-Compare', 'S12 並べる（イヤホン）', sCompare], ['SC13-Repeat', 'S13 また買った（コーヒー・見本）', sCoffee]]],
];

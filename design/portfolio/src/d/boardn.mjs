// 新しい案「★の中身」のボード（N0〜N5）。文字は少なく、絵を大きく
import { C, F, SH, icon, objD, earArt, num, small, tile, node, just, factTag } from './libd.mjs';
import { frame, at, ph, kick, dot, box, bl, arrow } from './boardd.mjs';
import { QL, SKIN, SHOES, COFFEE, FIELDS, yen } from './datad.mjs';
import { WELL, OFFER, starOf, rcOf, sRate, catOrder, renderN } from './nakami.mjs';

const dotC = (c, s = 10) => `<span style="display:inline-block; width:${s}px; height:${s}px; border-radius:50%; background:${c}; flex-shrink:0;"></span>`;
const big = (t, { size = 64, w = 900, lh = 1.3 } = {}) => `<div style="font-size:${size}px; font-weight:${w}; line-height:${lh}; letter-spacing:.01em;">${t}</div>`;
const byS = (s) => WELL.find((p) => p.s === s);

// ---------- N0 ひと目で ----------
function n0() {
  const steps = [['商品を開く', '商品名・楽天の URL・カテゴリから'], ['★の中身を見る', 'よかった｜残念だった を、何件中何件で'], ['気になる残念が少ないものへ', '同じくらいの値段で。2つをくらべる']];
  return frame('N0', 'ひと目で分かる形', `
${at(72, 150, `<div style="width:640px;">${big('★の数では、<br>わからないこと。', { size: 60 })}<div style="font-size:19px; line-height:1.7; color:${C.ink2}; margin-top:22px;">買った人のレビューを読んで、<br><b style="color:${C.ink};">よかったこと・残念だったこと</b>を数える。</div></div>`)}
${at(72, 480, `<div style="width:640px; display:flex; flex-direction:column; gap:22px;">${steps.map(([t, s], i) => `<div style="display:flex; gap:16px; align-items:center;">${dot(i + 1, { size: 40 })}<div><div style="font-size:21px; font-weight:900;">${t}</div><div style="font-size:14px; color:${C.ink2}; margin-top:2px;">${s}</div></div></div>`).join('')}</div>`)}
${at(72, 840, `<div style="width:640px; font-size:14px; line-height:1.7; color:${C.ink2};">覚える形は1つだけ。<b style="color:${C.ink};">左に「よかった」、右に「残念だった」</b>。どの商品・どのカテゴリでも同じ</div>`)}
${ph(renderN({ screen: 'product' }), 790, 130, 0.9 * 0.8)}
${arrow(1100, 420, 70, { color: C.ink2 })}
${at(1098, 386, `<div style="font-size:13px; font-weight:700; color:${C.ink2};">押すと</div>`)}
${ph(renderN({ screen: 'aspect' }), 1180, 130, 0.9 * 0.8)}
`, { src: 'ear', sub: '買う前に、いちばん知りたいことだけ' });
}

// ---------- N1 ★の順と、中身の順はちがう（実データ） ----------
function n1() {
  const byStar = [...WELL].sort((a, b) => starOf(b.s) - starOf(a.s));
  const { on } = catOrder('fit');
  const rowH = 96, top = 190, lx = 150, rx = 900;
  const yL = (p) => top + byStar.indexOf(p) * rowH, yR = (p) => top + on.indexOf(p) * rowH;
  const hl = new Set(['e7e3a226', '821de2ea']);
  const item = (p, right) => `<div style="display:flex; align-items:center; gap:12px; width:380px; ${right ? '' : 'flex-direction:row-reverse; text-align:right;'} opacity:${hl.has(p.s) ? 1 : 0.55};">${node(earArt(p.s, 50), { size: 60, bg: C.tile })}<div style="min-width:0;"><div style="font-size:15px; font-weight:700; white-space:nowrap;">${p.name}</div><div style="font-size:14px; margin-top:2px;">${right ? `<span style="color:${C.negText}; font-family:${F.num}; font-size:20px; font-weight:600;">${p.neg.fit}</span><span style="color:${C.ink2};"> ／${p.read}件中</span>` : `<span style="font-family:${F.num}; font-size:20px; font-weight:600;">★${starOf(p.s).toFixed(2)}</span><span style="color:${C.ink2};">（${rcOf(p.s)}件）</span>`}</div></div></div>`;
  const lines = WELL.map((p) => `<line x1="0" y1="${yL(p) - top + 30}" x2="${rx - lx - 380 - 40}" y2="${yR(p) - top + 30}" stroke="${hl.has(p.s) ? C.ink : C.line}" stroke-width="${hl.has(p.s) ? 3 : 1.5}" stroke-linecap="round"></line>`).join('');
  const v = byS('e7e3a226'), s = byS('821de2ea');
  return frame('N1', '★の順と、「つけ心地」の順はちがう', `
${at(lx, 130, `<div style="width:380px; text-align:right; font-size:15px; font-weight:900;">★の高い順</div>`)}
${at(rx, 130, `<div style="width:380px; font-size:15px; font-weight:900;">つけ心地の「残念」が少ない順</div>`)}
${byStar.map((p) => at(lx, yL(p), item(p, false))).join('')}
${on.map((p) => at(rx, yR(p), item(p, true))).join('')}
${at(lx + 380 + 20, top, `<svg width="${rx - lx - 380 - 40}" height="${6 * rowH}" aria-hidden="true" style="display:block;">${lines}</svg>`)}
${at(1330, 170, `<div style="width:200px; display:flex; flex-direction:column; gap:22px;">${box(`<div style="font-size:12.5px; color:${C.ink2};">★は6つのうち5番め</div><b style="font-size:15px;">${v.name}</b><div style="font-size:13px; line-height:1.6;">つけ心地の残念は<br><span style="font-family:${F.num}; font-size:26px; font-weight:600; color:${C.negText};">${v.neg.fit}</span> ／${v.read}件中</div>`, { pad: 16, gap: 4 })}${box(`<div style="font-size:12.5px; color:${C.ink2};">★は3番め</div><b style="font-size:15px;">${s.name}</b><div style="font-size:13px; line-height:1.6;">つけ心地の残念は<br><span style="font-family:${F.num}; font-size:26px; font-weight:600; color:${C.negText};">${s.neg.fit}</span> ／${s.read}件中</div>`, { pad: 16, gap: 4 })}</div>`)}
${at(150, 800, `<div style="width:1130px; font-size:17px; line-height:1.7;"><b>★は「全部まとめた平均」。</b><span style="color:${C.ink2};">自分が気にすることで並べると、順番が入れ替わる。だから★の中身を開いて見せる</span></div>`)}
${at(150, 870, `<div style="width:1300px; font-size:12px; color:${C.muted}; line-height:1.6;">イヤホンで、レビューを30件以上読めた6商品（今はこれだけ）。★とレビュー数は楽天の商品の値。並びは件数の少ない商品を端に寄せない式で決め、数字は元の件数（N件中M件）</div>`)}
`, { src: 'ear', sub: 'イヤホンの実データ' });
}

// ---------- N2 多角的に ----------
function n2() {
  const A = [
    ['person', 'だれが？', '楽天や Amazon で買う人なら、だれでも。★とレビューを見ない人はいない'],
    ['bell', 'いつ？', '買う直前。「これでいいかな」と商品ページを見ているとき'],
    ['alert', '何がこわい？', '失敗すること。★では「何が」残念なのかが分からない'],
    ['list', '何が面倒？', 'レビュー100件は読めない。数えて、左右3行ずつにする'],
    ['check', '何を信じる？', '編集部より、買った人。件数と、原文のひとこと（出典つき）'],
    ['search', 'どこから来る？', '「商品名 口コミ」「デメリット」の検索。楽天アプリの共有から URL で'],
    ['pair', 'ほかと何が違う？', '価格.com は仕様と値段、マイベストは順位、楽天の AI 要約は1商品の文章。ここは件数で、商品をまたいで乗り換えられる'],
    ['layers', '覚えることは？', '1つの形だけ。よかった｜残念だった。どの画面も、どのカテゴリも同じ'],
    ['sparkle', '見た目は？', 'モノが主役・大きな数字・押すと並びが動く。表・1位・色は増やさない'],
    ['info', '守ることは？', '分母を出す・よい面と残念を同じ大きさで・本文は出さない・アクセス制御を回避しない'],
  ];
  const card = ([ic, q, a]) => `<div style="height:290px; box-sizing:border-box; padding:24px; border-radius:26px; background:${C.tile}; display:flex; flex-direction:column; gap:12px;"><span style="width:52px; height:52px; border-radius:50%; background:#fff; display:flex; align-items:center; justify-content:center;">${icon(ic, { size: 26 })}</span><div style="font-size:24px; font-weight:900;">${q}</div><div style="font-size:15.5px; line-height:1.75; color:${C.ink2};">${a}</div></div>`;
  return frame('N2', '10の観点から考えた', `
${at(72, 130, `<div style="width:1456px; display:grid; grid-template-columns:repeat(5, 1fr); gap:18px;">${A.map(card).join('')}</div>`)}
${at(72, 800, `<div style="width:1456px; font-size:17px; line-height:1.7;"><b>いちばん大きい理由：</b><span style="color:${C.ink2};">みんなが「買う直前」に同じことをしている（★を見て、低い評価を探して読む）。その手間を、商品ページ1枚で終わらせる</span></div>`)}
`, { src: 'none', sub: 'だれでも使いたくなるか' });
}

// ---------- N3 考えた7つの案 ----------
function n3() {
  const crit = ['3秒で分かる', 'だれでも使う', 'ほかと違う', '今のデータで'];
  const ideas = [
    ['★の中身', '商品の★を開いて、よかった｜残念だった を数えて見せる', [2, 2, 2, 2], '中心にする', true],
    ['何が気になる？', 'カテゴリで「つけ心地」を選ぶと、残念が少ない順に動く', [2, 1, 2, 2], 'カテゴリの画面に', false],
    ['2つをくらべる', '迷っている2つの、ちがいが大きいことだけ', [2, 1, 1, 2], '乗り換えの次に', false],
    ['わたしと同じ人', '敏感肌・足幅が広い人の声だけで数えなおす', [1, 1, 2, 1], 'あとで（欄を確かめてから）', false],
    ['条件で絞る → 声で決める', '前回の見直し。予算と機能で絞ってから', [1, 1, 0, 2], '仕様の条件はあとで', false],
    ['声の線', '統合案。商品が不満〜満足の線に並ぶ', [0, 0, 2, 2], 'しまっておく', false],
    ['AI に質問すると答える', '「メガネでも痛くない？」に文章で答える', [2, 2, 1, 0], 'しない（件数を保証できない）', false],
  ];
  const mark = (v) => (v === 2 ? `<span style="display:inline-block; width:18px; height:18px; border-radius:50%; background:${C.ink};"></span>` : v === 1 ? `<span style="display:inline-block; width:18px; height:18px; border-radius:50%; background:linear-gradient(90deg, ${C.ink} 50%, #fff 50%); box-shadow:inset 0 0 0 2px ${C.ink};"></span>` : `<span style="display:inline-block; width:18px; height:18px; border-radius:50%; box-shadow:inset 0 0 0 2px ${C.faint};"></span>`);
  const cols = '270px 1fr repeat(4, 116px) 240px';
  return frame('N3', '考えた7つの案と、選んだもの', `
${at(72, 130, `<div style="width:1456px;"><div style="display:grid; grid-template-columns:${cols}; gap:16px; padding:0 18px 10px; font-size:12.5px; color:${C.muted}; font-weight:700; align-items:end;"><span>案</span><span></span>${crit.map((c) => `<span style="text-align:center;">${c}</span>`).join('')}<span>どうするか</span></div>
${ideas.map(([t, s, v, verdict, on]) => `<div style="display:grid; grid-template-columns:${cols}; gap:16px; align-items:center; padding:18px; margin-top:8px; border-radius:22px; background:${on ? C.ink : C.tile}; color:${on ? '#fff' : C.ink};"><b style="font-size:19px;">${t}</b><span style="font-size:13.5px; line-height:1.6; opacity:.85;">${s}</span>${v.map((x) => `<span style="text-align:center;">${on ? mark(x).replace(new RegExp(C.ink, 'g'), '#fff') : mark(x)}</span>`).join('')}<b style="font-size:14px;">${verdict}</b></div>`).join('')}</div>`)}
${at(72, 760, `<div style="display:flex; gap:24px; font-size:13px; color:${C.ink2}; align-items:center;"><span style="display:flex; gap:8px; align-items:center;">${mark(2)}できる</span><span style="display:flex; gap:8px; align-items:center;">${mark(1)}一部</span><span style="display:flex; gap:8px; align-items:center;">${mark(0)}できない</span><span>・「★の中身」を入口にし、「何が気になる？」と「2つをくらべる」を次の一歩としてつなぐ</span></div>`)}
`, { src: 'none', sub: '4つのものさしで' });
}

// ---------- N4 だれでも、同じ形で ----------
function n4() {
  const s = byS('821de2ea');
  const lo = SKIN.find((x) => x.id === 'lmt-uruoi'), lf = FIELDS['lmt-uruoi'];
  const sh = SHOES.find((x) => x.id === 'nb-arishi');
  const cf = COFFEE.find((x) => x.id === 'sw-drip'), cff = FIELDS['sw-drip'];
  const two = (pn, pl, nn, nl, read) => `<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">${[[false, pl, pn], [true, nl, nn]].map(([neg, l, n]) => `<div style="padding:12px 14px; border-radius:18px; background:#fff;"><div style="display:flex; align-items:center; gap:6px; font-size:13px; font-weight:900;">${dotC(neg ? C.neg : C.pos)}${neg ? '残念だった' : 'よかった'}</div><div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:8px;"><span style="font-size:14px;">${l}</span><span style="font-family:${F.num}; font-size:24px; font-weight:600; color:${neg ? C.negText : C.posText};">${n}</span></div><div style="font-size:11.5px; color:${C.muted}; text-align:right;">${read}件中</div></div>`).join('')}</div>`;
  const people = [
    ['通勤で使う人', 'イヤホン', '耳から落ちない？', 'earbuds', two(s.pos.fit, 'つけ心地', s.neg.fit, 'つけ心地', s.read), '実データ'],
    ['敏感肌の人', '化粧水', 'しみない？', 'bottle', `${two(lo.irr[0], 'しみない', lo.irr[1], 'しみた', lo.read)}<div style="padding:10px 14px; border-radius:18px; background:#fff; margin-top:10px; display:flex; justify-content:space-between; align-items:center;"><span style="font-size:13px; font-weight:900;">また買った</span><span style="font-size:13px;"><span style="font-family:${F.num}; font-size:22px; font-weight:600;">${lf.rep}</span> ／${lf.attr}件中</span></div>`, '見本'],
    ['はじめて走る人', 'ランニングシューズ', 'サイズは合う？', 'shoe', `<div style="padding:14px; border-radius:18px; background:#fff;"><div style="font-size:13px; font-weight:900; margin-bottom:10px;">サイズ感（好みの向き・灰色）</div>${just({ counts: sh.dir, w: 272, h: 9 })}<div style="font-size:11.5px; color:${C.muted}; text-align:right; margin-top:6px;">${sh.read}件中</div></div>`, '見本'],
    ['毎日飲む人', 'ドリップコーヒー', 'また買いたい味？', 'bag', `<div style="padding:14px; border-radius:18px; background:#fff;"><div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-size:13px; font-weight:900;">また買った</span>${factTag('本人が選んだ欄')}</div><div style="margin-top:8px;"><span style="font-family:${F.num}; font-size:34px; font-weight:500;">${cff.rep}</span><span style="font-size:13px; color:${C.ink2};"> 件（使い道の欄に答えた ${cff.attr}件中）</span></div></div>`, '見本'],
  ];
  const col = ([who, cat, q, ob, body, tag]) => `<div style="width:348px; box-sizing:border-box; padding:24px; border-radius:30px; background:${C.tile}; display:flex; flex-direction:column; gap:16px;"><span style="height:150px; border-radius:24px; background:#fff; display:flex; align-items:center; justify-content:center;">${ob === 'earbuds' ? earArt('821de2ea', 120) : objD(ob, { size: 124 })}</span><div><div style="font-size:14px; color:${C.ink2};">${who}・${cat}</div><div style="font-size:27px; font-weight:900; margin-top:4px; white-space:nowrap;">「${q}」</div></div>${body}<div style="font-size:12px; color:${C.muted}; margin-top:auto; padding-top:6px;">${tag === '実データ' ? 'イヤホンの実データ（AI の分類）' : '見本（楽天で30件を読み、単語の規則で数えた）'}</div></div>`;
  return frame('N4', 'だれが使っても、同じ形', `
${at(72, 128, `<div style="display:flex; gap:21px; align-items:stretch;">${people.map(col).join('')}</div>`)}
${at(72, 700, `<div style="width:1456px; display:flex; gap:40px; font-size:14px; color:${C.ink2}; line-height:1.7;"><div style="display:flex; gap:10px; align-items:center;">${dotC(C.pos, 12)}${dotC(C.neg, 12)}<span><b style="color:${C.ink};">よかった｜残念だった</b>：赤と青はここだけ</span></div><div style="display:flex; gap:10px; align-items:center;">${dotC(C.side, 12)}<span><b style="color:${C.ink};">好みの向き</b>（サイズ・味）：よい・わるいではないので灰色</span></div><div style="display:flex; gap:10px; align-items:center;">${icon('check', { size: 16 })}<span><b style="color:${C.ink};">また買った</b>：本人が選んだ欄の事実（AI を通さない）</span></div></div>`)}
`, { src: 'ear', sub: '質問はちがっても、答え方は1つ' });
}

// ---------- N5 変わること・決めてほしいこと ----------
function n5() {
  const change = [['入口', '声の線・条件 → <b>商品から</b>（商品名・楽天の URL・「たとえば」）'], ['主役', '<b>★の中身</b>：左に よかった、右に 残念だった。何件中何件'], ['次の一歩', '気になる残念を押す → 同じくらいの値段で少ないもの → 2つをくらべる'], ['言葉', '満足・不満 → <b>よかった・残念だった</b>'], ['タブ', 'ホーム・さがす・くらべる の3つ'], ['カテゴリ', '「何が気になる？」を押すと、残念が少ない順に動く（順位ではない）']];
  const keep = ['数字は N件中M件。件数に「推定」は付けない', 'よい面と残念を同じ大きさで並べる', 'レビュー本文は出さない。照合した短い引用だけ（出典つき）', '「何が気になる？」に出す観点は、散らばりのゲートを通ったものだけ', '言及が少ない商品は並べず「ふれた声が少ない」へ', '相手のアクセス制御は回避しない'];
  const need = ['引用に「よかった・残念」の向きを持たせる（今のデータに無い。見本は人が読んで選んだ）', '乗り換えの判定（同じくらいの値段・残念が少ない）を純粋関数に', '★とレビュー数は楽天の商品の値をそのまま出す'];
  const asks = [['この「★の中身」を中心にしてよいか', ''], ['言葉は「残念だった」でよいか', 'ほかの候補：イマイチ・不満だった'], ['仕様の条件（ノイキャンなど）は最初は出さない', '前回の見直しの「条件で絞る」は、あとで足す']];
  return frame('N5', '変わること・決めてほしいこと', `
${at(72, 128, `<div style="width:860px;">${kick('いまの案から変わること')}${change.map(([a, b]) => `<div style="display:grid; grid-template-columns:120px 1fr; gap:16px; padding:12px 0; border-top:1px solid ${C.hair}; font-size:15px; line-height:1.6; align-items:baseline;"><b>${a}</b><span style="color:${C.ink2};">${b}</span></div>`).join('')}</div>`)}
${at(72, 500, `<div style="display:grid; grid-template-columns:1fr 1fr; gap:18px; width:860px;">${box(`${kick('変えないこと')}<div>${bl(keep, { fs: 12.5 })}</div>`, { pad: 20, gap: 6 })}${box(`${kick('実装で要ること')}<div>${bl(need, { fs: 12.5, ic: 'info', color: C.ink2 })}</div>`, { pad: 20, gap: 6 })}</div>`)}
${at(990, 128, `<div style="width:538px;">${box(`<div style="font-size:20px; font-weight:900;">決めてほしいこと</div>${asks.map(([q, s], i) => `<div style="display:flex; gap:14px; padding:14px 0; border-top:1px solid ${C.hair};">${dot(i + 1, { size: 30 })}<div><div style="font-size:16px; font-weight:900; line-height:1.5;">${q}</div>${s ? `<div style="font-size:13px; color:${C.ink2}; margin-top:3px;">${s}</div>` : ''}</div></div>`).join('')}`, { pad: 26, gap: 4 })}
<div style="margin-top:18px;">${box(`${kick('触って確かめる')}<div style="font-size:14px; line-height:1.7; color:${C.ink2};">このページの下に<b style="color:${C.ink};">触れる試作</b>（イヤホンの実データ）。ホーム →「たとえば」→ 残念を押す → 乗り換え → くらべる</div>`, { pad: 22, gap: 6, bg: C.tile, shadow: 'none' })}</div></div>`)}
`, { src: 'none', sub: 'OK なら、この形で作る' });
}

export const SHEETS_N = [['N0.dc.html', 'N0 ひと目で分かる形', n0], ['N1.dc.html', 'N1 ★の順と、つけ心地の順はちがう', n1], ['N2.dc.html', 'N2 10の観点から考えた', n2], ['N3.dc.html', 'N3 考えた7つの案と、選んだもの', n3], ['N4.dc.html', 'N4 だれが使っても、同じ形', n4], ['N5.dc.html', 'N5 変わること・決めてほしいこと', n5]];

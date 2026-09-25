// 統合案のボード（D00〜D09）
import { C, F, SH, icon, objD, earArt, shoeArt, num, small, tile, pill, qchip, cchip, seg, node, strip, just, again, coverage, tagCard, mark, OBJ_COL, factTag, aiTag, fieldBar } from './libd.mjs';
import { frame, at, ph, pc, h, p, kick, dot, box, note, bl, arrow, bigNum } from './boardd.mjs';
import { MAPPED, STATS, AXES, POLE, byShort, SHOES, COFFEE, MEASURE, ALL_DIR, UNITS, LISTING_REQUESTS, FIELDS, FIELD_CATS } from './datad.mjs';
import { QL, ruler, earItems, dHome, dCategory, dCategoryTags, dCategoryCond, dProduct, dProduct2, dSimilar, dCompare, dMe, dSearch, dTodo, dFacts } from './screensd.mjs';

const line = (cols, cells, { head = false, fs = 13, pad = 11 } = {}) => `<div style="display:grid; grid-template-columns:${cols}; gap:14px; padding:${head ? '0 0 8px' : `${pad}px 0`}; ${head ? '' : `border-top:1px solid ${C.hair};`} font-size:${head ? 12 : fs}px; ${head ? `color:${C.muted}; font-weight:700;` : 'line-height:1.55;'} align-items:center;">${cells.map((c) => `<span>${c}</span>`).join('')}</div>`;

// ---------- D00 決めたこと ----------
function d00() {
  const ans = [
    ['1', '案は混ぜる', '価格.com・マイベストと体験で違うと分かる。好み・嫌いを守り、使いやすく洗練、だれでも分かる'],
    ['2', '範囲は②', '系統をまたいで10カテゴリ（D07）'],
    ['3', 'わたしの条件', 'この端末の中だけ。登録なし'],
    ['4', 'AI の有料枠', '使ってよい。使う前に、金額を具体的にして聞く（D08）'],
    ['5', '最初の検証', 'イヤホン・化粧水・ランニングシューズの3つで抽出し直してから、10へ広げる（D08）'],
  ];
  const take = [
    ['A', '案A', ['これに似たもの（押した商品を真ん中に）', 'くらべる（違うところから先に）'], ['すべての点に色のリング', '文字の箱の四象限']],
    ['B', '別案B', ['見た目：白地・モノが主役・色は声の2色だけ', '商品の絵の丸と点線', '浮いた丸いタブ', '空きタイル（読めた量）'], ['下の輪（チップのほうが誰でも分かる）', '半円のゲージ（分母が見えない）']],
    ['C', '別案C', ['声札・声の3つの型', 'わたしの条件で数えなおす', '読めた深さで見せ方を変える', '観点の辞書と人の承認'], ['紙色の地（B の白に合わせる）', '「段」「声札」などの言葉を画面に出すこと']],
  ];
  return frame('00', '決めたこと', `
${at(72, 96, `<span style="display:inline-flex; align-items:center; gap:6px; height:28px; padding:0 12px; border-radius:14px; background:${C.ink}; color:#fff; font-size:13px; font-weight:700;">${icon('check', { size: 14, sw: 2.4 })}このキャンバスが、決定版の候補（あなたの OK 待ち）。使いやすさの見直しは「改訂」ページ（R0〜R3）。状態は D11</span>`)}
${at(72, 128, `<div style="width:640px;">${kick('いただいた回答')}${ans.map(([n, t, s]) => `<div style="display:flex; gap:14px; padding:14px 0; border-top:1px solid ${C.hair};">${dot(n, { size: 28 })}<div><div style="font-size:17px; font-weight:900;">${t}</div><div style="font-size:13.5px; color:${C.ink2}; line-height:1.65; margin-top:3px;">${s}</div></div></div>`).join('')}</div>`)}
${at(780, 128, `<div style="width:748px;">${kick('何を、どこから混ぜたか')}<div style="display:flex; flex-direction:column; gap:12px; margin-top:12px;">${take.map(([k, t, yes, no]) => box(`<div style="display:grid; grid-template-columns:70px 1fr 1fr; gap:16px; align-items:start;"><div style="font-size:20px; font-weight:900;">${t}</div><div>${small('使う', { size: 12, color: C.ink })}<div style="margin-top:6px;">${bl(yes, { fs: 13 })}</div></div><div>${small('使わない', { size: 12, color: C.ink })}<div style="margin-top:6px;">${bl(no, { ic: 'close', color: C.faint, fs: 13 })}</div></div></div>`, { pad: 20 })).join('')}</div></div>`)}
${at(72, 640, `<div style="width:1456px; font-size:14px; line-height:1.7;"><b>ひとことで：</b>C の骨組み（区分・声の型・わたしの条件・読めた深さ）を、B の見た目で、A の「似ているもの」と一緒に。画面の言葉は、だれでも分かる日常語にそろえた（D03）</div>`)}
`, { src: 'none' });
}

// ---------- D01 価格.com・マイベストとの違い ----------
function d01() {
  const mini = (inner) => `<div style="width:230px; height:300px; border-radius:26px; background:#fff; box-shadow:0 0 0 6px #161616, ${SH.lift}; overflow:hidden; position:relative; font-family:${F.jp};">${inner}</div>`;
  const table = mini(`<div style="padding:22px 14px; font-size:11px;"><div style="display:grid; grid-template-columns:1.4fr 1fr 1fr; gap:0; border:1px solid ${C.line};">${Array.from({ length: 10 }, (_, i) => `<span style="height:22px; border-right:1px solid ${C.line}; border-bottom:1px solid ${C.line}; background:${i === 0 ? C.tile : '#fff'};"></span><span style="height:22px; border-right:1px solid ${C.line}; border-bottom:1px solid ${C.line}; background:${i === 0 ? C.tile : '#fff'};"></span><span style="height:22px; border-bottom:1px solid ${C.line}; background:${i === 0 ? C.tile : '#fff'};"></span>`).join('')}</div><div style="margin-top:8px; color:${C.muted};">仕様・最安値・★の平均</div></div>`);
  const rank = mini(`<div style="padding:22px 14px;"><div style="height:110px; border-radius:12px; background:${C.tile}; display:flex; align-items:center; justify-content:center; font-family:${F.num}; font-size:30px; font-weight:700;">No.1</div>${[2, 3, 4, 5].map((n) => `<div style="display:flex; gap:8px; align-items:center; margin-top:8px;"><span style="font-family:${F.num}; font-weight:700; width:16px;">${n}</span><span style="flex:1; height:22px; border-radius:6px; background:${C.tile};"></span></div>`).join('')}<div style="margin-top:8px; font-size:11px; color:${C.muted};">編集部の検証と順位</div></div>`);
  const ours = mini(`<div style="position:absolute; left:14px; top:22px; font-size:12px; font-weight:900;">どこが気になりますか？</div><div style="position:absolute; left:14px; top:46px; display:flex; gap:5px;">${qchip('つけ心地', { on: true, h: 26, fs: 11 })}${qchip('ノイキャン', { h: 26, fs: 11 })}</div><div style="position:absolute; left:14px; top:84px; transform:scale(.505); transform-origin:0 0;">${ruler(earItems('fit'), { w: 400, h: 330, lo: '合わない', hi: '良い', sel: '821de2ea' })}</div><div style="position:absolute; left:14px; bottom:18px; right:14px; font-size:11px; color:${C.muted};">買った人の声の線（順位なし）</div>`);
  const rows = [['最初に目に入るもの', '仕様と値段の表', '1位の商品', '商品の絵が、声の線に並ぶ'], ['答えてくれる問い', 'どの仕様か・どこが安いか', 'どれがいちばんか', '買った人はどう感じたか。自分と同じ人は'], ['だれの判断か', 'メーカーの仕様と値段', '編集部の検証', '買った人全員の件数（AI が分類）'], ['読めていない商品', '見せ方の決まりは無い', '載らない', '「これから読みます」と見せる'], ['お金の場所', '最安値の店', '1位の購入ボタン', '声を読んだあとに1か所']];
  return frame('01', '価格.com・マイベストとの違い', `
${at(72, 124, `<div style="display:flex; gap:48px; align-items:flex-start;">${[['仕様で比べる', table], ['順位で選ばせる', rank], ['声の線で見る（この案）', ours]].map(([t, v], i) => `<div style="display:flex; flex-direction:column; gap:14px; align-items:center; width:260px;"><b style="font-size:16px; ${i === 2 ? '' : `color:${C.ink2};`}">${t}</b>${v}</div>`).join('')}</div>`)}
${at(72, 520, `<div style="width:1000px;">${line('170px 1fr 1fr 1.3fr', ['', '価格.com 型', 'マイベスト 型', 'この案'], { head: true })}${rows.map((r) => line('170px 1fr 1fr 1.3fr', [`<b>${r[0]}</b>`, `<span style="color:${C.ink2};">${r[1]}</span>`, `<span style="color:${C.ink2};">${r[2]}</span>`, `<b>${r[3]}</b>`])).join('')}<div style="font-size:11.5px; color:${C.muted}; margin-top:8px;">2つのサイトにもレビューや口コミはある。ここでは「主に見せるもの」を比べた（画面は形だけの模式図）</div></div>`)}
${at(1120, 124, `<div style="width:408px;">${box(`${kick('ひと目で分かる違い')}${[['順位ではなく、位置', '1位を作らない。右ほど満足、左ほど不満'], ['仕様ではなく、買ったあと', '「つけ心地」「サイズは合う？」で見る'], ['編集部ではなく、買った人全員', '何件中何件かを、そのまま出す'], ['わたしと同じ人だけ', '敏感肌・足幅が広い人の声で数えなおす'], ['読めていないことも見せる', '空きタイルと「これから読みます」']].map(([t, s], i) => `<div style="display:flex; gap:10px; padding:10px 0; border-top:1px solid ${C.hair};">${dot(i + 1, { size: 24 })}<div><div style="font-size:15px; font-weight:900;">${t}</div><div style="font-size:12.5px; color:${C.ink2}; margin-top:2px;">${s}</div></div></div>`).join('')}`, { pad: 22, gap: 4 })}</div>`)}
`, { src: 'ear' });
}

// ---------- D02 好み・嫌いから ----------
function d02() {
  const likes = [['モノが主役（好き2・3・4）', '白地に商品の絵。画面の色は商品と声の2色だけ'], ['画像を空間に並べる（好き7・8）', '声の線と「これに似たもの」は商品の絵で描く'], ['空きタイルもリズム（好き9）', '読めた量を空きタイルで見せる'], ['大きな数字＋小さな説明（好き10・11）', '件数は太い数字、説明は小さく'], ['柔らかい部品（好き3・5）', '角の丸いタイル・浮いた丸いタブ・黒い丸のボタン'], ['触ると動く（好き1・7）', '気になることを選ぶと、商品が線の上を動く']];
  const avoid = [['表だらけ（Q11）', '一覧はカードだけ。表は作らない'], ['1位推し（Q11）', '順位を出さない。並びは位置か「読めた多さ」'], ['ゲームっぽい・かわいい（嫌い5）', 'お祝い・連続記録・キャラクターを置かない'], ['お堅い統計（Q11）', '「分離度」「収縮」を画面に出さない（D03）'], ['文字で埋めた2軸（嫌い1・4）', '軸の言葉は端に2つだけ。名前は押したときに'], ['色が多い・強い（嫌い6・7）', 'グラデーション・原色の面を使わない'], ['AI が作りがちな見た目（Q11）', '紫のグラデーション・光る枠・絵文字を使わない']];
  return frame('02', '好み・嫌いから', `
${at(72, 128, `<div style="width:700px;">${kick('好きから取り入れたこと')}${likes.map(([a, b]) => line('290px 1fr', [`<b>${a}</b>`, `<span style="color:${C.ink2};">${b}</span>`], { fs: 13.5 })).join('')}</div>`)}
${at(828, 128, `<div style="width:700px;">${kick('嫌い・避けたいから、しないこと')}${avoid.map(([a, b]) => line('290px 1fr', [`<b>${a}</b>`, `<span style="color:${C.ink2};">${b}</span>`], { fs: 13.5 })).join('')}</div>`)}
${ph(dHome(), 72, 560, 0.42)}${ph(dCategory(), 260, 560, 0.42)}${ph(dCategoryTags(), 448, 560, 0.42)}${ph(dSimilar(), 636, 560, 0.42)}
${at(840, 600, `<div style="width:688px; font-size:13.5px; line-height:1.8; color:${C.ink2};">並べると、画面の大半は<b style="color:${C.ink};">白と薄い灰色と商品の絵</b>。赤と青は「不満」「満足」の2つにしか使わない。サイズや味のような「好みの向き」には、どちらの色も使わない（良し悪しではないため）</div>`)}
`, { src: 'ear' });
}

// ---------- D03 だれでも分かるための約束 ----------
function d03() {
  const words = [['観点', '気になること'], ['分離度が低い', 'みんな同じ／みんな満足'], ['収縮・中央に寄る', '真ん中＝意見が割れている、または読めたレビューが少ない'], ['言及なし', 'ふれていない'], ['段0（名前だけ）', 'これから読みます'], ['声札', '（言葉として出さない）'], ['ちょうどよさ', 'サイズは合いますか？（質問にする）'], ['条件（声の主）', 'わたしと同じ人だけ']];
  const rules = [['1画面に1つの問い', '見出しを質問にする：「どこが気になりますか？」「サイズは合いますか？」'], ['はじめての説明は1回だけ', '3行で閉じられる。2回目からは出ない'], ['色だけに頼らない', '左右の位置と「不満」「満足」の言葉を必ず添える'], ['数字は必ず分母つき', '「129件中14件」。割合だけを出さない'], ['押せるものは44px以上', '文字は11px以上（CLAUDE.md）'], ['いつでも元に戻れる', '条件はチップ1つで外せる。戻るボタンは左上']];
  return frame('03', 'だれでも分かるための約束', `
${at(72, 128, `<div style="width:560px;">${kick('中の言葉 → 画面の言葉')}${words.map(([a, b]) => line('180px 1fr', [`<span style="color:${C.muted};">${a}</span>`, `<b>${b}</b>`], { fs: 13.5 })).join('')}</div>`)}
${at(72, 560, `<div style="width:560px; display:flex; flex-direction:column; gap:12px;">${rules.slice(0, 3).map(([t, s], i) => note(i + 1, t, s)).join('')}</div>`)}
${at(680, 560, `<div style="width:420px; display:flex; flex-direction:column; gap:12px;">${rules.slice(3).map(([t, s], i) => note(i + 4, t, s)).join('')}</div>`)}
${ph(dCategory({ coach: true }), 700, 124, 0.5)}
${at(930, 150, `<div style="width:170px; font-size:12.5px; color:${C.ink2}; line-height:1.7;">はじめて開いたときだけの説明。線の読み方を3行で</div>`)}
${ph(dCategoryCond(), 1160, 124, 0.5)}
${at(1160, 580, `<div style="width:370px; font-size:12.5px; color:${C.ink2}; line-height:1.7;">「わたしと同じ人だけ」はスイッチ1つ。いま何件で数えているかを、スイッチの下に必ず書く（見本）</div>`)}
`, { src: 'none' });
}

// ---------- D04 画面の流れ ----------
function d04() {
  const S = 0.3, pw = 410 * S, gap = 60;
  const place = [
    [dHome(), 72, 150, 'ホーム'], [dCategory(), 72 + pw + gap, 150, 'カテゴリ（線）'], [dProduct(), 72 + 2 * (pw + gap), 150, '商品'], [dProduct2(), 72 + 3 * (pw + gap), 150, '商品（つづき）'], [dSimilar(), 72 + 4 * (pw + gap), 150, 'これに似たもの'], [dCompare(), 72 + 5 * (pw + gap), 150, 'くらべる'],
    [dCategoryTags(), 72 + pw + gap, 560, 'カテゴリ（一覧）'], [dCategoryCond(), 72 + 2 * (pw + gap), 560, 'わたしと同じ人だけ'], [dSearch(), 72, 560, 'さがす'], [dMe(), 72 + 4 * (pw + gap), 560, 'わたし'], [dTodo(), 72 + 5 * (pw + gap), 560, 'これから読む'],
  ];
  let html = '';
  for (const [s, x, y, t] of place) { html += at(x, y - 30, `<b style="font-size:13px;">${t}</b>`); html += ph(s, x, y, S); }
  const ar = (x, y, w = 50) => arrow(x, y, w, { color: C.ink2 });
  html += ar(72 + pw + 5, 270) + ar(72 + 2 * pw + gap + 5, 270) + ar(72 + 3 * pw + 2 * gap + 5, 270) + ar(72 + 4 * pw + 3 * gap + 5, 270) + ar(72 + 5 * pw + 4 * gap + 5, 270);
  html += at(72 + pw + gap + 40, 420, `<div style="font-size:12px; color:${C.ink2};">↕ 線と一覧を切り替え</div>`);
  html += at(72 + 2 * (pw + gap) - 30, 420, `<div style="font-size:12px; color:${C.ink2};">↘ 条件のスイッチ</div>`);
  html += at(72 + 4 * (pw + gap) + 10, 420, `<div style="font-size:12px; color:${C.ink2};">↻ まわりを押すと真ん中が入れ替わる</div>`);
  html += at(72, 900, `<div style="width:1456px; font-size:13.5px; color:${C.ink2};">いちばん短い道：ホーム → カテゴリ → 商品 → 楽天で見る（3回押す）。「これに似たもの」と「くらべる」は、決めきれない人のための寄り道</div>`);
  return frame('04', '画面の流れ', html, { src: 'ear' });
}

// ---------- D05 部品 ----------
function d05() {
  const e = byShort['821de2ea'], sh = SHOES.find((s) => s.id === 'nb-arishi'), cf = COFFEE[2];
  const part = (t, s, v, w = 460) => `<div style="width:${w}px;">${box(`<div style="font-size:16px; font-weight:900;">${t}</div><div style="min-height:50px; display:flex; align-items:center;">${v}</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.65;">${s}</div>`, { pad: 20, gap: 8 })}</div>`;
  return frame('05', '部品', `
${at(72, 116, `<div style="display:grid; grid-template-columns:repeat(3, 460px); gap:16px;">
${part('声の線', '商品の絵を1本の線に並べる。右ほど満足、左ほど不満。丸の大きさ＝書いた人の数。点線＝読めたレビューが少ない', `<div style="transform:scale(.62); transform-origin:0 0; height:168px; width:420px;">${ruler(earItems('fit'), { w: 660, h: 270, lo: POLE.fit.neg, hi: POLE.fit.pos })}</div>`)}
${part('声の帯', '左から不満・右から満足。帯の長さ全体＝読んだ件数なので、分母が見える', strip({ pos: e.pos.anc, neg: e.neg.anc, read: e.read, w: 410, h: 9, name: QL.anc }))}
${part('好みの帯', 'サイズや味のように、良し悪しではないもの。真ん中の黒が「ちょうど」。赤と青は使わない', just({ counts: ALL_DIR, w: 410, h: 9, name: 'サイズ感（見本）', read: MEASURE.cats[1].n }))}
${part('一覧の1枚', '一覧の1枚（中では「声札」と呼ぶ）。不満→満足の順。型に合う行だけを出す（空欄にしない）', `<div style="display:flex; gap:10px; align-items:flex-start; transform:scale(.72); transform-origin:0 0; height:172px;">${tagCard({ img: earArt(e.s, 84), name: e.name, read: e.read, lines: [{ kind: 'neg', t: QL.fit, n: e.neg.fit }, { kind: 'pos', t: QL.sound, n: e.pos.sound }], w: 170, imgH: 84 })}${tagCard({ img: shoeArt(sh, 84), name: sh.name, read: sh.read, lines: [{ kind: 'pos', t: '軽さ', n: sh.light[0] }], justP: { counts: sh.dir }, w: 170, imgH: 84 })}</div>`)}
${part('これに似たもの', '押した商品を真ん中に。近いほど声の出方が似ている。↑↓は「こちらが好評・不満寄り」', `<div style="display:flex; gap:8px; align-items:center;">${node(earArt('cb0101de', 40), { size: 46 })}<span style="font-size:11px; font-weight:700; background:#fff; padding:2px 7px; border-radius:9px; box-shadow:${SH.soft};">操作 ↓</span><span style="flex:1; border-top:1.4px dashed #C9C9C5; width:60px;"></span>${node(earArt(e.s, 60), { size: 66, sel: true })}</div>`)}
${part('読めた量', '1マス＝1商品。塗り＝読めた。読めていないことを隠さない', coverage(STATS.total, STATS.analysed, { cell: 7, gap: 3, cols: 40 }))}
${part('気になること・わたしの条件', '質問のチップは灰色、条件のチップは人の印。「みんな満足」は点線で押せない', `<div style="display:flex; gap:8px; flex-wrap:wrap;">${qchip('つけ心地', { on: true })}${qchip('ノイキャン')}${qchip('音質はみんな満足', { flat: true, fs: 12.5 })}${cchip('足幅が広い', { on: true })}</div>`)}
${part('また買った', 'レビューの欄「リピート」をそのまま数える（AI なし）。分母は欄に答えた人。使って減るモノだけ', `<div style="display:flex; gap:12px; align-items:center;">${factTag()}<span style="font-size:13px;">リピート ${num(FIELDS['sw-drip'].rep, { size: 15, w: 600 })}／${FIELDS['sw-drip'].attr}人</span>${pill('また買う', { kind: 'line', h: 34, fs: 12.5 })}</div>`)}
${part('浮いた丸いタブ', 'ホーム・さがす・くらべる・わたしの4つ。片手で届く下に', `<div style="position:relative; width:410px; height:70px;">${`<nav style="position:absolute; left:0; right:0; top:4px; height:60px; border-radius:30px; background:#fff; box-shadow:${SH.lift}; display:grid; grid-template-columns:repeat(4, 1fr); padding:5px; box-sizing:border-box;">${[['home', 'ホーム'], ['search', 'さがす'], ['pair', 'くらべる'], ['person', 'わたし']].map(([ic, t], i) => `<span style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; border-radius:25px; background:${i === 1 ? C.tile : 'transparent'}; font-size:11px; font-weight:${i === 1 ? 700 : 500};">${icon(ic, { size: 19 })}${t}</span>`).join('')}</nav>`}</div>`)}
</div>`)}
`, { src: 'ear' });
}

// ---------- D06 見た目 ----------
function d06() {
  const sw = [['白', '#FFFFFF', '地'], ['灰', C.tile, 'タイル・商品の台'], ['地図', C.map, '線と地図の地'], ['墨', C.ink, '文字・ちょうど'], ['不満', C.neg, '帯の左・左端の印'], ['満足', C.pos, '帯の右・右端の印'], ['向き', C.side, '好みの帯の両側'], ['余白', C.rest, 'ふれていない']];
  const objs = [...Object.keys(OBJ_COL), 'pump', 'tub'];
  return frame('06', '見た目', `
${at(72, 128, `<div style="width:720px;">${kick('色')}<div style="font-size:21px; font-weight:900; margin-top:6px;">ほぼ白黒。色は商品の絵と、声の2色だけ</div><div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:14px; margin-top:18px;">${sw.map(([n, c, u]) => `<div style="display:flex; flex-direction:column; gap:6px;"><span style="height:64px; border-radius:18px; background:${c}; box-shadow:inset 0 0 0 1px rgba(0,0,0,.08);"></span><b style="font-size:13px;">${n}</b><span style="font-family:${F.num}; font-size:11.5px; color:${C.muted};">${c}</span><span style="font-size:11.5px; color:${C.ink2};">${u}</span></div>`).join('')}</div><div style="font-size:12px; color:${C.muted}; margin-top:10px; line-height:1.6;">不満（橙寄りの赤）と満足（青）は、色が見分けにくい人にも明るさと位置で分かれる（Q20 の「青と橙」）</div></div>`)}
${at(860, 128, `<div style="width:668px;">${kick('文字')}<div style="margin-top:10px;"><div style="font-size:38px; font-weight:900;">買った人の声で、自分に合うかを見る</div><div style="font-size:12px; color:${C.muted}; margin-top:4px;">Zen Kaku Gothic New 900 ・ 見出し</div><div style="font-size:15px; margin-top:14px; line-height:1.7;">つけ心地にふれたレビューは129件中35件。</div><div style="font-size:12px; color:${C.muted};">Zen Kaku Gothic New 400 ・ 本文</div><div style="font-family:${F.num}; font-size:40px; font-weight:500; margin-top:14px;">129 <span style="color:${C.faint}; font-weight:300;">/</span> 132</div><div style="font-size:12px; color:${C.muted};">Outfit ・ 数字</div></div></div>`)}
${at(72, 560, `<div style="width:1456px;">${kick('モノの絵（実装では楽天の商品画像。ここでは色から描いた代わりの絵）')}<div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px;">${objs.map((o) => tile(objD(o, { size: 58 }), { w: 66, r: 18 })).join('')}</div></div>`)}
${at(72, 730, `<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; width:1456px;">${[['角', '大きい丸み（タイル22・カード20・ボタン半円）'], ['影', '浮くものだけ（タブ・下から出る板）。カードは薄い影'], ['動き', '位置が変わるときだけ 0.5秒。飾りの動きは無し'], ['暗い画面', '後で。白地で完成させてから']].map(([t, s]) => box(`<div style="font-size:15px; font-weight:900;">${t}</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.6;">${s}</div>`, { pad: 18, gap: 6, bg: C.tile, shadow: 'none' })).join('')}</div>`)}
`, { src: 'none' });
}

// ---------- D07 最初の10カテゴリ ----------
function d07() {
  const st = { real: ['読めている', C.ink, '#fff'], sample: ['見本だけ', C.tile, C.ink], todo: ['これから', '#fff', C.ink2] };
  const rows = UNITS.map((u) => { const L = u.listing; const s = st[u.state]; return line('46px 170px 110px 200px 180px 130px 100px 100px 1fr', [tile(objD(u.obj, { size: 36 }), { w: 40, r: 12 }), `<b>${u.name}</b>`, `<span style="color:${C.ink2};">${u.fam}</span>`, `<span style="color:${C.ink2};">${u.voice.join('・')}</span>`, `<span style="color:${C.ink2};">${u.conds.join('・')}</span>`, L ? (L.withRev ? `${num(L.withRev, { size: 13 })}<span style="color:${C.muted};"> / ${L.items}＊</span>` : `${num(L.ge30, { size: 13 })}<span style="color:${C.muted};"> / ${L.items}</span>`) : `<span style="color:${C.negText};">503（2回）</span>`, L && L.medRev ? num(L.medRev.toLocaleString('ja-JP'), { size: 13 }) : '—', L ? num(`¥${L.medPrice.toLocaleString('ja-JP')}`, { size: 13 }) : '—', `<span style="display:inline-flex; height:24px; align-items:center; padding:0 10px; border-radius:12px; background:${s[1]}; color:${s[2]}; border:1px solid ${C.line}; font-size:12px; font-weight:700;">${s[0]}</span>${L && L.topShop >= 11 ? ` <span style="font-size:11.5px; color:${C.negText};">1店が${L.topShop}/${L.items}</span>` : ''}`], { fs: 12.5, pad: 7 }); }).join('');
  return frame('07', '最初の10カテゴリ', `
${at(72, 124, `<div style="width:1456px;">${line('46px 170px 110px 200px 180px 130px 100px 100px 1fr', ['', 'カテゴリ', '系統', '声の型', '条件の例', 'レビュー30件以上', 'レビュー数（中央）', '値段（中央）', '状態'], { head: true })}${rows}</div>`)}
${at(72, 770, `<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; width:1456px;">${box(`${kick('選び方')}<div style="font-size:13px; color:${C.ink2}; line-height:1.7;">6つの系統から最低1つ。3つの声の型と条件が、全部どこかで試せるように。需要は測れていない（検索の量を取る手段が無い）ので判断で選んだ</div>`, { pad: 18, gap: 6 })}${box(`${kick('気をつけること')}<div style="font-size:13px; color:${C.ink2}; line-height:1.7;">シューズはレビューが薄い（30件以上は45のうち15）。コーヒーは1つのお店が45のうち20。キャットフードも1店が11</div>`, { pad: 18, gap: 6 })}${box(`${kick('測れなかったもの')}<div style="font-size:13px; color:${C.ink2}; line-height:1.7;">シャンプーと枕の一覧は、時間をあけて2回とも 503。繰り返さず止めた。ドライヤーと掃除機の一覧は、ほかの種類を含む。＊イヤホンは商品価格ナビでレビューが1件以上の数</div>`, { pad: 18, gap: 6 })}</div>`)}
`, { src: 'list', sub: `一覧の1ページ目（最大45商品）を読んだ。${LISTING_REQUESTS.ok}つは読めた` });
}

// ---------- D08 検証の順番と AI の費用 ----------
function d08() {
  const step1 = [['イヤホン', '読んだ976件を分類し直す', '約33回'], ['化粧水', '20商品×3ページ', '約60回'], ['ランニングシューズ', '20商品×3ページ', '約60回']];
  return frame('08', '検証の順番と AI の費用', `
${at(72, 118, `<div style="width:700px; padding:12px 16px; border-radius:18px; background:${C.tile}; box-sizing:border-box;"><b style="font-size:14px;">0. 本人が選んだ欄を確かめる（キーなし）</b><div style="font-size:12.5px; color:${C.ink2}; line-height:1.6; margin-top:4px;">回数の定義・並び順の偏り・商品価格ナビに無いこと・答えた人だけの偏り（D10）</div></div>`)}
${at(72, 214, `<div style="width:700px;">${kick('1. まず3つで抽出し直す（無料枠で1日）')}${step1.map(([a, b, c]) => line('180px 1fr 100px', [`<b>${a}</b>`, `<span style="color:${C.ink2};">${b}</span>`, num(c, { size: 13 })], { fs: 13.5 })).join('')}<div style="font-size:13px; color:${C.ink2}; line-height:1.75; margin-top:14px;">測ること：<br>・条件を書いた人の割合（AI で）と、単語の規則との一致<br>・「好み（サイズ等）」「また買った」の当たり外れ（人が100件を抜き取って確かめる）<br>・「わたしと同じ人だけ」を出してよい件数（今は20件の仮置き）</div></div>`)}
${at(72, 560, `<div style="width:700px;">${kick('2. 10カテゴリへ広げる')}<div style="display:flex; gap:40px; margin-top:14px;">${bigNum('2,400', '回の呼び出し（推定）＝10 × 60商品 × 4ページ', { size: 42 })}${bigNum('約5', '日＝無料枠（1日500回）のまま', { size: 42, sub: '日' })}</div><div style="font-size:13px; color:${C.ink2}; line-height:1.75; margin-top:14px;">無料枠でも回るので、<b style="color:${C.ink};">有料枠は「急ぐとき」だけ</b>。使う前に、下の数字で改めて聞く</div></div>`)}
${at(840, 128, `<div style="width:688px; display:flex; flex-direction:column; gap:16px;">${box(`${kick('有料で10カテゴリを1回分類すると（推定）')}${line('190px 1fr 1fr', ['', '入力', '出力'], { head: true })}${line('190px 1fr 1fr', ['<b>トークン</b>', '840万〜1,080万', '360万〜580万'], { fs: 13.5 })}${line('190px 1fr 1fr', ['<b>単価（100万あたり）</b>', '$0.25', '$1.50'], { fs: 13.5 })}${line('190px 1fr 1fr', ['<b>金額</b>', '$2.1〜2.7', '$5.4〜8.6'], { fs: 13.5 })}<div style="display:flex; align-items:baseline; gap:12px; margin-top:8px;"><span style="font-family:${F.num}; font-size:36px; font-weight:500;">$7.5〜11</span><span style="font-size:13px; color:${C.ink2};">1回あたり（約1,100〜1,700円。1ドル150円で換算）。まとめて送る方式なら半額</span></div><div style="font-size:12px; color:${C.muted}; line-height:1.6;">モデルは Flash-Lite（今の抽出と同じ系統）。30件で1回、入力3.5〜4.5千・出力1.5〜2.4千トークンと見積もった。やり直しを含めても上限$30程度の見込み</div>`, { pad: 22, gap: 6 })}${box(`${kick('確かめてから使うこと')}<div style="font-size:13px; color:${C.ink2}; line-height:1.7;">・単価は第三者の料金表の値。公式の料金ページで確かめる<br>・無料枠は、送った内容が Google の改善に使われることがある（料金表の注記）。送るのは公開されたレビューだけ</div>`, { pad: 22, gap: 6 })}${box(`${kick('お願いしたいこと')}<div style="font-size:13px; color:${C.ink2}; line-height:1.75;">この環境の設定（画面上の環境のメニュー → 編集）に、<b style="color:${C.ink};">GEMINI_API_KEY</b> を入れてください。あると良いもの：<b style="color:${C.ink};">RAKUTEN_APPLICATION_ID</b>（商品一覧を API で取る）、<b style="color:${C.ink};">RAKUTEN_AFFILIATE_ID</b>（リンク）。キーはチャットに貼らないでください</div>`, { pad: 22, gap: 6 })}</div>`)}
`, { src: 'cost' });
}

// ---------- D09 実装の進め方 ----------
function d09() {
  const steps = [['データの形を広げる', '本人が選んだ欄・3つの声の型・わたしの条件・数えないもの。判断は純粋関数に集めてテストで固定', 'キーなしでできる'], ['画面を作る', 'ホーム・カテゴリ（線／札）・商品・これに似たもの・くらべる・わたし・さがす。イヤホンの実データで', 'キーなしでできる'], ['3つで抽出し直す', 'イヤホン・化粧水・シューズ。ゲートの値を測って決める', 'GEMINI_API_KEY が要る'], ['10へ広げる', '無料枠で約5日。急ぐなら有料（聞いてから）', '同上'], ['公開の準備', '検索に出すページを決める（今は全部 noindex）。Amazon の審査', 'オーナーの判断']];
  return frame('09', '実装の進め方', `
${at(72, 128, `<div style="width:900px;">${kick('順番')}${steps.map(([t, s, r], i) => `<div style="display:grid; grid-template-columns:40px 220px 1fr 180px; gap:14px; padding:14px 0; border-top:1px solid ${C.hair}; align-items:center;">${dot(i + 1, { size: 28, bg: i < 2 ? C.ink : C.faint })}<b style="font-size:16px;">${t}</b><span style="font-size:13.5px; color:${C.ink2}; line-height:1.6;">${s}</span><span style="font-size:12.5px; color:${i < 2 ? C.ink : C.negText}; font-weight:700;">${r}</span></div>`).join('')}</div>`)}
${at(1040, 128, `<div style="width:488px; display:flex; flex-direction:column; gap:16px;">${box(`${kick('作り方（提案）')}<div style="font-size:14px; font-weight:900; line-height:1.5;">今の Vite ＋ TypeScript のまま（フレームワークを足さない）</div><div style="font-size:13px; color:${C.ink2}; line-height:1.7;">判断の純粋関数とテストが lib/ にあり、画面の数も少ない。商品の丸は HTML の絶対配置と本物のボタンで（CLAUDE.md）。アプリ化は、まずホーム画面に置ける形（PWA）から</div>`, { pad: 20, gap: 8 })}${box(`${kick('今あるものから変えること')}<div style="font-size:13px; color:${C.ink2}; line-height:1.7;">四象限を主役から外し、声の線にする。ジャンル一覧を10カテゴリのタイルにする。商品ページに「これに似たもの」。色を声の2色にそろえる</div>`, { pad: 20, gap: 8 })}${box(`${kick('変えないこと')}<div style="font-size:13px; color:${C.ink2}; line-height:1.7;">分母・散らばり・本文を出さない・アクセス制御、の4点。収縮・ゲート・引用の照合</div>`, { pad: 20, gap: 8 })}</div>`)}
${at(72, 820, `<div style="width:900px; font-size:14px; line-height:1.7;"><b>この板でよければ、1と2から始めます。</b>キーが入ったら3に進みます</div>`)}
`, { src: 'none' });
}

// ---------- D10 数字の出どころ（3段） ----------
function d10() {
  const rows = FIELD_CATS.map((c) => line('200px 60px 130px 130px 100px 1fr', [`<b>${c.name}</b>`, num(c.n, { size: 13 }), `${num(c.ga, { size: 13 })}<span style="color:${C.muted};">（${Math.round((c.ga / c.n) * 100)}%）</span>`, c.navi ? `<span style="color:${C.negText};">欄なし</span>` : `${num(c.attr, { size: 13 })}<span style="color:${C.muted};">（${Math.round((c.attr / c.n) * 100)}%）</span>`, c.navi ? '—' : num(c.rep, { size: 13 }), c.navi ? '—' : num(c.variant, { size: 13 })], { fs: 13, pad: 8 })).join('');
  const layer = (n, t, s, who, tag) => box(`<div style="display:flex; justify-content:space-between; align-items:center;"><div style="display:flex; gap:10px; align-items:center;">${dot(n, { size: 28 })}<b style="font-size:17px;">${t}</b></div>${tag}</div><div style="font-size:13px; color:${C.ink2}; line-height:1.65;">${s}</div><div style="font-size:12.5px; line-height:1.6;"><b>受け持つもの：</b>${who}</div>`, { pad: 20, gap: 8 });
  return frame('10', '数字の出どころ（3段）', `
${at(72, 124, `<div style="width:620px; display:flex; flex-direction:column; gap:14px;">
${layer(1, '本人が選んだ欄を数える', '楽天のレビューには、本文とは別に、レビュアーが選ぶ欄がある。選べる語が決まっているので表記ゆれが無く、AI を通さない', '★・年代・性別・買ったサイズや色・使い道｜誰に｜はじめて／リピート', factTag('事実・AIなし'))}
${layer(2, 'AI が本文を1件ずつ分類', '表記ゆれ（ノイキャン／ノイズキャンセリング）と否定（痛くならない／痛くなる）は AI が読む。件数はコードが数え、引用は原文と照合する', '観点の満足・不満・好みの向き・本文に書いた条件（敏感肌・足幅）・配送やお店の話を除く', aiTag())}
${layer(3, '広げたら置き換える（蒸留）', 'AI が付けた分類を正解にして小さな分類器を作り、自信のない分だけ AI に回す。500カテゴリに広げるときに', '2段目と同じ', aiTag('あとで'))}
</div>`)}
${at(740, 124, `<div style="width:788px;">${kick('欄はどれだけ埋まっているか（1ページ目・標準の並び）')}<div style="margin-top:10px;">${line('200px 60px 130px 130px 100px 1fr', ['カテゴリ', '読んだ', '年代・性別', '使い道の欄', 'うちリピート', '買った種類'], { head: true })}${rows}</div><div style="font-size:12px; color:${C.muted}; line-height:1.6; margin-top:10px;">上の3つは8商品×30件、ほかは1商品30件。欄に答えない人がいるので、分母は「欄に答えた人」にする</div></div>`)}
${at(740, 590, `<div style="width:788px;">${box(`${kick('使う前に確かめること')}<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 20px;">${bl(['「リピート」は、この商品か、このお店か（定義）', '2ページ目以降で、埋まり方が偏らないか', '商品価格ナビのページに本当に欄が無いか', '欄に答えた人だけで数える偏り'], { ic: 'info', fs: 12.5 })}</div>`, { pad: 20, gap: 8 })}</div>`)}
${ph(dFacts(), 72, 690, 0.3)}
${at(210, 700, `<div style="width:480px; font-size:12.5px; color:${C.ink2}; line-height:1.7;">画面では、欄の数字に<b style="color:${C.ink};">黒い枠の印</b>、AI の数字に<b style="color:${C.ink};">灰色の印</b>を付けて見分ける（S13・見本）。表記ゆれがあっても、欄の分は AI を通さないので揺れない</div>`)}
`, { src: 'list', sub: '欄を先に、AI はそのあと' });
}

// ---------- D11 いま決まっていること・決めてほしいこと ----------
function d11() {
  const col = (t, tone, items) => `<div style="width:450px;">${box(`<div style="display:flex; align-items:center; gap:8px;"><span style="width:12px; height:12px; border-radius:50%; background:${tone};"></span><b style="font-size:18px;">${t}</b></div>${items.map((x) => `<div style="padding:9px 0; border-top:1px solid ${C.hair}; font-size:13.5px; line-height:1.6;">${x}</div>`).join('')}`, { pad: 22, gap: 6 })}</div>`;
  return frame('11', 'いま決まっていること・決めてほしいこと', `
${at(72, 124, `<div style="display:flex; gap:24px; align-items:flex-start;">
${col('決まった（あなたの回答）', C.ink, ['A・B・C を混ぜる（この統合案）', '範囲は②：系統をまたいで10カテゴリ', 'わたしの条件は端末の中だけ・登録なし', 'AI の有料枠は、使う前に金額を聞く', '検証の進め方は任せる → 3つで抽出し直してから10へ', '本人が選んだ欄を使う。ただし検証してから'])}
${col('見直し後で決めたい（OK 待ち）', C.pos, ['流れ：条件で絞る → 気になることで並べる → 候補をくらべる。声の線は「図で見る」へ（R1）', '見た目：白地・声の2色のまま。なじみのある一覧・条件・候補のトレイ（R3・D06）', '言葉：日常語・1画面1問い・答えを先に（R3・D03）', '10カテゴリ：そのまま。声で決まる7つを先に（R2）', 'データ：欄 → AI → 蒸留 ＋ 仕様（公式・販売ページ・推定）（R2・D10）', '作り方：Vite＋TypeScript のまま。商品とくらべるは先に HTML に（R3）'])}
${col('まだ決めていない', C.faint, ['サイトの名前（コンセプトが固まったので候補を出せる）', '年代・性別を「わたしと同じ人」に使う見せ方', 'embedding の比較を検証に入れるか', 'イヤホン以外の仕様をどこから取るか', '需要（検索の量）の測り方', '色違い・同じ型の別ページの統合キー', 'シャンプー・枕の一覧（503 のまま）'])}
</div>`)}
${at(72, 570, `<div style="width:1398px;">${box(`<div style="display:flex; gap:16px; align-items:center;">${dot('→', { size: 32 })}<div><div style="font-size:18px; font-weight:900;">OK なら、キーが無くてもできる実装1・2から始める</div><div style="font-size:13.5px; color:${C.ink2}; margin-top:4px; line-height:1.6;">1 データの形を広げる（欄・3つの型・条件・数えないもの・仕様と出どころ）と、欄の検証。 2 見直し後の画面（くらべる → 商品 → カテゴリ）をイヤホンの実データで作る。GEMINI_API_KEY が入ったら、3つのカテゴリで抽出し直す</div></div></div>`, { pad: 22, bg: C.tile, shadow: 'none' })}</div>`)}
`, { src: 'none' });
}

export const SHEETS_D = [
  ['Main.dc.html', 'D00 決めたこと', d00], ['D01.dc.html', 'D01 価格.com・マイベストとの違い', d01], ['D02.dc.html', 'D02 好み・嫌いから', d02], ['D03.dc.html', 'D03 だれでも分かるための約束', d03], ['D04.dc.html', 'D04 画面の流れ', d04],
  ['D05.dc.html', 'D05 部品', d05], ['D06.dc.html', 'D06 見た目', d06], ['D07.dc.html', 'D07 最初の10カテゴリ', d07], ['D08.dc.html', 'D08 検証の順番と AI の費用', d08], ['D09.dc.html', 'D09 実装の進め方', d09], ['D10.dc.html', 'D10 数字の出どころ（3段）', d10], ['D11.dc.html', 'D11 いま決まっていること・決めてほしいこと', d11],
];

// ポートフォリオのボード 00〜10
import { C, F, SH, icon, num, tag, aiMark, btn, chip, productDot, voiceBar, quotePair, wordmark, esc } from './lib.mjs';
import { mapView, axesView, legend, compassRose } from './map.mjs';
import * as S from './screens.mjs';
import { frame, at, ph, pc, h, p, kick, dot, box, note, refs, bl, callouts, arrow } from './board.mjs';
import { STATS, AXES, MAPPED, COMPASS, SHORT, LABEL, byShort, SAME, KEYS } from './data.mjs';

// ====================================================================
// 00 決めたこと（30問の回答から）
// ====================================================================
const DECIDED = [
  ['Q01', '目指すもの', '見て分かることを売りに、価格.com・mybest と違う視点のプラットフォーム', ['04']],
  ['Q01', '収益', 'アフィリエイトと広告。収益の最大化が目的', ['18']],
  ['Q06', 'まず起こしたいこと', '使い続けたくなる・流入が増える。収益は同時に', ['05', '19']],
  ['Q02', '名前', 'コンセプトを固めてから決める', ['10']],
  ['Q03', '公開', '数か月以内に一般公開（検索に載せる）', ['18']],
  ['Q04', '形', 'Web。アプリも早い段階で', ['19']],
  ['Q05', 'ジャンル', '網羅的に。区分の考え方から見直す', ['09']],
  ['Q07', '相手', 'ジャンルは決めたが商品を決めきれない人／好きな物に似た物・別の物を探す人', ['05']],
  ['Q08', '入口', '観点の言葉での検索、ホームへ直接', ['13', '18']],
  ['Q09', '言われたい感想', '似ている・違うが見て分かる／そうなんだ／不満が先に分かる／見ているだけで面白い／自分に合うのが分かった', ['04', '05']],
  ['Q10', 'うまくいった瞬間', '気にしていた点で外れを避けた／図で知らなかった商品を見つけた', ['05']],
  ['Q11', '避けるもの', '表だらけ・1位を推す・ゲームっぽい・お堅い統計・AIっぽい見た目', ['11']],
  ['Q12', '楽しさ', '眺めて楽しい・人に見せたい、を強く。次に触って発見', ['06', '19']],
  ['Q13', '主役', 'マップ。埋め込みも検討。分かりやすく納得感のある仕組み', ['06', '07', '08']],
  ['Q14', '診断', '作らない。気にする観点で並べ替え・絞るのは可', ['14']],
  ['Q29', '購入', '楽天＋Amazon（★と件数のみ・審査後）', ['15', '18']],
];
const MINE = [
  ['ホーム', '地図帳（ジャンルの地図が並ぶ）＋悩みから探す', ['13']],
  ['スマホの地図', '全面に大きく。操作は下にまとめる', ['14']],
  ['点を押す', '下からシート。件数・引用・行き先3つ。URL に残す', ['15']],
  ['くらべる', '2つが基本（PC は3つまで）。どこからでも入れる', ['16']],
  ['差がつかない観点', '「迷わなくていい」として伝える。順位は作らない', ['15', '17']],
  ['色', '不満＝オレンジ、満足＝青。明るさと形（◆●）でも区別', ['11']],
  ['件数', '「読んだ129件のうち 不満14・満足21」にそろえる', ['12']],
  ['引用', '満足と不満を1件ずつ（抽出をやり直す）', ['15']],
  ['AI 分類', '数字の横に小さな印＋「数え方」のページ', ['17']],
  ['声が少ない商品', '点線の輪郭（位置は仮）。中央へ寄る', ['06']],
  ['見た目', '参考画像を見てから3案を決める（今は仮）', ['03', '比較']],
  ['共有・戻る理由', 'レンズつきの地図の画像／保存＋週ごとの変化＋通知', ['19']],
];
export function s00() {
  const row = ([q, k, v, r], last) => `<div style="display:grid; grid-template-columns:44px minmax(0, 1fr); gap:8px; padding:7px 2px; ${last ? '' : `border-bottom:1px solid ${C.line};`}">${num(q, { size: 11.5, color: C.muted })}<div style="min-width:0; display:flex; flex-direction:column; gap:2px;"><div style="display:flex; justify-content:space-between; align-items:center; gap:8px;"><span style="font-size:13px; font-weight:700;">${k}</span>${refs(r)}</div><div style="font-size:12.5px; line-height:1.55; color:${C.ink2};">${v}</div></div></div>`;
  const col = (list) => box(list.map((d, i) => row(d, i === list.length - 1)).join(''), { pad: 14, gap: 0 });
  let b = at(72, 112, `<div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:20px; width:900px; align-items:start;">${col(DECIDED.slice(0, 8))}${col(DECIDED.slice(8))}</div>`);
  b += at(1000, 112, `<div style="width:528px; display:flex; flex-direction:column; gap:10px;">${kick('任された15問を、こう決めた（違えば、この板にコメントしてください）')}${box(MINE.map(([k, v, r], i) => `<div style="display:grid; grid-template-columns:118px minmax(0,1fr) auto; gap:10px; align-items:start; padding:6px 0; ${i === MINE.length - 1 ? '' : `border-bottom:1px solid ${C.line};`}"><span style="font-size:12.5px; font-weight:700;">${k}</span><span style="font-size:12.5px; line-height:1.55; color:${C.ink2};">${v}</span>${refs(r)}</div>`).join(''), { pad: 14, gap: 0 })}</div>`);
  b += at(72, 848, `<div style="width:1456px; box-sizing:border-box; padding:14px 18px; border-radius:14px; background:${C.ink}; color:${C.white}; display:flex; gap:22px; align-items:center;"><span style="font-size:13px; font-weight:700; white-space:nowrap;">変えない4点（CLAUDE.md）</span><span style="font-size:12.5px; line-height:1.6; opacity:.92;">① 数字は「読んだN件のうちM件」、分母を常に出す ② 軸は言及の多さでなく意見の散らばりで選ぶ ③ レビュー本文は載せない（短い引用と出典だけ） ④ 相手のアクセス制御は回避しない</span></div>`);
  return frame('00', '決めたこと', b, { sub: '30問の回答から。右の番号は、反映したボード' });
}

// ====================================================================
// 01 表紙
// ====================================================================
export function s01() {
  let b = '';
  b += at(96, 150, `<div style="width:620px; display:flex; flex-direction:column; gap:24px;">
${wordmark(30)}
<div style="font-family:${F.disp}; font-weight:900; font-size:52px; line-height:1.25; white-space:nowrap;">買った人の声で描いた、<br>商品の地図。</div>
<div style="font-size:18px; line-height:1.8; color:${C.ink2};">似ている・違うが、ひと目で分かる。<br>不満が先に見える。数字はごまかさない。</div>
<div style="display:flex; gap:10px; flex-wrap:wrap;">${tag('UI ポートフォリオ', { bg: C.ink, color: C.white, fs: 12, h: 28 })}${tag('Web ＋ アプリ', { fs: 12, h: 28 })}${tag('2026-09-25', { fs: 12, h: 28 })}</div>
<div style="font-size:13px; line-height:1.8; color:${C.muted}; margin-top:8px;">地図・件数・引用は、実際のデータ（完全ワイヤレスイヤホン${STATS.total}商品、読んだレビューのべ${STATS.read}件）で描いています。<br>見た目（色・文字）は仮です。参考画像を見てから決め直します。</div>
</div>`);
  b += at(780, 110, `<div style="position:relative; width:760px; height:560px; border-radius:28px; overflow:hidden; box-shadow:${SH.lift};">${mapView({ w: 760, h: 560, labels: 'thick', min: 22, max: 58, compass: true, compassAt: [620, 420], compassSize: 110 })}</div>`);
  b += ph(S.pLens(), 720, 560, 0.44, { z: 6 });
  b += ph(S.pPeek(), 930, 590, 0.44, { z: 7 });
  b += ph(S.pSimilar(), 1140, 620, 0.44, { z: 8 });
  return frame('01', '表紙', b);
}

// ====================================================================
// 02 いまのサイトから
// ====================================================================
export function s02() {
  const keep = [
    ['分母が主役', '数字は読んだレビューの数と一緒に。カバレッジも隠さない'],
    ['散らばりで軸を選ぶ', '音質（分離度0.18）は軸にしない。ゲートの判断は純粋関数のまま'],
    ['収縮', '声が少ない商品は中央へ。地図でも同じ考え方を使う'],
    ['引用の照合', '原文と合わない引用は件数ごと捨てる'],
    ['言及なしを原点に置かない', '「割れている」と「語られていない」を分ける'],
    ['減光であって除外ではない', '絞り込みで商品を消さない'],
  ];
  const change = [
    ['1', '同じ「件中」が2つの意味', '「読んだ129件のうち」にそろえる', '12'],
    ['2', '引用が満足側に偏る', '満足・不満を1件ずつ（抽出をやり直す）', '15'],
    ['7', '観点のページに入口が無い', '悩みの言葉・レンズ・商品ページからつなぐ', '13・18'],
    ['8・9', 'スマホで図が下に隠れる／押せない点', '全面の地図、重なりをほどく', '14'],
    ['10', '図を URL で送れない', 'レンズ・軸・選んだ商品を URL に', '19'],
    ['11', '共通の枠・名前・数え方が無い', 'タブ・ヘッダー・「数え方」', '13・17'],
    ['4', '未読に「平均0.0」', '「まだ読めていない」と書く', '12'],
    ['14', '緑と赤だけで区別', '青とオレンジ＋形', '11'],
  ];
  let b = at(72, 112, `<div style="width:560px; display:flex; flex-direction:column; gap:12px;">${kick('引き継ぐ（原則として、すでに画面にある）')}${keep.map(([t, d]) => box(`<div style="display:flex; gap:10px; align-items:flex-start;">${icon('check', { size: 18, color: C.sat, sw: 2.4 })}<div><div style="font-size:14px; font-weight:700;">${t}</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.6; margin-top:2px;">${d}</div></div></div>`, { pad: 12, gap: 0 })).join('')}</div>`);
  b += at(680, 112, `<div style="width:848px; display:flex; flex-direction:column; gap:12px;">${kick('変える（番号は 05_現状の確認.md の項目）')}${box(`<div style="display:grid; grid-template-columns:56px 260px minmax(0,1fr) 70px; gap:0;">${['項目', 'いま', 'こうする', 'ボード'].map((t) => `<div style="font-size:11.5px; font-weight:700; color:${C.muted}; padding:0 8px 8px;">${t}</div>`).join('')}${change.map(([n, now, to, bd]) => [num(n, { size: 12, color: C.muted }), `<span style="font-size:13px;">${now}</span>`, `<span style="font-size:13px; font-weight:700;">${to}</span>`, refs([bd])].map((c) => `<div style="padding:9px 8px; border-top:1px solid ${C.line};">${c}</div>`).join('')).join('')}</div>`, { pad: 16, gap: 0 })}
${box(`<div style="display:flex; gap:12px; align-items:flex-start;">${icon('info', { size: 20, color: C.negText })}<div><div style="font-size:14px; font-weight:700;">データの厚みが、地図のいちばんの制約</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.65; margin-top:3px;">${STATS.total}商品のうち読めたのは${STATS.analysed}商品。そのうち${STATS.thin}商品は9件以下で、上位4商品が読んだ量の${STATS.top4share}%を占める。見た目より先に、楽天の出品の列挙（アプリID）と1商品あたりの読む量を増やす必要がある</div></div></div>`, { pad: 16, gap: 0, bg: C.negSoft, shadow: 'none' })}</div>`);
  return frame('02', 'いまのサイトから', b, { sub: '良いところは残し、測って分かった弱いところを変える' });
}

// ====================================================================
// 03 参考から読み取ること（画像待ち）
// ====================================================================
export function s03() {
  const slot = (label, n, col) => `<div style="display:flex; flex-direction:column; gap:10px;"><div style="display:flex; align-items:center; gap:8px;"><span style="width:10px; height:10px; border-radius:50%; background:${col};"></span><span style="font-size:14px; font-weight:700;">${label}</span><span style="font-size:12px; color:${C.muted};">${n}枚</span></div><div style="display:grid; grid-template-columns:repeat(6, minmax(0, 1fr)); gap:8px;">${Array.from({ length: n }, (_, i) => `<div style="aspect-ratio:3/4; border-radius:10px; border:1.5px dashed ${C.line2}; display:flex; align-items:center; justify-content:center; font-family:${F.num}; font-size:12px; color:${C.muted};">${i + 1}</div>`).join('')}</div></div>`;
  let b = at(72, 112, `<div style="width:900px; display:flex; flex-direction:column; gap:22px;">${slot('好き', 11, C.sat)}${slot('普通', 2, C.muted)}${slot('嫌い', 9, C.neg)}</div>`);
  b += at(1020, 112, `<div style="width:508px; display:flex; flex-direction:column; gap:14px;">
${box(`<div style="display:flex; gap:10px; align-items:flex-start;">${icon('info', { size: 20, color: C.negText })}<div><div style="font-size:15px; font-weight:700;">まだ画像を見られていません</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.7; margin-top:4px;">作業環境のネットワークの設定で、i.pinimg.com・mensjournal.com・assets.st-note.com・fulloutsourcing.jp・amazon.co.jp がすべて遮断されている。見られるようになったら、この板を「読み取ったこと」で埋め、見た目の3案と色・文字を決め直す</div></div></div>`, { pad: 16, gap: 0, bg: C.negSoft, shadow: 'none' })}
${box(`${kick('URL だけから推測できること（確かめていない）')}${bl(['好き：「uber-golf in-app」 → 地図が主役のアプリ画面かもしれない。この案の「全面の地図＋下からのシート」と方向は近い', '嫌い：amazon.co.jp → 情報が詰まった一覧・広告の多さを避けたい、と読める'], { color: C.muted, ic: 'arrow' })}`, { pad: 16 })}
${box(`${kick('見られるようにする方法')}${bl(['セッションのタイトルバー → クラウド環境のメニュー → 編集 → ネットワークで、上のホストを許可する', 'または、画像をチャットに貼る', 'または、リポジトリの design/reference/ に置いて push する'], { color: C.ink, ic: 'check' })}`, { pad: 16 })}
</div>`);
  return frame('03', '参考から読み取ること', b, { sub: '好き11・普通2・嫌い9。いまは画像待ち' });
}

// ====================================================================
// 04 コンセプト
// ====================================================================
export function s04() {
  const promise = [
    ['1', '似ている・違うが見える', '近さは「買った人の声の似かた」。好きな商品を真ん中に置けば、違いが方角で分かる', productDot({ size: 54, pos: 8, neg: 3 })],
    ['2', '不満が先に見える', '商品の丸の周りのリングは、不満（オレンジ）から描く。商品ページも不満が多い観点から', productDot({ size: 54, pos: 4, neg: 6 })],
    ['3', '数字はごまかさない', '件数は必ず「読んだ数」と一緒。AIが分けたことを明示し、引用は原文と照合', `<span style="display:flex; align-items:center; justify-content:center; width:54px; height:54px; border-radius:50%; background:${C.bg2};">${icon('check', { size: 26, sw: 2.4 })}</span>`],
  ];
  const vs = [
    ['価格.com', '仕様と表、星と掲示板'],
    ['mybest', '編集部が試した順位'],
    ['Amazon', '星と、大量の文章'],
    ['AI の要約', '文章で答える（図は要約されにくい）'],
  ];
  let b = at(72, 118, `<div style="width:760px; display:flex; flex-direction:column; gap:18px;">
<div style="font-family:${F.disp}; font-weight:900; font-size:46px; line-height:1.28;">買った人の声で描いた、<br>商品の地図。</div>
<div style="font-size:16px; line-height:1.8; color:${C.ink2};">順位ではなく位置で見せる。「どれが1位か」ではなく「どれが自分に近いか」。<br>眺めているうちに、似ているもの・違うもの・避けたい不満が見えてくる。</div>
</div>`);
  b += at(72, 360, `<div style="width:760px; display:flex; flex-direction:column; gap:14px;">${kick('3つの約束')}${promise.map(([n, t, d, g]) => box(`<div style="display:flex; gap:16px; align-items:center;">${g}<div><div style="display:flex; gap:8px; align-items:center;">${dot(n, { size: 22 })}<span style="font-size:17px; font-weight:700;">${t}</span></div><div style="font-size:13px; color:${C.ink2}; line-height:1.65; margin-top:4px;">${d}</div></div></div>`, { pad: 16 })).join('')}</div>`);
  b += at(900, 118, `<div style="width:628px; display:flex; flex-direction:column; gap:14px;">${kick('ほかと、どこが違うか')}${box(`<div style="display:grid; grid-template-columns:130px minmax(0,1fr); row-gap:0;">${vs.map(([k, v]) => `<div style="padding:10px 0; border-bottom:1px solid ${C.line}; font-size:14px; font-weight:700;">${k}</div><div style="padding:10px 0; border-bottom:1px solid ${C.line}; font-size:13.5px; color:${C.ink2};">${v}</div>`).join('')}<div style="padding:12px 0 2px; font-size:14px; font-weight:900; font-family:${F.disp};">この案</div><div style="padding:12px 0 2px; font-size:14px; font-weight:700;">買った人の声の<u>地図</u>。数えた件数で、位置と不満を見せる</div></div>`, { pad: 18 })}
${box(`${kick('なぜ地図か')}${bl(['位置は文章に要約されにくい。検索の AI の答えに置き換えられない', '画像として切り取られ、SNS で広がる（共有の入口になる）', '眺めて楽しい。知らなかった商品に出会える（回答の「うまくいった瞬間」）', '「1位を推す」を使わずに、選ぶ手がかりを出せる'], { color: C.ink })}`, { pad: 18 })}
${box(`${kick('言われたい感想との対応')}<div style="display:flex; flex-wrap:wrap; gap:8px;">${['似ている・違うが見て分かる → 地図と方角', 'そうなんだ → 迷わなくていい観点', '不満が先に分かる → リングと並び順', '見ているだけで面白い → 地図帳', '自分に合うのが分かった → レンズ'].map((t) => tag(t, { fs: 12, h: 28 })).join('')}</div>`, { pad: 18 })}
</div>`);
  return frame('04', 'コンセプト', b, { sub: '名前は、このコンセプトから決める（10）' });
}

// ====================================================================
// 05 体験の設計
// ====================================================================
export function s05() {
  const lanes = [
    { who: 'A　ジャンルは決めた。商品が決まらない', q: '検索「ワイヤレスイヤホン 耳が痛くならない」', steps: [
      ['観点のページ', '装着感のレンズで、満足・割れている・不満の3つに', '不安'],
      ['迷わなくていい', '「音質はどれも褒められている」', 'そうなんだ'],
      ['地図', '候補の近くに、知らなかった商品', '面白い'],
      ['点を押す', '不満が先。引用で確かめる', '納得'],
      ['くらべる', '2つの違いが件数で', '決めた'],
    ] },
    { who: 'B　好きな物がある。似た物・別の物がほしい', q: 'ホームへ直接／商品名で検索', steps: [
      ['ホーム（地図帳）', '好きな商品を探す', 'わくわく'],
      ['似ているもの', '好きな商品を真ん中に。方角＝勝っている観点', 'そうなんだ'],
      ['レンズ', '気になる観点だけで色分け', '自分に合う'],
      ['保存', '端末の中に。登録なし', 'まだ迷う'],
      ['通知で戻る', '値下がり・不満が増えた（アプリ）', '戻ってくる'],
    ] },
  ];
  let b = '';
  lanes.forEach((L, li) => {
    const y = 118 + li * 380;
    b += at(72, y, `<div style="width:1456px; display:flex; flex-direction:column; gap:14px;"><div style="display:flex; align-items:baseline; gap:14px;"><span style="font-family:${F.disp}; font-weight:900; font-size:22px;">${L.who}</span><span style="font-size:13px; color:${C.muted};">入口：${L.q}</span></div>
<div style="display:grid; grid-template-columns:repeat(5, minmax(0, 1fr)); gap:14px;">${L.steps.map(([t, d, feel], i) => box(`<div style="display:flex; align-items:center; gap:8px;">${dot(i + 1, { size: 22 })}<span style="font-size:15px; font-weight:700;">${t}</span></div><div style="font-size:12.5px; line-height:1.6; color:${C.ink2}; min-height:40px;">${d}</div><div style="margin-top:auto;">${tag(`気持ち：${feel}`, { bg: i === 1 ? C.satSoft : C.bg2, color: i === 1 ? C.satText : C.ink2, fs: 11.5, h: 24 })}</div>`, { pad: 14, gap: 8, extra: 'height:168px;' })).join('')}</div>
<div style="display:flex; align-items:center; gap:10px; font-size:12.5px; color:${C.ink2};">${icon('sparkle', { size: 16 })}${li === 0 ? '<b>うまくいった瞬間：</b>気にしていた「耳が痛い」で、外れを避けられた（回答 Q10-A）' : '<b>うまくいった瞬間：</b>地図で、知らなかった商品を見つけた（回答 Q10-D）'}</div></div>`);
  });
  b += at(72, 880, `<div style="width:1456px; display:flex; gap:12px; align-items:center; padding:12px 16px; border-radius:14px; background:${C.bg2}; box-sizing:border-box;"><span style="font-size:13px; font-weight:700; white-space:nowrap;">体験の原則</span><span style="font-size:12.5px; color:${C.ink2};">① どのページも、そこだけで「何のサイトで、数字をどう読むか」が分かる　② 楽しさは地図とレンズで。数字の上には演出を乗せない　③ 迷ったら「不満が先」</span></div>`);
  return frame('05', '体験の設計', b, { sub: '回答の2人の相手。気持ちの流れと、そこで効く仕掛け' });
}

// ====================================================================
// 06 地図の読み方
// ====================================================================
export function s06() {
  let b = at(72, 112, `<div style="position:relative; width:800px; height:760px; border-radius:24px; overflow:hidden; box-shadow:${SH.card};">${mapView({ w: 800, h: 760, labels: 'thick', min: 24, max: 62, compass: true, compassAt: [650, 600], compassSize: 120 })}</div>`);
  const rules = [
    ['近い', '買った人の声が似ている', '観点ごとの満足・不満の出方が似ているほど近い。仕様やブランドは使わない'],
    ['リング', '不満が先、満足が後', '12時から時計回りに、不満（オレンジ）→満足（青）→言及なし（灰）。太さは同じ'],
    ['大きさ', '語られた量', '観点への言及の合計（√で大きく）'],
    ['点線の輪郭', '声が少なく、位置は仮', `読んだ10件未満。この地図では${MAPPED.length}商品のうち${MAPPED.filter((p) => p.thick === 'thin').length}商品。声が少ないほど中央へ寄る`],
    ['方位', 'その向きほど、その観点の満足が多い', `いまは ${COMPASS.map((c) => c.label).join('・')}。地図の向きを読む手がかり`],
  ];
  b += at(912, 112, `<div style="width:616px; display:flex; flex-direction:column; gap:12px;">${kick('読み方は5つだけ')}${rules.map(([k, t, d], i) => box(`<div style="display:flex; gap:10px; align-items:baseline;">${dot(i + 1, { size: 22 })}<span style="font-size:16px; font-weight:700;">${k}</span><span style="font-size:14px;">＝ ${t}</span></div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.6; padding-left:32px;">${d}</div>`, { pad: 14, gap: 4 })).join('')}
${box(`${kick('地図の上でできること')}<div style="display:flex; flex-direction:column; gap:6px; font-size:13px; line-height:1.6;"><div><b>レンズ</b>：気になる観点を選ぶと、リングがその観点だけになる（14）</div><div><b>並べる</b>：2つの観点を選ぶと、点が動いて今の四象限に変わる（14・試作）</div><div><b>まだ地図にない</b>：読めていない商品は、名前と数で別に（原点に置かない）</div></div>`, { pad: 14 })}</div>`);
  return frame('06', '地図の読み方', b, { sub: `実データ：${STATS.mapped}商品（色違いは手でまとめた）` });
}

// ====================================================================
// 07 地図のしくみと、測ったこと
// ====================================================================
export function s07() {
  const thick = MAPPED.filter((p) => p.thick === 'thick').length, mid = MAPPED.filter((p) => p.thick === 'mid').length, thin = MAPPED.filter((p) => p.thick === 'thin').length;
  const bar = (label, v, max, col, note) => `<div style="display:grid; grid-template-columns:150px minmax(0,1fr) 170px; gap:12px; align-items:center;"><span style="font-size:13px;">${label}</span><div style="height:14px; background:${C.bg2}; border-radius:7px;"><div style="width:${Math.round((v / max) * 100)}%; height:14px; background:${col}; border-radius:7px;"></div></div><span style="font-size:13px;">${num(`${v}%`, { size: 14 })} <span style="color:${C.muted}; font-size:12px;">${note}</span></span></div>`;
  let b = at(72, 112, `<div style="width:700px; display:flex; flex-direction:column; gap:14px;">${kick('作り方（案）')}
${[['1', '商品ごとに20個の数', '10観点それぞれの「満足の割合」「不満の割合」（言及の合計で割る）'], ['2', '2次元にたたむ', `主成分分析。いまのデータで情報の${STATS.pcRatio}%を2次元に残せる`], ['3', '声が少ないほど中央へ', '言及の合計が少ない商品を中央に引き寄せる（収縮と同じ考え方。4件の商品が端に来ないように）'], ['4', '重なりをほどく', 'すべての点を押せるように、少しずつ押し広げる'], ['5', '方位を描く', '「その向きほど満足が多い観点」を矢印で']].map(([n, t, d]) => note(n, t, d, { w: 700 })).join('')}
</div>`);
  b += at(72, 560, `<div style="width:700px; display:flex; flex-direction:column; gap:12px;">${kick('測ったこと：ブランドで固まらないか（隣3つが同じブランドの割合）')}
${bar('この地図', STATS.sameBrand, 30, C.sat, `偶然なら${STATS.brandChance}%`)}
${bar('前身の地図（UMAP）', 29.9, 30, C.neg, '偶然なら4.2%')}
<div style="font-size:12.5px; color:${C.ink2}; line-height:1.65;">前身はカタログの文字（ブランドと型番）から作ったので、ブランドで固まった。買った人の声から作ると、偶然と同じ程度まで下がる</div></div>`);
  b += at(860, 112, `<div style="width:668px; display:flex; flex-direction:column; gap:14px;">
${box(`${kick('まだ言えないこと', C.negText)}<div style="font-size:14px; line-height:1.7;">「近い＝本当に似た商品か」は、<b>いまのデータでは確かめきれない</b>。仕様の「開放型」「ノイキャン対応」が近くに集まるかで確かめたいが、開放型で5件以上ふれられた商品は2つしかない</div><div style="display:flex; gap:8px; flex-wrap:wrap;">${tag(`声が厚い（30件〜）${thick}`, { bg: C.ink, color: C.white, fs: 12, h: 26 })}${tag(`ふつう（10〜29件）${mid}`, { fs: 12, h: 26 })}${tag(`点線（〜9件）${thin}`, { fs: 12, h: 26, bd: `1.5px dashed ${C.muted}` })}</div>`, { pad: 18, bg: C.negSoft, shadow: 'none' })}
${box(`${kick('地図の公開ゲート（案）— 軸のゲートと同じく、満たさないジャンルは地図を出さない')}${[[`声が厚い商品（読んだ30件以上）が12以上`, `いま ${thick}`, '未達', C.negText], [`隣が同じブランドの割合が、偶然の2倍未満`, `いま ${STATS.sameBrand}% ／ 偶然 ${STATS.brandChance}%`, '通過', C.satText], [`仕様のまとまり（開放型など）が、偶然より近くに集まる`, '声の多い開放型が2商品', '判定できない', C.muted]].map(([t, now, st, col]) => `<div style="display:grid; grid-template-columns:minmax(0,1fr) 150px 90px; gap:10px; align-items:center; font-size:13px; padding:6px 0; border-bottom:1px solid ${C.line};"><span>${t}</span><span style="color:${C.muted}; font-size:12px;">${now}</span><span style="font-weight:700; color:${col}; text-align:right;">${st}</span></div>`).join('')}<div style="font-size:12.5px; color:${C.ink2};">満たさない間は、地図の代わりに「並べる」（2つの観点の図）と一覧を出す。イヤホンは今、未達</div>`, { pad: 18 })}
${box(`${kick('ゲートを通すために、データでやること')}${bl(['楽天のアイテム検索 API で出品を列挙し、読める商品を増やす（カバレッジ27%の壁。02 第3節）', '1商品あたり最大10ページまで読む（03 の決定）', '色違いを1つにまとめる方法を作る（02 第10節、未解決）'], { color: C.ink, ic: 'arrow' })}`, { pad: 18 })}
</div>`);
  return frame('07', '地図のしくみと、測ったこと', b, { sub: '判断はまず測る。測れないことは、測れないと書く' });
}

// ====================================================================
// 08 埋め込みの使い方
// ====================================================================
export function s08() {
  const use = [
    ['言葉で探す', '「耳が痛い」「音漏れ」「蒸れる」など、打った言葉を観点と満足・不満の向きにつなぐ。画面には「この言葉は装着感の不満として数えています」と出す', 'S02'],
    ['似ているものの2つ目の根拠', 'レビューの文の近さを、件数の近さと並べて使う。表示する理由は件数で（「接続の満足が多め」）', 'S09'],
    ['新しいジャンルの観点づくり', 'レビューの文をまとまりに分けて、観点の候補を出す。名前と極の言葉は人が決める（観点は人手で定義する原則のまま）', '09'],
    ['場面を見つける', '「通勤」「ジム」「寝ながら」など使う場面の候補を出し、数えるかどうかを人が決める', '将来'],
  ];
  const not = [
    ['地図の位置をそのまま決める', '「なぜここにいるか」を件数で説明できなくなる。納得感を失う'],
    ['観点を自動で決める', '自由文から探すと、固有名詞が観点になる（前身で実測）'],
    ['要約文を作る', '数字の横に、検証できない文を置かない（原則5）'],
  ];
  let b = at(72, 112, `<div style="width:860px; display:flex; flex-direction:column; gap:12px;">${kick('使う', C.satText)}${use.map(([t, d, r], i) => box(`<div style="display:flex; justify-content:space-between; align-items:center;"><div style="display:flex; gap:8px; align-items:center;">${dot(i + 1, { size: 22, bg: C.sat })}<span style="font-size:16px; font-weight:700;">${t}</span></div>${refs([r])}</div><div style="font-size:13px; color:${C.ink2}; line-height:1.65;">${d}</div>`, { pad: 16, gap: 6 })).join('')}</div>`);
  b += at(980, 112, `<div style="width:548px; display:flex; flex-direction:column; gap:12px;">${kick('使わない', C.negText)}${not.map(([t, d]) => box(`<div style="display:flex; gap:8px; align-items:center;">${icon('close', { size: 18, color: C.negText, sw: 2.4 })}<span style="font-size:15px; font-weight:700;">${t}</span></div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.65;">${d}</div>`, { pad: 16, gap: 6 })).join('')}
${box(`${kick('使う前に測ること')}${bl(['レビュー本文は手元にしか無い（.cache、リポジトリには入れない）。埋め込みは手元で作り、残すのは数値だけ', '商品名・ブランドを伏せて埋め込み、隣が同じブランドの割合を測る（前身と同じ測り方）', '文の近さと件数の近さが、どれくらい一致するか'], { color: C.ink, ic: 'arrow' })}<div style="font-size:12px; color:${C.muted};">いまは未測定。この環境にはレビュー本文が無いため</div>`, { pad: 16 })}
</div>`);
  return frame('08', '埋め込みの使い方', b, { sub: '差別化に使う。ただし、画面の説明は必ず件数でする' });
}

// ====================================================================
// 09 ジャンルの区分
// ====================================================================
export function s09() {
  const shelves = [
    ['耳と音', '完全ワイヤレスイヤホン（公開中）・ヘッドホン・スピーカー'],
    ['髪と肌', 'ドライヤー・ヘアアイロン・シェーバー'],
    ['歯と体', '電動歯ブラシ・体重計・マッサージ機'],
    ['台所', '電気ケトル・炊飯器・コーヒーメーカー'],
    ['掃除と洗濯', 'ロボット掃除機・コードレス掃除機'],
    ['眠り', '枕・マットレス'],
    ['子ども', 'ベビーカー・抱っこ紐'],
    ['外と運動', 'ランニングシューズ・スマートウォッチ'],
    ['机と仕事', 'モニター・キーボード・チェア'],
    ['移動と旅', 'スーツケース・モバイルバッテリー'],
  ];
  let b = at(72, 112, `<div style="width:700px; display:flex; flex-direction:column; gap:14px;">${kick('3つの層')}
${[['棚', '暮らしの場所で分ける（10前後）。ホームの地図帳の見出し', 'layers'], ['比べる単位', '同じ観点で比べられるまとまり。地図は1単位に1枚', 'map'], ['悩み', '観点の言葉（例：耳が痛くならない）。単位をまたいで探せる', 'search']].map(([t, d, ic], i) => box(`<div style="display:flex; gap:14px; align-items:center;"><span style="width:44px; height:44px; border-radius:12px; background:${C.bg2}; display:flex; align-items:center; justify-content:center;">${icon(ic, { size: 22 })}</span><div><div style="font-size:16px; font-weight:700;">${i + 1}. ${t}</div><div style="font-size:13px; color:${C.ink2}; margin-top:2px;">${d}</div></div></div>`, { pad: 14 })).join('')}
${box(`${kick('単位を公開する条件（案）')}${bl(['軸に使える観点が2つ以上（今のゲート）', '地図のゲート（07）を通れば地図も出す。通らなければ「並べる」と一覧だけ', '満たさない単位は「準備中」と、足りないもの（例：あと何商品）を出す'], { color: C.ink })}`, { pad: 16 })}
${box(`${kick('選ぶ順（未測定）')}<div style="font-size:13px; color:${C.ink2}; line-height:1.65;">単価 × レビューの量 × 意見の割れ方。どれも測ってから決める。イヤホンは1件240円（8,000円×3%）で単価が低い</div>`, { pad: 16 })}
</div>`);
  b += at(820, 112, `<div style="width:708px; display:flex; flex-direction:column; gap:10px;">${kick('棚の案（名前も仮。単位は例で、どれも未測定）')}<div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:10px;">${shelves.map(([t, u], i) => `<div style="padding:14px; border-radius:16px; background:${i === 0 ? C.ink : C.surf}; color:${i === 0 ? C.white : C.ink}; box-shadow:${i === 0 ? 'none' : SH.card}; display:flex; flex-direction:column; gap:6px; min-height:84px; box-sizing:border-box;"><div style="font-size:16px; font-weight:700;">${t}</div><div style="font-size:12.5px; line-height:1.6; opacity:.85;">${u}</div></div>`).join('')}</div>
<div style="font-size:12px; color:${C.muted}; line-height:1.6;">楽天のジャンル分けは使わない（売り場の分け方で、比べ方とずれるため）。悩みの言葉は、単位ごとの観点の極（「合わない人がいる」など）から作る</div></div>`);
  return frame('09', 'ジャンルの区分', b, { sub: '棚 → 比べる単位 → 悩み。網羅は、ゲートを通った単位から' });
}

// ====================================================================
// 10 名前の案
// ====================================================================
export function s10() {
  const names = [
    ['A', 'コエマップ', 'KOEMAP', ['短い。アプリ名・アイコンにしやすい', '「声」と「地図」がそのまま入る'], ['カタカナ＋英字で、やや軽い']],
    ['B', 'こえのちず', 'koe no chizu', ['意味がそのまま伝わる。やわらかい'], ['長い。検索で他の言葉と混ざりやすい']],
    ['C', 'こえくらべ', 'koekurabe', ['いまのリポジトリ名。比べることが伝わる'], ['地図が伝わらない']],
    ['D', 'ならびえ', 'narabie', ['「並び絵」。順位でなく並びを見せる'], ['意味の説明が要る']],
  ];
  let b = at(72, 112, `<div style="width:1456px; display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:18px;">${names.map(([k, n, en, good, bad], i) => box(`<div style="display:flex; justify-content:space-between; align-items:center;">${num(k, { size: 18, color: C.muted })}${i === 0 ? tag('本命', { bg: C.ink, color: C.white, fs: 11, h: 22 }) : ''}</div>
<div style="height:150px; border-radius:14px; background:${i === 0 ? C.ink : C.bg2}; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px;">${wordmark(28, { text: n, color: i === 0 ? C.white : C.ink })}<span style="font-family:${F.num}; font-size:13px; color:${i === 0 ? '#C9CFD5' : C.muted};">${en}</span></div>
${bl(good, { color: C.sat })}${bl(bad, { color: C.negText, ic: 'close' })}`, { pad: 18, gap: 12 })).join('')}</div>`);
  b += at(72, 560, `<div style="width:1456px; display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:18px;">
${box(`${kick('名前の条件')}${bl(['「声（買った人）」と「地図（位置）」のどちらかが入る', '「口コミ」は使わない（サクラの印象がある）', '「おすすめ」「ランキング」を使わない（1位を推さない）'], { color: C.ink })}`, { pad: 18 })}
${box(`${kick('ロゴの考え方（仮）')}<div style="display:flex; gap:14px; align-items:center;">${wordmark(26, { text: '' })}<span style="font-size:13px; color:${C.ink2}; line-height:1.6;">声のリングそのもの。不満（オレンジ）を12時から少し、残りを満足（青）</span></div>`, { pad: 18 })}
${box(`${kick('まだ確かめていないこと', C.negText)}${bl(['商標の登録状況', 'ドメイン・アプリストアでの重複'], { color: C.negText, ic: 'info' })}`, { pad: 18 })}
</div>`);
  return frame('10', '名前の案', b, { sub: 'コンセプト「買った人の声で描いた、商品の地図」から' });
}

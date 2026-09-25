// 別案Bのボード（1600×1000）
import { C, F, SH, art, node, gauge, icon, num, sup, label, pill, roundBtn, mark, phone, browser, esc, ASPECT_ICON } from './libb.mjs';
import { imageMap, wheel, mosaic, bundle, WHEEL } from './mapb.mjs';
import { SKETCH } from './sketches.mjs';
import * as S from './screensb.mjs';
import * as SA from '../screens.mjs';
import { phone as phoneA } from '../lib.mjs';
import { STATS, MAPPED, AXES, SHORT, LABEL, byShort, SAME, KEYS, Q } from '../data.mjs';

export const BW = 1600, BH = 1000, TOTAL = 12;
const WFC = byShort['821de2ea'];
export function frame(n, title, body, { sub = '' } = {}) {
  return `<div style="position:relative; width:${BW}px; height:${BH}px; overflow:hidden; background:${C.board}; font-family:${F.jp}; color:${C.ink};">
<div style="position:absolute; left:72px; top:52px; display:flex; align-items:baseline; gap:16px; z-index:10;">${label(n, { size: 13 })}<span style="font-weight:900; font-size:32px; white-space:nowrap;">${title}</span>${sub ? `<span style="font-size:15px; color:${C.ink2}; white-space:nowrap;">${sub}</span>` : ''}</div>
<div style="position:absolute; right:72px; top:60px; z-index:10; display:flex; align-items:center; gap:12px;">${mark(14)}${label('plan b ・ 2026-09')}</div>
${body}
<div style="position:absolute; left:72px; bottom:24px; z-index:10; font-size:11px; color:${C.muted};">別案B（参考から）。数字は data/ の実データ。商品の絵は、実装では楽天の商品画像に置き換わる</div>
${/^B\d+$/.test(n) ? `<div style="position:absolute; right:72px; bottom:24px; z-index:10;">${label(`${n} / B${TOTAL}`)}</div>` : ''}
</div>`;
}
const at = (x, y, html, { w = 0, z = 4 } = {}) => `<div style="position:absolute; left:${x}px; top:${y}px;${w ? ` width:${w}px;` : ''} z-index:${z};">${html}</div>`;
const ph = (scr, x, y, s, o = {}) => at(x, y, phone(scr, { scale: s, dark: o.dark }), o);
const pc = (scr, x, y, s) => at(x, y, browser(scr, { scale: s }));
const card = (inner, { pad = 20, bg = '#fff', r = 26, extra = '' } = {}) => `<div style="box-sizing:border-box; padding:${pad}px; border-radius:${r}px; background:${bg}; display:flex; flex-direction:column; gap:10px; ${extra}">${inner}</div>`;
const tx = (t, { size = 13, color = C.ink2, lh = 1.7 } = {}) => `<div style="font-size:${size}px; line-height:${lh}; color:${color};">${t}</div>`;
const hd = (t, size = 17) => `<div style="font-size:${size}px; font-weight:700; line-height:1.4;">${t}</div>`;
const numDot = (n) => `<span style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; background:${C.ink}; color:#fff; font-family:${F.num}; font-size:13px; font-weight:600; flex-shrink:0;">${n}</span>`;
const note = (n, t, b, w = 300) => `<div style="width:${w}px; display:flex; gap:12px;">${numDot(n)}<div><div style="font-size:15px; font-weight:700; line-height:1.45;">${t}</div><div style="font-size:12.5px; line-height:1.7; color:${C.ink2}; margin-top:3px;">${b}</div></div></div>`;

// ====================================================================
// B00 参考から読み取ったこと
// ====================================================================
const REFS = [
  ['好き', '1', 'wheel', '弧のホイール', '回して選ぶ。選んだ1つ以外は退く'],
  ['好き', '2', 'object', '物が主役', '余白と、黒い丸のボタン'],
  ['好き', '3', 'sheet', '切り抜き＋柔らかい四角', '下からのシート、大きな数字'],
  ['好き', '4', 'split', '白黒の中で商品だけが色', '同じ大きさのタイル'],
  ['好き', '5', 'tiles', '物の絵のタイル', '太い見出し、浮いた丸いタブ'],
  ['好き', '6', 'fade', '物の絵が並んでぼける', '奥行きはぼかしで'],
  ['好き', '7', 'circlemap', '丸い写真の地図と点線', '触れると大きくなる'],
  ['好き', '8', 'scatter', '方眼の上の散布', '静かで、データらしい'],
  ['好き', '9', 'mosaic', '空きのあるタイル', '空きもリズムになる。明暗の2面'],
  ['好き', '10', 'cards', '大きな数字のカード', '半円のゲージ、くすんだ淡色'],
  ['好き', '11', 'stack', '量を板の束で', '1枚を抜き出す。上付きの件数'],
  ['普通', '1', 'catalog', 'よくある通販の一覧', '悪くないが面白くない'],
  ['普通', '2', 'sameColor', '同じ色で集めた一覧', '整っているが静的'],
  ['嫌い', '1', 'quadText', '文字の箱で埋めた四象限', '案Aの「並べる」に近い'],
  ['嫌い', '2', 'retail', '売り場の詰め込み', '宣伝の丸・区画'],
  ['嫌い', '3', 'dense', 'amazon.co.jp（アクセスせず）', '情報と広告の密度'],
  ['嫌い', '4', 'wordScale', '言葉で埋めた2軸の図', '位置の図でも、文字が並ぶと嫌い'],
  ['嫌い', '5', 'loud', '色の多いアプリ', 'ゲームっぽさ・グラデーション'],
  ['嫌い', '6', 'poster', '原色の色面のポスター', 'レトロ、強い色'],
  ['嫌い', '7', 'memphis', '原色のコラージュ', '色が多すぎる'],
  ['嫌い', '8', 'timeline', '小さな物が詰まった年表', '図鑑的な詰め込み'],
  ['嫌い', '9', 'magazine', '雑誌の書き込み', 'にぎやかすぎる'],
];
export function b00() {
  const col = { 好き: C.sat, 普通: C.faint, 嫌い: C.neg };
  const cell = ([k, n, sk, t, d]) => `<div style="background:#fff; border-radius:18px; padding:10px; display:flex; flex-direction:column; gap:6px;"><div style="border-radius:10px; background:#FAFAF9; overflow:hidden; display:flex; justify-content:center;">${SKETCH[sk]()}</div><div style="display:flex; align-items:center; gap:6px;"><span style="width:8px; height:8px; border-radius:50%; background:${col[k]};"></span><span style="font-family:${F.mono}; font-size:11px; color:${C.muted};">${k}${n}</span></div><div style="font-size:12.5px; font-weight:700; line-height:1.35;">${t}</div><div style="font-size:11.5px; color:${C.ink2}; line-height:1.45;">${d}</div></div>`;
  let b = at(72, 116, `<div style="width:1456px; display:grid; grid-template-columns:repeat(11, minmax(0, 1fr)); gap:10px;">${REFS.slice(0, 11).map(cell).join('')}</div>`);
  b += at(72, 420, `<div style="width:1456px; display:grid; grid-template-columns:repeat(11, minmax(0, 1fr)); gap:10px;">${REFS.slice(11).map(cell).join('')}</div>`);
  b += at(72, 726, `<div style="width:1456px; display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:16px;">
${card(`${label('好きに共通', { color: C.satText })}${tx('<b>物が主役</b>で、画面はほぼ白黒。<b>画像を空間に並べる</b>（地図・散布・空きタイル・束・弧）。触ると<b>回る・ぼける・大きくなる</b>。数字は大きく、説明は小さく')}`)}
${card(`${label('嫌いに共通', { color: C.negText })}${tx('<b>文字で埋めた2軸の図</b>（嫌い1・4）。<b>色が多い・強い</b>（嫌い5・6・7）。<b>詰め込み</b>（売り場・年表・雑誌）')}`)}
${card(`${label('案Aへの反省')}${tx('案Aは「名前の付いた点＋色のリング」と「文字の四象限」で、嫌い1・4に寄っていた。商品画像を主役にする原則（15）も図形で代用したまま')}`, { bg: C.ink, extra: `color:#fff;` }).replace(/color:#4F4F4F/g, 'color:#E6E6E4')}
</div>`);
  return frame('B00', '参考から読み取ったこと', b, { sub: '画像は載せず、型だけを模式図に（好き11・普通2・嫌い9）' });
}

// ====================================================================
// B01 表紙
// ====================================================================
export function b01() {
  let b = at(96, 150, `<div style="width:600px; display:flex; flex-direction:column; gap:26px;">${label('plan b ・ 別案', { size: 13 })}<div style="font-weight:900; font-size:60px; line-height:1.18; letter-spacing:-.01em; white-space:nowrap;">モノの地図に、<br>声を重ねる。</div><div style="font-size:18px; line-height:1.85; color:${C.ink2};">並んでいるのは、商品そのもの。<br>輪を回すと、買った人の声が重なって見える。</div><div style="font-size:13px; line-height:1.8; color:${C.muted};">参考（好き11・嫌い9）から組み直した別案。<br>案A（点とリングの地図）はそのまま残し、比べて選べるようにしています。</div></div>`);
  b += at(760, 96, `<div style="position:relative; width:780px; height:560px; border-radius:36px; overflow:hidden;">${imageMap({ w: 780, h: 560, top: 30, bottom: 30, lens: 'fit', min: 44, max: 84 })}</div>`);
  b += ph(S.bMap(), 700, 520, 0.46);
  b += ph(S.bBundle(), 910, 560, 0.46);
  b += ph(S.bProduct(), 1120, 600, 0.46);
  return frame('B01', '表紙', b);
}

// ====================================================================
// B02 A と B
// ====================================================================
export function b02() {
  const rows = [
    ['地図の点', '丸い点＋名前＋色のリング', '<b>商品の画像</b>。名前は押したときだけ'],
    ['近さの見せ方', '位置だけ', '位置＋<b>点線</b>（いちばん声が近い商品）'],
    ['観点の選び方', 'チップの帯', '<b>下の輪を回す</b>（片手）'],
    ['不満の見せ方', '全商品に色のリング', '観点を選んだときだけ<b>半円のゲージ</b>（左から不満）'],
    ['2つの観点で並べる', '四象限（文字の軸）', '<b>棚</b>（1つの観点で4つの段）。四象限はPCの奥に'],
    ['分母の見せ方', '「読んだ129件のうち」の文字', '<b>声の束</b>（1件＝1枚の板）'],
    ['読めていない商品', '「まだ地図にない73」', '<b>空きのタイル</b>（97マスのうち26が絵）'],
    ['色', '青とオレンジを全体に', 'ほぼ白黒。<b>声の2色は印だけ</b>'],
  ];
  let b = at(72, 120, phoneA(SA.pMap(), { scale: 0.62 }));
  b += at(72, 680, `<div style="width:254px; text-align:center;">${label('案A')}</div>`);
  b += ph(S.bLens(), 350, 120, 0.62);
  b += at(350, 680, `<div style="width:254px; text-align:center;">${label('案B')}</div>`);
  b += at(680, 120, card(`<div style="display:grid; grid-template-columns:150px minmax(0,1fr) minmax(0,1fr);">${['', '案A', '案B'].map((t) => `<div style="padding:0 10px 10px;">${label(t)}</div>`).join('')}${rows.map(([k, a, bb]) => [`<b style="font-size:13px;">${k}</b>`, `<span style="font-size:13px; color:${C.muted};">${a}</span>`, `<span style="font-size:13px;">${bb}</span>`].map((c) => `<div style="padding:11px 10px; border-top:1px solid ${C.hair};">${c}</div>`).join('')).join('')}</div>`, { pad: 22, extra: 'width:848px;' }));
  b += at(680, 700, card(`${label('変えないもの')}${tx('CLAUDE.md の4点、ゲート（軸・地図）、数え方、ジャンルの区分、お金と広告のルール、Web とアプリの役割。<b>案Aのボード 07〜09・17・18 はBでもそのまま使う</b>')}`, { extra: 'width:848px;' }));
  return frame('B02', '案A と 案B', b, { sub: '何が変わり、何が残るか' });
}

// ====================================================================
// B03 コンセプトB
// ====================================================================
export function b03() {
  const P3 = [
    ['1', 'モノが主役', '地図も一覧も、商品の画像で描く。画面の色は商品の色だけ。見ているだけで面白い（Q09）', `<div style="display:flex; gap:6px;">${['e89650d6', '821de2ea', 'cd6a9906'].map((s) => node(s, { size: 58 })).join('')}</div>`],
    ['2', '声は、回して重ねる', '気になる観点を輪で回すと、半円のゲージで声が重なる。不満は左から先に。触らなければ静か', `<div style="position:relative; width:64px; height:64px; margin:12px 0 0 10px;">${node('821de2ea', { size: 64 })}${gauge(21, 14, { size: 64, sw: 5, gap: 5 })}</div>`],
    ['3', '量は、束と空きで見せる', '読んだレビューは1件1枚の板の束。読めていない商品は空きのタイル。分母が目に見える', `<div style="transform:scale(.55); transform-origin:0 0; height:90px;">${bundle({ read: 60, pos: 12, neg: 8, w: 200, h: 160 })}</div>`],
  ];
  let b = at(72, 124, `<div style="width:760px;">${label('concept b')}<div style="font-weight:900; font-size:50px; line-height:1.25; margin-top:14px;">モノの地図に、<br>声を重ねる。</div><div style="font-size:16px; line-height:1.85; color:${C.ink2}; margin-top:18px;">案Aの「買った人の声で描いた地図」はそのまま。<br>ただし<b style="color:${C.ink};">描くのは点ではなく商品そのもの</b>。声は、見たいときに重ねる。</div></div>`);
  b += at(72, 470, `<div style="width:760px; display:flex; flex-direction:column; gap:14px;">${P3.map(([n, t, d, v]) => card(`<div style="display:flex; gap:18px; align-items:center;"><div style="width:200px; flex-shrink:0;">${v}</div><div><div style="display:flex; gap:10px; align-items:center;">${numDot(n)}<span style="font-size:19px; font-weight:700;">${t}</span></div><div style="font-size:13px; color:${C.ink2}; line-height:1.7; margin-top:6px;">${d}</div></div></div>`, { pad: 18 })).join('')}</div>`);
  b += at(900, 124, `<div style="width:628px; display:flex; flex-direction:column; gap:14px;">
${card(`${label('なぜBか（参考から）')}${tx('好きな11枚は、どれも<b>物が主役</b>で<b>画像を空間に並べ</b>、<b>触ると動く</b>。嫌いな9枚は、<b>文字の2軸図</b>と<b>色の多さ</b>と<b>詰め込み</b>。案Aは後者に寄っていた')}`)}
${card(`${label('言われたい感想（Q09）との対応')}<div style="display:flex; flex-wrap:wrap; gap:8px;">${['似ている・違うが見える → 点線と位置', 'そうなんだ → 迷わなくていい観点・束', '不満が先に分かる → 左から不満のゲージ', '見ているだけで面白い → モノの地図・暗い面', '自分に合うのが分かった → 輪を回す'].map((t) => `<span style="display:inline-flex; align-items:center; height:32px; padding:0 12px; border-radius:16px; background:${C.tile}; font-size:12.5px; font-weight:700;">${t}</span>`).join('')}</div>`)}
${card(`${label('うまくいった瞬間（Q10）')}${tx('<b>A 外れを避けた</b>：輪を「装着感」に回すと、左に不満のゲージが伸びた商品が分かる<br><b>D 知らない商品に出会う</b>：好きな商品から点線をたどると、隣に知らない商品がいる')}`)}
${card(`${label('名前への影響')}${tx('「モノ」と「声」が主役。案Aの名前の案（コエマップ等）はそのまま使える。Bなら「こえのちず」より、物の手ざわりがある短い名前が合う（名前は別に相談）')}`)}
</div>`);
  return frame('B03', 'コンセプトB', b, { sub: '参考の「物が主役」「空間に並べる」「触ると動く」から' });
}

// ====================================================================
// B04 体験B
// ====================================================================
export function b04() {
  const steps = [
    ['眺める', '商品が並ぶ地図。文字は最小。静か', 'わくわく', 'S04'],
    ['回す', '下の輪を「装着感」へ。半円のゲージが出る', 'そうなんだ', 'S05'],
    ['押す', '商品が大きくなり、近い5つに点線が太る', '見つけた', 'S06'],
    ['束を開く', '読んだ129件の板の束。不満の1枚を抜き出す', '確かめた', 'S09'],
    ['くらべる', '2つの物を並べ、違いがはっきりした順', '決めた', 'S11'],
    ['買う・保存', '黒い丸のボタン。保存すれば変化を通知', '戻ってくる', 'S08'],
  ];
  let b = at(72, 124, `<div style="width:1456px; display:grid; grid-template-columns:repeat(6, minmax(0, 1fr)); gap:14px;">${steps.map(([t, d, f, r], i) => card(`<div style="display:flex; justify-content:space-between; align-items:center;">${numDot(i + 1)}${label(r)}</div><div style="font-size:20px; font-weight:900;">${t}</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.7; min-height:64px;">${d}</div><div style="margin-top:auto;"><span style="display:inline-flex; height:26px; padding:0 10px; align-items:center; border-radius:13px; background:${i === 1 || i === 2 ? C.satSoft : C.tile}; color:${i === 1 || i === 2 ? C.satText : C.ink2}; font-size:11.5px; font-weight:700;">気持ち：${f}</span></div>`, { pad: 16, extra: 'height:230px;' })).join('')}</div>`);
  b += ph(S.bMap(), 72, 390, 0.54);
  b += ph(S.bLens(), 310, 390, 0.54);
  b += ph(S.bPeek(), 548, 390, 0.54);
  b += ph(S.bBundle(), 786, 390, 0.54);
  b += at(1060, 400, `<div style="width:468px; display:flex; flex-direction:column; gap:16px;">
${note(1, '触らなければ静か', 'はじめは商品と点線だけ。色も数字も出さない。眺める楽しさを先に（Q12）', 468)}
${note(2, '触ると、声が出る', '輪を回す・押す・開く、の3つだけ。どれも片手で、その場で戻せる', 468)}
${note(3, '確かめるまで、その場で', '束の板を押すと、原文と照合した短い引用。出典のレビューへ', 468)}
${note(4, 'どこから来ても同じ手ざわり', '検索で観点のページに来た人も、同じ輪と束で読める', 468)}
</div>`);
  return frame('B04', '体験の設計B', b, { sub: '眺める → 回す → 押す → 束を開く → くらべる' });
}

// ====================================================================
// B05 地図の読み方B
// ====================================================================
export function b05() {
  let b = at(72, 116, `<div style="position:relative; width:860px; height:780px; border-radius:34px; overflow:hidden;">${imageMap({ w: 860, h: 780, top: 30, bottom: 30, lens: 'fit', sel: '821de2ea', min: 48, max: 92 })}</div>`);
  const rules = [
    ['丸', '商品', '商品の画像（この板では絵）。大きさは語られた量'],
    ['点線', '声がいちばん近い商品', '押した商品は、近い5つへの点線が太くなる'],
    ['半円', '選んだ観点の声', '左から不満（コーラル）、続いて満足（青）。太さは同じ'],
    ['薄い丸', 'その観点にふれていない', '消さずに薄く（原点に置かない・減光）'],
    ['点線の輪', '声が少ない（読んだ10件未満）', '位置は仮。中央に寄る'],
  ];
  b += at(980, 116, `<div style="width:548px; display:flex; flex-direction:column; gap:12px;">${label('読み方は5つ。文字は押したときだけ')}${rules.map(([k, t, d], i) => card(`<div style="display:flex; gap:10px; align-items:baseline;">${numDot(i + 1)}<span style="font-size:17px; font-weight:700;">${k}</span><span style="font-size:14px;">＝ ${t}</span></div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.6; padding-left:36px;">${d}</div>`, { pad: 14 })).join('')}
${card(`${label('位置の作り方は案Aと同じ')}${tx('満足・不満の出方の似かたで位置を決める（ブランドで固まらない：隣が同じブランド 3%／偶然 3%）。<b>地図のゲート（案A 07）もそのまま</b>')}`, { pad: 16 })}</div>`);
  return frame('B05', '地図の読み方B', b, { sub: `実データ：${STATS.mapped}商品。いま「装着感」で、Sony WF-C710N を押した状態` });
}

// ====================================================================
// B06 3つの仕掛け
// ====================================================================
export function b06() {
  const m = mosaic({ cols: 14, cell: 20, gap: 5 });
  const cols = [
    ['観点の輪', '好き1', `<div style="position:relative; width:430px; height:250px; overflow:hidden; border-radius:22px; background:${C.map};"><div style="position:absolute; left:20px; top:-560px; transform:scale(1);">${wheel({ sel: 'fit', baseY: 690, w: 390 })}</div></div>`, ['片手で回す。真ん中が選んだ観点、両側は傾いて薄く', '上付きの数字＝その観点にふれた商品の数', '差がつかない観点（音質・接続）は輪に入れず、横に理由']],
    ['声の束', '好き11', `<div style="height:250px; border-radius:22px; background:${C.map}; display:flex; align-items:center; justify-content:center;">${bundle({ read: WFC.read, pos: WFC.pos.fit, neg: WFC.neg.fit, w: 400, h: 230 })}</div>`, [`1件＝1枚。${WFC.read}枚のうち不満${WFC.neg.fit}・満足${WFC.pos.fit}が色づく`, '板を押すと、原文と照合した短い引用だけ（本文は載せない）', '分母が「数字」ではなく「量」として見える']],
    ['空きのタイル', '好き9', `<div style="height:250px; border-radius:22px; background:${C.map}; display:flex; align-items:center; justify-content:center;">${m.html}</div>`, [`${STATS.total}マスのうち${m.shown}が絵、${m.empty}が空き`, '空きを押すと商品名。読めていないことは「悪い」ではない', 'カバレッジ（原則2）を、隠さず、きれいに']],
  ];
  let b = at(72, 124, `<div style="width:1456px; display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:18px;">${cols.map(([t, r, v, list]) => card(`<div style="display:flex; justify-content:space-between; align-items:baseline;"><span style="font-size:22px; font-weight:900;">${t}</span>${label(`参考：${r}`)}</div>${v}<div style="display:flex; flex-direction:column; gap:8px;">${list.map((x) => `<div style="display:flex; gap:8px; font-size:13px; line-height:1.6; color:${C.ink2};"><span style="margin-top:4px;">${icon('check', { size: 14, color: C.sat, sw: 2.4 })}</span><span>${x}</span></div>`).join('')}</div>`, { pad: 20, extra: 'height:560px;' })).join('')}</div>`);
  b += at(72, 712, card(`${label('注意')}${tx(`束を正確に描くには、<b>レビュー1件ずつの分類</b>を残す必要がある。今のデータは観点ごとの合計だけで、1件が満足と不満の両方に数えられているかが分からない（この板の束は合計から並べた見本）。抽出をやり直すときに一緒に残す`)}`, { extra: 'width:1456px;', bg: C.negSoft }));
  return frame('B06', '3つの仕掛け', b, { sub: '回す・束ねる・空ける。どれも原則を「見える形」にしたもの' });
}

// ====================================================================
// B07 デザイン言語B
// ====================================================================
export function b07() {
  const sw = (n, hex, u) => `<div style="display:flex; flex-direction:column; gap:6px;"><div style="height:78px; border-radius:18px; background:${hex}; border:1px solid ${C.hair};"></div><div style="font-size:13px; font-weight:700;">${n}</div><div style="font-family:${F.mono}; font-size:11px; color:${C.muted};">${hex}</div><div style="font-size:12px; color:${C.ink2}; line-height:1.5;">${u}</div></div>`;
  let b = at(72, 120, `<div style="width:960px; display:flex; flex-direction:column; gap:14px;">${label('色：画面は白黒。色が付くのは商品と、声の印だけ')}<div style="display:grid; grid-template-columns:repeat(6, minmax(0, 1fr)); gap:14px;">${sw('地', C.bg, '白')}${sw('タイル', C.tile, '物を置く面')}${sw('文字', C.ink, '文字・主なボタン')}${sw('不満', C.neg, 'ゲージの左・束の手前')}${sw('満足', C.sat, 'ゲージの右')}${sw('暗い面', C.dark, '夜・共有の画像')}</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.7;">不満（コーラル）と満足（青紫）は明るさも違い、位置（左／右・手前／奥）でも分かる。赤と緑は使わない。グラデーションの背景は使わない</div></div>`);
  b += at(1080, 120, `<div style="width:448px; display:flex; flex-direction:column; gap:12px;">${label('文字')}${card(`<div style="font-weight:900; font-size:40px; line-height:1.2;">何をくらべる？</div><div style="font-size:12px; color:${C.muted};">Zen Kaku Gothic New 900（見出し・本文）</div><div style="font-family:${F.num}; font-weight:600; font-size:48px; line-height:1;">129 <span style="font-size:24px; color:${C.faint}; font-weight:400;">/ 132</span></div><div style="font-size:12px; color:${C.muted};">Outfit（大きな数字）</div><div>${label('shelf 01 ・ coverage')}</div><div style="font-size:12px; color:${C.muted};">DM Mono（小さな見出し・字間を広く）</div>`, { pad: 20, extra: 'gap:6px;' })}</div>`);
  b += at(72, 480, `<div style="width:1456px; display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:16px;">
${card(`${label('形')}<div style="display:flex; gap:12px; align-items:center;">${node('637e1dd6', { size: 60 })}<span style="width:60px; height:60px; border-radius:20px; background:${C.tile};"></span><span style="width:60px; height:60px; border-radius:50%; background:${C.ink};"></span></div>${tx('商品は丸、分類は角の丸い四角、決める所は黒い丸', { size: 12.5 })}`)}
${card(`${label('動き')}${tx('輪：回る（0.4秒）<br>押す：その商品が大きく、ほかはぼける<br>束：1枚が手前へ抜け出す<br>動きを減らす設定では、すべて即時に', { size: 12.5 })}`)}
${card(`${label('大きさ')}${tx('文字11px以上。押せる所44px以上。商品の丸は34px以上。下回るジャンルは一覧に切り替える', { size: 12.5 })}`)}
${card(`${label('避けること（嫌いから）', { color: C.negText })}${tx('文字の箱で埋めた2軸の図／色の多い画面・グラデーション・立体の顔／売り場や雑誌の詰め込み／1位の強調', { size: 12.5 })}`)}
</div>`);
  b += ph(S.bLens(), 72, 668, 0.3) + ph(S.bDark(), 210, 668, 0.3, { dark: true });
  b += at(360, 708, `<div style="width:520px;">${label('明るい面・暗い面')}${tx('同じ画面を2つの面で（参考9）。暗い面は共有の画像や夜に。商品の画像が浮くので、タイルは暗い灰色に', { size: 12.5 })}</div>`);
  return frame('B07', 'デザイン言語B', b, { sub: '物が主役で、画面は退く' });
}

// ====================================================================
// B08〜B11 画面
// ====================================================================
export function b08() {
  let b = ph(S.bHome(), 72, 116, 0.84) + ph(S.bGenre(), 450, 116, 0.84) + ph(S.bSearch(), 828, 116, 0.84);
  b += at(1224, 116, `<div style="width:304px; display:flex; flex-direction:column; gap:18px;">
${note(1, '棚は、物の絵のタイル', '公開中のジャンルは大きく、準備中は空いた白いタイル（参考5・9）', 304)}
${note(2, 'ジャンルの入口は「空きのタイル」', `${STATS.total}マスのうち${STATS.analysed}が絵。読めた量がそのまま見える`, 304)}
${note(3, '言葉は、数え方に変換して見せる', '「耳が痛い」→ 装着感の不満。結果は物のタイルと大きな数字（参考3）', 304)}
${note(4, '悩みの件数は上付き', '「耳が痛くならない¹⁴」＝14商品がふれている（参考11）', 304)}
</div>`);
  return frame('B08', '画面：入口', b, { sub: 'ホーム・ジャンル・言葉で探す' });
}
export function b09() {
  let b = ph(S.bMap(), 72, 116, 0.8) + ph(S.bLens(), 430, 116, 0.8) + ph(S.bPeek(), 788, 116, 0.8) + ph(S.bDark(), 1146, 116, 0.8, { dark: true });
  b += at(72, 850, `<div style="width:1456px; display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:24px;">${[['眺める', '商品と点線だけ。下に「輪を回すと声が見える」'], ['回す', '装着感へ。半円のゲージ、ふれていない商品は薄く'], ['押す', '大きくなり名前が出る。近い5つの点線が太る。下からシート'], ['暗い面', 'ノイキャンで見た夜の地図。共有の画像にも']].map(([t, d]) => `<div><div style="font-size:15px; font-weight:700;">${t}</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.6; margin-top:4px;">${d}</div></div>`).join('')}</div>`);
  return frame('B09', '画面：地図', b, { sub: '主役。眺める → 回す → 押す' });
}
export function b10() {
  let b = ph(S.bProduct(), 72, 116, 0.8) + ph(S.bBundle(), 430, 116, 0.8) + ph(S.bSimilar(), 788, 116, 0.8) + ph(S.bCompare(), 1146, 116, 0.8);
  b += at(72, 850, `<div style="width:1456px; display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:24px;">${[['商品', '物が大きく。数字のカード2枚と、黒い丸の「買う」'], ['声の束', `読んだ${WFC.read}件＝${WFC.read}枚。不満の1枚を抜き出して引用`], ['似ているもの', '起点から近い5つへ点線。違いを色の文字で'], ['くらべる', '2つの物を並べ、細い線で不満／満足']].map(([t, d]) => `<div><div style="font-size:15px; font-weight:700;">${t}</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.6; margin-top:4px;">${d}</div></div>`).join('')}</div>`);
  return frame('B10', '画面：商品と比較', b, { sub: '評判が上、仕様が下（仕様はこの下に「推定」つきで）' });
}
export function b11() {
  let b = pc(S.bdHome(), 72, 116, 0.49) + pc(S.bdMap(), 808, 116, 0.49) + pc(S.bdProduct(), 72, 596, 0.37);
  b += ph(S.bAspect(), 640, 560, 0.44);
  b += at(860, 610, `<div style="width:668px; display:flex; flex-direction:column; gap:16px;">
${note(1, 'PC は地図を大きく、右に面', '輪の代わりに、上付きの数字つきのチップ。押した商品の物と大きなゲージ', 668)}
${note(2, '観点のページは「棚」', '四象限の代わりに、1つの観点で「満足が多い／割れている／不満が多い／ふれていない」の4段。横に流れる（検索の受け口）', 668)}
${note(3, 'ホームの下に、空きのタイル', 'ジャンル全体のうち、読めた商品の割合が一目で', 668)}
</div>`);
  return frame('B11', '画面：PC と観点のページ', b, { sub: 'PC 1440・スマホ 390' });
}

// ====================================================================
// B12 どう選ぶか
// ====================================================================
export function b12() {
  const opts = [
    ['1', 'B で進める', '推す', '参考の「好き」に最も近い。見て楽しく、原則（分母・カバレッジ・不満の対称）が形になる。実装は商品画像の質に左右される'],
    ['2', 'A で進める', '', '文字と数字で説明しやすい。ただし参考の「嫌い」（文字の2軸図・色の多さ）に近い'],
    ['3', '混ぜる', '', 'B の見た目と仕掛け（物の地図・輪・束・空き）に、A の「並べる」（2観点）を PC の奥にだけ残す'],
  ];
  let b = at(72, 124, `<div style="width:1456px; display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:18px;">${opts.map(([n, t, tagT, d], i) => card(`<div style="display:flex; justify-content:space-between; align-items:center;">${numDot(n)}${tagT ? `<span style="display:inline-flex; height:26px; padding:0 12px; align-items:center; border-radius:13px; background:${C.ink}; color:#fff; font-size:12px; font-weight:700;">${tagT}</span>` : ''}</div><div style="font-size:26px; font-weight:900;">${t}</div>${tx(d)}`, { pad: 22, extra: 'height:260px;' })).join('')}</div>`);
  b += at(72, 420, `<div style="width:1456px; display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:18px;">
${card(`${label('B で実装するときに要るもの')}${tx('① 商品画像の切り抜き（白背景の画像を丸いタイルに置く。背景の違う画像の扱いを決める）<br>② レビュー1件ずつの分類（束のため）と、引用の満足・不満の区別（抽出のやり直し）<br>③ 地図のゲート（案A 07）を通すためのデータの厚み<br>④ 輪の操作：スワイプとタップの両方、キーボードでは左右キー')}`, { pad: 22 })}
${card(`${label('決めてほしいこと')}${tx('<b>Q1</b> 1〜3 のどれで進めるか<br><b>Q2</b> 暗い面を最初から用意するか（共有の画像だけにするか）<br><b>Q3</b> 名前の案（コエマップ 等）は B でも同じ候補でよいか<br><b>Q4</b> 束の見せ方を、商品ページの主役にしてよいか')}`, { pad: 22, bg: C.ink, extra: 'color:#fff;' }).replace(/color:#4F4F4F/g, 'color:#E6E6E4')}
</div>`);
  return frame('B12', 'どう選ぶか', b, { sub: 'A・B・混ぜる。推すのは B' });
}

export const SHEETS_B = [
  ['B00-References.dc.html', 'B00 参考から読み取ったこと', b00],
  ['Main.dc.html', 'B01 表紙', b01],
  ['B02-AvsB.dc.html', 'B02 案A と 案B', b02],
  ['B03-Concept.dc.html', 'B03 コンセプトB', b03],
  ['B04-Experience.dc.html', 'B04 体験の設計B', b04],
  ['B05-MapReading.dc.html', 'B05 地図の読み方B', b05],
  ['B06-Devices.dc.html', 'B06 3つの仕掛け', b06],
  ['B07-Language.dc.html', 'B07 デザイン言語B', b07],
  ['B08-ScreensEntry.dc.html', 'B08 画面：入口', b08],
  ['B09-ScreensMap.dc.html', 'B09 画面：地図', b09],
  ['B10-ScreensProduct.dc.html', 'B10 画面：商品と比較', b10],
  ['B11-ScreensPC.dc.html', 'B11 画面：PC と観点のページ', b11],
  ['B12-Choose.dc.html', 'B12 どう選ぶか', b12],
];

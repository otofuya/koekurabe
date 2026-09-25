// キャンバス一式（../project/）と、手元確認用のプレビュー（../preview/）を書き出す
// 使い方：node --experimental-strip-types build.mjs
import { writeFileSync, mkdirSync, rmSync, readdirSync, existsSync } from 'fs';
import { dcFile, previewFile } from './out.mjs';
import * as A from './sheets-a.mjs';
import * as B from './sheets-b.mjs';
import * as X from './compare.mjs';
import * as S from './screens.mjs';
import { protoScreen, logic as protoLogic, renderStatic } from './proto.mjs';

const OUT = '../project/project', PRE = '../preview';
mkdirSync(OUT, { recursive: true });
mkdirSync(PRE, { recursive: true });
for (const f of readdirSync(OUT)) rmSync(`${OUT}/${f}`);
for (const f of readdirSync(PRE)) rmSync(`${PRE}/${f}`);

const TITLE = 'koekurabe UIポートフォリオ';
const boards = {}, order = [], notes = {};
const SW = 1600, SH = 1000, GAPX = 80, GAPY = 120;

function emit(file, title, root, w, h, { logic, board, preview = true } = {}) {
  writeFileSync(`${OUT}/${file}`, dcFile({ title, root, w, h, logic }));
  if (preview) writeFileSync(`${PRE}/${file.replace('.dc.html', '.html')}`, previewFile({ title, root }));
  boards[file] = { ...board, w, h };
  order.push(file);
}

// ---------- ポートフォリオ（3列） ----------
const SHEETS = [
  ['P00-Decided.dc.html', '00 決めたこと', A.s00],
  ['Main.dc.html', '01 表紙', A.s01],
  ['P02-Now.dc.html', '02 いまのサイトから', A.s02],
  ['P03-References.dc.html', '03 参考から読み取ること', A.s03],
  ['P04-Concept.dc.html', '04 コンセプト', A.s04],
  ['P05-Experience.dc.html', '05 体験の設計', A.s05],
  ['P06-MapReading.dc.html', '06 地図の読み方', A.s06],
  ['P07-MapMeasured.dc.html', '07 地図のしくみと、測ったこと', A.s07],
  ['P08-Embedding.dc.html', '08 埋め込みの使い方', A.s08],
  ['P09-Genres.dc.html', '09 ジャンルの区分', A.s09],
  ['P10-Names.dc.html', '10 名前の案', A.s10],
  ['P11-Language.dc.html', '11 デザイン言語（仮）', B.s11],
  ['P12-Parts.dc.html', '12 部品', B.s12],
  ['P13-Home.dc.html', '13 ホームと、言葉で探す', B.s13],
  ['P14-Map.dc.html', '14 ジャンルの地図・レンズ・並べる', B.s14],
  ['P15-Product.dc.html', '15 商品', B.s15],
  ['P16-Similar.dc.html', '16 似ているもの・くらべる', B.s16],
  ['P17-Trust.dc.html', '17 信頼：数え方', B.s17],
  ['P18-Money.dc.html', '18 お金', B.s18],
  ['P19-App.dc.html', '19 アプリ・戻ってくる理由・共有', B.s19],
  ['P20-Flow.dc.html', '20 画面一覧と遷移', B.s20],
  ['P21-Requirements.dc.html', '21 要件の対応表', B.s21],
];
SHEETS.forEach(([file, title, fn], i) => {
  emit(file, title, fn(), SW, SH, { board: { x: (i % 3) * (SW + GAPX), y: Math.floor(i / 3) * (SH + GAPY), title, page: 'portfolio' } });
});
// Main（表紙）を先頭に
order.splice(order.indexOf('Main.dc.html'), 1);
order.unshift('Main.dc.html');
notes.portfolioTitle = { x: 0, y: -300, text: 'UIポートフォリオ — 買った人の声で描いた、商品の地図', kind: 'title1', maxW: 3 * SW + 2 * GAPX, page: 'portfolio' };
notes.portfolioHow = { x: 3 * (SW + GAPX), y: 0, w: 440, text: '見方\n・00 で、回答から決めたことと、任された15問をどう決めたかを確かめてください\n・コンセプト・地図・見た目の案は、ページ「案の比較」に\n・実寸の画面は「画面（実寸）」、動かせる試作は「触れる試作」に\n・見た目（色・文字）は仮です。参考画像を見てから決め直します（03）\n・直したい所は、その板にコメントしてください', fill: 'blue', size: 'm', page: 'portfolio' };

// ---------- 案の比較 ----------
emit('X1-Concepts.dc.html', 'コンセプトの3案', X.x1(), SW, SH, { board: { x: 0, y: 0, title: 'コンセプトの3案', page: 'compare' } });
emit('X2-Maps.dc.html', '地図の5案', X.x2(), SW, SH, { board: { x: SW + GAPX, y: 0, title: '地図の5案', page: 'compare' } });
emit('X3-Looks.dc.html', '見た目の3案（仮）', X.x3(), SW, SH, { board: { x: 2 * (SW + GAPX), y: 0, title: '見た目の3案（仮）', page: 'compare' } });
notes.compareTitle = { x: 0, y: -300, text: '案の比較 — コンセプト・地図・見た目', kind: 'title1', maxW: 3 * SW + 2 * GAPX, page: 'compare' };

// ---------- 画面（実寸） ----------
const ROW = 844 + 400;
S.PHONE_SCREENS.forEach(([gname, list], g) => {
  list.forEach(([f, t, fn], i) => emit(`${f}.dc.html`, t, fn(), 390, 844, { board: { x: i * (390 + GAPX), y: g * ROW, title: t, page: 'screens' } }));
  notes[`screensG${g}`] = { x: 0, y: g * ROW - 260, text: `スマホ：${gname}`, kind: 'title1', maxW: 4 * 390 + 3 * GAPX, page: 'screens' };
});
const pcY = S.PHONE_SCREENS.length * ROW;
S.PC_SCREENS.forEach(([f, t, fn], i) => emit(`${f}.dc.html`, t, fn(), 1440, 900, { board: { x: (i % 2) * (1440 + GAPX), y: pcY + Math.floor(i / 2) * (900 + GAPY), title: t, page: 'screens' } }));
notes.screensPC = { x: 0, y: pcY - 260, text: 'PC（1440）', kind: 'title1', maxW: 2 * 1440 + GAPX, page: 'screens' };
notes.screensNote = { x: 4 * (390 + GAPX) + 40, y: 0, w: 440, text: 'スマホの画面は、Web（スマホで開いたとき）とアプリで共通です。アプリだけの違いは、ボード 19 に。\n商品名・件数・引用は data/ の実データ。商品画像は載せず、図形で代わりにしています。\n引用の満足・不満の区別は、今のデータに無いため手で分けた見本です。', fill: 'gray', size: 'm', page: 'screens' };

// ---------- 触れる試作 ----------
const proto = protoScreen();
emit('Proto.dc.html', '触れる試作', proto, 390, 844, { logic: protoLogic(), preview: false, board: { x: 0, y: 0, title: '触れる試作（操作できます）', page: 'proto', is_interactive: true } });
for (const [name, st] of [['map', {}], ['lens', { lens: 'fit' }], ['axes', { mode: 'axes' }], ['sheet', { lens: 'fit', sel: '821de2ea' }], ['ego', { mode: 'ego', sel: '821de2ea' }]]) {
  const r = renderStatic(proto, st);
  if (r.left.length) console.log('埋まらない値', name, r.left);
  writeFileSync(`${PRE}/Proto-${name}.html`, previewFile({ title: `試作 ${name}`, root: r.html }));
}
notes.protoTitle = { x: 0, y: -300, text: '触れる試作 — 地図 → レンズ → 並べる → 押す → 似ているもの', kind: 'title1', maxW: 1400, page: 'proto' };
notes.protoHow = { x: 470, y: 0, w: 440, text: '触り方（右上の Play で操作）\n・下の「装着感」などを押すと、リングがその観点だけになる\n・「並べる」を押すと、点が動いて装着感×ノイキャンの図に変わる\n・点を押すと、下からシート（件数と、ほかの不満）\n・「似ているものを見る」で、その商品を真ん中に点が集まり直す\n・位置と件数は実データ（イヤホン20商品）', fill: 'green', size: 'm', page: 'proto' };

// ---------- 目次 ----------
const canvas = {
  v: 3,
  createdOnFiles: { v: 1, at: new Date().toISOString().replace(/\.\d+Z$/, 'Z') },
  title: TITLE,
  launch: { view: 'canvas', page: 'portfolio' },
  pages: [{ id: 'portfolio', name: 'ポートフォリオ' }, { id: 'compare', name: '案の比較' }, { id: 'screens', name: '画面（実寸）' }, { id: 'proto', name: '触れる試作' }],
  boards, order, notes, designSystems: [],
};
writeFileSync(`${OUT}/canvas.json`, JSON.stringify(canvas, null, 2));
console.log(`板 ${order.length} 枚 ・ メモ ${Object.keys(notes).length}`);

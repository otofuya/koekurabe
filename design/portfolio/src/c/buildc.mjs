// 別案C のキャンバス一式（../../project-c/）と、手元確認用のプレビュー（../../preview-c/）を書き出す
// 使い方：cd design/portfolio/src/c && node --experimental-strip-types buildc.mjs
import { writeFileSync, mkdirSync, rmSync, readdirSync } from 'fs';
import { FONT_LINK, BASE_CSS } from './libc.mjs';
import { SHEETS_C } from './sheetsc.mjs';
import { COMPARE_C } from './comparec.mjs';
import { PHONE_C } from './screensc.mjs';
import { PC_C } from './pcc.mjs';
import { protoScreen, logic as protoLogic, renderStatic } from './protoc.mjs';

const OUT = '../../project-c/project', PRE = '../../preview-c';
mkdirSync(OUT, { recursive: true });
mkdirSync(PRE, { recursive: true });
for (const f of readdirSync(OUT)) rmSync(`${OUT}/${f}`);
for (const f of readdirSync(PRE)) rmSync(`${PRE}/${f}`);

const EMPTY = `class Component extends DCLogic {
  renderVals() {
    return {};
  }
}`;
const dc = ({ title, root, w, h, logic = EMPTY }) => `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="${FONT_LINK}">
<style>
${BASE_CSS}
</style>
</helmet>
${root}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${w},"height":${h}}}'>
${logic}
</script>
</body>
</html>
`;
const pre = (title, root) => `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>${title}</title><link rel="stylesheet" href="${FONT_LINK}"><style>${BASE_CSS}</style></head><body>${root}</body></html>`;

const boards = {}, order = [], notes = {};
const SW = 1600, SH = 1000, GX = 80, GY = 120;
function emit(file, title, root, w, h, { logic, board, preview = true } = {}) {
  writeFileSync(`${OUT}/${file}`, dc({ title, root, w, h, logic }));
  if (preview) writeFileSync(`${PRE}/${file.replace('.dc.html', '.html')}`, pre(title, root));
  boards[file] = { ...board, w, h };
  order.push(file);
}

SHEETS_C.forEach(([file, title, fn], i) => emit(file, title, fn(), SW, SH, { board: { x: (i % 3) * (SW + GX), y: Math.floor(i / 3) * (SH + GY), title, page: 'portfolio' } }));
notes.title = { x: 0, y: -300, text: '別案C — 全ジャンル前提：似た人の、買ったあと。', kind: 'title1', maxW: 3 * SW + 2 * GX, page: 'portfolio' };
notes.how = { x: 3 * (SW + GX), y: 0, w: 460, text: '見方\n・C00 で、何が変わって何を変えないかを確かめてください\n・C02 は、化粧水・ランニングシューズ・コーヒーで実際に測った粗い値（単語の規則・720件）\n・案A・別案B のキャンバスは残しています。C16 でどう進めるかを選べます\n・実寸の画面は「画面（実寸）」、動かせる試作は「触れる試作」に\n・直したい所は、その板にコメントしてください', fill: 'yellow', size: 'm', page: 'portfolio' };

COMPARE_C.forEach(([file, title, fn], i) => emit(file, title, fn(), SW, SH, { board: { x: i * (SW + GX), y: 0, title, page: 'compare' } }));
notes.cmpTitle = { x: 0, y: -300, text: '案の比較 — 入口・並べ方・声札', kind: 'title1', maxW: 3 * SW + 2 * GX, page: 'compare' };

const ROW = 844 + 400;
PHONE_C.forEach(([g, list], gi) => {
  list.forEach(([f, t, fn], i) => emit(`${f}.dc.html`, t, fn(), 390, 844, { board: { x: i * (390 + GX), y: gi * ROW, title: t, page: 'screens' } }));
  notes[`g${gi}`] = { x: 0, y: gi * ROW - 260, text: `スマホ：${g}`, kind: 'title1', maxW: 5 * 390 + 4 * GX, page: 'screens' };
});
const pcY = PHONE_C.length * ROW;
PC_C.forEach(([f, t, fn], i) => emit(`${f}.dc.html`, t, fn(), 1440, 900, { board: { x: (i % 2) * (1440 + GX), y: pcY + Math.floor(i / 2) * (900 + GY), title: t, page: 'screens' } }));
notes.pc = { x: 0, y: pcY - 260, text: 'PC（1440）', kind: 'title1', maxW: 2 * 1440 + GX, page: 'screens' };
notes.screensNote = { x: 5 * (390 + GX) + 40, y: 0, w: 460, text: '数字の出どころ\n・イヤホン：data/ の実データ（AI の分類）\n・シューズ・化粧水・コーヒー：楽天で8商品×30件を読み、単語の規則で数えた見本（AI の分類ではない）\n・ホーム・場所の件数：将来の状態を描いた見本\n商品の絵は色から描いた代わりの絵で、実装では楽天の商品画像。', fill: 'gray', size: 'm', page: 'screens' };

const proto = protoScreen();
emit('Proto.dc.html', '触れる試作C', proto, 390, 844, { logic: protoLogic(), preview: false, board: { x: 0, y: 0, title: '触れる試作C（操作できます）', page: 'proto', is_interactive: true } });
for (const [n, st] of [['size', {}], ['wide', { wide: true }], ['cushion', { asp: 'cushion' }], ['light', { asp: 'light' }], ['sheet', { sel: 'hk-bondi9w' }], ['sheet-wide', { sel: 'ua-cp3a', wide: true }]]) {
  const r = renderStatic(proto, st);
  if (r.left.length) console.log('埋まらない値', n, r.left.slice(0, 5));
  writeFileSync(`${PRE}/Proto-${n}.html`, pre(`試作 ${n}`, r.html));
}
notes.protoTitle = { x: 0, y: -300, text: '触れる試作C — ものさし → 観点 → 条件で数えなおす → 声札', kind: 'title1', maxW: 1600, page: 'proto' };
notes.protoHow = { x: 470, y: 0, w: 460, text: '触り方（右上の Play で操作）\n・「サイズ感／クッション／軽さ」を押すと、商品がものさしの上を動く\n・「足幅が広い」を押すと、幅広と書いた人の声だけで数えなおす。声が減り、商品は真ん中へ寄って点線になる\n・商品を押すと、全体と幅広の人を並べた声札が下から出る\n・数字はランニングシューズ8商品の見本（単語の規則・1商品30件）', fill: 'green', size: 'm', page: 'proto' };

const canvas = {
  v: 3,
  createdOnFiles: { v: 1, at: new Date().toISOString().replace(/\.\d+Z$/, 'Z') },
  title: 'koekurabe UIポートフォリオ 別案C（全ジャンル前提）',
  launch: { view: 'canvas', page: 'portfolio' },
  pages: [{ id: 'portfolio', name: 'ポートフォリオ（別案C）' }, { id: 'compare', name: '案の比較' }, { id: 'screens', name: '画面（実寸）' }, { id: 'proto', name: '触れる試作' }],
  boards, order, notes, designSystems: [],
};
writeFileSync(`${OUT}/canvas.json`, JSON.stringify(canvas, null, 2));
console.log(`板 ${order.length} 枚 ・ メモ ${Object.keys(notes).length}`);

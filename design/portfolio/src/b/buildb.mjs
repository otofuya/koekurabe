// 別案Bのキャンバス一式（../../project-b/）と、手元確認用のプレビュー（../../preview-b/）を書き出す
// 使い方：cd design/portfolio/src/b && node --experimental-strip-types buildb.mjs
import { writeFileSync, mkdirSync, rmSync, readdirSync } from 'fs';
import { FONT_LINK, BASE_CSS } from './libb.mjs';
import { SHEETS_B } from './sheetsb.mjs';
import { PHONE_B, PC_B } from './screensb.mjs';
import { protoScreen, logic as protoLogic, renderStatic } from './protob.mjs';

const OUT = '../../project-b/project', PRE = '../../preview-b';
mkdirSync(OUT, { recursive: true });
mkdirSync(PRE, { recursive: true });
for (const f of readdirSync(OUT)) rmSync(`${OUT}/${f}`);
for (const f of readdirSync(PRE)) rmSync(`${PRE}/${f}`);

const EMPTY = `class Component extends DCLogic {
  renderVals() {
    return {};
  }
}`;
const FONT_A = 'https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&amp;display=swap'; // 案Aの画面を並べる板のため
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
<link rel="stylesheet" href="${FONT_A}">
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
const pre = (title, root) => `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>${title}</title><link rel="stylesheet" href="${FONT_LINK}"><link rel="stylesheet" href="${FONT_A}"><style>${BASE_CSS}</style></head><body>${root}</body></html>`;

const boards = {}, order = [], notes = {};
const SW = 1600, SH = 1000, GX = 80, GY = 120;
function emit(file, title, root, w, h, { logic, board, preview = true } = {}) {
  writeFileSync(`${OUT}/${file}`, dc({ title, root, w, h, logic }));
  if (preview) writeFileSync(`${PRE}/${file.replace('.dc.html', '.html')}`, pre(title, root));
  boards[file] = { ...board, w, h };
  order.push(file);
}

SHEETS_B.forEach(([file, title, fn], i) => emit(file, title, fn(), SW, SH, { board: { x: (i % 3) * (SW + GX), y: Math.floor(i / 3) * (SH + GY), title, page: 'portfolio' } }));
order.splice(order.indexOf('Main.dc.html'), 1);
order.unshift('Main.dc.html');
notes.title = { x: 0, y: -300, text: '別案B — モノの地図に、声を重ねる', kind: 'title1', maxW: 3 * SW + 2 * GX, page: 'portfolio' };
notes.how = { x: 3 * (SW + GX), y: 0, w: 440, text: '見方\n・B00 で、参考（好き11・普通2・嫌い9）から読み取ったことを確かめてください\n・案A（前のキャンバス）は残しています。B02 で違いを、B12 でどう選ぶかを\n・実寸の画面は「画面（実寸）」、動かせる試作は「触れる試作」に\n・商品の絵は、実装では楽天の商品画像に置き換わります\n・直したい所は、その板にコメントしてください', fill: 'blue', size: 'm', page: 'portfolio' };

const ROW = 844 + 400;
PHONE_B.forEach(([g, list], gi) => {
  list.forEach(([f, t, fn], i) => emit(`${f}.dc.html`, t, fn(), 390, 844, { board: { x: i * (390 + GX), y: gi * ROW, title: t, page: 'screens' } }));
  notes[`g${gi}`] = { x: 0, y: gi * ROW - 260, text: `スマホ：${g}`, kind: 'title1', maxW: 4 * 390 + 3 * GX, page: 'screens' };
});
const pcY = PHONE_B.length * ROW;
PC_B.forEach(([f, t, fn], i) => emit(`${f}.dc.html`, t, fn(), 1440, 900, { board: { x: (i % 2) * (1440 + GX), y: pcY + Math.floor(i / 2) * (900 + GY), title: t, page: 'screens' } }));
notes.pc = { x: 0, y: pcY - 260, text: 'PC（1440）', kind: 'title1', maxW: 2 * 1440 + GX, page: 'screens' };
notes.screensNote = { x: 4 * (390 + GX) + 40, y: 0, w: 440, text: '商品名・件数は data/ の実データ。商品の絵は商品名の色から描いた代わりの絵で、実装では楽天の商品画像。\n引用の満足・不満の区別と、束の1枚ずつの色は、今のデータに無いため見本です（抽出のやり直しで付ける）。', fill: 'gray', size: 'm', page: 'screens' };

const proto = protoScreen();
emit('Proto.dc.html', '触れる試作B', proto, 390, 844, { logic: protoLogic(), preview: false, board: { x: 0, y: 0, title: '触れる試作B（操作できます）', page: 'proto', is_interactive: true } });
for (const [n, st] of [['map', {}], ['lens', { lens: 'fit' }], ['sel', { lens: 'fit', sel: '821de2ea' }], ['bundle', { lens: 'fit', sel: '821de2ea', view: 'bundle' }], ['sel-all', { sel: '637e1dd6' }]]) {
  const r = renderStatic(proto, st);
  if (r.left.length) console.log('埋まらない値', n, r.left.slice(0, 5));
  writeFileSync(`${PRE}/Proto-${n}.html`, pre(`試作 ${n}`, r.html));
}
notes.protoTitle = { x: 0, y: -300, text: '触れる試作B — 眺める → 回す → 押す → 束を開く', kind: 'title1', maxW: 1400, page: 'proto' };
notes.protoHow = { x: 470, y: 0, w: 440, text: '触り方（右上の Play で操作）\n・下の輪の「装着感」などを押すと、輪が回り、商品に半円のゲージが出る\n・商品を押すと大きくなり、声が近い5つへの点線が太くなる。下からシート\n・「声の束を開く」で、読んだレビューの束（1件1枚）\n・位置と件数は実データ（イヤホン20商品）', fill: 'green', size: 'm', page: 'proto' };

const canvas = {
  v: 3,
  createdOnFiles: { v: 1, at: new Date().toISOString().replace(/\.\d+Z$/, 'Z') },
  title: 'koekurabe UIポートフォリオ 別案B（参考から）',
  launch: { view: 'canvas', page: 'portfolio' },
  pages: [{ id: 'portfolio', name: 'ポートフォリオ（別案B）' }, { id: 'screens', name: '画面（実寸）' }, { id: 'proto', name: '触れる試作' }],
  boards, order, notes, designSystems: [],
};
writeFileSync(`${OUT}/canvas.json`, JSON.stringify(canvas, null, 2));
console.log(`板 ${order.length} 枚 ・ メモ ${Object.keys(notes).length}`);

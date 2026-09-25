// 統合案のキャンバス一式（../../project-d/）と、手元確認用のプレビュー（../../preview-d/）を書き出す
// 使い方：cd design/portfolio/src/d && node --experimental-strip-types buildd.mjs
import { writeFileSync, mkdirSync, rmSync, readdirSync } from 'fs';
import { FONT_LINK, BASE_CSS } from './libd.mjs';
import { SHEETS_D } from './sheetsd.mjs';
import { SHEETS_R } from './boardr.mjs';
import { PHONE_R, PC_R } from './revise.mjs';

import { PHONE_D } from './screensd.mjs';
import { PC_D } from './pcd.mjs';
import { protoScreen, logic as protoLogic, renderStatic } from './protod.mjs';

const OUT = '../../project-d/project', PRE = '../../preview-d';
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

SHEETS_D.forEach(([file, title, fn], i) => emit(file, title, fn(), SW, SH, { board: { x: (i % 3) * (SW + GX), y: Math.floor(i / 3) * (SH + GY), title, page: 'portfolio' } }));
notes.title = { x: 0, y: -300, text: '統合案（A＋B＋C）— 決定版の候補：買った人の声で、自分に合うかを見る', kind: 'title1', maxW: 3 * SW + 2 * GX, page: 'portfolio' };
notes.how = { x: 3 * (SW + GX), y: 0, w: 460, text: '見方\n・D11 に、決まったこと・OK 待ち・まだのことをまとめています\n・D00 で、回答と「何をどこから混ぜたか」を確かめてください\n・D01 が、価格.com・マイベストとの体験の違い\n・実寸の画面は「画面（実寸）」、動かせる試作は「触れる試作」に\n・D08 に AI の費用（推定）とお願いしたいキー\n・D10 が、数字の出どころ（本人が選んだ欄と AI）\n・直したい所は、その板にコメントしてください', fill: 'yellow', size: 'm', page: 'portfolio' };

const ROW = 844 + 400;
PHONE_D.forEach(([g, list], gi) => {
  list.forEach(([f, t, fn], i) => emit(`${f}.dc.html`, t, fn(), 390, 844, { board: { x: i * (390 + GX), y: gi * ROW, title: t, page: 'screens' } }));
  notes[`g${gi}`] = { x: 0, y: gi * ROW - 260, text: `スマホ：${g}`, kind: 'title1', maxW: 4 * 390 + 3 * GX, page: 'screens' };
});
const pcY = PHONE_D.length * ROW;
PC_D.forEach(([f, t, fn], i) => emit(`${f}.dc.html`, t, fn(), 1440, 900, { board: { x: (i % 2) * (1440 + GX), y: pcY + Math.floor(i / 2) * (900 + GY), title: t, page: 'screens' } }));
notes.pc = { x: 0, y: pcY - 260, text: 'PC（1440）', kind: 'title1', maxW: 2 * 1440 + GX, page: 'screens' };
notes.screensNote = { x: 4 * (390 + GX) + 40, y: 0, w: 460, text: '数字の出どころ\n・イヤホン：data/ の実データ（AI の分類）\n・シューズ・化粧水・コーヒー：楽天で8商品×30件を読み、単語の規則で数えた見本（「見本」と書いてある）\n・ホームのカテゴリの状態は今の実際（読めているのはイヤホンだけ）\n商品の絵は色から描いた代わりの絵で、実装では楽天の商品画像。', fill: 'gray', size: 'm', page: 'screens' };

// 改訂（使いやすさ）：説明4枚・スマホ6・PC1
SHEETS_R.forEach(([file, title, fn], i) => emit(file, title, fn(), SW, SH, { board: { x: (i % 2) * (SW + GX), y: Math.floor(i / 2) * (SH + GY), title, page: 'revise' } }));
const rY = 2 * (SH + GY) + 300;
PHONE_R.forEach(([f, t, fn], i) => emit(`${f}.dc.html`, t, fn(), 390, 844, { board: { x: i * (390 + GX), y: rY, title: t, page: 'revise' } }));
PC_R.forEach(([f, t, fn], i) => emit(`${f}.dc.html`, t, fn(), 1440, 900, { board: { x: i * (1440 + GX), y: rY + 844 + 400, title: t, page: 'revise' } }));
notes.reviseTitle = { x: 0, y: -300, text: '改訂：使いやすさ — 条件で絞る → 声で決める。中心は「候補をくらべる」', kind: 'title1', maxW: 2 * SW + GX, page: 'revise' };
notes.reviseHow = { x: 2 * (SW + GX), y: 0, w: 460, text: 'ご指摘「価格.com ならスペック比較ができる。わざわざ検索しない」への見直しです\n・R0 答え：買い物を2段に分け、②「残った候補を声で決める」を主役に\n・R1 新しい流れ（画面つき）\n・R2 10カテゴリの見直しと、条件にする仕様の決め方\n・R3 ご相談の6つが、どう変わるか\n・下に実寸の画面（スマホ6・PC1）。数字はイヤホンの実データ\n・「統合案」「画面（実寸）」「触れる試作」のページは見直し前のまま', fill: 'yellow', size: 'm', page: 'revise' };
notes.reviseScreens = { x: 0, y: rY - 260, text: '改訂の画面（実寸）：ホーム → 条件で絞る → 商品 → 候補をくらべる ・ 図で見る（寄り道）', kind: 'title1', maxW: 6 * 390 + 5 * GX, page: 'revise' };

const proto = protoScreen();
emit('Proto.dc.html', '触れる試作（統合案）', proto, 390, 844, { logic: protoLogic(), preview: false, board: { x: 0, y: 0, title: '触れる試作（操作できます）', page: 'proto', is_interactive: true } });
for (const [n, st] of [['home', {}], ['coach', { screen: 'cat' }], ['cat', { screen: 'cat', coach: false }], ['cat-anc', { screen: 'cat', coach: false, k: 'anc' }], ['product', { screen: 'product' }], ['similar', { screen: 'similar' }], ['similar2', { screen: 'similar', anchor: 'cb0101de', sel: 'cb0101de' }]]) {
  const r = renderStatic(proto, st);
  if (r.left.length) console.log('埋まらない値', n, r.left.slice(0, 5));
  writeFileSync(`${PRE}/Proto-${n}.html`, pre(`試作 ${n}`, r.html));
}
notes.protoTitle = { x: 0, y: -300, text: '触れる試作 — ホーム → 気になることを選ぶ → 商品 → これに似たもの', kind: 'title1', maxW: 1600, page: 'proto' };
notes.protoHow = { x: 470, y: 0, w: 460, text: '触り方（右上の Play で操作）\n・ホームで「完全ワイヤレスイヤホン」（黒い枠）を押す\n・はじめての説明を閉じ、「つけ心地／ノイキャン／外の音／操作／値段」を押すと、商品が線の上を動く\n・丸を押すと下に出る。下の板を押すと商品へ\n・「これに似たものを見る」→ まわりの商品を押すと、真ん中が入れ替わる\n・数字はイヤホンの実データ', fill: 'green', size: 'm', page: 'proto' };

const canvas = {
  v: 3,
  createdOnFiles: { v: 1, at: new Date().toISOString().replace(/\.\d+Z$/, 'Z') },
  title: 'koekurabe 統合案（A＋B＋C）',
  launch: { view: 'canvas', page: 'revise' },
  pages: [{ id: 'revise', name: '改訂：使いやすさ' }, { id: 'portfolio', name: '統合案' }, { id: 'screens', name: '画面（実寸）' }, { id: 'proto', name: '触れる試作' }],
  boards, order, notes, designSystems: [],
};
writeFileSync(`${OUT}/canvas.json`, JSON.stringify(canvas, null, 2));
console.log(`板 ${order.length} 枚 ・ メモ ${Object.keys(notes).length}`);

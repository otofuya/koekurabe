// 画面だけを手早く書き出して確かめる（buildc.mjs の一部）
import { writeFileSync, mkdirSync } from 'fs';
import { FONT_LINK, BASE_CSS, phone } from './libc.mjs';
import { PHONE_C } from './screensc.mjs';
import { PC_C } from './pcc.mjs';
const PRE = '../../preview-c';
mkdirSync(PRE, { recursive: true });
const pre = (t, root) => `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>${t}</title><link rel="stylesheet" href="${FONT_LINK}"><style>${BASE_CSS}</style></head><body>${root}</body></html>`;
const only = process.argv[2] || '';
for (const [, list] of PHONE_C) for (const [f, t, fn] of list) if (f.includes(only)) writeFileSync(`${PRE}/${f}.html`, pre(t, fn()));
for (const [f, t, fn] of PC_C) if (f.includes(only)) writeFileSync(`${PRE}/${f}.html`, pre(t, fn()));
console.log('ok');
import { SHEETS_C } from './sheetsc.mjs';
for (const [f, t, fn] of SHEETS_C) if (('B-' + f).includes(only)) writeFileSync(`${PRE}/B-${f.replace('.dc.html', '.html')}`, pre(t, fn()));
console.log('boards ok');
import { COMPARE_C } from './comparec.mjs';
for (const [f, t, fn] of COMPARE_C) if (('B-' + f).includes(only)) writeFileSync(`${PRE}/B-${f.replace('.dc.html', '.html')}`, pre(t, fn()));
console.log('compare ok');

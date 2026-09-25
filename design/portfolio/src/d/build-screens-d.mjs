// 画面とボードを手早く書き出して確かめる（buildd.mjs の一部）
import { writeFileSync, mkdirSync } from 'fs';
import { FONT_LINK, BASE_CSS } from './libd.mjs';
import { PHONE_D } from './screensd.mjs';
const PRE = '../../preview-d';
mkdirSync(PRE, { recursive: true });
const pre = (t, root) => `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>${t}</title><link rel="stylesheet" href="${FONT_LINK}"><style>${BASE_CSS}</style></head><body>${root}</body></html>`;
const only = process.argv[2] || '';
for (const [, list] of PHONE_D) for (const [f, t, fn] of list) if (f.includes(only)) writeFileSync(`${PRE}/${f}.html`, pre(t, fn()));
const extra = process.env.EXTRA ? await import(process.env.EXTRA) : null;
if (extra) for (const [f, t, fn] of extra.LIST) if (f.includes(only)) writeFileSync(`${PRE}/${f.replace('.dc.html', '')}.html`, pre(t, fn()));
console.log('ok');
import { PC_D } from './pcd.mjs';
for (const [f, t, fn] of PC_D) if (f.includes(only)) writeFileSync(`${PRE}/${f}.html`, pre(t, fn()));
console.log('pc ok');

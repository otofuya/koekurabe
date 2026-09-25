// 別案Bの画面だけを preview-b/ に書き出す（見た目の早い確認用）
import { writeFileSync, mkdirSync } from 'fs';
import { FONT_LINK, BASE_CSS } from './libb.mjs';
import { PHONE_B, PC_B } from './screensb.mjs';

const pre = (title, root) => `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>${title}</title><link rel="stylesheet" href="${FONT_LINK}"><style>${BASE_CSS}</style></head><body>${root}</body></html>`;
mkdirSync('../../preview-b', { recursive: true });
const only = process.argv[2] || '';
for (const [, list] of PHONE_B) for (const [f, t, fn] of list) if (!only || f.includes(only)) writeFileSync(`../../preview-b/${f}.html`, pre(t, fn()));
for (const [f, t, fn] of PC_B) if (!only || f.includes(only)) writeFileSync(`../../preview-b/${f}.html`, pre(t, fn()));
console.log('ok');

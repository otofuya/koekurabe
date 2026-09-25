// 画面だけを preview/ に書き出す（見た目の早い確認用）
import { writeFileSync, mkdirSync } from 'fs';
import { previewFile } from './out.mjs';
import { PHONE_SCREENS, PC_SCREENS } from './screens.mjs';

mkdirSync('../preview', { recursive: true });
const only = process.argv[2] || '';
for (const [, list] of PHONE_SCREENS) for (const [f, t, fn] of list) if (!only || f.includes(only)) writeFileSync(`../preview/${f}.html`, previewFile({ title: t, root: fn() }));
for (const [f, t, fn] of PC_SCREENS) if (!only || f.includes(only)) writeFileSync(`../preview/${f}.html`, previewFile({ title: t, root: fn() }));
console.log('ok');

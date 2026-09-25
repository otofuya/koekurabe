// 手元の確認：preview/ の HTML を撮り、はみ出し・文字切れを数える
// 使い方：node shot.mjs [ファイル名の一部]
import { chromium } from '../../../../node_modules/playwright/index.mjs';
import { readdirSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const PRE = resolve('../../preview-b'), OUT = resolve('../../shots-b');
mkdirSync(OUT, { recursive: true });
const only = process.argv[2] || '';
const files = readdirSync(PRE).filter((f) => f.endsWith('.html') && f.includes(only));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let problems = 0;
for (const f of files) {
  const p = await b.newPage({ viewport: { width: 1700, height: 1100 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(pathToFileURL(resolve(PRE, f)).href);
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const root = document.body.firstElementChild;
    const rb = root.getBoundingClientRect();
    const out = [];
    for (const el of root.querySelectorAll('*')) {
      if (el.closest('svg') && el.tagName !== 'svg') continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const txt = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (txt && (cs.overflow === 'hidden' || cs.textOverflow === 'ellipsis' || cs.whiteSpace === 'nowrap') && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) out.push(`文字切れ: "${el.textContent.trim().slice(0, 24)}" ${el.scrollWidth}>${el.clientWidth}`);
      const eb = el.getBoundingClientRect();
      if (eb.width && (eb.right > rb.right + 1 || eb.bottom > rb.bottom + 1) && !el.closest('[style*="overflow:hidden"], [style*="overflow: hidden"]')) out.push(`板の外: <${el.tagName.toLowerCase()}> ${Math.round(eb.right - rb.right)}px,${Math.round(eb.bottom - rb.bottom)}px "${(el.textContent || '').trim().slice(0, 20)}"`);
      if (txt && parseFloat(cs.fontSize) < 11) out.push(`11px未満: ${cs.fontSize} "${el.textContent.trim().slice(0, 16)}"`);
    }
    return { w: Math.round(rb.width), h: Math.round(rb.height), out: [...new Set(out)].slice(0, 12) };
  });
  await p.setViewportSize({ width: Math.max(r.w, 200), height: Math.max(r.h, 200) });
  await p.waitForTimeout(150);
  await p.screenshot({ path: resolve(OUT, f.replace('.html', '.png')), clip: { x: 0, y: 0, width: r.w, height: r.h } });
  if (r.out.length || errs.length) { problems += r.out.length + errs.length; console.log(`■ ${f} (${r.w}×${r.h})\n  ${[...r.out, ...errs].join('\n  ')}`); }
  await p.close();
}
await b.close();
console.log(`撮影 ${files.length} 件 ・ 問題 ${problems} 件`);

// シェア用の画像（1200×630）の HTML。実際のブラウザで撮って PNG にする（scripts/prerender.mjs）。
//
// 楽天の商品画像は使わない（楽天の画像を別の場所へ持ち出さないため。docs/06 の回答）。
// 数字は件数だけ。分母（何件中）を必ず出す（設計原則1）。

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const FONTS = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600&family=Zen+Kaku+Gothic+New:wght@500;700;900&display=block">`;

const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1200px; height: 630px; background: #fff; color: #141414; font-family: "Zen Kaku Gothic New", sans-serif; }
  .num { font-family: "Outfit", "Zen Kaku Gothic New", sans-serif; font-variant-numeric: tabular-nums; }
  .site { position: absolute; left: 64px; bottom: 44px; font-size: 26px; font-weight: 900; display: flex; align-items: center; gap: 2px; }
  .site small { font-size: 18px; font-weight: 500; color: #6b6b68; margin-left: 6px; }
`;

/**
 * 商品1つぶん。
 * @param {{ name: string, star: number, reviewCount: number, read: number, good: {word: string, count: number}[], bad: {word: string, count: number}[], siteName: string }} d
 */
export function productOgHtml(d) {
  const col = (side, label, lines) => `
    <div class="col">
      <div class="col__head"><span class="dot dot--${side}"></span>${label}<small class="num">${d.read}件中</small></div>
      ${lines.length ? lines.map((l) => `
        <div class="row">
          <div class="row__top"><span>${esc(l.word)}</span><b class="num n--${side}">${l.count}</b></div>
          <div class="bar"><i class="bar--${side}" style="width:${Math.max(1.5, (l.count / d.read) * 100).toFixed(1)}%"></i></div>
        </div>`).join("") : `<p class="none">ふれた声なし</p>`}
    </div>`;
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}
    .wrap { position: absolute; inset: 0; padding: 52px 64px 0; }
    .name { font-size: 46px; font-weight: 900; line-height: 1.25; max-height: 116px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .sub { margin-top: 10px; font-size: 22px; color: #474745; display: flex; align-items: baseline; gap: 18px; }
    .sub .star { font-size: 30px; font-weight: 600; color: #141414; }
    .card { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 0 48px; }
    .col + .col { border-left: 1.5px solid #e6e6e3; padding-left: 48px; }
    .col__head { display: flex; align-items: center; gap: 10px; font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .col__head small { margin-left: auto; font-size: 18px; font-weight: 500; color: #6b6b68; }
    .dot { width: 14px; height: 14px; border-radius: 50%; }
    .dot--good { background: #5163e6; } .dot--bad { background: #e4583b; }
    .row { padding: 9px 0 8px; }
    .row__top { display: flex; justify-content: space-between; align-items: baseline; font-size: 27px; }
    .row__top b { font-size: 44px; font-weight: 600; line-height: 1.05; }
    .n--good { color: #3b48be; } .n--bad { color: #b03c20; }
    .bar { height: 9px; border-radius: 4px; background: #ececE9; margin-top: 5px; overflow: hidden; }
    .bar i { display: block; height: 100%; border-radius: 4px; }
    .bar--good { background: #5163e6; } .bar--bad { background: #e4583b; }
    .none { font-size: 20px; color: #6b6b68; padding: 10px 0; }
    .note { position: absolute; right: 64px; bottom: 48px; font-size: 18px; color: #6b6b68; }
  </style></head><body>
    <div class="wrap">
      <h1 class="name">${esc(d.name)}</h1>
      <p class="sub"><span class="star num">★${d.star.toFixed(2)}</span><span>楽天のレビュー${d.reviewCount.toLocaleString("ja-JP")}件の平均。その中身を${d.read}件読んで数えました</span></p>
      <div class="card">${col("good", "よかった", d.good)}${col("bad", "残念だった", d.bad)}</div>
    </div>
    <p class="site">${esc(d.siteName)}</p>
  </body></html>`;
}

/** サイト共通。 */
export function siteOgHtml({ siteName, tagline, lead }) {
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}
    .wrap { position: absolute; inset: 0; padding: 96px 64px 0; }
    h1 { font-size: 76px; font-weight: 900; line-height: 1.3; }
    p.lead { margin-top: 26px; font-size: 30px; color: #474745; }
    p.lead b { color: #141414; }
    .pair { position: absolute; right: 64px; bottom: 44px; display: flex; gap: 28px; font-size: 26px; font-weight: 700; }
    .pair span { display: inline-flex; align-items: center; gap: 10px; }
    .pair i { width: 16px; height: 16px; border-radius: 50%; display: inline-block; }
  </style></head><body>
    <div class="wrap"><h1>${esc(tagline)}</h1><p class="lead">${esc(lead)}</p></div>
    <p class="site">${esc(siteName)}</p>
    <p class="pair"><span><i style="background:#5163e6"></i>よかった</span><span><i style="background:#e4583b"></i>残念だった</span></p>
  </body></html>`;
}

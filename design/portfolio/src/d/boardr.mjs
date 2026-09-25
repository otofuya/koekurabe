// 改訂のボード（R0〜R3）：「価格.com で仕様は比べられる」への答え
import { C, F, SH, icon, objD, earArt, num, small, tile, node, strip } from './libd.mjs';
import { frame, at, ph, h, p, kick, dot, box, bl, arrow, bigNum } from './boardd.mjs';
import { byShort, UNITS, QL, yen } from './datad.mjs';
import { rHome, rCategory, rProduct, rCompare, PHONE_R, FILTER, SPEC_COV, SPEC_PROV } from './revise.mjs';

const line = (cols, cells, { head = false, fs = 13, pad = 10 } = {}) => `<div style="display:grid; grid-template-columns:${cols}; gap:14px; padding:${head ? '0 0 8px' : `${pad}px 0`}; ${head ? '' : `border-top:1px solid ${C.hair};`} font-size:${head ? 12 : fs}px; ${head ? `color:${C.muted}; font-weight:700;` : 'line-height:1.55;'} align-items:center;">${cells.map((c) => `<span>${c}</span>`).join('')}</div>`;
const nv = (s, k) => `<span style="color:${C.negText};">不満 ${s.neg[k]}</span>・<span style="color:${C.posText};">満足 ${s.pos[k]}</span>`;

// ---------- R0 ご指摘への答え ----------
function r0() {
  const s = byShort['821de2ea'];
  const rows = [['つけ心地', `<span style="color:${C.faint};">仕様の表に無い</span>`, 'fit'], ['連続再生', '最大8.5時間 <span style="font-size:11.5px; color:' + C.muted + ';">公式</span>', 'battery'], ['ノイキャン', '対応 <span style="font-size:11.5px; color:' + C.muted + ';">販売ページ</span>', 'anc']];
  const steps = [[FILTER.all, 'イヤホン全体', 0], [FILTER.budget, '〜1万円', 0], [FILTER.match, 'ノイキャンあり', 0], [3, '候補に入れた', 1], [1, '買うもの', 1]];
  const stepBox = ([n, t, dark], i) => `<div style="display:flex; align-items:center; gap:14px;"><div style="width:220px; box-sizing:border-box; padding:16px 18px; border-radius:22px; background:${dark ? C.ink : C.tile}; color:${dark ? '#fff' : C.ink};"><div style="font-family:${F.num}; font-size:40px; font-weight:500; line-height:1;">${n}</div><div style="font-size:13px; margin-top:6px; ${dark ? '' : `color:${C.ink2};`}">${t}</div></div>${i < steps.length - 1 ? `<svg width="36" height="20" viewBox="0 0 36 20" aria-hidden="true"><path d="M2 10H30M23 3l7 7-7 7" fill="none" stroke="${C.ink2}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>` : ''}</div>`;
  return frame('R0', 'ご指摘への答え', `
${at(72, 124, `<div style="width:690px; display:flex; flex-direction:column; gap:12px;">${kick('いただいた指摘')}<div style="padding:14px 18px; border-radius:18px; background:${C.tile}; font-size:15px; line-height:1.7;">「価格.com ならスペック比較ができる。画面のサイズとかも考えると、わざわざこのシステムで検索しないと思った」</div>
${kick('その通りだと考えたこと')}<div>${bl(['仕様で絞る・いちばん安い店を探すのは、価格.com のほうが速くて正確', '声の線（図）を最初に出すと、スマホでは読みにくく、何をすればいいか迷う', '「どれがいちばんか」から始めると、価格.com とマイベストの土俵に乗ってしまう'], { fs: 13.5 })}</div>
${kick('だから、こう変える')}<div>${bl(['買い物を2段に分ける：<b style="color:' + C.ink + ';">① 条件で絞る → ② 残った2〜4つを声で決める</b>', '①は最小限（条件は3〜4つ）。②の「候補をくらべる」を主役にする', 'ほかのサイトで絞った候補も、商品名を入れるだけで持ち込める'], { fs: 13.5 })}</div></div>`)}
${at(840, 124, `<div style="width:688px;">${box(`${kick('スペックで分からないこと（イヤホンの実データ）')}<div style="display:flex; gap:12px; align-items:center; margin:4px 0 6px;">${node(earArt(s.s, 46), { size: 54 })}<div><b style="font-size:16px;">${s.name}</b><div style="font-size:12.5px; color:${C.ink2};">${yen(s.price)}・レビュー ${s.read}件を読んだ</div></div></div>${line('120px 1fr 1fr', ['', '仕様の表', `買った人（${s.read}件中）`], { head: true })}${rows.map(([t, v, k]) => line('120px 1fr 1fr', [`<b>${t}</b>`, v, nv(s, k)], { fs: 14 })).join('')}<div style="font-size:13px; color:${C.ink2}; line-height:1.7; margin-top:8px;">仕様が教えてくれるのは「ある・ない」と「数字」。<b style="color:${C.ink};">買ったあとに合う・合わない</b>は、買った人の声にしか無い。連続再生は8.5時間でも、電池に不満 ${s.neg.battery}件</div>`, { pad: 22, gap: 6 })}</div>`)}
${at(72, 560, `<div style="width:1456px;">${kick('買い物の2段（イヤホン・実際の数）')}<div style="display:flex; gap:0; margin-top:12px; align-items:center;">${steps.map(stepBox).join('')}</div>
<div style="display:grid; grid-template-columns:790px 1fr; margin-top:12px; font-size:13.5px;"><div style="border-top:3px solid ${C.line}; padding-top:8px; color:${C.ink2};"><b style="color:${C.ink};">① 条件で絞る</b>　価格.com も得意。ここでは最小限（チップ3〜4つ）</div><div style="border-top:3px solid ${C.ink}; padding-top:8px; margin-left:20px;"><b>② 声で決める</b>　ここが主役。「候補をくらべる」</div></div></div>`)}
${at(72, 780, `<div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; width:1456px;">${box(`${kick('「画面のサイズ」の読み方 1：商品の仕様として')}<div style="font-size:13.5px; color:${C.ink2}; line-height:1.7;">テレビやパソコンの画面の大きさのように、<b style="color:${C.ink};">仕様で決まる買い物は価格.com の勝ち</b>。だから最初の10カテゴリには入れていない（R2）。ここで扱うのは、仕様で決まらない買い物</div>`, { pad: 20, gap: 6 })}${box(`${kick('読み方 2：スマホの画面の狭さとして')}<div style="font-size:13.5px; color:${C.ink2}; line-height:1.7;">横に長い仕様表はスマホで読めない。ここでは<b style="color:${C.ink};">候補3つ × 数行</b>までにして、390px の幅に収める（R1 の「候補をくらべる」）。図は寄り道にした</div>`, { pad: 20, gap: 6 })}</div>`)}
`, { src: 'ear', sub: 'スペックで絞るのは価格.com。ここは、残った候補を声で決める場所' });
}

// ---------- R1 新しい流れ ----------
function r1() {
  const S = 0.5, pw = 410 * S, gap = 64, y = 290;
  const xs = [72, 72 + pw + gap, 72 + 2 * (pw + gap), 72 + 3 * (pw + gap)];
  const screens = [[rHome(), '何をくらべますか？', 'ホーム', '商品名でさがす・カテゴリ・続きから。「迷っている商品をくらべる」を一番上に'], [rCategory(), 'どこが気になりますか？', '条件で絞る → 並べる', '条件はチップで。並びは「気になること」の評判順（順位ではない）。＋候補で下のトレイへ'], [rProduct(), '買う前に知っておくことは？', '商品：最終チェック', '答えを先に：いちばん多い不満。仕様と声を横に並べる。同じ値段で不満が少ないもの'], [rCompare(), 'どれが自分に合う？', '候補をくらべる（中心）', '2〜4つ。仕様は数行、声は違いが大きい順。同じくらいのことは1行で']];
  const entries = [['search', '商品名で', '→ 商品'], ['list', 'カテゴリから', '→ 条件で絞る'], ['pair', 'ほかのサイトで絞った候補を持ち込む', '→ くらべる']];
  let html = at(72, 124, `<div style="display:flex; gap:14px; align-items:center;">${kick('3つの入口')}${entries.map(([ic, t, s]) => `<div style="display:flex; align-items:center; gap:10px; height:52px; padding:0 18px; border-radius:26px; background:${C.tile};">${icon(ic, { size: 20 })}<b style="font-size:14.5px;">${t}</b><span style="font-size:13px; color:${C.ink2};">${s}</span></div>`).join('')}</div>`);
  html += at(72, 196, `<div style="font-size:13.5px; color:${C.ink2}; width:1060px; line-height:1.7;">どの入口から来ても、行き着く先は<b style="color:${C.ink};">「候補をくらべる」</b>。お金の場所（楽天で見る）は、声を読んだあと（商品・くらべる）だけに置く</div>`);
  screens.forEach(([sc, q, t, d], i) => {
    html += at(xs[i], y - 50, `<div style="width:${pw + 20}px;"><div style="font-size:12px; color:${C.muted}; font-weight:700;">${t}</div><div style="font-size:15px; font-weight:900; margin-top:2px;">${q}</div></div>`);
    html += ph(sc, xs[i], y, S);
    html += at(xs[i], y + 864 * S + 14, `<div style="width:${pw}px; font-size:12.5px; color:${C.ink2}; line-height:1.65;">${d}</div>`);
    if (i < 3) html += arrow(xs[i] + pw + 10, y + 200, gap - 20, { color: C.ink2 });
  });
  const mx = 1180;
  html += at(mx, y - 50, `<div style="width:348px;"><div style="font-size:12px; color:${C.muted}; font-weight:700;">寄り道</div><div style="font-size:15px; font-weight:900; margin-top:2px;">図で見る（声の線）</div></div>`);
  html += ph(PHONE_R[5][2](), mx, y, 0.4);
  html += at(mx + 180, y + 10, `<div style="width:168px; font-size:12.5px; color:${C.ink2}; line-height:1.65;">一覧の右上「図で見る」から。商品が、不満（左）と満足（右）の間に並ぶ。<br><br>好き7・8（画像を空間に並べる）はここに残す。<b style="color:${C.ink};">主役にはしない</b></div>`);
  html += at(mx, y + 864 * 0.4 + 24, `<div style="width:348px;">${box(`${kick('候補の残り方')}<div style="font-size:13px; color:${C.ink2}; line-height:1.7;">この端末の中だけ（登録なし）。くらべる画面は URL（/vs/…）になり、家族に送れる</div>`, { pad: 16, gap: 4 })}</div>`);
  return frame('R1', '新しい流れ', html, { src: 'ear', sub: '条件で絞る → 声で決める。中心は「候補をくらべる」' });
}

// ---------- R2 10カテゴリの見直し ----------
const GUESS = {
  lotion: ['予算・肌の悩み・容量', '肌に合うか・しっとり感・香り'], shampoo: ['予算・髪の悩み・ノンシリコン', '香り・きしみ・まとまり'], pillow: ['予算・高さ調整・素材', '高さが合うか・寝心地・へたり'],
  run: ['予算・レベル・足幅', 'サイズ感・クッション・疲れにくさ'], coffee: ['予算・杯数・焙煎の深さ', '味・香り・また買ったか'], protein: ['予算・種類・味', '味・溶けやすさ・また買ったか'],
  catfood: ['予算・年齢・ドライ／ウェット', '食いつき・お腹の調子・また買ったか'], earbuds: ['予算・ノイキャン・形・防水', 'つけ心地・つながり・操作'], dryer: ['予算・重さ・風量', '乾く速さ・まとまり・音'], vacuum: ['予算・重さ・連続時間', '吸う力・ゴミ捨て・持ちやすさ'],
};
function r2() {
  const st = { real: ['読めている', C.ink, '#fff'], sample: ['見本だけ', C.tile, C.ink], todo: ['これから', '#fff', C.ink2] };
  const cols = '44px 170px 250px 1fr 104px';
  const row = (u) => { const [f, a] = GUESS[u.key]; const s = st[u.state]; return line(cols, [tile(objD(u.obj, { size: 34 }), { w: 38, r: 12 }), `<b>${u.name}</b>`, `<span style="color:${C.ink2};">${f}</span>`, `<span style="color:${C.ink2};">${a}</span>`, `<span style="display:inline-flex; height:24px; align-items:center; padding:0 10px; border-radius:12px; background:${s[1]}; color:${s[2]}; border:1px solid ${C.line}; font-size:12px; font-weight:700;">${s[0]}</span>`], { fs: 13, pad: 6 }); };
  const voice = ['lotion', 'shampoo', 'pillow', 'run', 'coffee', 'protein', 'catfood'], both = ['earbuds', 'dryer', 'vacuum'];
  const U = (k) => UNITS.find((u) => u.key === k);
  const group = (t, s, list) => `<div style="margin-top:14px;"><div style="display:flex; align-items:baseline; gap:12px; margin-bottom:6px;"><b style="font-size:16px;">${t}</b>${small(s, { size: 12.5, color: C.ink2 })}</div>${list.map((k) => row(U(k))).join('')}</div>`;
  const cov = [['ノイキャン', SPEC_COV.anc, ''], ['耳をふさぐか', SPEC_COV.openEar, ''], ['防水', SPEC_COV.water, ''], ['連続再生', SPEC_COV.playback, ''], ['重さ', SPEC_COV.weight, ''], ['2台につなぐ', SPEC_COV.multipoint, '推定のみ'], ['外の音を聞く', SPEC_COV.ambient, '推定のみ']];
  const bw = 128;
  const covRow = ([t, n, s]) => `<div style="display:grid; grid-template-columns:112px ${bw}px 1fr; gap:10px; align-items:center; font-size:12.5px; padding:4px 0; white-space:nowrap;"><span>${t}</span><span style="position:relative; display:block; height:10px; border-radius:5px; background:${C.rest};"><span style="position:absolute; left:0; top:0; height:10px; width:${Math.round((n / FILTER.all) * bw)}px; border-radius:5px; background:${n / FILTER.all >= 0.5 ? C.ink : C.faint};"></span></span><span style="font-family:${F.num};">${n}<span style="color:${C.muted};"> / ${FILTER.all}</span>${s ? ` <span style="font-family:${F.jp}; font-size:11.5px; color:${C.muted};">${s}</span>` : ''}</span></div>`;
  return frame('R2', '最初の10カテゴリの見直し', `
${at(72, 118, `<div style="width:1000px;">${line(cols, ['', 'カテゴリ', '条件で絞る（想定）', 'スペックで分からないこと（想定）', '状態'], { head: true })}${group('声で決まる（7）', '仕様の差が小さく、買ったあとの「合う・合わない」で決まる。ここを先に並べる', voice)}${group('仕様で絞って、声で決める（3）', '条件で絞ってから声で決める。「仕様と声のズレ」を商品ページに出す', both)}</div>`)}
${at(72, 800, `<div style="width:1000px; display:flex; flex-direction:column; gap:4px;">${bl(['10カテゴリは変えない。<b style="color:' + C.ink + ';">仕様で決まる買い物（テレビ・パソコン・カメラ・スマホ本体）は、もともと入れていない</b>', 'イヤホン以外の条件と観点は想定。観点は、読んでから意見の散らばりで決める（CLAUDE.md の2）', 'イヤホン以外で、仕様をどこから取るかはまだ確かめていない'], { fs: 13, ic: 'info', color: C.ink2 })}</div>`)}
${at(1120, 118, `<div style="width:408px; display:flex; flex-direction:column; gap:16px;">${box(`${kick('条件にする仕様の決め方（イヤホンで測った）')}<div style="font-size:13px; color:${C.ink2}; line-height:1.65;"><b style="color:${C.ink};">半分以上の商品に掲載がある仕様だけ</b>を条件にする。残りは、くらべる画面で「掲載なし」も含めて見せる</div><div style="margin-top:4px;">${cov.map(covRow).join('')}</div>`, { pad: 20, gap: 6 })}
${box(`${kick(`仕様の出どころ（イヤホン・値 ${SPEC_PROV.official + SPEC_PROV.ec_api + SPEC_PROV.llm_inferred}個）`)}<div style="display:flex; gap:24px; margin-top:4px;">${bigNum(SPEC_PROV.official, '公式', { size: 32 })}${bigNum(SPEC_PROV.ec_api, '販売ページ', { size: 32 })}${bigNum(SPEC_PROV.llm_inferred, '推定', { size: 32 })}</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.65;">推定は、掲載が無く AI が商品名や説明から推し量った値。画面では「推定」の印を付ける。件数（声）には印を付けない</div>`, { pad: 20, gap: 8 })}</div>`)}
`, { src: 'none', sub: '10はそのまま。声で決まる7つを先に' });
}

// ---------- R3 6つの項目：どう変わるか ----------
function r3() {
  const rows = [
    ['画面の流れ', 'ホーム → 声の線 → 商品 → これに似たもの・くらべる', '3つの入口 → 条件で絞る → 気になることで並べる → <b>候補をくらべる</b>（中心）。声の線は「図で見る」の寄り道', '価格.com で絞った人が、最後の決め手を探しに来られる'],
    ['見た目', '白地・色は声の2色だけ。商品の丸が線に並ぶ', '白地・声の2色は変えない。主役を<b>なじみのある一覧・条件・候補のトレイ</b>に。不満｜満足の帯はどの画面も同じ形', 'はじめてでも操作が分かる。スマホの幅に収まる'],
    ['言葉', '日常語・1画面1問い', '変えない。＋<b>答えを先に</b>：「いちばん多い不満は つけ心地（129件中14件）」「つながりは Air Pro 3 が好評」', '読む前に結論が分かる。数字は分母つきのまま'],
    ['最初の10カテゴリ', '系統をまたいで10', '10はそのまま。<b>声で決まる7つを先に</b>。イヤホン・ドライヤー・掃除機は「仕様と声のズレ」を見せる', '仕様で決まる買い物は、もともと価格.com の勝ち'],
    ['データの3段', '欄 → AI → 蒸留', '変えない。＋<b>仕様</b>を4つ目の出どころに（公式・販売ページ・推定の印）。掲載が半分未満の仕様は条件にしない', '条件で絞るのに要る。推定と事実を見分ける'],
    ['作り方', '今の Vite＋TypeScript のまま', '変えない。＋商品と「くらべる」のページは<b>先に HTML を書き出す</b>（検索に出せるように）。候補は端末の中と URL（/vs/…）', '「A と B 比較」で検索した人に、直接届く'],
  ];
  const cols = '150px 1fr 1.35fr 1fr';
  return frame('R3', '6つの項目：どう変わるか', `
${at(72, 118, `<div style="width:1456px;">${line(cols, ['項目', 'いまの案（D04〜D10）', '見直し後', 'ねらい'], { head: true })}${rows.map(([a, b, c, d]) => line(cols, [`<b style="font-size:15px;">${a}</b>`, `<span style="color:${C.muted};">${b}</span>`, `<span>${c}</span>`, `<span style="color:${C.ink2};">${d}</span>`], { fs: 13.5, pad: 14 })).join('')}</div>`)}
${at(72, 620, `<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:18px; width:1456px;">
${box(`${kick('変えないこと')}<div>${bl(['数字は「N件中M件」。件数に「推定」は付けない', '観点は意見の散らばりで選ぶ', 'レビュー本文は出さない。照合した短い引用だけ', '相手のアクセス制御は回避しない', '順位を付けない（並びは「あなたが選んだ並び」）'], { fs: 12.5 })}</div>`, { pad: 20, gap: 6 })}
${box(`${kick('手放すこと（トレードオフ）')}<div>${bl(['声の線（商品を空間に並べる）は主役でなくなる → 「図で見る」に残す', '「これに似たもの」の図は、商品ページでは「同じ値段で不満が少ない2つ」に簡単にする', '一覧は順位に見えやすい → 1位の印を付けず、並びの理由を書く'], { fs: 12.5, ic: 'info', color: C.ink2 })}</div>`, { pad: 20, gap: 6 })}
${box(`${kick('OK のあとに作る順番')}<div style="font-size:12.5px; color:${C.ink2}; line-height:1.75;">1 データの形：声・欄・<b style="color:${C.ink};">仕様（出どころつき）</b>。条件の判定は純粋関数に<br>2 画面：くらべる → 商品 → カテゴリ（条件・並び）→ ホーム → 図で見る。イヤホンの実データで<br>3 キーが入ったら3カテゴリで抽出し直す</div>`, { pad: 20, gap: 6 })}
</div>`)}
`, { src: 'none', sub: 'ご相談の6つについて、いまの案 → 見直し後' });
}

export const SHEETS_R = [['R0.dc.html', 'R0 ご指摘への答え', r0], ['R1.dc.html', 'R1 新しい流れ', r1], ['R2.dc.html', 'R2 最初の10カテゴリの見直し', r2], ['R3.dc.html', 'R3 6つの項目：どう変わるか', r3]];

// 案の比較：コンセプトの3案・地図の5案・見た目の3案（仮）
import { C, F, SH, icon, num, tag, chip, productDot, wordmark, esc } from './lib.mjs';
import { mapView, axesView } from './map.mjs';
import * as S from './screens.mjs';
import { frame, at, ph, h, p, kick, dot, box, bl } from './board.mjs';
import { STATS, MAPPED, byShort, KEYS, SHORT, neighbors } from './data.mjs';

const card = (inner, extra = '') => box(inner, { pad: 18, gap: 10, extra });
const verdict = (t, on) => tag(t, { bg: on ? C.ink : C.bg2, color: on ? C.white : C.ink2, fs: 11.5, h: 24 });

// ====================================================================
// X1 コンセプトの3案
// ====================================================================
export function x1() {
  const WFC = byShort['821de2ea'];
  const units = [
    ['A', '声の地図', '推す', '買った人の声で描いた、商品の地図', `<div style="position:relative; width:100%; height:220px; border-radius:14px; overflow:hidden;">${mapView({ w: 444, h: 220, labels: 'none', min: 14, max: 32 })}</div>`,
      ['地図そのものが入口で、眺めて楽しい（Q12）', '似ている・違う・不満を、同じ地図の上で', '図は要約されず、共有される'], ['データが薄いジャンルでは地図が成り立たない（07 のゲートで守る）'], 'ホーム・ジャンルの主役'],
    ['B', '似ている・違うの図鑑', 'A に入れる', '好きな物から、似た物・別の物へ', `<div style="height:220px; border-radius:14px; background:${C.map}; display:flex; align-items:center; justify-content:center; gap:14px;">${productDot({ size: 40, pos: 6, neg: 2 })}${productDot({ size: 64, pos: 21, neg: 14, sel: true })}${productDot({ size: 44, pos: 9, neg: 1 })}</div>`,
      ['「好きなものがある人」（Q07）に最短', '「〇〇 代わり」の検索の受け口になる'], ['起点が無い人（まだ何も知らない人）には入口が弱い'], '「似ているもの」（16）として A の中に'],
    ['C', '不満の先回り', 'A に入れる', '外れを、先に避ける', `<div style="height:220px; border-radius:14px; background:${C.negSoft}; display:flex; flex-direction:column; justify-content:center; gap:10px; padding:0 22px; box-sizing:border-box;">${['装着感 不満14', '電池 不満10', 'ノイキャン 不満11'].map((t) => `<div style="display:flex; align-items:center; gap:10px;"><span style="width:10px; height:10px; transform:rotate(45deg); background:${C.neg};"></span><span style="font-size:15px; font-weight:700;">${t}</span></div>`).join('')}</div>`,
      ['「不満が先に分かる」（Q09）が一目で', '買う直前の不安に直接効く'], ['否定だけが目立ち、眺める楽しさが弱い', '良い面との対称（原則3）が崩れやすい'], 'リングの並び順・商品ページの並び順として A の中に'],
  ];
  let b = '';
  units.forEach(([k, t, tagT, line, vis, good, bad, where], i) => {
    const x = 72 + i * 492;
    b += at(x, 112, card(`<div style="display:flex; justify-content:space-between; align-items:center;"><div style="display:flex; align-items:baseline; gap:10px;">${num(k, { size: 18, color: C.muted })}<span style="font-family:${F.disp}; font-weight:900; font-size:23px;">${t}</span></div>${verdict(tagT, i === 0)}</div><div style="font-size:14px; font-weight:700;">「${line}」</div>${vis}${bl(good, { color: C.sat })}${bl(bad, { color: C.negText, ic: 'close' })}<div style="margin-top:auto; padding:10px 12px; border-radius:12px; background:${C.bg2}; font-size:12.5px; font-weight:700;">${where}</div>`, 'width:444px; height:740px;'));
  });
  b += at(72, 876, `<div style="width:1456px; font-size:13px; color:${C.ink2};">A を主にし、B と C は A の中の機能にする。ほかのボードはこの組み合わせで描いている。A 以外を主にしたい場合は、この板にコメントしてください</div>`);
  return frame('比較', 'コンセプトの3案', b, { sub: '回答の「見て分かる」「似ている・違う」「不満が先」を、どれを主にするか' });
}

// ====================================================================
// X2 地図の5案（何で位置を決めるか）
// ====================================================================
export function x2() {
  const a = axesView({ w: 262, h: 200, x: 'fit', y: 'anc', min: 12, max: 24, labels: false });
  const WFC = byShort['821de2ea'];
  const nb = neighbors(WFC, 5);
  const ego = `<div style="position:relative; height:200px; border-radius:12px; background:${C.map}; overflow:hidden;">${nb.map((n, i) => { const ang = -Math.PI / 2 + i * 1.25; const r = 50 + n.dist * 90; return `<div style="position:absolute; left:${Math.round(131 + Math.cos(ang) * r - 12)}px; top:${Math.round(100 + Math.sin(ang) * r * 0.8 - 12)}px;">${productDot({ size: 24, pos: KEYS.reduce((q, k) => q + n.p.pos[k], 0), neg: KEYS.reduce((q, k) => q + n.p.neg[k], 0), thick: n.p.thick })}</div>`; }).join('')}<div style="position:absolute; left:112px; top:81px;">${productDot({ size: 38, pos: 21, neg: 14, sel: true })}</div></div>`;
  const schematic = (labels) => `<div style="position:relative; height:200px; border-radius:12px; background:${C.map}; overflow:hidden;">${labels.map(([t, x, y, s]) => `<div style="position:absolute; left:${x}px; top:${y}px; width:${s}px; height:${s}px; border-radius:50%; background:rgba(18,20,23,.07); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:${C.ink2}; text-align:center; line-height:1.3;">${t}</div>`).join('')}<div style="position:absolute; right:8px; bottom:6px; font-size:11px; color:${C.muted};">模式図</div></div>`;
  const units = [
    ['①', '2つの観点で並べる', '今の四象限', `<div style="position:relative; height:200px; border-radius:12px; overflow:hidden; border:1px solid ${C.line};">${a.html}</div>`, ['軸の意味がはっきり。いちばん説明しやすい', '「気にする2点」で決める人に効く'], ['一度に2観点。置ける商品が少ない（いま11）'], '残す：「並べる」', true],
    ['②', '声の似かたの地図', '推す', `<div style="position:relative; height:200px; border-radius:12px; overflow:hidden;">${mapView({ w: 262, h: 200, labels: 'none', min: 12, max: 26 })}</div>`, ['満足・不満の出方が似ている商品が近い', 'ブランドで固まらない（測定 3%／偶然 3%）', '全体を1枚で眺められる'], ['軸に名前が無い → 方位で補う', '声が少ないと位置が揺れる'], '主役：ジャンルの地図', true],
    ['③', '話題の地図', '採らない', schematic([['ノイキャンの話', 20, 30, 92], ['着け心地の話', 150, 20, 86], ['値段と音の話', 90, 108, 88]]), ['何が語られる商品かが分かる'], ['褒め言葉と不満が同じ場所に来る', '「良いか」が読めない'], '②の方位に吸収', false],
    ['④', '起点の地図', '推す', ego, ['好きな商品から似た物・別の物へ（Q07）', '方角＝勝っている観点で「ここが違う」'], ['起点が要る'], '「似ているもの」', true],
    ['⑤', '言葉の埋め込み', '裏で使う', schematic([['通勤', 30, 40, 70], ['ジム', 150, 30, 64], ['寝ながら', 88, 112, 76]]), ['観点に無い違い（場面など）を拾える', '差別化になる'], ['位置の理由を件数で説明できない', 'ブランド名が混ざる恐れ（未測定）'], '探す・似ている・観点づくりの裏側（08）', false],
  ];
  let b = '';
  units.forEach(([k, t, tg, vis, good, bad, where, on], i) => {
    const x = 72 + i * 296;
    b += at(x, 112, card(`<div style="display:flex; justify-content:space-between; align-items:center;">${num(k, { size: 18, color: C.muted })}${verdict(tg, on)}</div><div style="font-family:${F.disp}; font-weight:900; font-size:19px;">${t}</div>${vis}${bl(good, { color: C.sat, fs: 12.5 })}${bl(bad, { color: C.negText, ic: 'close', fs: 12.5 })}<div style="margin-top:auto; padding:9px 11px; border-radius:12px; background:${C.bg2}; font-size:12.5px; font-weight:700;">${where}</div>`, 'width:280px; height:740px;'));
  });
  b += at(72, 876, `<div style="width:1456px; font-size:13px; color:${C.ink2};">位置は件数から作り（②④①）、埋め込み（⑤）は「理由を件数で言える場面」にだけ使う。回答の「分かりやすく納得感ある仕組み」を優先した</div>`);
  return frame('比較', '地図の5案', b, { sub: '何で位置を決めるか。①②④は実データで描いた' });
}

// ====================================================================
// X3 見た目の3案（仮：参考画像を見てから作り直す）
// ====================================================================
const LOOKS = {
  A: { name: '地図アプリ', note: '今の仮。白地・黒・青とオレンジ', map: {} },
  B: { name: '夜の地図', note: '暗い地に、声が光る。眺めて楽しい', map: {
    '#FFFFFF': '#0F1319', '#F2F4F5': '#1B212A', '#EAEEF0': '#131922', '#DFE5E8': '#1E2632', '#121417': '#EEF1F4', '#3E444C': '#C3CAD3', '#5A616A': '#9AA4AF', '#9AA1A9': '#6B7580', '#DDE1E5': '#2A323D', '#C9CFD5': '#3A4350', '#1D5FD1': '#5C9DFF', '#EF7A2B': '#FF9C52', '#C4CAD0': '#46505C', '#1A55BD': '#8CB8FF', '#A4460A': '#FFB783', '#DCE7FA': '#1B2B45', '#FDE6D5': '#3A2616', 'rgba(255,255,255,': 'rgba(15,19,25,',
  } },
  C: { name: '紙の地図帳', note: '白い紙に細い線。見出しは明朝', map: {
    '#EAEEF0': '#FFFFFF', '#DFE5E8': '#E6E4DC', '#121417': '#1C1B18', '#1D5FD1': '#2D57A0', '#EF7A2B': '#D46A26', '#F2F4F5': '#F3F2EE',
  }, disp: "'Shippori Mincho B1',serif" },
};
function themed(html, L) {
  let s = html;
  for (const [a, b] of Object.entries(L.map)) s = s.split(a).join(b);
  if (L.disp) s = s.split(F.disp).join(L.disp);
  return s;
}
export function x3() {
  let b = '';
  ['A', 'B', 'C'].forEach((k, i) => {
    const L = LOOKS[k];
    const x = 72 + i * 492;
    b += at(x, 112, `<div style="display:flex; align-items:baseline; gap:10px; margin-bottom:12px;">${num(k, { size: 18, color: C.muted })}<span style="font-family:${F.disp}; font-weight:900; font-size:22px;">${L.name}</span><span style="font-size:13px; color:${C.ink2};">${L.note}</span></div>`);
    b += ph(themed(S.pHome(), L), x, 160, 0.52, { z: 3 });
    b += ph(themed(S.pLens(), L), x + 226, 160, 0.52, { z: 3 });
  });
  b += at(72, 640, `<div style="width:1456px; box-sizing:border-box; padding:16px 20px; border-radius:16px; background:${C.negSoft}; display:flex; gap:14px; align-items:center;">${icon('info', { size: 22, color: C.negText })}<span style="font-size:13.5px; line-height:1.6;">この3案は、参考画像（好き11・嫌い9）を<b>見る前</b>の仮です。画像を見られるようになったら、読み取ったことから3案を作り直します。役割（不満・満足・言及なし・声が少ない）と明るさの差は、どの案でも同じにします</span></div>`);
  b += at(72, 720, `<div style="width:1456px; display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:18px;">${[
    ['A 地図アプリ', ['地図が主役の道具。迷わない', '白地で、商品画像が映える'], ['おとなしく、面白さが弱いかもしれない']],
    ['B 夜の地図', ['眺めて楽しい。共有の画像で目を引く', '青とオレンジの光が見分けやすい'], ['商品画像（白背景が多い）が浮く', '昼の屋外で読みにくい']],
    ['C 紙の地図帳', ['落ち着き。数字の信用と合う', '地図らしさが強い'], ['「お堅い」に寄りやすい（Q11 で避けたい）']],
  ].map(([t, g, bd]) => box(`<div style="font-size:15px; font-weight:700;">${t}</div>${bl(g, { color: C.sat, fs: 12.5 })}${bl(bd, { color: C.negText, ic: 'close', fs: 12.5 })}`, { pad: 16, gap: 6 })).join('')}</div>`);
  return frame('比較', '見た目の3案（仮）', b, { sub: '同じホームとレンズの画面を、3つの見た目で' });
}

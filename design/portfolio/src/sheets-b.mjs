// ポートフォリオのボード 11〜21
import { C, F, SH, icon, num, tag, aiMark, btn, chip, productDot, voiceBar, quotePair, wordmark, esc } from './lib.mjs';
import { mapView, axesView, legend, compassRose } from './map.mjs';
import * as S from './screens.mjs';
import { frame, at, ph, pc, h, p, kick, dot, box, note, refs, bl, callouts, arrow } from './board.mjs';
import { STATS, AXES, MAPPED, SHORT, LABEL, byShort, SAME, KEYS, Q, maxCount } from './data.mjs';

const WFC = byShort['821de2ea'];

// ====================================================================
// 11 デザイン言語（仮）
// ====================================================================
export function s11() {
  const sw = (name, hex, use, dark = false) => `<div style="display:flex; flex-direction:column; gap:6px;"><div style="height:72px; border-radius:14px; background:${hex}; border:1px solid ${C.line};"></div><div style="font-size:13px; font-weight:700;">${name}</div><div style="font-family:${F.num}; font-size:11.5px; color:${C.muted};">${hex}</div><div style="font-size:12px; color:${C.ink2}; line-height:1.5;">${use}</div></div>`;
  let b = at(72, 112, `<div style="width:900px; display:flex; flex-direction:column; gap:14px;">${kick('色（仮）— 役割は3つだけ。値段を色にしない（03 の決定21）')}<div style="display:grid; grid-template-columns:repeat(6, minmax(0, 1fr)); gap:14px;">${sw('文字・操作', C.ink, '主な操作と文字')}${sw('地図の地', C.map, '地図の背景。方眼は薄く')}${sw('不満', C.neg, 'リングの先頭・不満の件数')}${sw('不満の文字', C.negText, '白地で 4.5:1 以上')}${sw('満足', C.sat, 'リング・満足の件数')}${sw('言及なし', C.none, 'リングの残り・点線')}</div>
<div style="font-size:12.5px; color:${C.ink2}; line-height:1.65;">不満と満足は、色相（オレンジ／青）に加えて明るさを変え、形（◆／●）と位置（左／右）でも分ける。赤と緑は使わない</div></div>`);
  b += at(1030, 112, `<div style="width:498px; display:flex; flex-direction:column; gap:14px;">${kick('文字（仮）')}${box(`<div style="font-family:${F.disp}; font-weight:900; font-size:34px;">見出し 声の地図</div><div style="font-size:12px; color:${C.muted};">Zen Kaku Gothic New 900</div><div style="font-size:16px; line-height:1.7;">本文 買った人の声を、観点ごとに数えて並べます。</div><div style="font-size:12px; color:${C.muted};">BIZ UDPGothic（読みやすさを優先したUD書体）</div><div>${num('不満 14 ・ 満足 21 ・ 読んだ 129', { size: 18 })}</div><div style="font-size:12px; color:${C.muted};">DM Mono（数字の桁がそろう）</div>`, { pad: 18, gap: 6 })}</div>`);
  b += at(72, 470, `<div style="width:1456px; display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:18px;">
${box(`${kick('形')}<div style="display:flex; gap:14px; align-items:center;">${productDot({ size: 56, pos: 7, neg: 3 })}${productDot({ size: 56, pos: 7, neg: 3, thick: 'thin' })}${productDot({ size: 56, pos: 0, neg: 0, hollow: true })}</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.6;">丸＝商品（実装では商品画像）。リング＝声。点線＝声が少ない／言及なし</div>`, { pad: 18 })}
${box(`${kick('動き')}${bl(['地図 ⇄ 並べる：点が滑って移動（0.6秒）。どの点がどこへ行ったか追える', 'レンズの切り替え：リングだけが変わる。点は動かさない', '動きを減らす設定では、すべて即時に切り替え'], { color: C.ink, fs: 12.5 })}`, { pad: 18 })}
${box(`${kick('大きさの下限')}${bl(['文字は11px以上', '押せる所は44px以上（地図の点は小さくても、押せる範囲は44px）', '点の直径は24px以上。下回るなら点にまとめる'], { color: C.ink, fs: 12.5 })}`, { pad: 18 })}
${box(`${kick('避けること（回答 Q11）')}${bl(['表だらけ／1位の強調／王冠・メダル', 'ゲームのような演出・点数', 'グラデーションの背景・紫・クリーム地'], { color: C.negText, ic: 'close', fs: 12.5 })}`, { pad: 18 })}
</div>`);
  b += at(72, 760, `<div style="width:1456px; box-sizing:border-box; padding:16px 20px; border-radius:16px; background:${C.negSoft}; display:flex; gap:14px; align-items:center;">${icon('info', { size: 22, color: C.negText })}<span style="font-size:13.5px; line-height:1.6;">この色と文字は<b>仮</b>です。参考画像（03）を見てから、案の比較「見た目の3案」を作り直し、ここを決めます。役割（不満・満足・言及なし・声が少ない）は、見た目が変わっても残します</span></div>`);
  return frame('11', 'デザイン言語（仮）', b, { sub: '役割を先に決め、色と文字は参考画像のあとで' });
}

// ====================================================================
// 12 部品
// ====================================================================
export function s12() {
  const p = WFC;
  const cell = (t, inner, d) => box(`${kick(t)}<div style="min-height:96px; display:flex; align-items:center;">${inner}</div><div style="font-size:12px; color:${C.ink2}; line-height:1.55;">${d}</div>`, { pad: 16, gap: 8 });
  let b = at(72, 112, `<div style="width:1456px; display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:16px;">
${cell('声のリング', `<div style="display:flex; gap:12px; align-items:center;">${productDot({ size: 64, pos: 52, neg: 4 })}${productDot({ size: 64, pos: 21, neg: 14 })}${productDot({ size: 64, pos: 2, neg: 6 })}</div>`, '不満を12時から先に。満足と同じ太さ')}
${cell('根拠の厚さ', `<div style="display:flex; gap:14px; align-items:center;">${['thick', 'mid', 'thin'].map((t, i) => `<div style="display:flex; flex-direction:column; align-items:center; gap:6px;">${productDot({ size: 48, pos: 6, neg: 2, thick: t })}<span style="font-size:11px; color:${C.muted};">${['30件〜', '10〜29件', '〜9件'][i]}</span></div>`).join('')}</div>`, '読んだ数で3段。点線は位置が仮')}
${cell('声のバー', voiceBar({ label: '装着感', pos: 21, neg: 14, read: 129, w: 300 }), '不満は左、満足は右。分母は常に「読んだ数」')}
${cell('引用', quotePair(Q['821de2ea'].fit, { w: 300, fs: 12 }), '満足と不満を1件ずつ。出典へのリンク')}
${cell('レンズの帯', `<div style="display:flex; gap:6px; flex-wrap:wrap;">${chip('すべて')}${chip('装着感', { on: true })}${chip('ノイキャン')}</div>`, '軸に使える観点だけ。差がつかない観点は理由つきで横に')}
${cell('方位', compassRose({ size: 110 }), 'その向きほど、その観点の満足が多い')}
${cell('AI 分類の印', `<div style="display:flex; gap:10px; align-items:center;">${aiMark(12)}<span style="font-size:12px; color:${C.ink2};">押すと「数え方」へ</span></div>`, '数字の横に小さく。警告の枠にしない')}
${cell('まだ地図にない', `<button type="button" style="height:40px; padding:0 14px; border-radius:20px; border:none; background:${C.bg}; box-shadow:${SH.card}; font-family:${F.body}; font-size:13px; font-weight:700; color:${C.ink};">まだ地図にない ${num(73, { size: 13 })}</button>`, '読めていない商品。名前で探せる')}
${cell('購入', `<div style="display:flex; gap:8px;">${btn('楽天で見る', { h: 44, fs: 13 })}${btn('Amazonで見る', { kind: 'ghost', h: 44, fs: 13 })}</div>`, '価格は取得日つき。Amazon は資格情報が無い間は出さない')}
${cell('くらべるに入れる', `<div style="display:flex; gap:8px; align-items:center;">${btn('くらべる', { kind: 'ghost', ic: 'plus', h: 44, fs: 13 })}<span style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; background:${C.ink}; color:${C.white}; font-family:${F.num}; font-size:12px;">2</span></div>`, 'どの画面からでも。タブの数字で分かる')}
${cell('迷わなくていい', `<div style="font-size:12.5px; color:${C.ink2}; line-height:1.6; padding:10px 12px; border-radius:12px; background:${C.bg2};"><b>迷わなくていい：音質。</b>${SAME[0].products}商品がふれ、ほぼ全員が満足</div>`, '差がつかない観点を、役に立つ事実として')}
${cell('広告の枠', `<div style="width:300px; height:56px; border-radius:10px; border:1px dashed ${C.line2}; display:flex; align-items:center; justify-content:center; gap:6px; font-size:12px; color:${C.muted};">${tag('広告', { fs: 11, h: 20 })}区切りの位置だけ</div>`, '「広告」と必ず書く。地図・比較・購入の近くに置かない')}
</div>`);
  return frame('12', '部品', b, { sub: 'すべて実装で作る部品。見た目が変わっても役割は同じ' });
}

// ====================================================================
// 13 ホームと、言葉で探す
// ====================================================================
export function s13() {
  let b = ph(S.pHome(), 72, 112, 0.84) + ph(S.pSearch(), 470, 112, 0.84);
  b += pc(S.dHome(), 880, 112, 0.45);
  b += at(880, 560, `<div style="width:648px; display:flex; flex-direction:column; gap:14px;">
${note(1, '入口は「地図」と「悩み」', 'ホームは地図帳。ジャンルの地図が並び、見ているだけで面白い。悩みの言葉（耳が痛くならない 等）は観点の極から作る', { w: 648 })}
${note(2, '打った言葉を、数え方に変換して見せる', '「耳が痛い」は装着感の不満として数えている、と先に言う。埋め込みはここで使う（08）', { w: 648 })}
${note(3, '悩みから、そのまま答えへ', '「装着感の不満が少ない」順。ただし8件以上ふれた商品だけ（少ない件数で上に来ないように）', { w: 648 })}
${note(4, 'ほかの棚は「準備中」', 'ゲートを通ったジャンルから公開。足りないものも書く', { w: 648 })}
</div>`);
  return frame('13', 'ホームと、言葉で探す', b, { sub: '入口：ホームへ直接／観点の言葉で検索（回答 Q08）' });
}

// ====================================================================
// 14 ジャンルの地図・レンズ・並べる
// ====================================================================
export function s14() {
  let b = ph(S.pMap(), 72, 112, 0.84) + ph(S.pLens(), 450, 112, 0.84) + ph(S.pAxes(), 828, 112, 0.84);
  b += at(1224, 112, `<div style="width:304px; display:flex; flex-direction:column; gap:16px;">
${note(1, '地図は全面に', 'スマホでも図を最初に大きく（回答 Q16）。操作は下にまとめる', { w: 304 })}
${note(2, 'レンズ', '気になる観点を1つ選ぶと、リングがその観点だけに。ふれていない商品は点線（言及なし）', { w: 304 })}
${note(3, '並べる', '2つ選ぶと「問い」のカード（着け心地×静かさ 等）で、今の四象限へ。点が動いて変わる', { w: 304 })}
${note(4, '原点に置かない', `どちらかにふれていない商品は図に置かず、数を出す`, { w: 304 })}
${note(5, 'すべての点が押せる', '重なりをほどいてから描く。押せる範囲は44px', { w: 304 })}
${note(6, '差がつかない観点', `${SAME.map((a) => SHORT[a.key]).join('・')}はレンズに入れず、理由と一緒に横に`, { w: 304 })}
</div>`);
  b += at(72, 880, `<div style="width:1120px; font-size:12.5px; color:${C.ink2};">「一覧」は今の一覧（未読の商品も名前を出す）を引き継ぐ。絞り込みは減光で、消さない</div>`);
  return frame('14', 'ジャンルの地図・レンズ・並べる', b, { sub: '主役。見て楽しい、触ると分かる' });
}

// ====================================================================
// 15 商品：点を押す・商品ページ
// ====================================================================
export function s15() {
  let b = ph(S.pPeek(), 72, 112, 0.84) + ph(S.pProduct(), 450, 112, 0.84) + ph(S.pProduct2(), 828, 112, 0.84);
  b += at(1224, 112, `<div style="width:304px; display:flex; flex-direction:column; gap:16px;">
${note(1, '点を押すと、下からシート', '地図を残したまま。行き先は「詳しく／似ている／くらべる」の3つ', { w: 304 })}
${note(2, '不満が先', '商品ページは不満の件数が多い観点から。バーは同じ商品の中で目盛りをそろえる', { w: 304 })}
${note(3, '引用は満足と不満を1件ずつ', '今のデータには区別が無い。抽出をやり直して付ける（この画面の引用は手で分けた見本）', { w: 304 })}
${note(4, '迷わなくていい', '差がつかない観点を、役に立つ事実として', { w: 304 })}
${note(5, '買うは、読んだ後に1か所', '楽天とAmazonを同じ扱いで。価格は取得日つき', { w: 304 })}
</div>`);
  return frame('15', '商品：点を押す・商品ページ', b, { sub: '評判が上、仕様が下（仕様は推定バッジつきで、このさらに下）' });
}

// ====================================================================
// 16 似ているもの・くらべる
// ====================================================================
export function s16() {
  let b = ph(S.pSimilar(), 72, 112, 0.84) + ph(S.pCompare(), 450, 112, 0.84);
  b += pc(S.dCompare(), 850, 112, 0.47);
  b += at(850, 580, `<div style="width:678px; display:flex; flex-direction:column; gap:14px;">
${note(1, '好きな商品を真ん中に', '近さ＝声の似かた。方角＝起点より満足が多い観点。「似ているけど、ここが違う」が見える（回答 Q07・Q09）', { w: 678 })}
${note(2, '比べられるのは、両方がふれている観点だけ', '片方だけの観点は「言及なし」と書く。空欄にしない（空欄側が劣って見えるため）', { w: 678 })}
${note(3, '違いがはっきりした順', '違いの大きさ × 根拠の厚さで並べる。件数が少ない差を上に出さない', { w: 678 })}
${note(4, '2つが基本、PC は3つまで', 'URL で送れる。共有用の画像も作る（19）', { w: 678 })}
</div>`);
  return frame('16', '似ているもの・くらべる', b, { sub: '好きな物から、似た物・別の物へ' });
}

// ====================================================================
// 17 信頼：数え方
// ====================================================================
export function s17() {
  let b = ph(S.pHow(), 72, 112, 0.84);
  const rules = [
    ['分母はいつも「読んだレビューの数」', '「件中」を言及数に使わない。未読は「まだ読めていない」と書き、平均0.0を出さない'],
    ['AI が分けたことを、数字の横で', '警告の枠にしない。押すと数え方へ'],
    ['本文は載せない', '短い引用と、出典のレビューへのリンクだけ（著作権法 30条の4・32条）'],
    ['照合を通らない引用は捨てる', '別々のレビューをつないだ文が混ざる（初回138件中17件）'],
    ['差が出ない観点は並べない', '音質の順位は作らない。「迷わなくていい」として事実だけを書く'],
    ['読めていない商品も名前を出す', `${STATS.total}商品のうち${STATS.analysed}商品。残りは「まだ地図にない」に`],
    ['相手のアクセス制御は回避しない', 'Amazon のレビュー本文は取らない（★と件数のみ）。403 で止める'],
  ];
  b += at(470, 112, `<div style="width:1058px; display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:14px;">${rules.map(([t, d], i) => box(`<div style="display:flex; gap:8px; align-items:center;">${dot(i + 1, { size: 22 })}<span style="font-size:15px; font-weight:700;">${t}</span></div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.65;">${d}</div>`, { pad: 16, gap: 6 })).join('')}
${box(`${kick('数え方ページに載せる実数')}<div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:8px 14px; font-size:13px;"><span>重複を除く前</span>${num(STATS.beforeDedup.toLocaleString(), { size: 14 })}<span>重複</span>${num(STATS.dupRemoved, { size: 14 })}<span>読んだレビュー</span>${num(STATS.read, { size: 14 })}<span>引用</span>${num(STATS.quotes, { size: 14 })}</div>`, { pad: 16, gap: 8 })}
</div>`);
  return frame('17', '信頼：数え方', b, { sub: '「数字がごまかしていない」と言われるために' });
}

// ====================================================================
// 18 お金
// ====================================================================
export function s18() {
  const touch = [
    ['商品のシート・商品ページ', '読んだ後に1か所。楽天とAmazonを同じ形で'],
    ['くらべる', '左右に同じボタン。片方だけに置かない'],
    ['似ているもの', '一覧の各商品から商品ページへ（直接の購入ボタンは置かない）'],
    ['保存（アプリ）', '値下がりの通知 → 商品ページ'],
  ];
  const ads = [['置く', ['記事の区切り（商品ページの下、観点のページの途中）', '一覧の区切り（20件ごと）', 'アプリは画面下の固定枠（地図の画面を除く）'], C.sat], ['置かない', ['地図の上・シートの中', 'くらべるの表の中', '購入ボタンの隣・引用の隣'], C.negText]];
  const seo = [
    ['観点のページ', 'ワイヤレスイヤホン 装着感／耳が痛くならない'],
    ['似ているもの', '〇〇 似ている／〇〇 代わり'],
    ['くらべる', 'A と B どっち'],
    ['商品', '〇〇 評判／〇〇 不満'],
  ];
  let b = at(72, 112, `<div style="width:700px; display:flex; flex-direction:column; gap:12px;">${kick('アフィリエイト：買う場所')}${touch.map(([t, d]) => box(`<div style="display:flex; gap:10px; align-items:baseline;">${icon('cart', { size: 18 })}<span style="font-size:14.5px; font-weight:700;">${t}</span></div><div style="font-size:12.5px; color:${C.ink2}; padding-left:28px;">${d}</div>`, { pad: 12, gap: 4 })).join('')}
${kick('広告のルール')}<div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:12px;">${ads.map(([t, list, col]) => box(`<div style="font-size:14px; font-weight:700; color:${col};">${t}</div>${bl(list, { color: col, ic: t === '置く' ? 'check' : 'close', fs: 12.5 })}`, { pad: 14, gap: 6 })).join('')}</div></div>`);
  b += at(840, 112, `<div style="width:688px; display:flex; flex-direction:column; gap:12px;">${kick('検索の入口（ページの型 × ジャンル数だけ増える）')}${box(`<div style="display:grid; grid-template-columns:150px minmax(0,1fr);">${seo.map(([t, q]) => `<div style="padding:10px 0; border-bottom:1px solid ${C.line}; font-size:14px; font-weight:700;">${t}</div><div style="padding:10px 0; border-bottom:1px solid ${C.line}; font-size:13px; color:${C.ink2};">「${q}」</div>`).join('')}</div>`, { pad: 16 })}
${box(`${kick('逆算（01_仕様.md の数字）')}<div style="font-size:13.5px; line-height:1.8;">イヤホン ${num('¥8,000', { size: 13 })} × 料率 ${num('3%', { size: 13 })} ＝ 1件 ${num('240円', { size: 13 })}<br>月10万円なら 約 ${num('420件', { size: 13 })} の購入 → 約 ${num('20万', { size: 13 })} セッション</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.6;">単価の高いジャンル（09）を早めに。広告は訪問数に比例するので、観点・似ている・くらべるのページを、ジャンルの数だけ増やす</div>`, { pad: 16 })}
${box(`${kick('まず測る数（回答 Q06：定着と流入が先）')}${bl(['戻ってきた人の割合（7日以内）', '地図で点を押した・レンズを使った割合', '保存した数、くらべた数', '検索からの流入（ページの型ごと）、購入リンクの押された数'], { color: C.ink, fs: 12.5 })}`, { pad: 16 })}
</div>`);
  return frame('18', 'お金', b, { sub: 'アフィリエイト＋広告。信用を削らない置き方で、入口を増やす' });
}

// ====================================================================
// 19 アプリ・戻ってくる理由・共有
// ====================================================================
export function s19() {
  let b = ph(S.pSaved(), 72, 112, 0.84) + ph(S.pScan(), 450, 112, 0.84);
  // 共有の画像（OG 1200×630 を縮小）
  const og = `<div style="position:relative; width:1200px; height:630px; background:${C.bg}; font-family:${F.body}; overflow:hidden;"><div style="position:absolute; left:0; top:0; width:760px; height:630px;">${mapView({ w: 760, h: 630, lens: 'fit', labels: 'thick', min: 24, max: 58 })}</div><div style="position:absolute; left:800px; top:60px; width:360px; display:flex; flex-direction:column; gap:18px;">${wordmark(26)}<div style="font-family:${F.disp}; font-weight:900; font-size:44px; line-height:1.3;">イヤホンの<br>装着感の地図</div><div style="font-size:20px; line-height:1.6; color:${C.ink2};">オレンジ＝合わない人がいる<br>青＝つけ心地が良い</div><div style="font-size:18px; color:${C.muted};">読んだレビュー のべ${STATS.read}件</div></div></div>`;
  b += at(850, 112, `<div style="display:flex; flex-direction:column; gap:10px;">${kick('共有の画像（検索・SNS に出る 1200×630）')}<div style="width:678px; height:356px; overflow:hidden; border-radius:14px; box-shadow:${SH.card};"><div style="transform:scale(.565); transform-origin:0 0;">${og}</div></div></div>`);
  b += at(850, 520, `<div style="width:678px; display:flex; flex-direction:column; gap:12px;">
${note(1, 'アプリにする理由', '店頭で箱のバーコード（JAN）を読むと、その商品の「不満が先」が開く。保存した商品の変化を通知できる', { w: 678 })}
${note(2, '戻ってくる理由', '保存（端末の中・登録なし）＋週ごとの更新（今週増えた不満・値下がり）。週次の数字は更新が始まってから入る', { w: 678 })}
${note(3, '共有されるもの', 'レンズつきの地図／好きな商品を真ん中にした地図／くらべるカード。選んだ状態は URL に残す', { w: 678 })}
${note(4, 'Web とアプリは同じ画面', '違いはバーコード・通知・画面下の広告枠だけ', { w: 678 })}
</div>`);
  return frame('19', 'アプリ・戻ってくる理由・共有', b, { sub: 'アプリは早い段階で（回答 Q04）。定着の仕掛け（Q06）' });
}

// ====================================================================
// 20 画面一覧と遷移
// ====================================================================
export function s20() {
  const nodes = [
    ['ホーム（地図帳）', 90, 180], ['言葉で探す', 90, 420], ['観点のページ', 90, 640],
    ['ジャンルの地図', 470, 300], ['レンズ', 470, 520], ['並べる（2観点）', 470, 700],
    ['点のシート', 850, 300], ['商品ページ', 850, 520], ['数え方', 850, 740],
    ['似ているもの', 1230, 220], ['くらべる', 1230, 440], ['保存', 1230, 620], ['楽天・Amazon', 1230, 800],
  ];
  const pos = Object.fromEntries(nodes.map(([t, x, y]) => [t, [x, y]]));
  const edges = [
    ['ホーム（地図帳）', 'ジャンルの地図'], ['ホーム（地図帳）', '言葉で探す'], ['言葉で探す', '観点のページ'], ['言葉で探す', 'レンズ'], ['観点のページ', 'レンズ'],
    ['ジャンルの地図', 'レンズ'], ['レンズ', '並べる（2観点）'], ['ジャンルの地図', '点のシート'], ['レンズ', '点のシート'],
    ['点のシート', '商品ページ'], ['点のシート', '似ているもの'], ['点のシート', 'くらべる'], ['商品ページ', '似ているもの'], ['商品ページ', 'くらべる'], ['商品ページ', '保存'], ['商品ページ', '楽天・Amazon'], ['商品ページ', '数え方'], ['くらべる', '楽天・Amazon'],
  ];
  const NW = 240, NH = 64;
  let svg = `<svg width="1600" height="1000" aria-hidden="true" style="position:absolute; left:0; top:0;"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.muted}"></path></marker></defs>`;
  for (const [a, z] of edges) {
    const [x1, y1] = pos[a], [x2, y2] = pos[z];
    const sx = x1 + NW, sy = y1 + NH / 2, ex = x2, ey = y2 + NH / 2;
    const d = x2 > x1 ? `M${sx} ${sy} C${sx + 70} ${sy}, ${ex - 70} ${ey}, ${ex - 4} ${ey}` : `M${x1 + NW / 2} ${y1 + NH} L${x2 + NW / 2} ${y2 - 4}`;
    svg += `<path d="${d}" fill="none" stroke="${C.muted}" stroke-width="1.6" marker-end="url(#ah)"></path>`;
  }
  svg += '</svg>';
  let b = svg + nodes.map(([t, x, y]) => at(x, y, `<div style="width:${NW}px; height:${NH}px; box-sizing:border-box; border-radius:16px; background:${['ジャンルの地図', 'レンズ', '点のシート'].includes(t) ? C.ink : C.surf}; color:${['ジャンルの地図', 'レンズ', '点のシート'].includes(t) ? C.white : C.ink}; box-shadow:${SH.card}; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700;">${t}</div>`)).join('');
  b += at(72, 112, `<div style="font-size:13px; color:${C.ink2};">黒い箱＝主役の流れ。どの画面からも「くらべる」「保存」に入れる（タブ）</div>`);
  return frame('20', '画面一覧と遷移', b, { sub: `スマホ14・PC 4 を「画面（実寸）」に` });
}

// ====================================================================
// 21 要件の対応表
// ====================================================================
export function s21() {
  const rows = [
    ['見て分かることを売りに（Q01）', '地図・リング・方位・レンズ', '04・06・14'],
    ['収益の最大化（Q01）', '買う場所4つ、広告のルール、検索の入口4型', '18'],
    ['定着と流入（Q06）', '保存・週ごとの変化・通知・共有の画像', '19'],
    ['アプリを早く（Q04）', 'バーコード・通知。画面は Web と共通', '19'],
    ['網羅的なジャンル（Q05）', '棚 → 比べる単位 → 悩み。ゲートを通った単位から', '09'],
    ['決めきれない人／似た物を探す人（Q07）', '2つの体験の流れ。似ているもの（起点の地図）', '05・16'],
    ['観点の言葉・ホーム直接（Q08）', '言葉で探す・観点のページ・地図帳', '13'],
    ['似ている・違うが見える（Q09）', '近さ＝声の似かた、方角＝勝っている観点', '06・16'],
    ['外れを避ける／知らない商品に出会う（Q10）', '不満が先・レンズ／地図で出会う', '05・14'],
    ['避けるもの（Q11）', '順位を強調しない。ゲームの演出なし', '11'],
    ['眺めて楽しい（Q12）', '地図帳・地図 ⇄ 並べるの動き', '13・14・試作'],
    ['マップ・埋め込み・納得感（Q13）', '位置は件数から、埋め込みは探す・似ている・観点づくりに', '07・08'],
    ['診断を作らない（Q14）', '観点で並べ替えるだけ', '14'],
    ['楽天＋Amazon（Q29）', '同じ形のボタン。Amazon は★と件数、資格情報が無い間は出さない', '15・18'],
    ['分母・散らばり・本文・アクセス制御（CLAUDE.md）', '読んだ数と一緒に／ゲート／引用だけ／回避しない', '17'],
  ];
  let b = at(72, 112, box(`<div style="display:grid; grid-template-columns:420px minmax(0,1fr) 150px;">${['要件', 'この案での扱い', 'ボード'].map((t) => `<div style="font-size:12px; font-weight:700; color:${C.muted}; padding:0 10px 8px;">${t}</div>`).join('')}${rows.map(([a, b2, c]) => [`<span style="font-size:13px; font-weight:700;">${a}</span>`, `<span style="font-size:13px; color:${C.ink2};">${b2}</span>`, refs(c.split('・'))].map((x) => `<div style="padding:9px 10px; border-top:1px solid ${C.line};">${x}</div>`).join('')).join('')}</div>`, { pad: 18, gap: 0, extra: 'width:1456px;' }));
  return frame('21', '要件の対応表', b, { sub: '回答と原則が、どこに入ったか' });
}

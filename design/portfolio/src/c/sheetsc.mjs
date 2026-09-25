// 別案C のボード（C00〜C16）
import { C, F, SH, icon, obj, tile, earArt, shoeArt, bottleArt, bagArt, num, label, pill, cond, aiNote, sampleNote, tierMark, TIERS, voiceStrip, justStrip, repeatLine, voiceTag, mark, OBJ_COL } from './libc.mjs';
import { frame, at, ph, pc, h, p, kick, dot, box, note, bl, arrow, bigNum, BW, BH } from './boardc.mjs';
import { MAPPED, STATS, AXES, SHORT, LABEL, byShort, FAMILIES, famCount, MYBEST_GOODS, MYBEST_OUT, KAKAKU_GOODS, COUNTS, PLACES, MEASURE, pct, SHOES, SKIN, COFFEE, ALL_DIR, WIDE_DIR, WIDE_TOTAL, LIGHT, CUSH, SHOE_REP, SHOE_SHIP } from './datac.mjs';
import { sHome, sPlace, sConditions, sSearch, sTier0, sTier1Shoes, sTier2Ear, sTier3Map, sProductEar, sProductSkin, sJust, sCompare, sCoffee } from './screensc.mjs';
import { pcAdmin } from './pcc.mjs';

const thick = MAPPED.filter((p) => p.read >= 30).length;
const famName = (k) => (k === 'kids' ? '子どもとペット' : FAMILIES.find((f) => f.key === k).name);
const famTone = { power: '#1C1B19', play: '#47453F', tool: '#6C6860', skin: '#8C877D', eat: '#A39E94', wear: '#BDB6A8', kids: '#D8D3C9' };
const pctBar = (v, w = 120, col = C.ink) => `<span style="display:inline-block; width:${w}px; height:8px; border-radius:4px; background:${C.rest}; vertical-align:middle;"><span style="display:block; width:${Math.min(100, v)}%; height:8px; border-radius:4px; background:${col};"></span></span>`;

// ---------- C00 前提が変わった ----------
function c00() {
  const change = [
    ['比べる対象', '1ジャンル・97商品', `物販 ${COUNTS.mbGoodsMid} カテゴリ（マイベストの中カテゴリ）。比べる単位はさらに細かい`],
    ['観点', 'イヤホン用の10個を手で', '500以上ぶん。手だけでは作れない → 辞書＋人の承認'],
    ['声の種類', '満足・不満の2つ', '「小さめ／大きめ」の向き、「また買った」の行動が出る（C02）'],
    ['地図', '1枚', '描けるほど読めるカテゴリは一部 → 読めた深さで見せ方を変える'],
    ['ホーム', 'ジャンル一覧', '500以上は並べられない → 入口の設計（場所・条件・困りごと）'],
    ['取得', '426リクエスト・114回', '数十万ページ（推定）→ 読む順番そのものが設計'],
  ].map(([k, a, b]) => `<div style="display:grid; grid-template-columns:110px 190px 1fr; gap:14px; padding:12px 0; border-bottom:1px solid ${C.hair}; font-size:13.5px; line-height:1.55;"><b>${k}</b><span style="color:${C.muted};">${a}</span><span>${b}</span></div>`).join('');
  const keep = ['分母を常に出す（N件中M件）', '軸は散らばりで選ぶ（言及の多さではない）', 'レビュー本文は出さない（照合した短い引用だけ）', '相手のアクセス制御は回避しない（403で止める）'];
  const ans = [['layers', '区分は3層', '比べる単位・系統・入口'], ['tag', '声は3つの型', '良し悪し・ちょうどよさ・また買った'], ['person', '似た人の声', 'レビューの本人が書いた条件で数えなおす'], ['shelf', '読めた深さの4段', '名前だけ → 声札 → 棚 → 地図']];
  return frame('00', '前提が変わった', `
${at(72, 136, `<div style="display:flex; align-items:flex-end; gap:26px;">${bigNum('97', '商品（今のイヤホン）', { size: 58 })}${icon('arrow', { size: 30, color: C.faint })}${bigNum(COUNTS.mbGoodsMid, 'カテゴリ（物販・リンクを貼れる範囲）', { size: 58 })}${icon('arrow', { size: 30, color: C.faint })}${bigNum('12.6万', 'ページを読む見込み（推定）', { size: 58 })}</div>`)}
${at(72, 270, `<div style="width:800px;">${kick('規模が変わると、変わること')}<div style="margin-top:6px;">${change}</div></div>`)}
${at(72, 612, `<div style="width:800px;">${box(`${kick('変えないこと（CLAUDE.md の4点）')}<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px 20px;">${bl(keep)}</div><div style="font-size:12.5px; color:${C.ink2};">収縮・ゲート・引用の照合・評判が先で仕様が後、も変えない</div>`, { pad: 22 })}</div>`)}
${at(930, 136, `<div style="width:340px;">${kick('別案C の答え')}<div style="display:flex; flex-direction:column; gap:14px; margin-top:12px;">${ans.map(([ic, t, s], i) => `<div style="display:flex; gap:12px; align-items:flex-start;">${tile(icon(ic, { size: 22 }), { w: 46, r: 14, bg: C.card })}<div><div style="font-size:17px; font-weight:700;">${t}</div><div style="font-size:13px; color:${C.ink2}; margin-top:2px;">${s}</div></div></div>`).join('')}</div><div style="margin-top:26px; font-size:30px; font-weight:700; line-height:1.35;">似た人の、<br>買ったあと。</div><div style="font-size:13px; color:${C.ink2}; margin-top:8px; line-height:1.7;">案A・案B は残し、どちらにもとらわれずに組み直した。C16 で選べる</div></div>`)}
${ph(sHome(), 1290, 136, 0.56)}
`, { src: 'cat' });
}

// ---------- C01 カテゴリを読む ----------
function c01() {
  const max = 91;
  const rows = MYBEST_GOODS.map(([n, c, f]) => `<div style="display:grid; grid-template-columns:168px 1fr 34px; align-items:center; gap:10px; height:21px; font-size:12px;"><span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${n}</span><span style="display:block; height:12px; width:${(c / max) * 100}%; border-radius:3px; background:${famTone[f]};"></span>${num(c, { size: 12 })}</div>`).join('');
  const out = MYBEST_OUT.map(([n, c]) => `<div style="display:flex; justify-content:space-between; font-size:12px; color:${C.muted}; height:21px; align-items:center;"><span>${n}</span>${num(c, { size: 12, color: C.muted })}</div>`).join('');
  const legend = Object.keys(famTone).map((k) => `<span style="display:inline-flex; align-items:center; gap:5px; font-size:11.5px; color:${C.ink2}; white-space:nowrap;"><span style="width:12px; height:12px; border-radius:3px; background:${famTone[k]};"></span>${famName(k)}</span>`).join('');
  const cmp = [['全体', `${COUNTS.mbRoots}ルート・${COUNTS.mbMid}中カテゴリ`, `${COUNTS.kkRoots}大カテゴリ・${COUNTS.kkSections}セクション`], ['物販（リンクを貼れる）', `<b>${COUNTS.mbGoodsRoots}ルート・${COUNTS.mbGoodsMid}中カテゴリ</b>（${pct(COUNTS.mbGoodsMid, COUNTS.mbMid)}%）`, `${COUNTS.kkGoodsRoots}大カテゴリ（アイテム ${COUNTS.kkGoodsItems.toLocaleString('ja-JP')}。商品名を含むので数ではない）`], ['性格', '悩みと属性の切り口（プチプラ・敏感肌）', '仕様と型番のカタログ＋絞り込み']].map(([k, a, b]) => `<div style="display:grid; grid-template-columns:118px 1fr 1fr; gap:12px; padding:10px 0; border-bottom:1px solid ${C.hair}; font-size:12.5px; line-height:1.55;"><b>${k}</b><span>${a}</span><span>${b}</span></div>`).join('');
  const tree = (root, mid, leaves) => `<div style="display:flex; align-items:center; gap:8px; font-size:12.5px;"><span style="color:${C.muted};">${root}</span>${icon('arrow', { size: 14, color: C.faint })}<b>${mid}</b>${icon('arrow', { size: 14, color: C.faint })}<span style="display:flex; gap:5px;">${leaves.map((l, i) => `<span style="display:inline-flex; height:26px; align-items:center; padding:0 9px; border-radius:13px; background:${i === 0 ? C.ink : C.card}; color:${i === 0 ? '#fff' : C.ink}; box-shadow:${i ? SH.card : 'none'}; font-size:12px; white-space:nowrap;">${l}</span>`).join('')}</span></div>`;
  return frame('01', 'カテゴリを読む', `
${at(72, 128, `<div style="width:560px;">${kick(`マイベスト：物販 ${COUNTS.mbGoodsRoots}ルート・${COUNTS.mbGoodsMid}中カテゴリ（系統で色分け）`)}<div style="display:flex; flex-wrap:wrap; gap:6px 12px; margin:10px 0 12px;">${legend}</div><div style="display:flex; flex-direction:column; gap:1px;">${rows}</div></div>`)}
${at(676, 128, `<div style="width:200px;">${kick(`外したもの ${COUNTS.mbOutMid}`)}<div style="font-size:11.5px; color:${C.muted}; margin:8px 0 10px; line-height:1.5;">サービス・金融・通信など、商品リンクを貼れないもの</div><div style="display:flex; flex-direction:column; gap:1px;">${out}</div><div style="font-size:11.5px; color:${C.ink2}; margin-top:10px; line-height:1.5;">ギフト（18）は外したうえで、<b>「贈る」という入口</b>にする</div></div>`)}
${at(930, 128, `<div style="width:598px;">${kick('マイベストと価格.com')}<div style="margin-top:6px;">${cmp}</div></div>`)}
${at(930, 340, `<div style="width:598px;">${box(`${kick('読み取ったこと')}<div style="font-size:18px; font-weight:700;">比べられる単位は3段目にある</div><div style="font-size:13px; color:${C.ink2}; line-height:1.7;">スティック掃除機とロボット掃除機は代わりにならない。見本の「コーヒー」にも豆・ドリップ・カプセルが混ざっていた。1つの単位の中だけで観点・ゲート・地図を持つ。マイベストの中カテゴリ ${COUNTS.mbGoodsMid} は下限で、単位はその1〜3倍ほどの見込み（未測定）</div><div style="display:flex; flex-direction:column; gap:10px; margin-top:6px;">${tree('家電', '掃除機', ['スティック', 'ロボット', 'キャニスター'])}${tree('家電', 'イヤホン', ['完全ワイヤレス', '有線', '骨伝導'])}${tree('ドリンク', 'コーヒー', ['豆', 'ドリップ', 'カプセル'])}${tree('スポーツ', 'ランニング', ['シューズ', 'ウェア', '時計'])}</div>`, { pad: 22, gap: 12 })}</div>`)}
${at(930, 690, `<div style="width:598px;">${box(`<div style="display:flex; gap:14px; align-items:flex-start;">${icon('info', { size: 20 })}<div style="font-size:13px; line-height:1.7; color:${C.ink2};">2つのサイトは<b style="color:${C.ink};">木（売り場の分け方）</b>が入口。このサイトは木を URL の住所として持つだけにして、入口は<b style="color:${C.ink};">場所・条件・困りごと・検索</b>にする（C04・C09）</div></div>`, { pad: 20 })}</div>`)}
`, { src: 'cat', sub: '受け取った資料から、物販だけを数えた' });
}

// ---------- C02 測ってみた ----------
function c02() {
  const cats = MEASURE.cats;
  const tri = (vals, suffix = '%') => `<div style="display:flex; flex-direction:column; gap:7px; margin-top:4px;">${cats.map((c, i) => `<div style="display:grid; grid-template-columns:112px 1fr 44px; align-items:center; gap:8px; font-size:12px;"><span>${c.name}</span>${pctBar(vals[i], 150)}<span style="font-family:${F.mono}; font-size:12px; text-align:right;">${vals[i]}${suffix}</span></div>`).join('')}</div>`;
  const I = MEASURE.irritation;
  const card = (n, title, big, body) => box(`<div style="display:flex; justify-content:space-between; align-items:baseline;">${kick(`発見 ${n}`)}</div><div style="font-size:16px; font-weight:700; line-height:1.4;">${title}</div>${big}<div style="font-size:12px; color:${C.ink2}; line-height:1.6;">${body}</div>`, { pad: 18, gap: 8, extra: 'height:250px;' });
  const cards = [
    card(1, '自分の条件を書く人は、1〜2割', tri(cats.map((c) => pct(c.cond, c.n))), '敏感肌・幅広・普段のサイズ・ブラック派など。年代や家族も1割前後。条件で数えなおすと分母は小さくなる'),
    card(2, 'シューズは、サイズの声が38%', `<div style="margin-top:6px;">${justStrip({ counts: ALL_DIR, w: 300, h: 10, name: 'サイズ感（240件中）', read: 0 })}</div>`, '良し悪しではなく「向き」。小さめも大きめも不満になりうるが、好みでもある'),
    card(3, 'また買った、は食べ物と肌で多い', tri(cats.map((c) => pct(c.rep, c.n))), 'リピ・〇回目・定期便。満足より強い行動の事実。使って減るモノだけの観点にする'),
    card(4, '商品の声ではないものが、最大25%', tri(cats.map((c) => pct(c.ship, c.n))), '配送・梱包・お店の対応。数えずに、数えなかった件数を出す'),
    card(5, '条件で絞ると、見え方が変わる', `<div style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">${voiceStrip({ pos: I.all.pos, neg: I.all.neg, read: I.all.n, w: 300, h: 8, name: '化粧水の刺激・全体', fs: 12 })}${voiceStrip({ pos: I.sensitive.pos, neg: I.sensitive.neg, read: I.sensitive.n, w: 300, h: 8, name: '敏感肌と書いた人', fs: 12 })}</div>`, `不満は ${I.all.neg}/${I.all.n}件（${pct(I.all.neg, I.all.n)}%）→ ${I.sensitive.neg}/${I.sensitive.n}件（${pct(I.sensitive.neg, I.sensitive.n)}%）。ただし14件は少ない`),
    card(6, '「全員が褒める」は、ここにもある', `<div style="display:flex; align-items:baseline; gap:14px; margin-top:4px;"><span style="font-family:${F.mono}; font-size:40px; color:${C.posText};">${LIGHT[0]}</span><span style="font-size:13px; color:${C.muted};">対</span><span style="font-family:${F.mono}; font-size:40px; color:${C.negText};">${LIGHT[1]}</span><span style="font-size:12px; color:${C.ink2};">シューズの「軽さ」<br>満足 対 不満</span></div>`, 'イヤホンの音質と同じ。言及は多いが差が出ないので、軸にしない。規則はジャンルを越えて効く'),
  ];
  const odd = [['store', 'コーヒーは上位8のうち5が同じお店'], ['bottle', '化粧水にお試しセットが混ざる'], ['pair', 'シューズは同じ型が2ページに分かれる'], ['list', '商品名は宣伝の言葉で長い']];
  const deep = cats.map((c) => `${c.name} ${c.deep[0]}/${c.deep[1]}`).join('・');
  return frame('02', '測ってみた', `
${at(72, 124, `<div style="display:flex; gap:10px; align-items:center; font-size:13px; color:${C.ink2};">${['楽天のカテゴリ一覧（3つ）', 'レビューの多い8商品', '各1ページ・30件', '単語の規則で数えた'].map((t, i) => `${i ? icon('arrow', { size: 14, color: C.faint }) : ''}<span style="display:inline-flex; height:30px; align-items:center; padding:0 12px; border-radius:15px; background:${C.card}; box-shadow:${SH.card};">${t}</span>`).join('')}<span style="margin-left:10px; font-family:${F.mono}; font-size:12px;">${MEASURE.reviews}件 ・ ${MEASURE.requests}リクエスト ・ ホストごとに3秒</span></div>`)}
${at(72, 176, `<div style="display:grid; grid-template-columns:repeat(3, 474px); gap:16px;">${cards.join('')}</div>`)}
${at(72, 712, `<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; width:1454px;">${box(`${kick('楽天の商品は、そのままでは比べる単位にならない')}${odd.map(([ic, t]) => `<div style="display:flex; gap:8px; align-items:center; font-size:12.5px;">${icon(ic === 'bottle' ? 'flask' : ic, { size: 15 })}${t}</div>`).join('')}`, { pad: 18, gap: 7 })}${box(`${kick('読める深さは100倍違う')}<div style="font-size:12.5px; line-height:1.65; color:${C.ink2};">上位8商品のレビュー件数の中央値：化粧水 約2,150・<b style="color:${C.ink};">シューズ 約107</b>・コーヒー 約5,990<br>30件以上ある商品：${deep}</div>`, { pad: 18, gap: 7 })}${box(`${kick('できなかったこと')}<div style="font-size:12.5px; line-height:1.65; color:${C.ink2};">ペットフード2つ・家電2つの一覧は <b style="color:${C.ink};">503</b>。繰り返さず未測定<br>ranking の robots.txt は <b style="color:${C.ink};">403</b>。そこで止めた<br>単語の規則は否定を読み違える。本番は AI で</div>`, { pad: 18, gap: 7 })}</div>`)}
`, { src: 'meas', sub: `化粧水・ランニングシューズ・コーヒー ${MEASURE.reviews}件（単語の規則・粗い値）` });
}

// ---------- C03 コンセプト ----------
function c03() {
  const sh = SHOES.find((s) => s.id === 'hk-bondi9w');
  const tagDemo = voiceTag({ img: shoeArt(sh, 96), name: sh.name, read: sh.read, total: sh.total, lines: [{ kind: 'pos', t: 'クッション', n: sh.cushion[0] }, { kind: 'pos', t: '軽さ', n: sh.light[0] }], just: { counts: sh.dir, name: 'サイズ感' }, w: 210, imgH: 96 });
  const I = MEASURE.irritation;
  const col = (n, t, s, visual) => `<div style="width:440px; display:flex; flex-direction:column; gap:12px;">${dot(n, { size: 30 })}<div style="font-size:22px; font-weight:700;">${t}</div><div style="font-size:13.5px; line-height:1.75; color:${C.ink2};">${s}</div><div style="margin-top:6px;">${visual}</div></div>`;
  const ans = [['Q07', '決めているが製品まで決めきれない', '棚（ものさし）と、似ているもの'], ['Q09', '自分に合うのが分かった', '似た人の声で数えなおす'], ['Q09', '不満が先に分かる', '声札も帯も、不満から'], ['Q10 A', '気にしていた点で外れを避けた', '条件×観点のページ'], ['Q10 D', '知らなかった商品を見つけた', '似た人が選んでいるもの・地図'], ['Q13', 'マップ（埋め込みで差別化・納得感）', '軸は名前の言える観点。埋め込みは「似ている」に使い、理由を言葉で出す']];
  return frame('03', 'コンセプト', `
${at(72, 128, `<div style="font-size:64px; font-weight:700; line-height:1.2;">似た人の、買ったあと。</div><div style="font-size:17px; color:${C.ink2}; margin-top:12px;">どのモノでも同じ読み方で、自分に近い人の声だけを数えなおせる。</div>`)}
${at(72, 300, `<div style="display:flex; gap:48px;">
${col(1, 'どのモノでも、同じ文法', '声札（こえふだ）1枚に、読んだ件数・不満が先・ちょうどよさ・また買った。500以上のカテゴリで同じ形なので、一度覚えれば全部読める', `<div style="display:flex; gap:12px; align-items:flex-end;">${tagDemo}<div style="font-size:12px; color:${C.muted}; line-height:1.6;">シューズ（見本）<br>イヤホンもコーヒーも<br>同じ形（C11）</div></div>`)}
${col(2, '似た人の声だけ、数えなおせる', 'レビューに本人が書いた条件（敏感肌・足幅が広い・毎朝ブラック）で数えなおす。全体の件数は消さずに並べる。選んだ条件は端末の中だけ', `<div style="display:flex; flex-direction:column; gap:12px; width:400px;"><div style="display:flex; gap:8px;">${cond('敏感肌', { on: true })}${cond('足幅が広い')}${cond('一人暮らし')}</div>${voiceStrip({ pos: I.all.pos, neg: I.all.neg, read: I.all.n, w: 400, h: 9, name: '化粧水の刺激・全体' })}${voiceStrip({ pos: I.sensitive.pos, neg: I.sensitive.neg, read: I.sensitive.n, w: 400, h: 9, name: '敏感肌と書いた人（見本・14件は少ない）' })}</div>`)}
${col(3, '読めた深さを、そのまま見せる', '名前だけ → 声札 → 棚 → 地図。読めていないことを隠さず、地図は読めたカテゴリだけに「育つ」。イヤホンは今、地図まで あと' + (12 - thick) + '商品', `<div style="display:flex; flex-direction:column; gap:10px;">${[0, 1, 2, 3].map((t) => `<div style="display:flex; align-items:center; gap:12px;">${tierMark(t)}<span style="font-size:12.5px; color:${C.ink2};">${['まだ読めていない', '商品ごとの声札', '観点のものさし', '2つの観点の地図'][t]}</span></div>`).join('')}</div>`)}
</div>`)}
${at(72, 790, `<div style="width:1456px;">${kick('06 の回答との対応')}<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px 16px; margin-top:10px;">${ans.map(([q, a, b]) => `<div style="display:flex; gap:10px; align-items:flex-start; font-size:12.5px; line-height:1.5;"><span style="font-family:${F.mono}; font-size:11px; color:${C.muted}; width:44px; flex-shrink:0; margin-top:2px;">${q}</span><span><span style="color:${C.ink2};">${a}</span> → <b>${b}</b></span></div>`).join('')}</div></div>`)}
`, { src: 'meas' });
}

// ---------- C04 区分の3層 ----------
function c04() {
  const entr = [['search', '検索', '商品名・カテゴリ・困りごと・条件の言葉'], ['place', '暮らしの場所', `${PLACES.length}か所。モノの絵で`], ['person', 'わたしの条件', '一度選べば全カテゴリで'], ['alert', '困りごと', '系統の共通観点から'], ['gift', '贈る', '贈り物として買った人の声']];
  const fams = [...FAMILIES.map((f) => ({ ...f, n: famCount(f.key) })), { key: 'kids', name: '子どもとペット', obj: 'stroller', n: famCount('kids') }];
  const units = [['earbuds', '完全ワイヤレスイヤホン', 2], ['vacuum', 'スティック掃除機', 0], ['bottle', '化粧水', 1], ['shoe', 'ランニングシューズ', 1], ['bag', 'コーヒー', 1], ['bowl', 'キャットフード', 0], ['kettle', '電気ケトル', 0], ['pillow', '枕', 0]];
  const layer = (y, name, sub, inner, hgt) => at(72, y, `<div style="display:grid; grid-template-columns:200px 1fr; gap:24px; width:1060px; align-items:center;"><div><div style="font-size:12px; font-family:${F.mono}; color:${C.muted};">${sub}</div><div style="font-size:22px; font-weight:700; margin-top:2px;">${name}</div></div><div style="min-height:${hgt}px; display:flex; align-items:center;">${inner}</div></div>`);
  return frame('04', '区分の3層', `
${layer(130, '入口', '人の側の切り口', `<div style="display:flex; gap:10px; flex-wrap:wrap;">${entr.map(([ic, t, s]) => `<div style="display:flex; gap:10px; align-items:center; padding:10px 14px; border-radius:16px; background:${C.card}; box-shadow:${SH.card};">${icon(ic, { size: 20 })}<div><div style="font-size:14px; font-weight:700;">${t}</div><div style="font-size:11.5px; color:${C.muted};">${s}</div></div></div>`).join('')}</div>`, 120)}
${at(72, 290, `<div style="width:1060px; border-top:1px dashed ${C.line};"></div>`)}
${layer(314, '系統', '体とのかかわり方・6＋1', `<div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:10px; width:836px;">${fams.map((f) => `<div style="display:flex; flex-direction:column; align-items:center; gap:4px; padding:12px 6px; border-radius:16px; background:${C.card}; box-shadow:${SH.card}; ${f.key === 'kids' ? `opacity:.7; box-shadow:none; border:1px dashed ${C.line};` : ''}">${obj(f.obj, { size: 64 })}<b style="font-size:13px; text-align:center; line-height:1.3;">${f.name}</b><span style="font-family:${F.mono}; font-size:11px; color:${C.muted};">${f.n}</span></div>`).join('')}</div>`, 170)}
${at(72, 520, `<div style="width:1060px; border-top:1px dashed ${C.line};"></div>`)}
${layer(544, '比べる単位', `${COUNTS.mbGoodsMid}〜（見込み）`, `<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; width:836px;">${units.map(([o, n, t]) => `<div style="display:flex; gap:10px; align-items:center; padding:8px 10px; border-radius:14px; background:${t ? C.card : 'transparent'}; box-shadow:${t ? SH.card : 'none'}; border:${t ? 'none' : `1px dashed ${C.line}`};">${tile(obj(o, { size: 40 }), { w: 44, r: 10, bg: t ? C.tile : C.paper })}<div style="min-width:0;"><div style="font-size:12.5px; font-weight:700; line-height:1.3;">${n}</div><div style="margin-top:3px;">${tierMark(t, { size: 's' })}</div></div></div>`).join('')}</div>`, 180)}
${at(72, 790, `<div style="width:1060px; font-size:12.5px; color:${C.ink2}; line-height:1.7;">系統ごとの数は、マイベストのルート単位で振った概算（中カテゴリの数）。「子どもとペット」は中身を他の系統に振り直す（ベビーカー→道具、離乳食→食べる、キャットフード→食べる。ただし食べるのはペット）</div>`)}
${at(1180, 130, `<div style="width:348px; display:flex; flex-direction:column; gap:14px;">${box(`${kick('比べる単位')}<div style="font-size:13px; line-height:1.7; color:${C.ink2};">代わりになる商品の集まり。<b style="color:${C.ink};">1つずつ観点・ゲート・地図を持つ</b>。URL は <span style="font-family:${F.mono};">/c/&lt;単位&gt;</span></div>`, { pad: 18, gap: 6 })}${box(`${kick('系統')}<div style="font-size:13px; line-height:1.7; color:${C.ink2};">観点の辞書と「困りごと」を共有する。<b style="color:${C.ink};">着る・履くならサイズ感、肌と髪なら刺激</b>、が最初から入っている。画面にはほぼ出さない</div>`, { pad: 18, gap: 6 })}${box(`${kick('入口')}<div style="font-size:13px; line-height:1.7; color:${C.ink2};">木（売り場の分け方）を入口にしない。人は<b style="color:${C.ink};">場所・条件・困りごと</b>から来る。1つの単位が複数の場所に入る</div>`, { pad: 18, gap: 6 })}${box(`${kick('なぜ木を主にしないか')}<div style="font-size:13px; line-height:1.7; color:${C.ink2};">500以上を木で見せると、価格.com と同じ「表だらけ」になる（Q11 で避けたいもの）。木は住所として残す</div>`, { pad: 18, gap: 6 })}</div>`)}
`, { src: 'cat' });
}

// ---------- C05 声の3つの型 ----------
function c05() {
  const e = byShort['821de2ea'];
  const cof = MEASURE.cats[2];
  const col = (title, sub, visual, rows) => `<div style="width:469px;">${box(`<div style="font-size:22px; font-weight:700;">${title}</div><div style="font-size:13px; color:${C.ink2};">${sub}</div><div style="height:118px; display:flex; align-items:center;">${visual}</div>${rows.map(([k, v]) => `<div style="display:grid; grid-template-columns:96px 1fr; gap:10px; padding:8px 0; border-top:1px solid ${C.hair}; font-size:12.5px; line-height:1.55;"><b>${k}</b><span style="color:${C.ink2};">${v}</span></div>`).join('')}`, { pad: 22, gap: 10, extra: 'height:560px;' })}</div>`;
  return frame('05', '声の3つの型', `
${at(72, 130, `<div style="display:flex; gap:24px;">
${col('良し悪し', '満足 ↔ 不満。今のイヤホンの観点', voiceStrip({ pos: e.pos.fit, neg: e.neg.fit, read: e.read, w: 400, h: 12, name: `装着感（${e.name}・実データ）`, fs: 13 }), [['例', '装着感・刺激・クッション・手入れ'], ['見せ方', '声の帯。左から不満、右から満足、全体の長さ＝読んだ件数'], ['数え方', '今のまま。収縮・分離度・ゲート'], ['軸', 'なる（散らばりのゲートを通れば）'], ['順位', '付けない。ものさしの上の位置で見せる']])}
${col('ちょうどよさ', '小さめ ↔ ちょうど ↔ 大きめ。良し悪しではない', justStrip({ counts: ALL_DIR, w: 400, h: 12, name: 'サイズ感（シューズ8商品・見本）', read: MEASURE.cats[1].n, fs: 13 }), [['例', 'サイズ感・使用感（さっぱり↔しっとり）・味（酸味↔苦味）・硬さ'], ['見せ方', '3つの区間の帯。真ん中の黒が「ちょうど」。満足と不満の色は使わない'], ['数え方', '向きの点数＝（大きめ−小さめ）÷（全部＋4）。同じ収縮'], ['軸', '地図の軸に向く（好みなので、どちらの端も「悪い」ではない）'], ['条件', '幅広・普段のサイズと組むと強い']])}
${col('また買った', '行動の事実。満足より強い', `<div style="display:flex; flex-direction:column; gap:10px;"><div style="display:flex; align-items:baseline; gap:8px;"><span style="font-family:${F.mono}; font-size:48px;">${cof.rep}</span><span style="font-family:${F.mono}; font-size:16px; color:${C.muted};">/ ${cof.n}件</span></div>${repeatLine(cof.rep, cof.n, { fs: 13 })}<span style="font-size:12px; color:${C.muted};">コーヒー8商品（見本）</span></div>`, [['例', 'リピ・〇回目・定期便・また買う'], ['見せ方', '件数1つ。声札の下に'], ['範囲', '使って減るモノだけ（食べる・肌と髪・日用品）'], ['使い道', '「わたしの棚」から同じものをもう一度（C14）'], ['注意', '贈り物の声（コーヒー9%）は自分用と分ける']])}
</div>`)}
${at(72, 716, `<div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; width:1455px;">${box(`<div style="display:flex; gap:14px; align-items:flex-start;">${tile(icon('person', { size: 22 }), { w: 46, r: 14 })}<div><div style="font-size:16px; font-weight:700;">声の主（条件）は、観点ではない</div><div style="font-size:13px; color:${C.ink2}; line-height:1.7; margin-top:4px;">レビュー1件に付く札（0〜数個）。「敏感肌と書いた人の刺激」のように、どの型の観点とも組める（C07）</div></div></div>`, { pad: 20 })}${box(`<div style="display:flex; gap:14px; align-items:flex-start;">${tile(icon('truck', { size: 22 }), { w: 46, r: 14 })}<div><div style="font-size:16px; font-weight:700;">数えないもの：配送・梱包・お店</div><div style="font-size:13px; color:${C.ink2}; line-height:1.7; margin-top:4px;">見本では9〜25%。数えなかった件数は、カテゴリのページに出す（「お店と配送の声 60件は数えていません」）</div></div></div>`, { pad: 20 })}</div>`)}
`, { src: 'meas' });
}

// ---------- C06 観点の辞書と承認 ----------
function c06() {
  const steps = [['300件を取り出す', '単位の上位商品から'], ['AIが辞書から選ぶ', '固有は3つまで提案。固有名詞は機械で弾く'], ['人が承認', '型（良し悪し・ちょうど・行動）もここで'], ['抽出', '30件で1回。件数はコードが数える'], ['ゲートは自動', '散らばり・商品数・段']];
  const pyr = [['共通', 'すべての物販', '思っていたのと違う・丈夫さ・価格の納得感・見た目と質感', 4], ['系統', '6つの系統ごと', '着る・履く＝サイズ感・履き心地・洗濯／肌と髪＝刺激・使用感・香り　など', 30], ['固有', '1単位に3つまで', 'イヤホン＝ノイズキャンセリング／シューズ＝クッション・グリップ', '≦3']];
  return frame('06', '観点の辞書と承認', `
${at(72, 128, `<div style="width:560px; display:flex; flex-direction:column; gap:10px;">${kick('辞書は3段')}${pyr.map(([t, s, ex, n], i) => `<div style="margin-left:${i * 28}px; display:flex; gap:14px; align-items:flex-start; padding:14px 16px; border-radius:16px; background:${C.card}; box-shadow:${SH.card};"><div style="width:62px; flex-shrink:0;"><div style="font-size:18px; font-weight:700;">${t}</div><div style="font-family:${F.mono}; font-size:11px; color:${C.muted};">${n}個</div></div><div><div style="font-size:12px; color:${C.muted};">${s}</div><div style="font-size:13px; line-height:1.6; margin-top:2px;">${ex}</div></div></div>`).join('')}<div style="font-size:12px; color:${C.muted}; line-height:1.6;">個数は設計の目安（未測定）</div></div>`)}
${at(72, 486, `<div style="width:560px;">${kick('流れ')}<div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">${steps.map(([t, s], i) => `<div style="display:flex; gap:12px; align-items:center;">${dot(i + 1, { size: 26, bg: i === 2 ? C.neg : C.ink })}<div><b style="font-size:14px;">${t}</b><span style="font-size:12.5px; color:${C.ink2}; margin-left:10px;">${s}</span></div></div>`).join('')}</div></div>`)}
${pc(pcAdmin(), 680, 128, 0.58)}
${at(680, 690, `<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; width:836px;">${box(`${kick('守ること')}<div style="font-size:12.5px; line-height:1.65; color:${C.ink2};">「自由文から発見させない」（仕様）。AI が作るのは辞書からの<b style="color:${C.ink};">提案</b>で、決めるのは人</div>`, { pad: 16, gap: 6 })}${box(`${kick('手間')}<div style="font-size:12.5px; line-height:1.65; color:${C.ink2};">1単位5分 × ${COUNTS.mbGoodsMid} ≒ <b style="color:${C.ink};">44時間</b>（推定）。需要の高い順に承認する</div>`, { pad: 16, gap: 6 })}${box(`${kick('見本で分かったこと')}<div style="font-size:12.5px; line-height:1.65; color:${C.ink2};">シューズの「軽さ」は満足${LIGHT[0]}・不満${LIGHT[1]}。<b style="color:${C.ink};">承認の画面で「差が出ない見込み」</b>を先に出す</div>`, { pad: 16, gap: 6 })}</div>`)}
`, { src: 'meas' });
}

// ---------- C07 似た人の声 ----------
function c07() {
  const rules = [['本人が書いた条件だけ', 'レビューの中の「敏感肌ですが」「幅広なので」を AI が拾う。画面に「本人が書いた条件（AIが抽出）」と出す'], ['全体の件数を消さない', '「全体 240件中13件 ／ 敏感肌と書いた14件中8件」と並べる'], ['少ないときは小さく', '条件つきが20件未満なら、数字を小さく薄くして「まだ少ない」と書く（値は測って決める）'], ['端末の中だけ', '登録なし。選んだ条件はこの端末にだけ置く'], ['診断ではない', '自分で選んで、いつでも外せる絞り込み。質問に答えさせない（Q14）']];
  const dict = FAMILIES.map((f) => `<div style="display:grid; grid-template-columns:110px 1fr; gap:10px; padding:7px 0; border-bottom:1px solid ${C.hair}; font-size:12.5px;"><b>${f.name}</b><span style="color:${C.ink2};">${f.conds.join('・')}</span></div>`).join('') + `<div style="display:grid; grid-template-columns:110px 1fr; gap:10px; padding:7px 0; font-size:12.5px;"><b>子どもとペット</b><span style="color:${C.ink2};">月齢・犬猫の年齢</span></div>`;
  return frame('07', '似た人の声', `
${at(72, 128, `<div style="width:470px; display:flex; flex-direction:column; gap:14px;">${rules.map(([t, s], i) => note(i + 1, t, s)).join('')}</div>`)}
${at(72, 600, `<div style="width:470px;">${box(`${kick('条件の辞書（系統ごと）')}${dict}`, { pad: 18, gap: 2 })}</div>`)}
${ph(sProductSkin(), 590, 128, 0.72)}
${ph(sJust({ wideOn: true }), 910, 128, 0.72)}
${at(1236, 128, `<div style="width:292px; display:flex; flex-direction:column; gap:14px;">${box(`${kick('見本で測った割合')}${MEASURE.cats.map((c) => `<div style="display:flex; justify-content:space-between; font-size:13px;"><span>${c.name}</span><span style="font-family:${F.mono};">${c.cond}/${c.n}（${pct(c.cond, c.n)}%）</span></div>`).join('')}<div style="font-size:11.5px; color:${C.muted}; line-height:1.6;">自分の条件を書いたレビュー。単語の規則で数えた</div>`, { pad: 18, gap: 8 })}${box(`${kick('分母の見込み')}<div style="font-size:13px; line-height:1.7; color:${C.ink2};">見本は1商品30件。本番は最大10ページ（300件）読むので、<b style="color:${C.ink};">条件つきの声は約10倍</b>（推定）。1商品の中より、カテゴリ全体で先に言えるようになる</div>`, { pad: 18, gap: 6 })}${box(`${kick('似た人が選んでいる')}<div style="font-size:13px; line-height:1.7; color:${C.ink2};">ワイド型のシューズ2つは「幅広」と書いた人が30件中 <b style="color:${C.ink};">10件と8件</b>、ほかは2〜5件。条件の偏りそのものが手がかり（Q10 D）</div>`, { pad: 18, gap: 6 })}</div>`)}
`, { src: 'meas', sub: 'わたしの条件で、どのカテゴリでも数えなおす' });
}

// ---------- C08 読めた深さの4段 ----------
function c08() {
  const T = [
    [0, '読めた商品がない', '商品名・画像・価格と「まだ読めていない」。「読んでほしい」ボタン', '出さない（noindex）', sTier0()],
    [1, '30件以上読めた商品が1つ以上', '商品ごとの声札。順位なし', '商品ページだけ', sTier1Shoes()],
    [2, '軸に使える観点が1つ以上（今のゲート）', '観点ごとのものさし・観点のページ', '出す', sTier2Ear()],
    [3, '30件以上読めた商品が12以上・軸2つ以上・同ブランドの近さが偶然の2倍未満', '2つの観点の地図（ちょうどよさを優先）', '出す', sTier3Map()],
  ];
  let html = '';
  T.forEach(([n, gate, show, idx, screen], i) => {
    const x = 72 + i * 370;
    html += at(x, 128, tierMark(n, { dark: true }));
    html += ph(screen, x, 172, 0.5);
    html += at(x + 222, 172, `<div style="width:130px; display:flex; flex-direction:column; gap:10px; font-size:12px; line-height:1.55;"><div><div style="font-size:11px; color:${C.muted};">条件（案）</div>${gate}</div><div><div style="font-size:11px; color:${C.muted};">出すもの</div>${show}</div><div><div style="font-size:11px; color:${C.muted};">検索に</div>${idx}</div></div>`);
  });
  const now = [[3, 0, '—'], [2, 1, `完全ワイヤレスイヤホン（地図まで あと${12 - thick}商品）`], [1, 3, '見本で測った 化粧水・ランニングシューズ・コーヒー'], [0, COUNTS.mbGoodsMid - 4, 'ほかすべて']];
  return frame('08', '読めた深さの4段', `
${html}
${at(72, 634, `<div style="width:1456px;">${box(`<div style="display:flex; justify-content:space-between; align-items:baseline;">${kick('今の状態（物販 ' + COUNTS.mbGoodsMid + ' カテゴリ）')}<span style="font-size:12px; color:${C.muted};">段は自動で決まる。上がるのはいつも「読めた量」が増えたとき</span></div><div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; margin-top:6px;">${now.map(([t, n, s]) => `<div style="display:flex; flex-direction:column; gap:6px;">${tierMark(t)}<span style="font-family:${F.mono}; font-size:30px;">${n}</span><span style="font-size:12px; color:${C.ink2}; line-height:1.5;">${s}</span></div>`).join('')}</div>`, { pad: 22, gap: 8 })}</div>`)}
${at(72, 850, `<div style="width:1456px; font-size:13px; color:${C.ink2}; line-height:1.7;">同じ文法で段だけが変わる：段0でも「名前・値段・まだ読めていない」は出し、段が上がると声札 → ものさし → 地図が<b style="color:${C.ink};">足されていく</b>。地図が無いことは「悪い」ではなく「まだ」と書く</div>`)}
`, { src: 'ear' });
}

// ---------- C09 入口とホーム ----------
function c09() {
  const urls = [['/c/<単位>', 'カテゴリ（段で中身が変わる）'], ['/c/<単位>/<観点>', 'ものさし（段2から。ゲートを通った観点だけ）'], ['/c/<単位>/<観点>?条件=幅広', '条件×観点（Q08 A の「観点の言葉で検索」の受け口）'], ['/p/<商品>', '商品の声札'], ['/vs/<a>/<b>', '並べる（シェア用）'], ['/place/<場所>', '暮らしの場所'], ['/trouble/<困りごと>', '困りごと（系統の共通観点）']];
  return frame('09', '入口とホーム', `
${ph(sHome(), 72, 128, 0.78)}
${at(420, 128, `<div style="width:560px; display:flex; flex-direction:column; gap:16px;">
${note(1, '検索がいちばん大きな入口', '商品名・カテゴリ・困りごと・条件の言葉を1つの窓で。結果は「カテゴリ×条件」「観点」「困りごと」「商品」に分けて出す')}
${note(2, 'わたしの条件（ホームの2段目）', '一度選べば、どのカテゴリでも効く。ホームに来る人（Q08 D）に、最初に見せる')}
${note(3, '暮らしの場所', `${PLACES.length}か所をモノの絵のタイルで。1つの単位が複数の場所に入る（イヤホン＝外へ・仕事と学び）`)}
${note(4, '困りごと', 'すぐ壊れた・サイズが合わない・思っていたのと違う。系統の共通観点から')}
${note(5, '今週', '地図になったカテゴリ・声が増えたもの。戻ってくる理由（Q06「定着」）')}
</div>`)}
${at(420, 490, `<div style="width:560px;">${box(`${kick('URL（検索の受け口）')}${urls.map(([u, s]) => `<div style="display:grid; grid-template-columns:230px 1fr; gap:10px; font-size:12.5px; padding:4px 0;"><span style="font-family:${F.mono}; font-size:12px;">${u.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span><span style="color:${C.ink2};">${s}</span></div>`).join('')}<div style="font-size:11.5px; color:${C.muted}; margin-top:4px;">ゲートを通らない組み合わせはページを作らない（404）。段0は noindex</div>`, { pad: 18, gap: 4 })}</div>`)}
${ph(sSearch(), 1020, 128, 0.78)}
${ph(sPlace(), 1352, 128, 0.42)}
${at(1352, 520, `<div style="width:176px; font-size:12px; color:${C.ink2}; line-height:1.6;">場所の中では、段の印で「読めている」「まだ」を分ける。読めていないカテゴリも名前を出す（隠さない）</div>`)}
`, { src: 'none', sub: 'ホームの件数は将来を描いた見本' });
}

// ---------- C10 体験の流れ ----------
function c10() {
  const rows = [
    ['検索から着く', '「ランニングシューズ 幅広」で来た人', [[sSearch(), '検索'], [sJust({ wideOn: true }), '幅広の人のサイズ感'], [sTier1Shoes(), '声札'], [sJust(), '全体と比べる']], 'Q10 A：気にしていた点（幅広で小さめ）で外れを避ける'],
    ['決めたけれど迷う', 'イヤホンを買うと決めた人', [[sTier2Ear(), 'ものさし'], [sProductEar(), '声札'], [sCompare(), '並べる']], 'Q07：製品まで決めきれない人に、違うところから先に見せる'],
    ['似たもの・違うもの', '持っている商品が好きな人', [[sProductEar(), '声が似ているもの'], [sTier3Map(), '地図（段3）'], [sCoffee(), '別のカテゴリでも同じ形']], 'Q10 D：知らなかった商品を見つける。近い理由は言葉で'],
  ];
  let html = '';
  rows.forEach(([t, who, screens, out], r) => {
    const y = 128 + r * 272;
    html += at(72, y + 10, `<div style="width:250px;"><div style="font-size:12px; font-family:${F.mono}; color:${C.muted};">流れ ${r + 1}</div><div style="font-size:20px; font-weight:700; margin-top:2px;">${t}</div><div style="font-size:13px; color:${C.ink2}; margin-top:4px;">${who}</div><div style="font-size:12.5px; line-height:1.6; margin-top:12px; padding:10px 12px; border-radius:12px; background:${C.card}; box-shadow:${SH.card};">${out}</div></div>`);
    screens.forEach(([s, cap], i) => {
      const x = 360 + i * 290;
      html += ph(s, x, y, 0.28);
      html += at(x + 124, y + 70, `<div style="width:140px; font-size:12.5px; font-weight:700; line-height:1.45;">${dot(i + 1, { size: 22 })}<div style="margin-top:6px;">${cap}</div></div>`);
      if (i < screens.length - 1) html += arrow(x + 124, y + 150, 120);
    });
  });
  return frame('10', '体験の流れ', html, { src: 'ear' });
}

// ---------- C11 画面の文法 ----------
function c11() {
  const e = byShort['821de2ea'], sh = SHOES.find((s) => s.id === 'nb-arishi'), cf = COFFEE[2], sk = SKIN.find((s) => s.id === 'cl-vc100');
  const tags = [
    voiceTag({ img: earArt(e.s, 96), name: e.name, read: e.read, total: e.reviewCount, lines: [{ kind: 'neg', t: '装着感', n: e.neg.fit }, { kind: 'pos', t: 'ノイキャン', n: e.pos.anc }], w: 200, imgH: 96 }),
    voiceTag({ img: shoeArt(sh, 96), name: sh.name, read: sh.read, total: sh.total, lines: [{ kind: 'pos', t: '軽さ', n: sh.light[0] }], just: { counts: sh.dir, name: 'サイズ感' }, w: 200, imgH: 96 }),
    voiceTag({ img: bottleArt(sk, 96), name: sk.name, read: sk.read, total: sk.total, lines: [{ kind: 'neg', t: '刺激', n: sk.irr[1] }], just: { counts: sk.dir, labels: ['さっぱり', 'しっとり'] }, rep: sk.rep, w: 200, imgH: 96 }),
    voiceTag({ img: bagArt(cf, 96), name: cf.name, read: cf.read, total: cf.total, lines: [], just: { counts: cf.dir, labels: ['酸味', '苦味'] }, rep: cf.rep, w: 200, imgH: 96 }),
  ];
  const part = (t, s, v, w = 352) => `<div style="width:${w}px;">${box(`<div style="font-size:15px; font-weight:700;">${t}</div><div style="min-height:56px; display:flex; align-items:center;">${v}</div><div style="font-size:12px; color:${C.ink2}; line-height:1.6;">${s}</div>`, { pad: 18, gap: 8 })}</div>`;
  return frame('11', '画面の文法', `
${at(72, 124, `<div style="width:900px;">${kick('声札（こえふだ）— イヤホン・シューズ・化粧水・コーヒーが同じ形')}<div style="display:flex; gap:16px; margin-top:12px; align-items:flex-start;">${tags.join('')}</div><div style="font-size:12.5px; color:${C.ink2}; margin-top:12px; line-height:1.7;">上から：絵・名前・「読んだ N / 全体」・不満→満足の行・ちょうどの帯・また買った。無い型の行は出さない（空欄にしない）。イヤホンは実データ、ほかは見本</div></div>`)}
${at(1010, 124, `<div style="display:flex; flex-direction:column; gap:14px;">
${part('声の帯', '左から不満・右から満足・真ん中はふれていない。全体の長さ＝読んだ件数。分母が常に見える', voiceStrip({ pos: e.pos.anc, neg: e.neg.anc, read: e.read, w: 290, h: 10, name: 'ノイズキャンセリング' }), 518)}
${part('ちょうどの帯', '3つの区間。真ん中の黒が「ちょうど」。色で良し悪しを言わない', justStrip({ counts: ALL_DIR, w: 290, h: 10, name: 'サイズ感', read: MEASURE.cats[1].n }), 518)}
${part('条件と段の印', '人の印＝わたしの条件。段の印＝読めた深さ。どの画面でも右上か見出しの横', `<div style="display:flex; gap:8px; flex-wrap:wrap;">${cond('足幅が広い', { on: true })}${tierMark(1)}${tierMark(2)}</div>`, 518)}
</div>`)}
${at(72, 640, `<div style="display:flex; gap:16px;">
${part('ものさし（段2）', '1本の観点に商品の絵を並べる。位置は収縮後の点数。点線の丸＝30件未満。ふれていない商品は別に', `<div style="position:relative; width:290px; height:56px;"><div style="position:absolute; left:0; right:0; top:28px; border-top:1.5px solid ${C.hair};"></div>${[[20, 34], [120, 40], [170, 30], [210, 46], [250, 36]].map(([x, s], i) => `<span style="position:absolute; left:${x}px; top:${28 - s / 2}px; width:${s}px; height:${s}px; border-radius:50%; background:${C.tile}; ${i === 2 ? `outline:1px dashed ${C.faint}; outline-offset:2px;` : ''}"></span>`).join('')}</div>`)}
${part('並べる', '違うところから先に。同じくらい・片方だけ・どちらも言及なし、を分けて書く', `<div style="display:flex; gap:8px; align-items:center;">${voiceStrip({ pos: 21, neg: 14, read: 129, w: 120, h: 8, labels: false })}<b style="font-size:12px;">装着感</b>${voiceStrip({ pos: 39, neg: 9, read: 303, w: 120, h: 8, labels: false })}</div>`)}
${part('また買った', '使って減るモノだけ。声札のいちばん下', repeatLine(COFFEE[1].rep, 30, { fs: 14 }))}
${part('まだ（段0）', '点線の枠と薄い絵。「まだ読めていない」と書く。順位も「おすすめ」も付けない', `<div style="display:flex; gap:10px; align-items:center; padding:8px 12px; border-radius:14px; border:1px dashed ${C.line};">${tile(obj('bowl', { size: 34 }), { w: 40, r: 10, bg: C.paper })}<span style="font-size:12.5px; color:${C.ink2};">まだ読めていない</span>${tierMark(0, { size: 's' })}</div>`)}
</div>`)}
${at(72, 872, `<div style="width:1456px; font-size:13px; color:${C.ink2}; line-height:1.7;">部品は全カテゴリで同じ。変わるのは、どの型の観点があるか（辞書）と、どこまで読めたか（段）だけ。<b style="color:${C.ink};">一度覚えれば、初めてのカテゴリでも読める</b>ことが、500以上に広げる前提</div>`)}
`, { src: 'ear', sub: 'どのカテゴリでも同じ部品' });
}

// ---------- C12 デザイン言語 ----------
function c12() {
  const sw = [['紙', C.paper, '地'], ['札', C.card, 'カード'], ['台', C.tile, 'モノの台'], ['墨', C.ink, '文字・ちょうど'], ['不満', C.neg, '帯の左'], ['満足', C.pos, '帯の右'], ['向き', C.side, 'ちょうどの両側'], ['余白', C.rest, 'ふれていない']];
  const objs = Object.keys(OBJ_COL);
  const likes = [['モノが主役', '好き2・3・4', '地は紙色、色はモノの絵だけ'], ['画像を空間に並べる', '好き7・8・9', 'ものさし・地図は商品の絵で'], ['数字は大きく、説明は小さく', '好き10・11', '分母は等幅の数字で'], ['部品は丸く柔らかい', '好き3・5', '札の角・丸いチップ']];
  const dislikes = [['文字で埋めた2軸の図', '嫌い1・4', '軸の言葉は端に2つだけ。商品名は押したときに'], ['色が多い・強い', '嫌い5・6・7', '色は声の2色と、モノの絵だけ'], ['詰め込み', '嫌い2・3・8・9', '1画面1つの問い。広告は枠の外']];
  return frame('12', 'デザイン言語', `
${at(72, 128, `<div style="width:700px;">${kick('紙と札')}<div style="font-size:21px; font-weight:700; margin-top:6px;">地は温かい紙。声は札と帯で読む。色はモノの絵と声の2色だけ</div><div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-top:18px;">${sw.map(([n, c, u]) => `<div style="display:flex; flex-direction:column; gap:6px;"><span style="height:64px; border-radius:14px; background:${c}; box-shadow:inset 0 0 0 1px rgba(0,0,0,.08);"></span><b style="font-size:13px;">${n}</b><span style="font-family:${F.mono}; font-size:11px; color:${C.muted};">${c}</span><span style="font-size:11.5px; color:${C.ink2};">${u}</span></div>`).join('')}</div><div style="font-size:12px; color:${C.muted}; margin-top:10px; line-height:1.6;">不満（朱）と満足（藍）は、色が見分けにくい人にも明るさと位置で分かれる。向き（ちょうど）は良し悪しではないので無彩色</div></div>`)}
${at(840, 128, `<div style="width:688px;">${kick('文字')}<div style="display:flex; gap:28px; margin-top:10px;"><div><div style="font-size:40px; font-weight:700;">似た人の、買ったあと。</div><div style="font-size:12px; color:${C.muted}; margin-top:4px;">IBM Plex Sans JP 700 ・ 見出し</div><div style="font-size:15px; margin-top:12px; line-height:1.7;">装着感にふれたレビューは129件中35件。</div><div style="font-size:12px; color:${C.muted};">IBM Plex Sans JP 400 ・ 本文</div><div style="font-family:${F.mono}; font-size:28px; margin-top:12px;">129 / 132件</div><div style="font-size:12px; color:${C.muted};">IBM Plex Mono ・ 数字と分母</div></div></div><div style="font-size:12px; color:${C.ink2}; margin-top:12px;">いちばん小さい文字は 11px（CLAUDE.md）。等幅の数字で、分母の桁がそろう</div></div>`)}
${at(72, 588, `<div style="width:1456px;">${kick('モノの絵（カテゴリの入口。実装では代表商品の画像）')}<div style="display:flex; gap:6px; margin-top:10px; flex-wrap:wrap;">${objs.map((o) => tile(obj(o, { size: 56 }), { w: 64, r: 14 })).join('')}</div></div>`)}
${at(72, 730, `<div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; width:1456px;">${box(`${kick('参考の「好き」から')}${likes.map(([a, r, b]) => `<div style="display:grid; grid-template-columns:200px 110px 1fr; gap:10px; font-size:12.5px; padding:5px 0;"><b>${a}</b><span style="font-family:${F.mono}; font-size:11px; color:${C.muted};">${r}</span><span style="color:${C.ink2};">${b}</span></div>`).join('')}`, { pad: 20, gap: 4 })}${box(`${kick('参考の「嫌い」から、避けること')}${dislikes.map(([a, r, b]) => `<div style="display:grid; grid-template-columns:180px 110px 1fr; gap:10px; font-size:12.5px; padding:5px 0;"><b>${a}</b><span style="font-family:${F.mono}; font-size:11px; color:${C.muted};">${r}</span><span style="color:${C.ink2};">${b}</span></div>`).join('')}<div style="font-size:12px; color:${C.muted}; margin-top:4px;">Q11：表だらけ・1位推し・ゲームっぽさ・お堅い統計・AIっぽい見た目（紫のグラデーション等）を避ける</div>`, { pad: 20, gap: 4 })}</div>`)}
`, { src: 'none' });
}

// ---------- C13 読む順番と量 ----------
function c13() {
  const pipe = [['一覧', '楽天の API（資格情報）か、カテゴリ一覧（サーバー描画・件数つき）'], ['単位を作る', 'メーカー品＝型番・JAN ／ お店の商品＝お店ごとに上限'], ['読む', 'ホストごとに3秒・robots.txt・1商品10ページまで・403で止める・503は間をあける'], ['AIで分類', '30件で1回。観点×型・条件・数えないもの'], ['照合と検査', '引用は原文と照合、件数は M ≤ N'], ['段を決める', 'ゲートは自動'], ['週次', '一覧の件数が増えた商品だけ、1ページ目を読み直す']];
  return frame('13', '読む順番と量', `
${at(72, 128, `<div style="width:520px;">${kick('流れ')}<div style="display:flex; flex-direction:column; gap:0; margin-top:10px;">${pipe.map(([t, s], i) => `<div style="display:grid; grid-template-columns:34px 110px 1fr; gap:10px; padding:11px 0; border-bottom:1px solid ${C.hair}; align-items:start;">${dot(i + 1, { size: 24 })}<b style="font-size:14px;">${t}</b><span style="font-size:12.5px; color:${C.ink2}; line-height:1.6;">${s}</span></div>`).join('')}</div></div>`)}
${at(660, 128, `<div style="width:420px;">${kick('量の見込み（推定）')}<div style="display:flex; flex-direction:column; gap:22px; margin-top:14px;">${bigNum('12.6万', `ページ ＝ ${COUNTS.mbGoodsMid}単位 × 60商品 × 4ページ`, { size: 48 })}${bigNum('4.4', '1ホスト・3秒ごと（1日2.88万ページ）で1回目を読み終える', { size: 48, sub: '日' })}${bigNum('12.6万', '回の AI 呼び出し（30件で1回）', { size: 48 })}${bigNum('約250', 'AI の無料枠（1日500回）のままなら、分類し終えるまで', { size: 48, color: C.negText, sub: '日' })}</div><div style="font-size:12.5px; color:${C.ink2}; margin-top:18px; line-height:1.7;">→ 有料枠を使う（単価は未確認）か、最初は範囲を絞る（C16 の問い2・4）</div></div>`)}
${at(1130, 128, `<div style="width:398px; display:flex; flex-direction:column; gap:14px;">${box(`${kick('読む順番')}<div style="font-size:15px; font-weight:700; line-height:1.6;">優先度 ＝ 検索の需要 × 1件の報酬 × 読める見込み</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.65;">1件の報酬＝価格×料率（料率は未確認）。読める見込み＝30件以上ある商品の割合。「読んでほしい」の数も需要に足す</div>`, { pad: 18, gap: 8 })}${box(`${kick('読める見込み（測った）')}${[...MEASURE.cats.map((c) => [c.name, c.deep[0], c.deep[1], '30件以上']), ['イヤホン', MEASURE.earbudsDeep[0], MEASURE.earbudsDeep[1], '1件以上']].map(([n, a, b, t]) => `<div style="display:grid; grid-template-columns:120px 1fr 70px; gap:8px; align-items:center; font-size:12.5px;"><span>${n}</span>${pctBar(pct(a, b), 130)}<span style="font-family:${F.mono}; font-size:12px; text-align:right;">${a}/${b}</span></div>`).join('')}<div style="font-size:11.5px; color:${C.muted};">イヤホンは商品価格ナビの97商品で、レビューが1件以上ある数（52商品は0件）</div>`, { pad: 18, gap: 8 })}${box(`${kick('2種類の商品')}<div style="font-size:12.5px; color:${C.ink2}; line-height:1.65;"><b style="color:${C.ink};">メーカー品</b>（家電・コスメ）：同じ型が複数のページに。統合キーは未解決<br><b style="color:${C.ink};">お店の商品</b>（コーヒー・服・家具）：1つのお店が単位を埋めやすい（見本で8のうち5）</div>`, { pad: 18, gap: 6 })}</div>`)}
${at(72, 640, `<div style="width:1000px;">${box(`${kick('範囲ごとの見込み（推定。1単位＝60商品×4ページ）')}<div style="display:grid; grid-template-columns:220px 1fr 1fr 1fr; gap:10px; font-family:${F.mono}; font-size:11px; color:${C.muted}; margin-top:4px;"><span>範囲</span><span>ページ（＝AI 呼び出し）</span><span>読む時間（1ホスト）</span><span>AI 無料枠で</span></div>${[['1単位', 1], ['需要の高い10単位（問い2 ②）', 10], ['1つの系統（着る・履く 35）', 35], ['物販すべて（526）', 526]].map(([t, u]) => { const pg = u * 240; const hrs = (pg * 3) / 3600; return `<div style="display:grid; grid-template-columns:220px 1fr 1fr 1fr; gap:10px; padding:9px 0; border-top:1px solid ${C.hair}; font-size:13px; align-items:center;"><b>${t}</b><span style="font-family:${F.mono};">${pg.toLocaleString('ja-JP')}</span><span style="font-family:${F.mono};">${hrs < 24 ? `${hrs < 1 ? Math.round(hrs * 60) + '分' : hrs.toFixed(1) + '時間'}` : (hrs / 24).toFixed(1) + '日'}</span><span style="font-family:${F.mono}; ${pg / 500 > 30 ? `color:${C.negText};` : ''}">${(pg / 500).toFixed(1)}日</span></div>`; }).join('')}`, { pad: 20, gap: 4 })}</div>`)}
`, { src: 'meas' });
}

// ---------- C14 お金 ----------
function c14() {
  const levers = [['1クリックの価値', '価格 × 料率 × 購入率', '料率はカテゴリとお店で違う（未確認）。確かめてから優先度に入れる'], ['使って減るモノ', `また買った：コーヒー ${pct(MEASURE.cats[2].rep, MEASURE.cats[2].n)}%・化粧水 ${pct(MEASURE.cats[0].rep, MEASURE.cats[0].n)}%`, '「わたしの棚」から同じものをもう一度買える。戻る理由と収益の両方'], ['贈る', `贈り物として買った声：コーヒー ${MEASURE.cats[2].gift}件`, '「贈る」の入口。自分用の声と分けて数える'], ['検索の受け口', '単位 × 観点 × 条件', 'ロングテール。ゲートを通ったものだけ']];
  const rules = ['購入の案内は、声の後に1か所（楽天＋Amazon は審査後）', '広告は決めた枠だけ。ものさし・地図・声札の中には入れない', '段0のページには広告を置かない（薄いページで稼がない）', '並び順を送客先で変えない。順位も「おすすめ」も付けない', '「読んでほしい」は需要として数えるだけ。お金を受け取って読む順を変えない'];
  return frame('14', 'お金', `
${at(72, 128, `<div style="width:900px; display:flex; flex-direction:column; gap:12px;">${levers.map(([t, a, b]) => box(`<div style="display:grid; grid-template-columns:170px 290px 1fr; gap:16px; align-items:center;"><b style="font-size:16px;">${t}</b><span style="font-family:${F.mono}; font-size:13px;">${a}</span><span style="font-size:13px; color:${C.ink2}; line-height:1.6;">${b}</span></div>`, { pad: 20 })).join('')}</div>`)}
${at(72, 486, `<div style="width:900px;">${box(`${kick('守ること（信用がそのまま収益の前提）')}${bl(rules)}`, { pad: 22, gap: 8 })}</div>`)}
${ph(sCoffee(), 1020, 486, 0.44)}
${at(1220, 500, `<div style="width:300px; font-size:12.5px; color:${C.ink2}; line-height:1.7;">使って減るモノは、声札のいちばん下に「また買った」。保存した商品は<b style="color:${C.ink};">「わたしの棚」から同じものをもう一度</b>買える（見本：コーヒー）</div>`)}
${at(1020, 128, `<div style="width:508px; display:flex; flex-direction:column; gap:14px;">${box(`${kick('今の数字（docs/01）')}<div style="font-size:13px; color:${C.ink2}; line-height:1.7;">イヤホン ¥8,000 × 3% ＝ 1件240円。月10万円なら約420件、月20万セッションが要る。<b style="color:${C.ink};">地図の出来より、単価がボトルネックになりやすい</b></div>`, { pad: 20, gap: 6 })}${box(`${kick('全ジャンルにして変わること')}<div style="font-size:13px; color:${C.ink2}; line-height:1.7;">単価の高いカテゴリ（家電・家具）と、回数の多いカテゴリ（食べる・肌と髪）を<b style="color:${C.ink};">両方</b>持てる。読む順番（C13）で、単価と回数の両方を見る</div>`, { pad: 20, gap: 6 })}${box(`${kick('未確認')}<div style="font-size:13px; color:${C.ink2}; line-height:1.7;">カテゴリごとの料率・Amazon の審査・広告の単価。数字を置く前に確かめる</div>`, { pad: 20, gap: 6 })}</div>`)}
`, { src: 'meas' });
}

// ---------- C15 危ういこと ----------
function c15() {
  const risks = [
    ['条件で分母が小さくなる', '条件を書くのは1〜2割', '全体を並べる・20件未満は小さく・カテゴリ全体で先に言う', 'high'],
    ['条件の抽出も AI', '「敏感肌ですが」を読み違える', '「本人が書いた条件（AIが抽出）」と明示。人手で抜き取り検査', 'mid'],
    ['ちょうど・また買ったの精度', '今回は単語の規則だけ', 'イヤホンで抽出し直して測る（問い5）', 'mid'],
    ['AI の費用', '無料枠なら約250日', '有料枠か、範囲を絞る（問い4）', 'high'],
    ['同じ型の別ページ・色違い', '見本で1組。統合キーは未解決', '統合キーの設計からやり直す（02 第10節）', 'mid'],
    ['お店の偏り', 'コーヒーは8のうち5が1店', 'お店ごとの上限・偏りを画面に出す', 'mid'],
    ['一覧の 503', 'ペットフード・家電で4回', '間をあけて1回だけ。繰り返し叩かない', 'low'],
    ['Amazon のレビュー本文', 'アクセス制御がある', '取らない。★と件数だけ（審査後）', 'low'],
    ['辞書と場所の割り振り', '案だけ。526単位には未適用', '需要の高い順に承認していく', 'mid'],
  ];
  const col = { high: C.neg, mid: C.faint, low: C.tile2 };
  return frame('15', '危ういこと・まだできないこと', `
${at(72, 128, `<div style="width:1456px;"><div style="display:grid; grid-template-columns:14px 280px 330px 1fr; gap:16px; font-family:${F.mono}; font-size:11px; color:${C.muted}; padding-bottom:6px;"><span></span><span>何が</span><span>いま分かっていること</span><span>どうする</span></div>${risks.map(([a, b, c, lv]) => `<div style="display:grid; grid-template-columns:14px 280px 330px 1fr; gap:16px; padding:13px 0; border-top:1px solid ${C.hair}; font-size:13.5px; line-height:1.55; align-items:center;"><span style="width:10px; height:10px; border-radius:50%; background:${col[lv]};"></span><b>${a}</b><span style="color:${C.ink2};">${b}</span><span>${c}</span></div>`).join('')}<div style="display:flex; gap:18px; font-size:12px; color:${C.muted}; margin-top:12px;"><span style="display:flex; gap:6px; align-items:center;"><span style="width:10px; height:10px; border-radius:50%; background:${C.neg};"></span>先に決める</span><span style="display:flex; gap:6px; align-items:center;"><span style="width:10px; height:10px; border-radius:50%; background:${C.faint};"></span>実装の前に測る</span><span style="display:flex; gap:6px; align-items:center;"><span style="width:10px; height:10px; border-radius:50%; background:${C.tile2};"></span>作法で防ぐ</span></div></div>`)}
${at(72, 660, `<div style="width:1456px;">${box(`${kick('実装の前に測ること（この順で）')}<div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:16px; margin-top:6px;">${[['イヤホンを抽出し直す', '3つの型と条件つきで。条件がどれだけ書かれているか（AI）'], ['規則と AI の一致', '見本3カテゴリを AI で分類し、人手100件の抜き取りで確かめる'], ['条件のゲート', '20件は妥当か。全体との差が偶然でないかを測る'], ['地図のゲート', '同ブランドの近さ・仕様の近さ（段3の条件）'], ['料率', 'カテゴリごとに確かめ、読む順番の式に入れる']].map(([t, s2], i) => `<div style="display:flex; gap:10px;">${dot(i + 1, { size: 24 })}<div><div style="font-size:14px; font-weight:700;">${t}</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.6; margin-top:3px;">${s2}</div></div></div>`).join('')}</div>`, { pad: 22, gap: 8 })}</div>`)}
`, { src: 'meas' });
}

// ---------- C16 A・B・C と決めてほしいこと ----------
function c16() {
  const rows = [['主役', '商品の地図（点と声のリング）', 'モノの地図（商品の絵）', '声札と、似た人の声'], ['規模', '1ジャンル', '1ジャンル', '物販 526 カテゴリ〜'], ['区分', 'ジャンルの一覧', 'ジャンルの一覧', '単位・系統・入口の3層'], ['声', '満足・不満', '満足・不満（半円のゲージ）', '良し悪し・ちょうど・また買った＋条件'], ['地図', '最初から', '最初から', '読めたカテゴリだけ（段3）'], ['見た目', '仮', 'ほぼ白黒', '紙と札']];
  const qs = [['進める案', 'A／B／C／混ぜる（例：C の区分と声の型 ＋ B の見た目）'], ['最初に出す範囲', '①1つの系統を深く ②系統をまたいで需要の高い10単位 ③全部を段0で出して順に深める'], ['わたしの条件', '端末の中だけ（登録なし）でよいか'], ['AI の有料枠', '使うか。使わないなら範囲を絞る'], ['最初の検証', 'イヤホンを「ちょうど・条件・また買った」つきで抽出し直してよいか']];
  return frame('16', 'A・B・C と決めてほしいこと', `
${at(72, 128, `<div style="width:900px;"><div style="display:grid; grid-template-columns:100px repeat(3, 1fr); gap:12px; font-size:13px; font-weight:700; padding-bottom:8px;"><span></span><span>案A</span><span>別案B</span><span>別案C（全ジャンル）</span></div>${rows.map(([k, a, b, c]) => `<div style="display:grid; grid-template-columns:100px repeat(3, 1fr); gap:12px; padding:12px 0; border-top:1px solid ${C.hair}; font-size:13px; line-height:1.55;"><b>${k}</b><span style="color:${C.ink2};">${a}</span><span style="color:${C.ink2};">${b}</span><span>${c}</span></div>`).join('')}<div style="font-size:12.5px; color:${C.ink2}; margin-top:14px; line-height:1.7;">C は B と対立しない。<b style="color:${C.ink};">C の骨組み（区分・声の型・条件・段）に、B の地図と見た目を載せる</b>こともできる。A・B のキャンバスは残してある</div></div>`)}
${at(1020, 128, `<div style="width:508px; display:flex; flex-direction:column; gap:12px;">${kick('決めてほしいこと')}${qs.map(([t, s], i) => box(`<div style="display:flex; gap:12px;">${dot(i + 1, { size: 26, bg: C.neg })}<div><div style="font-size:15px; font-weight:700;">${t}</div><div style="font-size:12.5px; color:${C.ink2}; line-height:1.65; margin-top:3px;">${s}</div></div></div>`, { pad: 16 })).join('')}<div style="font-size:12px; color:${C.muted}; line-height:1.6;">チャットで番号を付けて答えてください（例：1 C、2 ②、3 はい）。直したい所は、その板にコメントを</div></div>`)}
${at(72, 520, `<div style="width:900px;">${box(`${kick('承認の後の進め方（案）')}<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:14px; margin-top:6px;">${[['1', 'イヤホンを抽出し直す', '型・条件・数えないもの'], ['2', '見本3カテゴリを AI で', '規則との一致を測る'], ['3', '画面を作る', '声札・ものさし・段・条件'], ['4', '範囲を広げる', '問い2の答えに沿って']].map(([n, t, s2]) => `<div style="display:flex; gap:10px;">${dot(n, { size: 24 })}<div><div style="font-size:14px; font-weight:700;">${t}</div><div style="font-size:12px; color:${C.ink2}; margin-top:2px;">${s2}</div></div></div>`).join('')}</div>`, { pad: 22, gap: 8 })}</div>`)}
${at(72, 690, `<div style="width:900px; font-size:12.5px; color:${C.ink2}; line-height:1.8;"><b style="color:${C.ink};">残してあるキャンバス</b><br>案A：<span style="font-family:${F.mono}; font-size:12px;">claude.ai/artifact/TY4A6KaZScvrHLgLteyoEw</span><br>別案B：<span style="font-family:${F.mono}; font-size:12px;">claude.ai/artifact/17R9ZWAfg6GoPSRNK7vxZm</span></div>`)}
`, { src: 'none' });
}

export const SHEETS_C = [
  ['Main.dc.html', 'C00 前提が変わった', c00], ['C01.dc.html', 'C01 カテゴリを読む', c01], ['C02.dc.html', 'C02 測ってみた', c02], ['C03.dc.html', 'C03 コンセプト', c03],
  ['C04.dc.html', 'C04 区分の3層', c04], ['C05.dc.html', 'C05 声の3つの型', c05], ['C06.dc.html', 'C06 観点の辞書と承認', c06], ['C07.dc.html', 'C07 似た人の声', c07],
  ['C08.dc.html', 'C08 読めた深さの4段', c08], ['C09.dc.html', 'C09 入口とホーム', c09], ['C10.dc.html', 'C10 体験の流れ', c10], ['C11.dc.html', 'C11 画面の文法', c11],
  ['C12.dc.html', 'C12 デザイン言語', c12], ['C13.dc.html', 'C13 読む順番と量', c13], ['C14.dc.html', 'C14 お金', c14], ['C15.dc.html', 'C15 危ういこと', c15], ['C16.dc.html', 'C16 A・B・C と決めてほしいこと', c16],
];

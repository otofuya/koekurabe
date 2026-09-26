import { h } from "../app/dom.ts";
import type { Page } from "../app/router.ts";
import { setHead } from "../app/head.ts";
import { SITE, hasAds } from "../app/site.ts";
import { categoryIds, genre } from "../app/data.ts";
import { aboutHead } from "@lib/seo-model.ts";

/** 運営者の表記（公開ページ共通。~/.claude/memory/accounts.md）。 */
const OPERATOR = { name: "おとうふや", mail: "otofuya22@gmail.com" };

const dateJa = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

/**
 * このサイトについて：数え方・引用・広告・プライバシー・運営者。
 * 広告の段は、アフィリエイトの ID があるときだけ出す（無いときは広告が無いので）。
 */
export function aboutPage(app: HTMLElement): Page {
  setHead(aboutHead(SITE));
  const genres = categoryIds().map((id) => genre(id)!);
  const asOf = dateJa(genres[0]?.generatedAt ?? "");

  app.append(h("article", { class: "about" },
    h("h1", null, "このサイトについて"),
    h("p", { class: "about__lead" }, "楽天の商品レビューを読んで、よかったこと・残念だったことを項目ごとに数えています。"),

    h("section", { class: "about__sec" },
      h("h2", null, "数え方"),
      h("ul", null,
        h("li", null, "AI（Google の Gemini）がレビューを1件ずつ読み、項目ごとに「よかった」「残念だった」を分けます。"),
        h("li", null, "件数は、その分け方をコードが数えたものです。分母は、読んだレビューの件数です。"),
        h("li", null, "1件のレビューが、同じ項目の「よかった」と「残念だった」の両方に入ることがあります。"),
        h("li", null, "読んだレビューが30件未満の商品は、数字がぶれやすいので「まだ少ない」と書いています。"),
        h("li", null, "並びは「残念が少ない順」です。点数や順位は付けていません。"),
        h("li", null, "年代・性別・最近1年で絞って数えられます。年代と性別は、レビューの人が楽天で自分で選んだ欄です。"),
        h("li", null, "「★を下げている残念」は、その残念があったレビューの★の平均と、ほかのレビューの★の平均を並べたものです。"),
        h("li", null, "サイズ感のような好みは、よかった・残念だったではなく「小さめ｜ちょうど｜大きめ」で数えます。"),
        genres.map((g) => h("li", null, `${g.label}：${g.coverage.total}商品のうち${g.coverage.analysed}商品、レビュー${g.coverage.reviewsRead.toLocaleString("ja-JP")}件を読みました。`)))),

    h("section", { class: "about__sec" },
      h("h2", null, "ひとこと（引用）"),
      h("ul", null,
        h("li", null, "画面の「ひとこと」は、レビューの原文と1文字ずつ照合した短い引用です。照合できなかったものは、件数ごと捨てています。"),
        h("li", null, "引用には出典（楽天のレビューのページ）へのリンクを付けています。レビューの本文は載せていません。"))),

    h("section", { class: "about__sec" },
      h("h2", null, "値段・★・在庫"),
      h("ul", null,
        h("li", null, `値段・★・レビュー数は、楽天から取得した時点の値です${asOf ? `（${asOf}）` : ""}。`),
        h("li", null, "買う前に、楽天の商品ページで今の値段と在庫を確かめてください。"),
        h("li", null, "AI の分け方には、まちがいが入ることがあります。"))),

    hasAds() ? h("section", { class: "about__sec" },
      h("h2", null, "広告"),
      h("ul", null,
        h("li", null, "このサイトは楽天アフィリエイトに参加しています。「楽天で見る」は広告のリンクで、「PR」の印を付けています。"),
        h("li", null, "このリンクから買われると、運営者に紹介料が入ります。"),
        h("li", null, "紹介料は、件数・並び・乗り換え先の選び方に使っていません。"))) : null,

    h("section", { class: "about__sec" },
      h("h2", null, "プライバシー"),
      h("ul", null,
        h("li", null, "登録はありません。"),
        h("li", null, "「気になる」・最近見た商品・くらべるに入れた商品は、この端末のブラウザにだけ残ります。サーバーには送りません。"),
        h("li", null, "文字の表示に Google Fonts を使っています。フォントを読み込むとき、Google に接続します。"),
        hasAds() ? h("li", null, "楽天のリンクを押したあとは、楽天のサイトの決まりでクッキーが使われます。") : null)),

    h("section", { class: "about__sec" },
      h("h2", null, "運営者"),
      h("dl", { class: "about__dl" },
        h("dt", null, "運営"), h("dd", null, OPERATOR.name),
        h("dt", null, "連絡先"), h("dd", null, OPERATOR.mail))),

    SITE.provisional ? h("p", { class: "fine" }, `「${SITE.name}」は仮の名前です。`) : null));
  return {};
}

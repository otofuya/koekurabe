import { READ_ENOUGH, nakami, displayName } from "./nakami-model.ts";
import type { AspectProduct } from "./aspect-model.ts";

/**
 * 検索とシェアに出す「ページの頭」。題・説明・検索に出すか・正規の URL・パンくず。
 *
 * 文はすべて件数から組み立てる定型文（設計原則5）。★は楽天の値なので、構造化データの
 * 評価（AggregateRating）には入れない（ほかのサイトの評価をまとめた印は Google の決まりで使えない）。
 *
 * 検索に出すのは、くわしく読めた商品と、並べられる観点があるカテゴリだけ（docs/09 第9節の段）。
 * 読めていない・少ししか読めていない商品のページは、中身が薄いので出さない。
 */

export type Crumb = { name: string; path: string };

export type Head = {
  title: string;
  description: string;
  /** 正規の URL のパス（クエリなし）。 */
  path: string;
  /** 検索に出してよいページか。サイトを公開していないあいだは、これに関係なく出さない。 */
  index: boolean;
  /** シェア用の画像のパス。無ければサイト共通の画像。 */
  image?: string;
  crumbs?: Crumb[];
};

export type Site = { name: string; url: string; public: boolean };

export const SITE_TAGLINE = "★の数では、わからないこと";
export const SITE_DESCRIPTION = "★の数では、わからないこと。買った人のレビューを読んで、よかったこと・残念だったことを数えました。";

/** 商品ページを検索に出すか。くわしく読めた（30件以上）商品だけ。 */
export function productIndexable(reviewsRead: number | null) {
  return (reviewsRead ?? 0) >= READ_ENOUGH;
}

/** カテゴリを検索に出すか。くわしく読めた商品があり、並べられる観点が1つ以上（段2）。 */
export function categoryIndexable(readEnoughCount: number, offerableCount: number) {
  return readEnoughCount >= 1 && offerableCount >= 1;
}

const joinTop = (lines: { key: string; count: number }[], word: (key: string) => string) =>
  lines.map((line) => `${word(line.key)}${line.count}件`).join("・");

export type ProductInput = {
  productId: string;
  name: string;
  reviewCount: number;
  reviewsRead: number | null;
  aspects: AspectProduct["aspects"] | null;
};

export type CategoryInput = { id: string; label: string };

export function productHead(p: ProductInput, category: CategoryInput, order: readonly string[], word: (key: string) => string, site: Site): Head {
  const name = displayName(p.name);
  const path = `/reviews/${p.productId}`;
  const crumbs = [{ name: site.name, path: "/" }, { name: category.label, path: `/compare/${category.id}` }, { name, path }];
  if (!p.aspects || !p.reviewsRead) {
    return {
      title: `${name}｜${site.name}`,
      description: p.reviewCount
        ? `${category.label}。楽天のレビュー${p.reviewCount.toLocaleString("ja-JP")}件は、まだ読んでいません。`
        : `${category.label}。楽天にレビューがまだ無い商品です。`,
      path,
      index: false,
      crumbs,
    };
  }
  const { good, bad } = nakami({ id: p.productId, reviewsRead: p.reviewsRead, aspects: p.aspects }, order, 3);
  const parts = [`楽天のレビュー${p.reviewsRead}件を読んで数えました。`];
  if (good.length) parts.push(`よかった：${joinTop(good, word)}。`);
  if (bad.length) parts.push(`残念だった：${joinTop(bad, word)}。`);
  return {
    title: `${name}の口コミ｜よかった・残念だったを数えました｜${site.name}`,
    description: parts.join(""),
    path,
    index: productIndexable(p.reviewsRead),
    image: productIndexable(p.reviewsRead) ? `/og/${p.productId}.png` : undefined,
    crumbs,
  };
}

export type CategoryStats = { total: number; analysed: number; reviewsRead: number; readEnough: number; offerable: readonly string[] };

export function categoryHead(category: CategoryInput, stats: CategoryStats, word: (key: string) => string, site: Site): Head {
  const path = `/compare/${category.id}`;
  const words = stats.offerable.slice(0, 4).map(word);
  return {
    title: `${category.label}を、買った人の声でくらべる｜${site.name}`,
    description: stats.analysed
      ? `${category.label}${stats.total}商品のうち${stats.analysed}商品、レビュー${stats.reviewsRead.toLocaleString("ja-JP")}件を読みました。${words.length ? `${words.join("・")}など、` : ""}気になることの残念が少ない順に並べます。`
      : `${category.label}${stats.total}商品。レビューはまだ読んでいません。`,
    path,
    index: categoryIndexable(stats.readEnough, stats.offerable.length),
    crumbs: [{ name: site.name, path: "/" }, { name: category.label, path }],
  };
}

export function homeHead(site: Site): Head {
  return { title: `${site.name}｜${SITE_TAGLINE}`, description: SITE_DESCRIPTION, path: "/", index: true };
}

/** くらべるは組み合わせが多く、どれも同じ商品ページの言い換えなので検索に出さない。 */
export function vsHead(aName: string, bName: string, site: Site, path: string): Head {
  const a = displayName(aName), b = displayName(bName);
  return { title: `${a}と${b}をくらべる｜${site.name}`, description: `${a}と${b}の、よかった・残念だったの件数をくらべます。`, path, index: false };
}

export function aboutHead(site: Site): Head {
  return {
    title: `このサイトについて｜${site.name}`,
    description: `${site.name}の数え方・広告・プライバシー・運営者。`,
    path: "/about",
    index: true,
    crumbs: [{ name: site.name, path: "/" }, { name: "このサイトについて", path: "/about" }],
  };
}

export function notFoundHead(site: Site, path: string): Head {
  return { title: `見つかりません｜${site.name}`, description: SITE_DESCRIPTION, path, index: false };
}

/** meta robots の値。公開前はすべて出さない。 */
export const robotsValue = (head: Head, site: Site) => (site.public && head.index ? "index,follow" : "noindex,follow");

export const absoluteUrl = (site: Site, path: string) => site.url.replace(/\/$/, "") + path;

/** パンくずの構造化データ（BreadcrumbList）。評価の印は付けない。 */
export function breadcrumbLd(head: Head, site: Site) {
  if (!head.crumbs || head.crumbs.length < 2) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: head.crumbs.map((crumb, i) => ({ "@type": "ListItem", position: i + 1, name: crumb.name, item: absoluteUrl(site, crumb.path) })),
  };
}

const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** 検索に出すページだけのサイトマップ。 */
export function sitemapXml(site: Site, entries: { path: string; lastmod?: string }[]) {
  const urls = entries.map((e) => `  <url><loc>${escapeXml(absoluteUrl(site, e.path))}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}</url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

/** 公開前は、すべてのクローラーに読まないよう頼む。 */
export function robotsTxt(site: Site) {
  return site.public
    ? `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(site, "/sitemap.xml")}\n`
    : "User-agent: *\nDisallow: /\n";
}

/**
 * 楽天アフィリエイトのリンク。ID が無いときは元の URL のまま（資格情報が無い機能は黙って消す。docs/04）。
 * 楽天のドメインの URL だけを包む。
 */
export function affiliateUrl(url: string, affiliateId: string) {
  const id = affiliateId.trim();
  if (!id || !/^[\w.-]+$/.test(id)) return url;
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return url;
  }
  if (!/(^|\.)rakuten\.co\.jp$/.test(host)) return url;
  const encoded = encodeURIComponent(url);
  return `https://hb.afl.rakuten.co.jp/hgc/${id}/?pc=${encoded}&m=${encoded}`;
}

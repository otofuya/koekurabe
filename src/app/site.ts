import type { Site } from "@lib/seo-model.ts";
import { affiliateUrl } from "@lib/seo-model.ts";

/**
 * サイトの設定。ビルドのときの環境変数から（.env.local に書く。docs/13）。
 * 名前を変えるときは、ここと scripts/prerender.mjs の SITE_NAME・index.html の title を直す。
 */
export const SITE: Site & { affiliateId: string; provisional: boolean } = {
  // 2026-09-26 にオーナーが決めた（2回目の候補の D）。★の名前は伝わりにくいので、見た人がすぐ分かる言葉に
  name: "買った人の声",
  provisional: false,
  url: (import.meta.env.VITE_SITE_URL || "https://koekurabe.pages.dev").replace(/\/$/, ""),
  public: import.meta.env.VITE_SITE_PUBLIC === "1",
  affiliateId: import.meta.env.VITE_RAKUTEN_AFFILIATE_ID || "",
};

/** 広告のリンクがあるか（アフィリエイトの ID があるときだけ）。 */
export const hasAds = () => !!SITE.affiliateId;

export const shopUrl = (url: string) => affiliateUrl(url, SITE.affiliateId);

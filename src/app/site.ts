import type { Site } from "@lib/seo-model.ts";
import { affiliateUrl } from "@lib/seo-model.ts";

/**
 * サイトの設定。ビルドのときの環境変数から（.env.local に書く。docs/13）。
 * 名前はまだ仮。変えるときはここだけ直す。
 */
export const SITE: Site & { affiliateId: string; provisional: boolean } = {
  name: "★の中身",
  provisional: true,
  url: (import.meta.env.VITE_SITE_URL || "https://koekurabe.pages.dev").replace(/\/$/, ""),
  public: import.meta.env.VITE_SITE_PUBLIC === "1",
  affiliateId: import.meta.env.VITE_RAKUTEN_AFFILIATE_ID || "",
};

/** 広告のリンクがあるか（アフィリエイトの ID があるときだけ）。 */
export const hasAds = () => !!SITE.affiliateId;

export const shopUrl = (url: string) => affiliateUrl(url, SITE.affiliateId);

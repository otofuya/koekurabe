import { decodeHtml, extractProductLinks } from "./spec-parse-html.ts";

/**
 * Fetching manufacturer product pages.
 *
 * Discovery is the part that varies. Category listing pages turned out to be the worst entry
 * point of the three — Sony's renders its lineup client-side, so the served HTML yields one link
 * out of a hundred-odd models. Sitemaps and Shopify's own product JSON both hand over the full
 * lineup in one request, so they come first and HTML listings are the fallback.
 *
 * The politeness controls here are not the same thing as permission. The site owner authorised
 * this crawl; these settings keep it from being a burden on the servers it visits.
 */

export type Discovery =
  | { kind: "sitemap"; url: string }
  | { kind: "shopify"; collection: string; origin: string }
  | { kind: "listing"; urls: string[] }
  /**
   * Nothing to enumerate: the product's own model number spells the URL. For makers whose lineup
   * page renders client-side, this asks for exactly the pages wanted rather than crawling for
   * them, and a 404 is simply "this maker does not have that product".
   */
  | { kind: "model-path"; template: string };

export type CrawlConfig = {
  discovery: Discovery;
  /** Which of the discovered URLs are product pages for this genre. */
  productPath: RegExp;
  /** Sony keeps the spec table on a child page; appended to the product URL when set. */
  specPathSuffix?: string;
};

export type FetchedPage = { url: string; html: string; status: number; fromCache: boolean };

export const USER_AGENT = "AffiliateMapSpecBot/1.0 (+https://uma-free.com/)";

/** Three seconds between requests to one host, well under anything that would be noticed. */
export const DEFAULT_INTERVAL_MS = 3_000;
const MAX_ATTEMPTS = 3;
const RETRY_BASE_MS = 2_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type CacheEntry = { html: string; etag?: string; lastModified?: string; fetchedAt: string };
export type PageCache = {
  get(url: string): Promise<CacheEntry | null>;
  set(url: string, entry: CacheEntry): Promise<void>;
};

export type CrawlerOptions = {
  intervalMs?: number;
  cache?: PageCache | null;
  /** Hard ceiling per run, so a bad pattern cannot turn into an unbounded crawl. */
  maxRequests?: number;
  onProgress?: (message: string) => void;
};

/**
 * robots.txt is honoured even though the owner's authorisation is what permits this crawl at all.
 * The two are independent: permission came from the site owner here, while `Disallow` tells us
 * which paths the *remote* operator does not want fetched. Respecting it costs nothing — the
 * product paths this needs are outside every `Disallow` on the sites checked.
 */
export class RobotsRules {
  private disallow: string[] = [];

  static parse(text: string) {
    const rules = new RobotsRules();
    let applies = false;
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.replace(/#.*$/, "").trim();
      if (!line) continue;
      const [field, ...rest] = line.split(":");
      const value = rest.join(":").trim();
      const name = field.trim().toLowerCase();
      if (name === "user-agent") applies = value === "*" || value.toLowerCase().includes("affiliatemapspecbot");
      else if (applies && name === "disallow" && value) rules.disallow.push(value);
    }
    return rules;
  }

  allows(pathname: string) {
    return !this.disallow.some((rule) => {
      // Only the `*` wildcard is common enough in these files to be worth supporting.
      if (!rule.includes("*")) return pathname.startsWith(rule);
      const pattern = new RegExp("^" + rule.split("*").map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*"));
      return pattern.test(pathname);
    });
  }
}

export class MakerCrawler {
  private lastRequestAt = new Map<string, number>();
  private robots = new Map<string, RobotsRules | null>();
  private requestCount = 0;
  private readonly options: CrawlerOptions;

  constructor(options: CrawlerOptions = {}) { this.options = options; }

  private get intervalMs() { return this.options.intervalMs ?? DEFAULT_INTERVAL_MS; }
  get requestsMade() { return this.requestCount; }

  private async throttle(host: string) {
    const last = this.lastRequestAt.get(host);
    if (last !== undefined) {
      const wait = this.intervalMs - (Date.now() - last);
      if (wait > 0) await sleep(wait);
    }
    this.lastRequestAt.set(host, Date.now());
  }

  private async robotsFor(origin: string) {
    if (this.robots.has(origin)) return this.robots.get(origin) ?? null;
    let rules: RobotsRules | null = null;
    try {
      await this.throttle(new URL(origin).host);
      const response = await fetch(`${origin}/robots.txt`, { headers: { "user-agent": USER_AGENT } });
      if (response.status === 401 || response.status === 403) {
        throw new Error(`アクセス拒否 (${response.status}): ${origin}/robots.txt`);
      }
      // A missing or broken robots.txt means no stated restrictions, not a blanket refusal.
      if (response.ok) rules = RobotsRules.parse(await response.text());
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("アクセス拒否")) throw error;
      rules = null;
    }
    this.robots.set(origin, rules);
    return rules;
  }

  async allowed(url: string) {
    const target = new URL(url);
    const rules = await this.robotsFor(target.origin);
    return rules ? rules.allows(target.pathname) : true;
  }

  /** Fetch one page, honouring robots, the per-host interval, the run ceiling and the cache. */
  async fetchPage(url: string): Promise<FetchedPage | null> {
    if (this.options.maxRequests !== undefined && this.requestCount >= this.options.maxRequests) return null;
    if (!(await this.allowed(url))) {
      this.options.onProgress?.(`robots.txt により取得しません: ${url}`);
      return null;
    }
    const cached = (await this.options.cache?.get(url)) ?? null;
    const headers: Record<string, string> = { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml,application/json" };
    if (cached?.etag) headers["if-none-match"] = cached.etag;
    if (cached?.lastModified) headers["if-modified-since"] = cached.lastModified;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      await this.throttle(new URL(url).host);
      this.requestCount += 1;
      let response: Response;
      try {
        response = await fetch(url, { headers, redirect: "follow" });
      } catch {
        if (attempt === MAX_ATTEMPTS - 1) return null;
        await sleep(RETRY_BASE_MS * 2 ** attempt);
        continue;
      }
      if (response.status === 304 && cached) return { url, html: cached.html, status: 304, fromCache: true };
      if (response.status === 401 || response.status === 403) {
        throw new Error(`アクセス拒否 (${response.status}): ${url}`);
      }
      if (response.status === 429 || response.status >= 500) {
        if (attempt === MAX_ATTEMPTS - 1) return null;
        const retryAfter = Number(response.headers.get("retry-after"));
        await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : RETRY_BASE_MS * 2 ** attempt);
        continue;
      }
      if (!response.ok) return null;
      const bytes = new Uint8Array(await response.arrayBuffer());
      const html = decodeHtml(bytes, response.headers.get("content-type"));
      await this.options.cache?.set(url, {
        html,
        etag: response.headers.get("etag") ?? undefined,
        lastModified: response.headers.get("last-modified") ?? undefined,
        fetchedAt: new Date().toISOString(),
      });
      return { url, html, status: response.status, fromCache: false };
    }
    return null;
  }

  /** Every product URL for one maker, by whichever route that maker actually supports. */
  async discover(config: CrawlConfig): Promise<string[]> {
    // A model-path maker has no list to walk; the caller builds one URL per product instead.
    if (config.discovery.kind === "model-path") return [];
    if (config.discovery.kind === "sitemap") return this.fromSitemap(config.discovery.url, config.productPath);
    if (config.discovery.kind === "shopify") return this.fromShopify(config.discovery, config.productPath);
    const found: string[] = [];
    for (const listing of config.discovery.urls) {
      const page = await this.fetchPage(listing);
      if (page) found.push(...extractProductLinks(page.html, listing, config.productPath));
    }
    return [...new Set(found)];
  }

  private async fromSitemap(url: string, productPath: RegExp, depth = 0): Promise<string[]> {
    const page = await this.fetchPage(url);
    if (!page) return [];
    const locations = [...page.html.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((match) => match[1]);
    // A sitemap index points at more sitemaps; one level of following is enough for these sites.
    if (/<sitemapindex/i.test(page.html) && depth < 1) {
      const nested: string[] = [];
      for (const child of locations) nested.push(...await this.fromSitemap(child, productPath, depth + 1));
      return [...new Set(nested)];
    }
    return [...new Set(locations.filter((location) => {
      try { return productPath.test(new URL(location).pathname); } catch { return false; }
    }))];
  }

  private async fromShopify(discovery: Extract<Discovery, { kind: "shopify" }>, productPath: RegExp) {
    const url = `${discovery.origin}/collections/${encodeURIComponent(discovery.collection)}/products.json?limit=250`;
    const page = await this.fetchPage(url);
    if (!page) return [];
    let parsed: { products?: { handle?: string }[] };
    try { parsed = JSON.parse(page.html); } catch { return []; }
    return (parsed.products ?? [])
      .map((product) => `${discovery.origin}/products/${product.handle}`)
      .filter((productUrl) => { try { return productPath.test(new URL(productUrl).pathname); } catch { return false; } });
  }

  /** The page carrying the spec table, which is a child page on some sites and the product page elsewhere. */
  specUrlFor(productUrl: string, config: CrawlConfig) {
    if (!config.specPathSuffix) return productUrl;
    return new URL(config.specPathSuffix, productUrl.endsWith("/") ? productUrl : `${productUrl}/`).toString();
  }
}

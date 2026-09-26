/** Decode a fetched HTML response using its declared charset when available. */
export function decodeHtml(bytes: Uint8Array, contentType: string | null): string {
  const headerCharset = contentType?.match(/charset\s*=\s*["']?([^;\s"']+)/i)?.[1];
  const asciiPrefix = new TextDecoder("ascii").decode(bytes.subarray(0, Math.min(bytes.length, 2048)));
  const metaCharset = asciiPrefix.match(/<meta[^>]+charset\s*=\s*["']?([^\s"'/>]+)/i)?.[1]
    ?? asciiPrefix.match(/<meta[^>]+content=["'][^"']*charset\s*=\s*([^\s;"']+)/i)?.[1];
  const declared = (headerCharset ?? metaCharset ?? "utf-8").toLowerCase();
  const aliases: Record<string, string> = {
    "shift-jis": "shift_jis",
    "shift_jis": "shift_jis",
    "sjis": "shift_jis",
    "windows-31j": "shift_jis",
    "x-sjis": "shift_jis",
  };

  try {
    return new TextDecoder(aliases[declared] ?? declared).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

/** Extract absolute HTTP(S) product links from anchors on a listing page. */
export function extractProductLinks(html: string, baseUrl: string, productPath: RegExp): string[] {
  const links: string[] = [];
  const hrefPattern = /<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  for (const match of html.matchAll(hrefPattern)) {
    const href = (match[1] ?? match[2] ?? match[3] ?? "").replace(/&amp;/gi, "&");
    if (!href) continue;
    try {
      const url = new URL(href, baseUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") continue;
      productPath.lastIndex = 0;
      if (productPath.test(url.pathname)) links.push(url.toString());
    } catch {
      // Ignore malformed hrefs; a listing page commonly contains non-URL navigation tokens.
    }
  }
  return [...new Set(links)];
}

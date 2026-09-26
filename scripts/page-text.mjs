import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Where a page's readable text lives.
 *
 * Not in the tracked data files. The extracted values are short facts with a source attached and
 * belong in the repo so the pipeline can be audited without re-crawling; the pages themselves are
 * several hundred kilobytes of other people's writing — shop copy and marketing prose — and
 * fetching that to read is a different act from redistributing it. It is a working artifact, it
 * regenerates from the HTML cache beside it, and it stays out of version control.
 */
export const PAGE_TEXT_DIR = ".cache/page-text";

/**
 * Keyed by source as well as product. Both fetch scripts see the same products, and a shared path
 * meant whichever ran last silently replaced the other's text — re-running only the marketplace
 * fetch would have thrown away the manufacturer pages it had no way to fetch again.
 */
export function pageTextPath(rootDir, categoryId, source, productId) {
  return path.join(rootDir, PAGE_TEXT_DIR, categoryId, source, `${productId}.txt`);
}

export async function savePageText(rootDir, categoryId, source, productId, text) {
  const target = pageTextPath(rootDir, categoryId, source, productId);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, text, "utf8");
}

export async function loadPageText(rootDir, categoryId, source, productId) {
  return readFile(pageTextPath(rootDir, categoryId, source, productId), "utf8").catch(() => "");
}

function pageMetaPath(rootDir, categoryId, source, productId) {
  return pageTextPath(rootDir, categoryId, source, productId).replace(/\.txt$/, ".meta.json");
}

export async function savePageMeta(rootDir, categoryId, source, productId, meta) {
  const target = pageMetaPath(rootDir, categoryId, source, productId);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, JSON.stringify(meta) + "\n", "utf8");
}

export async function loadPageMeta(rootDir, categoryId, source, productId) {
  try {
    return JSON.parse(await readFile(pageMetaPath(rootDir, categoryId, source, productId), "utf8"));
  } catch {
    return null;
  }
}

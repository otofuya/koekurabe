import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * 楽天ウェブサービスの API（2026-07-01 版）。アプリ ID とアクセスキーの両方が要る。
 *
 * - 資格情報は環境変数か、プロジェクト直下の .dev.vars / .env.local（どちらも git に入らない）
 * - 1秒に1回まで。429・5xx は間をあけて3回まで。403 などはそこで止める（回避しない）
 */

export const ITEM_SEARCH = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701";
export const GENRE_SEARCH = "https://openapi.rakuten.co.jp/ichibams/api/IchibaGenre/Search/20260701";
export const INTERVAL_MS = 1_100;

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function rakutenCredentials(rootDir) {
  const vars = {};
  for (const file of [".dev.vars", ".env.local"]) {
    try {
      const text = await readFile(path.join(rootDir, file), "utf8");
      for (const line of text.split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
        if (m) vars[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch {}
  }
  const applicationId = process.env.RAKUTEN_APPLICATION_ID || vars.RAKUTEN_APPLICATION_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY || vars.RAKUTEN_ACCESS_KEY;
  if (!applicationId || !accessKey) {
    throw new Error("RAKUTEN_APPLICATION_ID と RAKUTEN_ACCESS_KEY が要ります（.dev.vars に書く。docs/13）");
  }
  return { applicationId, accessKey };
}

let lastCall = 0;

export async function callRakuten(endpoint, params, creds) {
  const wait = INTERVAL_MS - (Date.now() - lastCall);
  if (wait > 0) await sleep(wait);
  const url = new URL(endpoint);
  url.search = new URLSearchParams({ format: "json", formatVersion: "2", applicationId: creds.applicationId, ...params }).toString();
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    lastCall = Date.now();
    const response = await fetch(url, { headers: { accessKey: creds.accessKey } });
    if (response.status === 429 || response.status >= 500) {
      await sleep(INTERVAL_MS * 3 * attempt);
      continue;
    }
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`楽天 API ${response.status}: ${body.error_description ?? body.error ?? JSON.stringify(body).slice(0, 200)}`);
    return body;
  }
  throw new Error("楽天 API が混んでいて応答しませんでした（429・5xx が3回）。時間をあけて");
}

/** 商品検索の結果を、版の違い（formatVersion 1 / 2）に関係なく商品の配列にする。 */
export const itemsOf = (body) => (body.Items ?? body.items ?? []).map((entry) => entry.Item ?? entry);

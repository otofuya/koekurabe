import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Gemini の無料枠を守る（2026-09-26・オーナーの指示「UMA-FREE で分かっているレート制限を踏まえて」）。
 *
 * UMA-FREE の表（frontend/scripts/agents/model_tiers.ts）：Flash-Lite 系は 1分15回・1日500回・1分25万トークン。
 * - 呼び出しの間を4.5秒あける（1分に13回まで）
 * - 1日の回数を .cache/gemini-usage.json に記録し、自分で決めた上限を超えそうなら止める
 *   （同じ Google のプロジェクトを UMA-FREE と分け合うかもしれないので、上限は既定で低め）
 * - 1日の区切りは太平洋時間の0時（Gemini の1日の枠が戻る時刻）
 *
 * 枠切れ（429）はここではなく gemini.ts の stopOn429 で扱い、やり直さずに止める。
 */

export class QuotaStop extends Error {
  constructor(message) {
    super(message);
    this.name = "QuotaStop";
  }
}

export const MIN_INTERVAL_MS = 4_500;
export const DEFAULT_DAILY_LIMIT = 100;

export const pacificDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);

export async function createQuota({ rootDir, model, dailyLimit = DEFAULT_DAILY_LIMIT, minIntervalMs = MIN_INTERVAL_MS }) {
  const file = path.join(rootDir, ".cache", "gemini-usage.json");
  let usage = {};
  try { usage = JSON.parse(await readFile(file, "utf8")); } catch {}
  let last = 0;
  const entry = () => ((usage[pacificDate()] ??= {})[model] ??= { calls: 0, tokens: 0 });
  const persist = async () => {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(usage, null, 1) + "\n", "utf8");
  };
  return {
    limit: dailyLimit,
    used: () => usage[pacificDate()]?.[model]?.calls ?? 0,
    /** 1回ぶんを予約する。上限なら QuotaStop。間隔が足りなければ待つ。 */
    async reserve() {
      if ((usage[pacificDate()]?.[model]?.calls ?? 0) >= dailyLimit) {
        throw new QuotaStop(`今日（太平洋時間 ${pacificDate()}）の上限 ${dailyLimit}回に達しました。続きは明日`);
      }
      const wait = minIntervalMs - (Date.now() - last);
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      last = Date.now();
      entry().calls += 1;
      await persist();
    },
    async addTokens(tokens) {
      if (!tokens) return;
      entry().tokens += tokens;
      await persist();
    },
  };
}

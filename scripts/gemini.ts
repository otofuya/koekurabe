/**
 * The Gemini calls this project makes: text embeddings for the map's semantic component, and one
 * structured extraction that reads a manufacturer's page and returns spec values.
 *
 * Both are optional. Without a key the caller falls back — the embedding to a local hash vector,
 * the extraction to nothing at all — and says so in the generated data rather than failing the
 * batch. A missing key should cost quality, never a run.
 */

export type GeminiConfig = {
  apiKey: string;
  embeddingModel?: string;
  extractionModel?: string;
  /** Overridable so a test can point at a local server; the real host otherwise. */
  endpoint?: string;
  /** Called when a request is being retried, so a batch script can say why it is slow. */
  onRetry?: (attempt: number, status: number) => void;
};

const DEFAULT_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-001";
// gemini-2.5-flash is refused for new keys, and the API's own error points here.
const DEFAULT_EXTRACTION_MODEL = "gemini-3.6-flash";

/**
 * How many texts go in one request. Measured against a real key rather than the documented cap:
 * 50 is accepted, 100 comes back 429 on the free tier.
 */
export const EMBED_BATCH_SIZE = 50;

/** Between batches, so a long run does not spend its whole per-minute allowance at once. */
const BATCH_PAUSE_MS = 1_200;
const MAX_ATTEMPTS = 5;
const RETRY_BASE_MS = 5_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A rate limit is a "wait", not a "no".
 *
 * Returning null on the first 429 threw away every batch that had already succeeded, so a run that
 * was one request over the per-minute allowance produced nothing at all and silently fell back to
 * hash vectors.
 */
async function postWithRetry(url: string, body: string, onRetry?: (attempt: number, status: number) => void) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body });
    } catch {
      if (attempt === MAX_ATTEMPTS - 1) return null;
      await sleep(RETRY_BASE_MS * 2 ** attempt);
      continue;
    }
    if (response.status !== 429 && response.status < 500) return response;
    if (attempt === MAX_ATTEMPTS - 1) return response;
    onRetry?.(attempt + 1, response.status);
    const retryAfter = Number(response.headers.get("retry-after"));
    await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : RETRY_BASE_MS * 2 ** attempt);
  }
  return null;
}

/**
 * 768 rather than the model's full width. The vector is compressed to single digits by PCA
 * immediately afterwards, so paying for more dimensions buys nothing this pipeline can use.
 */
export const EMBEDDING_DIMENSIONS = 768;

const trimmed = (value: string, limit: number) => (value.length > limit ? value.slice(0, limit) : value);

export function chunk<T>(items: readonly T[], size: number) {
  const out: T[][] = [];
  for (let index = 0; index < items.length; index += size) out.push(items.slice(index, index + size));
  return out;
}

/**
 * Embeddings for a list of texts, in the same order.
 *
 * Returns null on any failure — a partial set would be worse than none, because the batch would
 * then mix real embeddings with hashed ones in a single vector space and the distances between
 * them would mean nothing.
 */
export async function embedTexts(texts: readonly string[], config: GeminiConfig): Promise<number[][] | null> {
  if (!config.apiKey || !texts.length) return null;
  const model = config.embeddingModel ?? DEFAULT_EMBEDDING_MODEL;
  const endpoint = config.endpoint ?? DEFAULT_ENDPOINT;
  const out: number[][] = [];
  const batches = chunk(texts, EMBED_BATCH_SIZE);
  for (const [index, batch] of batches.entries()) {
    if (index) await sleep(BATCH_PAUSE_MS);
    const response = await postWithRetry(
      `${endpoint}/models/${model}:batchEmbedContents?key=${encodeURIComponent(config.apiKey)}`,
      JSON.stringify({
        requests: batch.map((text) => ({
          model: `models/${model}`,
          content: { parts: [{ text: trimmed(text, 8_000) }] },
          outputDimensionality: EMBEDDING_DIMENSIONS,
        })),
      }),
      config.onRetry,
    );
    if (!response?.ok) return null;
    const body = await response.json().catch(() => null) as { embeddings?: { values?: number[] }[] } | null;
    const values = body?.embeddings?.map((item) => item.values ?? []);
    if (!values || values.length !== batch.length || values.some((vector) => !vector.length)) return null;
    out.push(...values);
  }
  return out;
}

export type JsonSchema = Record<string, unknown>;

/**
 * One structured-output call. The schema is passed to the API rather than described in the prompt,
 * so a malformed answer is the API's problem to retry rather than this code's to parse around.
 */
export async function generateStructured<T>(prompt: string, schema: JsonSchema, config: GeminiConfig): Promise<T | null> {
  if (!config.apiKey) return null;
  const model = config.extractionModel ?? DEFAULT_EXTRACTION_MODEL;
  const endpoint = config.endpoint ?? DEFAULT_ENDPOINT;
  const response = await postWithRetry(
    `${endpoint}/models/${model}:generateContent?key=${encodeURIComponent(config.apiKey)}`,
    JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        // Reading values off a page is not a creative task.
        temperature: 0,
      },
    }),
    config.onRetry,
  );
  if (!response?.ok) return null;
  const body = await response.json().catch(() => null) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  } | null;
  const text = body?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
  if (!text) return null;
  try { return JSON.parse(text) as T; } catch { return null; }
}

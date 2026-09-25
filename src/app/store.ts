/**
 * この端末にだけ覚えること（登録なし）。localStorage が使えない環境では覚えないだけで、画面は壊れない。
 * - 気になること：観点のキー（カテゴリごと）。どの商品でも先に見せる
 * - 最近見た商品・くらべるに入れた商品（2つまで）
 */
const PREFIX = "koe.";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* 覚えられない環境では何もしない */
  }
  listeners.forEach((fn) => fn(key));
}
const listeners = new Set<(key: string) => void>();
export function onStoreChange(fn: (key: string) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const asIds = (value: unknown) => (Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : []);

export const concerns = {
  get: (category: string) => asIds(read(`concerns.${category}`, [])),
  has: (category: string, key: string) => concerns.get(category).includes(key),
  toggle(category: string, key: string) {
    const now = concerns.get(category);
    const next = now.includes(key) ? now.filter((k) => k !== key) : [...now, key];
    write(`concerns.${category}`, next);
    return next.includes(key);
  },
};

export const recent = {
  get: () => asIds(read("recent", [])),
  add(id: string) {
    write("recent", [id, ...recent.get().filter((x) => x !== id)].slice(0, 8));
  },
};

export const tray = {
  get: () => asIds(read("tray", [])).slice(0, 2),
  has: (id: string) => tray.get().includes(id),
  toggle(id: string) {
    const now = tray.get();
    const next = now.includes(id) ? now.filter((x) => x !== id) : [...now, id].slice(-2);
    write("tray", next);
    return next.includes(id);
  },
  clear: () => write("tray", []),
};

export const once = {
  seen: (key: string) => read(`once.${key}`, false),
  mark: (key: string) => write(`once.${key}`, true),
};

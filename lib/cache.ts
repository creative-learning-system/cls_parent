const TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export async function fetchCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const entry = store.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.value as T;
  const value = await fetcher();
  store.set(key, { value, expiresAt: Date.now() + TTL_MS });
  return value;
}

export function invalidate(key: string): void {
  store.delete(key);
}

export function invalidateChild(studentId: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(`c${studentId}:`)) store.delete(key);
  }
}

export function clearCache(): void {
  store.clear();
}

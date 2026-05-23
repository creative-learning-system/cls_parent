const store = new Map<string, unknown>();

export async function fetchCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (store.has(key)) return store.get(key) as T;
  const result = await fetcher();
  store.set(key, result);
  return result;
}

export function invalidateChild(studentId: number): void {
  for (const key of store.keys()) {
    if (key.startsWith(`c${studentId}:`)) store.delete(key);
  }
}

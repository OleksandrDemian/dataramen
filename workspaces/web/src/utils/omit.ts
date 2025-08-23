export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result: Record<string, unknown> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (!keys.includes(key as K)) {
      result[key] = value;
    }
  });
  return result as Omit<T, K>;
}

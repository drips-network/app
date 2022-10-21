export function wrapItems<K extends string, T extends Record<K, string>>(array: T[], key: K) {
  return Object.fromEntries(array.map((v) => [v[key], v]));
}

export function unwrapIdItems<T>(items: { [id: string]: T }): ({ id: string } & T)[] {
  return Object.entries(items).map(([id, value]) => ({ ...value, id }));
}

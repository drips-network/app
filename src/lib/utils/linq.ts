export function singleOrDefault<T>(array: T[], predicate?: (item: T) => boolean): T | null {
  const condition = predicate || (() => true);
  const filtered = array.filter(condition);

  if (filtered.length === 1) {
    return filtered[0];
  }

  if (filtered.length === 0) {
    return null;
  }

  throw new Error('Sequence contains more than one matching element');
}

export function single<T>(arr: T[], predicate?: (item: T) => boolean): T {
  const condition = predicate ?? (() => true);
  const filtered = arr.filter(condition);

  if (filtered.length === 1) return filtered[0];
  if (filtered.length === 0) throw new Error('Sequence contains no matching element');

  throw new Error('Sequence contains more than one matching element');
}

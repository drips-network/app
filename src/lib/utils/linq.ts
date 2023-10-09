export default function singleOrDefault<T>(array: T[], predicate?: (item: T) => boolean): T | null {
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

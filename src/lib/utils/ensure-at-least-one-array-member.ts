export default function ensureAtLeastOneArrayMember<T>(arr: T[]): arr is [T, ...T[]] {
  return arr.length > 0;
}

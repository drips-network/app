export function areStringArraysEqual(arr1: string[], arr2: string[]): boolean {
  const set1 = new Set(arr1.map((a) => a.toLowerCase()));
  const set2 = new Set(arr2.map((a) => a.toLowerCase()));

  if (set1.size !== set2.size) {
    return false;
  }

  for (const addr of set1) {
    if (!set2.has(addr)) {
      return false;
    }
  }

  return true;
}

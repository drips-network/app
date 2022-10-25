/**
 * Checks value of `key` of each object in an array, and returns an array
 * of de-duplicated objects based on the value of `key`.
 * @param array The array to de-duplicate.
 * @param key The key to check for de-duplication.
 * @returns The de-duplicated array.
 */
export default function <T>(array: T[], key: keyof T): T[] {
  return [...new Map(array.map((item) => [item[key], item])).values()];
}

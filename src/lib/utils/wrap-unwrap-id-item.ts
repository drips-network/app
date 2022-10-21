/**
 * Take an array of records in which a key named `key` holds a string value. Return an object
 * where each key corresponds to the former value of `key` and has a value matching the array
 * member with said value of `key`.
 * @param array The array of homogenous types with IDs as keys to process.
 * @param key The name of the new attribute added to returned objects.
 * @returns The generated array.
 */
export function wrapItems<K extends string, T extends Record<K, string>>(array: T[], key: K) {
  return Object.fromEntries(array.map((v) => [v[key], v]));
}

/**
 * Take an object in which each key is the ID of the object it holds as a value. Return an array
 * of all values of the object, with each having an added `id` key corresponding to their key in
 * the original input object.
 * @param items The object to process.
 * @returns The procssed object as an array.
 */
export function unwrapIdItems<T>(items: { [id: string]: T }): ({ id: string } & T)[] {
  return Object.entries(items).map(([id, value]) => ({ ...value, id }));
}

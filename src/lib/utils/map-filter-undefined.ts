/**
 * Perform `Array.map` on an array while discarding any `undefined` values before returning
 * the mapped array.
 * @param array The array to map.
 * @param mapFn The function to apply to each array member. Return either the desired item or `undefined`
 * for skipping the current value.
 * @returns The transformed array, without any `undefined` values.
 */
export default function mapFilterUndefined<T, RT>(
  array: T[],
  mapFn: (value: T, index: number, array: T[]) => RT | undefined,
): RT[] {
  const mapped = array.map(mapFn);

  return mapped.filter<RT>((v): v is RT => v !== undefined);
}

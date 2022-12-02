/**
 * Deterministically chooses a random element from a provided array, based
 * on a seed string.
 * @param array The array to pick a random element from.
 * @param seed The seed to use to generate the random index.
 * @returns The randomly-selected element.
 */
export default function (array: unknown[], seed: string) {
  const charCodes = seed.split('').reduce<number>((a, b, i) => {
    return (i == 1 ? String(a).charCodeAt(0) : +a) + b.charCodeAt(0);
  }, 0);

  return array[charCodes % array.length];
}

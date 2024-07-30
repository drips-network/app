export function single<T>(array: ArrayLike<T>): T {
  if (array.length === 1) {
    return array[0];
  }

  throw new Error(
    array.length === 0 ? 'The array is empty.' : 'The array contains more than one element.',
  );
}

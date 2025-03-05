/**
 * Takes an array of any type, null or undefined, and filters out all non-truthy values.
 * @param input
 * @returns input without any false-ish values.
 */
export default function filterFalseish<T>(input: (T | null | undefined | false)[]): T[] {
  return input.filter((v): v is T => Boolean(v));
}

const PATTERN = /^(?:[a-z0-9]+:)/;

/**
 * Tests whether a path `input` is safe to `goto`. The path is considered unsafe
 * if it has a protocol prefix and would thus lead to outside the app or execute
 * JS when passed to `goto`.
 * @param input The path to test.
 * @returns True if safe to pass to `goto`, false if not.
 */
export default function (input: string) {
  return !PATTERN.test(input);
}

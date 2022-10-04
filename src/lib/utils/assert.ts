/**
 * Asserts that `condition` is truthy.
 * @param condition The condition to assert.
 * @param message Error message to throw on assertion error.
 * @throw An error if `condition` is falsy.
 */
export default function assert(condition: unknown, message = 'Assertion Error'): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

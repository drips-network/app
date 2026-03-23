const PROTOCOL_PATTERN = /^(?:[a-z0-9]+:)/;

/**
 * Tests whether a path `input` is safe to `goto`. The path is considered unsafe
 * if it has a protocol prefix and would thus lead to outside the app or execute
 * JS when passed to `goto`.
 * @param input The path to test.
 * @returns True if safe to pass to `goto`, false if not.
 */
function isSafePath(input: string) {
  const hasProtocolPattern = PROTOCOL_PATTERN.test(input);
  const hasDoubleSlash = input.startsWith('//');

  return !hasProtocolPattern && !hasDoubleSlash;
}

export function safeParseBackToParam(url: URL) {
  const backTo = url.searchParams.get('backTo');
  const decodedBackTo = decodeURIComponent(backTo || '');

  const isSafe = isSafePath(decodedBackTo);
  const safeBackTo = isSafe ? decodedBackTo : '';

  return safeBackTo;
}

export default isSafePath;

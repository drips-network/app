// Fixed dummy origin to resolve candidate paths against. Using a constant (instead of
// `window.location`) makes this work identically on the server and the client.
const BASE_ORIGIN = 'https://safe-path.invalid';

// ASCII control characters (incl. tab, CR, LF) and DEL. The URL parser silently strips
// some of these, so they can be used to smuggle e.g. `java\tscript:` or `/\t/evil.com`.
// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_PATTERN = /[\u0000-\u001F\u007F]/;

/**
 * Tests whether a path `input` is safe to `goto`, `redirect` to or use as an `href`. Only
 * same-origin relative paths are considered safe: the input must start with exactly one
 * `/`, and must resolve to the same origin when parsed as a URL. This rejects schemes
 * like `javascript:` or `data:` (in any casing or with leading whitespace), absolute URLs,
 * protocol-relative URLs (`//evil.com`) and their backslash variants (`/\evil.com`,
 * `\\evil.com`), which browsers treat as `//`.
 * @param input The path to test.
 * @returns True if safe to pass to `goto`, false if not.
 */
function isSafePath(input: string): boolean {
  if (typeof input !== 'string') return false;

  if (!input.startsWith('/')) return false;
  if (input[1] === '/' || input[1] === '\\') return false;
  if (CONTROL_CHAR_PATTERN.test(input)) return false;

  let resolved: URL;
  try {
    resolved = new URL(input, BASE_ORIGIN);
  } catch {
    return false;
  }

  return resolved.origin === BASE_ORIGIN;
}

/**
 * Reads the `backTo` query param from `url` and returns it if it's a safe in-app path,
 * or an empty string otherwise. `searchParams.get` already decodes the value, so it must
 * not be decoded again.
 */
export function safeParseBackToParam(url: URL) {
  const backTo = url.searchParams.get('backTo') ?? '';

  return isSafePath(backTo) ? backTo : '';
}

export default isSafePath;

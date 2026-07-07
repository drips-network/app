/**
 * Unwraps the human-readable message from an error thrown by `authenticatedCall`
 * (see `../call.ts`). Those errors carry the raw response body appended to the
 * status line, e.g.:
 *
 *   API call failed: 400 Bad Request - {"error":"This issue is already assigned…"}
 *
 * The Wave API serialises failures as `{ error: string }`, so we split off the
 * body after the first " - " separator and pull `error` out of it. Falls back to
 * the body (or the whole message when there's no separator, e.g. network errors
 * or `AccountSuspendedError`/`AccountRestrictedError`, which carry plain messages).
 */
export default function extractApiErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);

  const separatorIndex = raw.indexOf(' - ');
  const body = separatorIndex === -1 ? raw : raw.slice(separatorIndex + 3);

  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === 'object' && typeof parsed.error === 'string') {
      return parsed.error;
    }
  } catch {
    // Body wasn't JSON — fall through to the raw body.
  }

  return body;
}

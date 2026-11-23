import { isHttpError } from '@sveltejs/kit';
import { AccountRestrictedError } from '$lib/utils/wave/call';
import extractApiErrorMessage from '$lib/utils/wave/utils/extract-api-error-message';

/**
 * Turns an error from the approve/reject endpoints into a short, accurate message for a result row.
 *
 * `authenticatedCall` reshapes some API errors before they get here:
 * - A 403 whose body mentions "restricted" becomes `AccountRestrictedError` ("Your account is
 *   restricted"). On approve, the API's only such 403 is about the APPLICANT being banned or
 *   restricted, not the admin clicking, so we say that instead.
 * - Any other 403 becomes a SvelteKit `HttpError` with the API message dropped. The approve/reject
 *   endpoints only 403 for missing program-admin rights, so we say that.
 * - Everything else arrives as `API call failed: <status> - {"error": "..."}`; we unwrap the message.
 */
export function describeDecisionError(error: unknown, action: 'approve' | 'reject'): string {
  if (error instanceof AccountRestrictedError) {
    return action === 'approve'
      ? "The person who applied for this repo is banned or restricted, so it can't be approved."
      : error.message;
  }

  if (isHttpError(error) && error.status === 403) {
    return "Not allowed: you're not an admin of this program.";
  }

  return extractApiErrorMessage(error);
}

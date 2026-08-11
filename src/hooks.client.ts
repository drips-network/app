import type { HandleClientError } from '@sveltejs/kit';
import { pushError } from '$lib/utils/faro/faro-manager';

/**
 * SvelteKit only invokes `handleError` for *unexpected* errors — anything thrown
 * via `error(...)` (e.g. expected 404s) is handled by SvelteKit directly and
 * never reaches here. So every error that arrives is a genuine client-side
 * crash (a throw in a `load` function or during rendering) that surfaces to the
 * user as a full-page 500.
 *
 * These errors are caught by SvelteKit and therefore never reach
 * `window.onerror` / `unhandledrejection`, which is all Faro's default
 * instrumentation observes — so without this hook they're invisible in
 * monitoring. Forward them to Faro explicitly.
 */
export const handleError: HandleClientError = ({ error, event, status, message }) => {
  const reported = error instanceof Error ? error : new Error(message);

  pushError(reported, {
    route: event.route.id ?? 'unknown',
    url: event.url.pathname,
    status: String(status),
  });

  // Don't alter what the user sees — keep SvelteKit's default message.
};

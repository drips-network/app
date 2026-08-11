import { getLivenessCheckpointStatus } from '$lib/utils/wave/liveness.js';
import { redirect } from '@sveltejs/kit';

/**
 * Sends the user to the checkpoint screen when the API says one is due.
 *
 * The API refuses the grants endpoints outright in that case, so without this
 * guard the user would land on a broken page. Whether a check is actually due
 * is entirely the API's call — this just asks and acts on the answer.
 */
export const load = async ({ parent, url, fetch, depends }) => {
  depends('wave:liveness-checkpoint');

  const { user } = await parent();

  // Unauthenticated users are redirected to login by the child loads; there is
  // no checkpoint to evaluate for them.
  if (!user) return {};

  try {
    const checkpoint = await getLivenessCheckpointStatus(fetch, 'grant_access');

    if (!checkpoint.satisfied) {
      throw redirect(
        302,
        `/wave/checkpoint?backTo=${encodeURIComponent(url.pathname + url.search)}`,
      );
    }

    return { checkpoint };
  } catch (err) {
    // Preserve our own redirect above.
    if (err && typeof err === 'object' && 'status' in err && err.status === 302) {
      throw err;
    }
    // Let the child loads handle auth — they own the login redirect and the
    // backTo round trip.
    if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
      return {};
    }
    throw err;
  }
};

import { safeParseBackToParam } from '$lib/utils/safe-path';
import { startLivenessCheckpoint } from '$lib/utils/wave/liveness.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url, fetch }) => {
  const { checkpoint } = await parent();

  const backTo = safeParseBackToParam(url) || '/wave/rewards';

  if (checkpoint.satisfied) {
    throw redirect(302, backTo);
  }

  // Out of tries — the intro step explains what to do about it.
  if (checkpoint.locked) {
    throw redirect(302, `/wave/checkpoint?backTo=${encodeURIComponent(backTo)}`);
  }

  // Starting here rather than on a button press in the component means the
  // token is fetched server-side on first paint, so the SDK can mount as soon
  // as the page does. Resumes an in-flight challenge instead of creating a
  // second one, so a reload mid-flow is harmless.
  const session = await startLivenessCheckpoint(fetch, 'grant_access');

  return {
    backTo,
    sumsubToken: session.accessToken,
    waveFullscreenFlow: true,
  };
};

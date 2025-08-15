import buildUrl from '$lib/utils/build-url';
import { getDraft } from '$lib/utils/rpgf/rpgf.js';
import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

// Route needs client-side jwt
export const ssr = false;

export const load = async ({ fetch, params, parent, url }) => {
  const { rpgfUserData } = await parent();

  if (!rpgfUserData) {
    // User is not signed in, so redirect to connect
    return redirect(
      307,
      buildUrl('/app/connect', { backTo: url.pathname, requireRpgfSignIn: 'true' }),
    );
  }

  const { id } = params;

  try {
    const wrappedDraft = await getDraft(fetch, id);

    if (!wrappedDraft) {
      throw error(404, 'Draft not found');
    }

    return {
      wrappedDraft,
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes('401')) {
      return error(401);
    } else {
      return error(500, 'Internal Server Error');
    }
  }
};

import { getDraft } from '$lib/utils/rpgf/rpgf.js';
import { error } from '@sveltejs/kit';

// Route needs client-side jwt
export const ssr = false;

export const load = async ({ fetch, params, parent }) => {
  const { rpgfUserData } = await parent();

  if (!rpgfUserData) {
    return error(401, 'Unauthorized');
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

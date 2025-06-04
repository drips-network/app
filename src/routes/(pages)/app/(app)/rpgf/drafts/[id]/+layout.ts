import { getDraft } from '$lib/utils/rpgf/rpgf.js';
import { error } from '@sveltejs/kit';

// Route needs client-side jwt
export const ssr = false;

export const load = async ({ fetch, params }) => {
  const { id } = params;

  const wrappedDraft = await getDraft(fetch, id);

  if (!wrappedDraft) {
    return error(404, 'Draft not found');
  }

  return {
    wrappedDraft,
  };
};

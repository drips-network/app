import { getDraft } from '$lib/utils/rpgf/rpgf.js';
import { error } from '@sveltejs/kit';

// Route needs client-side jwt
export const ssr = false;

export const load = async ({ fetch, params }) => {
  const { id } = params;

  const draftWrapper = await getDraft(fetch, id);

  if (!draftWrapper) {
    return error(404, 'Draft not found');
  }

  return {
    draftWrapper,
  };
};

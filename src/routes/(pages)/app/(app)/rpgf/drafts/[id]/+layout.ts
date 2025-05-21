import { getDraft, getDrafts } from '$lib/utils/rpgf/rpgf.js';
import { error } from '@sveltejs/kit';

// Route needs client-side jwt
export const ssr = false;

export const load = async ({ fetch, params }) => {
  let id = params.id;

  const draft = await getDraft(fetch, id);

  if (!draft) {
    return error(404, 'Draft not found');
  }

  return {
    draft,
  };
};

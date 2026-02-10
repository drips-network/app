import { listSignupSources } from '$lib/utils/wave/signupSources.js';

export const load = async ({ fetch, depends }) => {
  depends('wave:admin:signup-sources');

  try {
    const signupSources = await listSignupSources(fetch, { limit: 100 });

    return {
      signupSources,
    };
  } catch {
    return {
      signupSources: {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    };
  }
};

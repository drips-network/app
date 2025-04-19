import * as ecosystemsApi from '$lib/utils/ecosystems';

export const load = async ({ params, fetch }) => {
  const ecosystem = await ecosystemsApi.get(params.ecosystemId, fetch);

  return {
    ecosystem,
  };
};

import { fetchEcosystem } from '../fetch-ecosystem';

export const load = async ({ params, fetch }) => {
  const ecosystem = await fetchEcosystem(params.ecosystemId, fetch);

  return {
    ecosystem,
  };
};

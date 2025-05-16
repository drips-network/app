import { redirect } from '@sveltejs/kit';
import buildUrl from '$lib/utils/build-url';
import getConnectedAddress from '$lib/utils/get-connected-address';
import * as ecosystemsApi from '$lib/utils/ecosystems';
import { fetchEcosystem } from './[ecosystemId]/fetch-ecosystem.js';
import type { EcosystemProfileFragment } from './[ecosystemId]/components/__generated__/gql.generated.js';

export const load = async ({ fetch }) => {
  const connectedAddress = getConnectedAddress();

  if (!connectedAddress) {
    redirect(307, buildUrl('/app/connect', { backTo: '/app/ecosystems' }));
  }

  const apiEcosystems = await ecosystemsApi.getAll();

  // Create an array to store tuples of [ecosystem, ecosystemMainAccount]
  const ecosystems: Array<[(typeof apiEcosystems)[0], EcosystemProfileFragment | undefined]> = [];

  // Process each ecosystem
  for (const ecosystem of apiEcosystems) {
    if (ecosystem.accountId) {
      const ecosystemRes = await fetchEcosystem(ecosystem.accountId, fetch);
      // Create a tuple with the ecosystem and its fetched details
      ecosystems.push([ecosystem, ecosystemRes.ecosystemMainAccount || undefined]);
    } else {
      // For ecosystems without accountId, just include the ecosystem with undefined for the second element
      ecosystems.push([ecosystem, undefined]);
    }
  }

  return { ecosystems };
};

export const ssr = false;

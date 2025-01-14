import { isSupportedGitUrl } from '$lib/utils/is-valid-git-url';
import { MeiliSearch, type FederatedMultiSearchParams } from 'meilisearch';
import { resultsSchema, type Result } from './types';
import { z } from 'zod';
import ensStore from '$lib/stores/ens/ens.store';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import { BASE_URL } from '$lib/utils/base-url';
import network from '$lib/stores/wallet/network';
import { isAddress } from 'ethers';

const client = new MeiliSearch({
  host: `${BASE_URL}/api/search`,
});

/**
 * Add a "fake" search result for an unclaimed project if a Git URL or owner/name pattern is entered
 * for a repo not found in Drips DB
 */
async function getGitUrlResults(q: string, parsedHits: Result[]): Promise<Result | undefined> {
  if (!isSupportedGitUrl(q)) return undefined;

  const gitUrlInResults = parsedHits.some(
    (hit) => hit.type === 'project' && hit.url.toLowerCase() === q.toLowerCase(),
  );

  try {
    if (!gitUrlInResults) {
      const repoRes = await fetch(`/api/github/${encodeURIComponent(q)}`);
      const repoResJson = await repoRes.json();

      const is404 = 'message' in repoResJson && repoResJson.message === 'Error: 404';

      if (!is404) {
        const { repoName, ownerName } = z
          .object({ repoName: z.string(), ownerName: z.string() })
          .parse(repoResJson);

        return {
          type: 'project',
          url: q,
          name: `${ownerName}/${repoName}`,
        };
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  return undefined;
}

async function getEnsResult(q: string): Promise<Result | undefined> {
  try {
    const lookup = await ensStore.reverseLookup(q);

    if (lookup) {
      return {
        type: 'address',
        address: lookup,
      };
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function getAddressResult(q: string): Result | undefined {
  if (isAddress(q)) {
    return {
      type: 'address',
      address: q,
    };
  }

  return undefined;
}

export async function search(q: string): Promise<Result[]> {
  const commonOptions: Partial<FederatedMultiSearchParams['queries'][number]> = {
    attributesToHighlight: ['name'],
    showMatchesPosition: true,
  };

  const { hits } = await client.multiSearch({
    federation: {},
    queries: [
      {
        indexUid: 'projects',
        q,
        filter: [
          `name IS NOT NULL AND verificationStatus = Claimed AND chain = ${network.gqlName} AND isVisible = true`,
        ],
        federationOptions: { weight: 1.1 },
        ...commonOptions,
      },
      {
        indexUid: 'drip_lists',
        filter: [`name IS NOT NULL AND chain = ${network.gqlName} AND isVisible = true`],
        q,
        ...commonOptions,
      },
    ],
  });

  const parsedHits: Result[] = resultsSchema.parse(hits);

  const [gitUrlResult, ensResult, addressResult] = await Promise.all([
    getGitUrlResults(q, parsedHits),
    getEnsResult(q),
    getAddressResult(q),
  ]);

  return mapFilterUndefined([addressResult, ensResult, gitUrlResult, ...parsedHits], (v) => v);
}

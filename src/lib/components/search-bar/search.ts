import { isValidGitUrl } from '$lib/utils/is-valid-git-url';
import { MeiliSearch, type FederatedMultiSearchParams } from 'meilisearch';
import { resultsSchema, type Result } from './types';
import { z } from 'zod';
import ensStore from '$lib/stores/ens/ens.store';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import { isAddress } from 'ethers';
import { BASE_URL } from '$lib/utils/base-url';

const client = new MeiliSearch({
  host: `${BASE_URL}/api/search`,
});

/**
 * Add a "fake" search result for an unclaimed project if a Git URL or owner/name pattern is entered
 * for a repo not found in Drips DB
 */
async function getGitUrlResults(q: string, parsedHits: Result[]): Promise<Result | undefined> {
  if (!isValidGitUrl(q)) return undefined;

  const gitHubUrl = isValidGitUrl(q) ? q : `https://github.com/${q}`;

  const gitUrlInResults = parsedHits.some(
    (hit) => hit.type === 'project' && hit.url.toLowerCase() === gitHubUrl.toLowerCase(),
  );

  if (!gitUrlInResults) {
    const repoRes = await fetch(`/api/github/${encodeURIComponent(gitHubUrl)}`);
    const repoResJson = await repoRes.json();

    const is404 = 'message' in repoResJson && repoResJson.message === 'Error: 404';

    if (!is404) {
      const { repoName, ownerName } = z
        .object({ repoName: z.string(), ownerName: z.string() })
        .parse(repoResJson);

      return {
        type: 'project',
        url: gitHubUrl,
        name: `${ownerName}/${repoName}`,
      };
    }
  }

  return undefined;
}

async function getEnsResult(q: string): Promise<Result | undefined> {
  if (!isAddress(q)) return undefined;

  const lookup = await ensStore.reverseLookup(q);

  if (lookup) {
    return {
      type: 'ens',
      name: q,
      address: lookup,
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
        filter: ['name IS NOT NULL AND ownerAddress IS NOT NULL'],
        federationOptions: { weight: 1.1 },
        ...commonOptions,
      },
      { indexUid: 'drip_lists', filter: ['name IS NOT NULL'], q, ...commonOptions },
    ],
  });

  const parsedHits: Result[] = resultsSchema.parse(hits);

  const [gitUrlResult, ensResult] = await Promise.all([
    getGitUrlResults(q, parsedHits),
    getEnsResult(q),
  ]);

  return mapFilterUndefined([ensResult, gitUrlResult, ...parsedHits], (v) => v);
}

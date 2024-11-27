import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import uriDecodeParams from '$lib/utils/url-decode-params';
import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import type { ProjectByUrlQuery, ProjectByUrlQueryVariables } from './__generated__/gql.generated';
import isClaimed from '$lib/utils/project/is-claimed';
import { PROJECT_PROFILE_FRAGMENT } from '../../../components/project-profile/project-profile.svelte';
import { z } from 'zod';
import { redis } from '../../../../../../../../api/redis';
import cached from '$lib/utils/cache/remote/cached';
import queryCacheKey from '$lib/utils/cache/remote/query-cache-key';
import { executeRepoDriverReadMethod } from '$lib/utils/sdk/repo-driver/repo-driver';
import { hexlify, toUtf8Bytes } from 'ethers';
import { Forge, type OxString } from '$lib/utils/sdk/sdk-types';
import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
import network from '$lib/stores/wallet/network';

async function fetchDripsProject(repoUrl: string) {
  const getProjectsQuery = gql`
    ${PROJECT_PROFILE_FRAGMENT}
    query ProjectByUrl($url: String!, $chains: [SupportedChain!]!) {
      projectByUrl(url: $url, chains: $chains) {
        ...ProjectProfile
      }
    }
  `;

  const url = new URL(repoUrl);
  const [, owner, repo] = url.pathname.split('/');

  const accountId = await executeRepoDriverReadMethod({
    functionName: 'calcAccountId',
    args: [Forge.gitHub, hexlify(toUtf8Bytes(`${owner}/${repo}`)) as OxString],
  });

  const cacheKey = queryCacheKey(getProjectsQuery, [repoUrl], `project-page:${accountId}`);

  return await cached(redis, cacheKey, 172800, () =>
    // should throw if underlying client knows what it's doing
    query<ProjectByUrlQuery, ProjectByUrlQueryVariables>(
      getProjectsQuery,
      {
        url: repoUrl,
        chains: [network.gqlName],
      },
      fetch,
    ),
  );
}

export const load = (async ({ params, fetch, url }) => {
  let githubUsername, githubRepoName: string;
  try {
    const p = uriDecodeParams(params);
    githubRepoName = p.githubRepoName;
    githubUsername = p.githubUsername;
  } catch {
    throw error(400);
  }

  // `exact` param disables the redirect to the "real" github repo URL.
  // For example, after a repo has been renamed, it would usually automatically redirect
  // to the new repo name, but it must still be possible to access the old project.
  const exact = url.searchParams.has('exact');

  const repoSchema = z.object({
    url: z.string(),
    description: z.string().nullable(),
    repoName: z.string(),
    ownerName: z.string(),
    forksCount: z.number(),
    stargazersCount: z.number(),
    defaultBranch: z.string(),
  });

  let repo: z.infer<typeof repoSchema>;

  const repoUrl = `https://github.com/${githubUsername}/${githubRepoName}`;

  const [repoRes, projectRes] = await Promise.all([
    fetch(`/api/github/${encodeURIComponent(repoUrl)}`),
    fetchDripsProject(repoUrl),
  ]);

  const project = projectRes.projectByUrl;
  if (!project) {
    throw error(404);
  }

  const projectChainData = filterCurrentChainData(project.chainData);

  const repoResJson = await repoRes.json();

  if ('message' in repoResJson && repoResJson.message === 'Error: 404') {
    throw error(404);
  }

  try {
    repo = repoSchema.parse(repoResJson);
  } catch {
    throw error(500, 'Unable to fetch repo info from GitHub / cache');
  }

  const { url: realRepoUrl } = repo;

  const repoUrlIsCanonical = repoUrl === realRepoUrl;

  if (!exact && !repoUrlIsCanonical) {
    return redirect(301, `/app/projects/github/${repo.ownerName}/${repo.repoName}`);
  }

  if (isClaimed(projectChainData) && !projectChainData.splits) {
    throw new Error('Claimed project somehow does not have splits');
  }

  // True if the repo URL is non-canonical, but only the casing is wrong
  const wrongCasing = !repoUrlIsCanonical && repoUrl.toLowerCase() === realRepoUrl.toLowerCase();

  const correctCasingRepo = wrongCasing
    ? {
        url: realRepoUrl,
        repoName: repo.repoName,
        ownerName: repo.ownerName,
      }
    : undefined;

  // If the repo has been renamed / moved, this is the new URL
  const newRepo =
    !repoUrlIsCanonical && !wrongCasing
      ? {
          url: realRepoUrl,
          repoName: repo.repoName,
          ownerName: repo.ownerName,
        }
      : undefined;

  return {
    project,
    description:
      typeof repoResJson.description === 'string' ? (repoResJson.description as string) : undefined,
    newRepo,
    correctCasingRepo,
    blockWhileInitializing: false,
    preservePathOnNetworkChange: true,
  };
}) satisfies PageServerLoad;

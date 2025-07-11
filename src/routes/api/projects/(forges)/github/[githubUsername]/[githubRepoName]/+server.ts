import { error, json, type RequestHandler } from '@sveltejs/kit';
import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import type { ProjectByUrlQuery, ProjectByUrlQueryVariables } from './__generated__/gql.generated';
import { z } from 'zod';
import cached from '$lib/utils/cache/remote/cached';
import queryCacheKey from '$lib/utils/cache/remote/query-cache-key';
import { executeRepoDriverReadMethod } from '$lib/utils/sdk/repo-driver/repo-driver';
import { hexlify, toUtf8Bytes } from 'ethers';
import { Forge, type OxString } from '$lib/utils/sdk/sdk-types';
import network from '$lib/stores/wallet/network';
import { redis } from '../../../../../redis';
import { PROJECT_PROFILE_FRAGMENT } from '../../../../../../(pages)/app/(app)/projects/(forges)/components/project-profile/project-profile.svelte';

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

  // cache key is shared with project page
  const cacheKey = queryCacheKey(getProjectsQuery, [repoUrl], `project-page:${accountId}`);

  return await cached(redis, cacheKey, 172800, () =>
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
export const GET: RequestHandler = async ({ params, fetch }) => {
  const { githubUsername, githubRepoName } = params;

  // TODO; schema should be shared with endpoint that is called a little later
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

  const resBody = {
    project,
    description:
      typeof repoResJson.description === 'string' ? (repoResJson.description as string) : undefined,
    newRepo,
    correctCasingRepo,
  };

  return json(resBody);
};

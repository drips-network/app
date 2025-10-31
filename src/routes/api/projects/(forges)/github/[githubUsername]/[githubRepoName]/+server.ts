import { error, json, type RequestHandler } from '@sveltejs/kit';
import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import type { ProjectByUrlQuery, ProjectByUrlQueryVariables } from './__generated__/gql.generated';
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
export const GET: RequestHandler = async ({ params }) => {
  const { githubUsername, githubRepoName } = params;

  const repoUrl = `https://github.com/${githubUsername}/${githubRepoName}`;

  const projectRes = await fetchDripsProject(repoUrl);

  const project = projectRes.projectByUrl;
  if (!project) {
    throw error(404);
  }

  if (!project.repoMetadata) {
    throw error(404);
  }

  type Repo = {
    url: string;
    description: string | null;
    repoName: string;
    ownerName: string;
    forksCount: number;
    stargazersCount: number;
    defaultBranch: string;
  };

  const repo: Repo = {
    url: project.repoMetadata.url,
    description: project.repoMetadata.description ?? null,
    repoName: project.repoMetadata.repoName,
    ownerName: project.repoMetadata.ownerName,
    forksCount: project.repoMetadata.forksCount,
    stargazersCount: project.repoMetadata.stargazersCount,
    defaultBranch: project.repoMetadata.defaultBranch,
  };

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
    description: repo.description,
    newRepo,
    correctCasingRepo,
  };

  return json(resBody);
};

import { error, redirect } from '@sveltejs/kit';
import fetchUnclaimedFunds from '$lib/utils/project/unclaimed-funds';
import type { PageServerLoad } from './$types';
import fetchEarnedFunds from '$lib/utils/project/earned-funds';
import uriDecodeParams from '$lib/utils/url-decode-params';
import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import type { ProjectByUrlQuery } from './__generated__/gql.generated';
import type { QueryProjectByUrlArgs } from '$lib/graphql/__generated__/base-types';
import isClaimed from '$lib/utils/project/is-claimed';
import { PROJECT_PROFILE_FRAGMENT } from '../../../components/project-profile/project-profile.svelte';
import { z } from 'zod';

export const load = (async ({ params, fetch, url }) => {
  const { githubUsername, githubRepoName } = uriDecodeParams(params);

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

  const repoRes = await fetch(`/api/github/${encodeURIComponent(repoUrl)}`);
  const repoResJson = await repoRes.json();

  if ('message' in repoResJson && repoResJson.message === 'Error: 404') {
    throw error(404);
  }

  try {
    repo = repoSchema.parse(repoResJson);
  } catch (e) {
    throw error(500, 'Unable to fetch repo info from GitHub / cache');
  }

  const { url: realRepoUrl } = repo;

  const repoUrlIsCanonical = repoUrl === realRepoUrl;

  if (!exact && !repoUrlIsCanonical) {
    throw redirect(301, `/app/projects/github/${repo.ownerName}/${repo.repoName}`);
  }

  const getProjectsQuery = gql`
    ${PROJECT_PROFILE_FRAGMENT}
    query ProjectByUrl($url: String!) {
      projectByUrl(url: $url) {
        ...ProjectProfile
      }
    }
  `;

  const { projectByUrl: project } = await query<ProjectByUrlQuery, QueryProjectByUrlArgs>(
    getProjectsQuery,
    {
      url: repoUrl,
    },
    fetch,
  );

  if (!project) {
    throw error(404);
  }

  const unclaimedFunds = !isClaimed(project)
    ? fetchUnclaimedFunds(project.account.accountId)
    : undefined;

  const earnedFunds = isClaimed(project) ? fetchEarnedFunds(project.account.accountId) : undefined;

  if (isClaimed(project) && !project.splits) {
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
    streamed: {
      unclaimedFunds,
      earnedFunds,
    },
    newRepo,
    correctCasingRepo,
    blockWhileInitializing: false,
  };
}) satisfies PageServerLoad;

import { error, redirect } from '@sveltejs/kit';
import fetchUnclaimedFunds from '$lib/utils/project/unclaimed-funds';
import type { PageServerLoad } from './$types';
import uriDecodeParams from '$lib/utils/url-decode-params';
import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import type { ProjectByUrlQuery, ProjectByUrlQueryVariables } from './__generated__/gql.generated';
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

  const getProjectsQuery = gql`
    ${PROJECT_PROFILE_FRAGMENT}
    query ProjectByUrl($url: String!) {
      projectByUrl(url: $url) {
        ...ProjectProfile
      }
    }
  `;

  const repoUrl = `https://github.com/${githubUsername}/${githubRepoName}`;

  const [repoRes, projectRes] = await Promise.all([
    await fetch(`/api/github/${encodeURIComponent(repoUrl)}`),
    await query<ProjectByUrlQuery, ProjectByUrlQueryVariables>(
      getProjectsQuery,
      {
        url: repoUrl,
      },
      fetch,
    ),
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
  } catch (e) {
    throw error(500, 'Unable to fetch repo info from GitHub / cache');
  }

  const { url: realRepoUrl } = repo;

  const repoUrlIsCanonical = repoUrl === realRepoUrl;

  if (!exact && !repoUrlIsCanonical) {
    throw redirect(301, `/app/projects/github/${repo.ownerName}/${repo.repoName}`);
  }

  const unclaimedFunds = !isClaimed(project)
    ? fetchUnclaimedFunds(project.account.accountId)
    : undefined;

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
    description:
      typeof repoResJson.description === 'string' ? (repoResJson.description as string) : undefined,
    streamed: {
      unclaimedFunds,
    },
    newRepo,
    correctCasingRepo,
    blockWhileInitializing: false,
  };
}) satisfies PageServerLoad;

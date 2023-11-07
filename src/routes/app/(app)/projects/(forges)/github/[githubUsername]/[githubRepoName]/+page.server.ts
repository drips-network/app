import { error } from '@sveltejs/kit';
import fetchUnclaimedFunds from '$lib/utils/project/unclaimed-funds';
import siteExists from '$lib/utils/site-exists';
import type { PageServerLoad } from './$types';
import fetchEarnedFunds from '$lib/utils/project/earned-funds';
import uriDecodeParams from '$lib/utils/url-decode-params';
import getIncomingSplits from '$lib/utils/splits/get-incoming-splits';
import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import type { ProjectByUrlQuery } from './__generated__/gql.generated';
import type { QueryProjectByUrlArgs } from '$lib/graphql/__generated__/base-types';
import isClaimed from '$lib/utils/project/is-claimed';
import unreachable from '$lib/utils/unreachable';
import { PROJECT_PROFILE_FRAGMENT } from '../../../components/project-profile/project-profile.svelte';

// TODO: This fails if the network is not the default one. We need to support other networks.

export const load = (async ({ params, fetch }) => {
  const { githubUsername, githubRepoName } = uriDecodeParams(params);

  const gitHubUrl = `https://github.com/${githubUsername}/${githubRepoName}`;

  if (!(await siteExists(gitHubUrl))) {
    throw error(404);
  }

  try {
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
        url: gitHubUrl,
      },
      fetch,
    );

    if (!project) {
      throw error(404);
    }

    const unclaimedFunds = !isClaimed(project)
      ? fetchUnclaimedFunds(project.account.accountId)
      : undefined;

    const earnedFunds = isClaimed(project)
      ? fetchEarnedFunds(project.account.accountId)
      : undefined;

    if (isClaimed(project) && !project.splits) {
      throw new Error('Claimed project somehow does not have splits');
    }

    return {
      project,
      splits: isClaimed(project) ? project.splits ?? unreachable() : undefined,
      streamed: {
        unclaimedFunds,
        earnedFunds,
        incomingSplits: getIncomingSplits(project.account.accountId, fetch),
      },
      blockWhileInitializing: false,
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    throw e;
  }
}) satisfies PageServerLoad;

import GitProjectService from '$lib/utils/project/GitProjectService';
import { error } from '@sveltejs/kit';
import fetchUnclaimedFunds from '$lib/utils/project/unclaimed-funds';
import siteExists from '$lib/utils/site-exists';
import type { PageServerLoad } from './$types';
import { buildProjectSplitsData } from '../../../methods/project-splits';
import fetchEarnedFunds from '$lib/utils/project/earned-funds';
import uriDecodeParams from '$lib/utils/url-decode-params';
import getIncomingSplits from '$lib/utils/splits/get-incoming-splits';

// TODO: This fails if the network is not the default one. We need to support other networks.

export const load = (async ({ params }) => {
  const { githubUsername, githubRepoName } = uriDecodeParams(params);

  const service = await GitProjectService.new();

  const gitHubUrl = `https://github.com/${githubUsername}/${githubRepoName}`;

  if (!(await siteExists(gitHubUrl))) {
    throw error(404);
  }

  try {
    const project = await service.getByUrl(gitHubUrl);

    const unclaimedFunds = project.claimed
      ? undefined
      : fetchUnclaimedFunds(project.repoDriverAccount.accountId);

    const earnedFunds = project.claimed
      ? fetchEarnedFunds(project.repoDriverAccount.accountId)
      : undefined;

    return {
      project,
      streamed: {
        unclaimedFunds,
        earnedFunds,
        incomingSplits: getIncomingSplits(project.repoDriverAccount.accountId),
        splits: buildProjectSplitsData(project, project.claimed ? project.splits.dependencies : []),
      },
      blockWhileInitializing: false,
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    throw error(500);
  }
}) satisfies PageServerLoad;

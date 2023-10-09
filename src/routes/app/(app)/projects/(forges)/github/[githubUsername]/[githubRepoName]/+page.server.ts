import { error } from '@sveltejs/kit';
import siteExists from '$lib/utils/site-exists';
import type { PageServerLoad } from './$types';
import { buildProjectSplitsData } from '../../../methods/project-splits';
import fetchEarnedFunds from '$lib/utils/project/earned-funds';
import uriDecodeParams from '$lib/utils/url-decode-params';
import getIncomingSplits from '$lib/utils/splits/get-incoming-splits';
import { GitProjectService } from '$lib/utils/project/GitProjectService';
import { ProjectVerificationStatus } from '$lib/graphql/generated/graphql';
import { fetchUnclaimedFunds } from '$lib/utils/project/git-project-utils';

// TODO: This fails if the network is not the default one. We need to support other networks.

export const load = (async ({ params }) => {
  const { githubUsername, githubRepoName } = uriDecodeParams(params);

  const gitProjectService = await GitProjectService.new();

  const gitHubUrl = `https://github.com/${githubUsername}/${githubRepoName}`;

  if (!(await siteExists(gitHubUrl))) {
    throw error(404);
  }

  try {
    const project = await gitProjectService.getProjectByUrl(gitHubUrl);

    const unclaimedFunds =
      project.verificationStatus === ProjectVerificationStatus.Claimed
        ? undefined
        : fetchUnclaimedFunds(project.id);

    const earnedFunds =
      project.verificationStatus === ProjectVerificationStatus.Claimed
        ? fetchEarnedFunds(project.id)
        : undefined;

    return {
      project,
      streamed: {
        unclaimedFunds,
        earnedFunds,
        incomingSplits: getIncomingSplits(project.id),
        splits: await buildProjectSplitsData(project),
      },
      blockWhileInitializing: false,
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    throw error(500);
  }
}) satisfies PageServerLoad;

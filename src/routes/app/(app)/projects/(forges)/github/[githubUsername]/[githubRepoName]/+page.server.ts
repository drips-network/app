import GitProjectService from '$lib/utils/project/GitProjectService';
import { error } from '@sveltejs/kit';
import isForge from '$lib/utils/project/is-forge';
import fetchUnclaimedFunds from '$lib/utils/project/unclaimed-funds';
import siteExists from '$lib/utils/site-exists';
import type { PageServerLoad } from './$types';
import { buildProjectSplitsData } from '../../../methods/project-splits';
import fetchEarnedFunds from '$lib/utils/project/earned-funds';
import getIncomingSplits from '../../../methods/get-incoming-splits';
import uriDecodeParams from '$lib/utils/url-decode-params';

export const load = (async ({ params }) => {
  const { githubUsername, githubRepoName } = uriDecodeParams(params);

  const service = await GitProjectService.new();

  const gitHubUrl = `https://github.com/${githubUsername}/${githubRepoName}`;

  if (!(await siteExists(gitHubUrl))) {
    throw error(404);
  }

  const project = await service.getByUrl(gitHubUrl);

  if (!isForge('github', project)) {
    throw error(
      500,
      'Expected project to be a GitHub project, but it was a ${project.source} project',
    );
  }

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
      splits: buildProjectSplitsData(project),
    },
  };
}) satisfies PageServerLoad;

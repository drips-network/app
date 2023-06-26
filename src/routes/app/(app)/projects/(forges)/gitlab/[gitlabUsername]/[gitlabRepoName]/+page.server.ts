import GitProjectService from '$lib/utils/project/GitProjectService';
import { error } from '@sveltejs/kit';
import isForge from '$lib/utils/project/is-forge';
import fetchUnclaimedFunds from '$lib/utils/project/unclaimed-funds';
import siteExists from '$lib/utils/site-exists';
import { buildProjectSplitsData } from '../../../methods/project-splits';
import type { PageServerLoad } from './$types';
import fetchEarnedFunds from '$lib/utils/project/earned-funds';
import getIncomingSplits from '../../../methods/get-incoming-splits';
import uriDecodeParams from '$lib/utils/url-decode-params';

export const load = (async ({ params }) => {
  const { gitlabRepoName, gitlabUsername } = uriDecodeParams(params);

  const service = await GitProjectService.new();

  const gitLabUrl = `https://gitlab.com/${gitlabUsername}/${gitlabRepoName}`;

  if (!(await siteExists(gitLabUrl))) {
    throw error(404);
  }

  const project = await service.getByUrl(gitLabUrl);

  if (!isForge('gitlab', project)) {
    throw error(
      500,
      'Expected project to be a GitLab project, but it was a ${project.source} project',
    );
  }

  const unclaimedFunds = project.claimed
    ? undefined
    : fetchUnclaimedFunds(project.repoDriverAccount.userId);

  const earnedFunds = project.claimed
    ? fetchEarnedFunds(project.repoDriverAccount.userId)
    : undefined;

  return {
    project,
    streamed: {
      unclaimedFunds,
      earnedFunds,
      incomingSplits: getIncomingSplits(project.repoDriverAccount.userId),
      splits: buildProjectSplitsData(project),
    },
  };
}) satisfies PageServerLoad;

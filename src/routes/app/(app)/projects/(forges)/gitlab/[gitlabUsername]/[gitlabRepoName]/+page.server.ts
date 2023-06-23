import GitProjectService from '$lib/utils/project/GitProjectService';
import { error } from '@sveltejs/kit';
import isForge from '$lib/utils/project/is-forge';
import fetchUnclaimedFunds from '$lib/utils/project/unclaimed-funds';
import siteExists from '$lib/utils/site-exists';
import buildProjectSplitsData from '../../../methods/build-project-splits-data';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
  const { gitlabRepoName, gitlabUsername } = params;

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
    : await fetchUnclaimedFunds(project.repoDriverAccount.userId);

  return {
    project,
    unclaimedFunds,
    streamed: {
      splits: buildProjectSplitsData(project),
    },
  };
}) satisfies PageServerLoad;

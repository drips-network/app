import GitProjectService from '$lib/utils/project/GitProjectService';
import { error } from '@sveltejs/kit';
import isForge from '$lib/utils/project/is-forge';
import fetchUnclaimedFunds from '$lib/utils/project/unclaimed-funds';
// This should be `PageServerLoad`, but for some reason SvelteKit isn't generating one. TODO: Figure out why
import type { PageLoad } from './$types';
import siteExists from '$lib/utils/site-exists';

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
  };
}) satisfies PageLoad;

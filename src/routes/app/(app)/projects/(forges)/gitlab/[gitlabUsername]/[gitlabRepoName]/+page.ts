import GitProjectService from '$lib/utils/project/GitProjectService';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import isForge from '$lib/utils/project/is-forge';
import fetchUnclaimedFunds from '$lib/utils/project/unclaimed-funds';

// TODO: Add support for GitLab "project groups"

export const load = (async ({ params }) => {
  const { gitlabRepoName, gitlabUsername } = params;

  const service = await GitProjectService.new();

  const project = await service.getByUrl(`https://gitlab.com/${gitlabUsername}/${gitlabRepoName}`);

  if (!isForge('gitlab', project)) {
    throw error(
      500,
      'Expected project to be a GitLab project, but it was a ${project.source} project',
    );
  }

  const unclaimedFunds = project.claimed
    ? undefined
    : await fetchUnclaimedFunds(project.repoDriverAccount.userId);

  // TODO: Check if this project exists on GitHub

  return {
    project,
    unclaimedFunds,
  };
}) satisfies PageLoad;

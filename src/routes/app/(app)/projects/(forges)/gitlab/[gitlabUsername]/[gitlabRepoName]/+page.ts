import GitProjectService from '$lib/utils/project/GitProjectService';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import isForge from '$lib/utils/project/is-forge';

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

  return {
    project,
  };
}) satisfies PageLoad;

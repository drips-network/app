import GitProjectService from '$lib/utils/project/GitProjectService';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import isForge from '$lib/utils/project/is-forge';

export const load = (async ({ params }) => {
  const { githubUsername, githubRepoName } = params;

  const service = await GitProjectService.new();

  const project = await service.getByUrl(`https://github.com/${githubUsername}/${githubRepoName}`);

  if (!isForge('github', project)) {
    throw error(
      500,
      'Expected project to be a GitHub project, but it was a ${project.source} project',
    );
  }

  return {
    project,
  };
}) satisfies PageLoad;

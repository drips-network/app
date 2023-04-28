import type { GitHubSource, GitProject } from '../../../types';
import type { PageLoad } from './$types';

export const load = (({ params }) => {
  const { githubUsername, githubRepoName } = params;

  // TODO: Fetch real project.

  let project: GitProject<GitHubSource>;

  if (githubRepoName === 'svelte-stepper') {
    project = {
      repoDriverAccount: {
        userId: '0',
        driver: 'repo',
      },
      owner: {
        driver: 'address',
        userId: '0',
        address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
      },
      source: {
        type: 'github',
        repoName: githubRepoName,
        ownerName: githubUsername,
        url: `https://github.com/${githubUsername}/${githubRepoName}.git`,
      },
      emoji: '🚶',
      color: '#fcc842',
    };
  } else {
    project = {
      repoDriverAccount: {
        userId: '0',
        driver: 'repo',
      },
      source: {
        type: 'github',
        repoName: githubRepoName,
        ownerName: githubUsername,
        url: `https://github.com/${githubUsername}/${githubRepoName}.git`,
      },
      owner: undefined,
    };
  }

  return {
    project,
  };
}) satisfies PageLoad;

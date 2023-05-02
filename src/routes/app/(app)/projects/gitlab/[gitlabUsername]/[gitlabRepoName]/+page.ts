import type { GitLabSource, GitProject } from '$lib/utils/metadata/types';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
  const { gitlabRepoName, gitlabUsername } = params;

  // TODO: Fetch real project.

  let project: GitProject<GitLabSource>;

  if (gitlabRepoName === 'svelte-stepper') {
    project = {
      claimed: true,
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
        forge: 'gitlab',
        repoName: gitlabRepoName,
        ownerName: gitlabUsername,
        host: 'gitlab.com',
        url: `https://github.com/${gitlabUsername}/${gitlabRepoName}.git`,
      },
      emoji: '🚶',
      color: '#fcc842',
    };
  } else {
    project = {
      claimed: false,
      repoDriverAccount: {
        userId: '0',
        driver: 'repo',
      },
      source: {
        forge: 'gitlab',
        repoName: gitlabRepoName,
        ownerName: gitlabUsername,
        host: 'gitlab.com',
        url: `https://github.com/${gitlabUsername}/${gitlabRepoName}.git`,
      },
      owner: undefined,
    };
  }

  return {
    project,
  };
};

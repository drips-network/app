import {
  VerificationStatus,
  type GenericGitSource,
  type GitProject,
} from '$lib/utils/metadata/types';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
  const { gitUrl } = params;

  const decodedGitUrl = new URL(decodeURI(gitUrl));

  // TODO: Fetch real repo data

  let project: GitProject<GenericGitSource>;

  if (decodedGitUrl.href === 'https://some-host.com/svelte-stepper.git') {
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
        forge: 'generic',
        repoName: 'svelte-stepper',
        url: decodedGitUrl.href,
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
        forge: 'generic',
        repoName: 'svelte-stepper',
        url: decodedGitUrl.href,
      },
      owner: undefined,
      verificationStatus: VerificationStatus.NOT_STARTED,
    };
  }

  return {
    project,
  };
};

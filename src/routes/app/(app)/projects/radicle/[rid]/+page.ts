import type { GitProject, RadicleSource } from '../../types';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
  const { rid } = params;

  // TODO: Fetch real project.

  let project: GitProject<RadicleSource>;

  if (rid === 'rad:1234') {
    project = {
      gitDriverAccount: {
        userId: '0',
        driver: 'git',
      },
      owner: {
        driver: 'address',
        userId: '0',
        address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
      },
      source: {
        type: 'radicle',
        rid,
        repoName: 'Svelte Stepper',
        seed: 'seed.radicle.xyz',
        url: `https://seed.radicle.xyz/${rid}`,
      },
      emoji: '🚶',
      color: '#fcc842',
    };
  } else {
    project = {
      gitDriverAccount: {
        userId: '0',
        driver: 'git',
      },
      source: {
        type: 'radicle',
        rid,
        repoName: 'Svelte Stepper',
        seed: 'seed.radicle.xyz',
        url: `https://seed.radicle.xyz/${rid}`,
      },
      owner: undefined,
    };
  }

  return {
    project,
  };
};

import { makeStep } from '$lib/components/stepper/types';
import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
import type { WaveDto, WaveRepoWithDetailsDto } from '$lib/utils/wave/types/wave';
import ConfigureDetails from './configure-details.svelte';

export default (
  waveRepos: WaveRepoWithDetailsDto[],
  issues: IssueDetailsDto[],
  waves: WaveDto[],
  onSuccess?: () => void,
) => {
  return {
    steps: [
      makeStep({
        component: ConfigureDetails,
        props: {
          waveRepos,
          issues,
          waves,
          onsuccess: onSuccess,
        },
      }),
    ],
  };
};

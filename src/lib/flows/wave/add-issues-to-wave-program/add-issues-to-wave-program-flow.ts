import { makeStep } from '$lib/components/stepper/types';
import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
import type {
  WaveProgramDto,
  WaveProgramRepoWithDetailsDto,
} from '$lib/utils/wave/types/waveProgram';
import ConfigureDetails from './configure-details.svelte';

export default (
  waveProgramRepos: WaveProgramRepoWithDetailsDto[],
  issues: IssueDetailsDto[],
  wavePrograms: WaveProgramDto[],
  onSuccess?: () => void,
) => {
  return {
    steps: [
      makeStep({
        component: ConfigureDetails,
        props: {
          waveProgramRepos,
          issues,
          wavePrograms,
          onsuccess: onSuccess,
        },
      }),
    ],
  };
};

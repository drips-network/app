import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import RpgfAdminBallotUploadStep from '$lib/components/rpgf-admin-ballot-upload-modal/rpgf-admin-ballot-upload-modal.svelte';
import type { Round } from '$lib/utils/rpgf/types/round';
import type { RpgfUser } from '$lib/utils/rpgf/types/user';
import type { WrappedBallot } from '$lib/utils/rpgf/types/ballot';

export default (round: Round, voters: RpgfUser[], existingBallots: WrappedBallot[]) => ({
  steps: [
    makeStep({
      component: RpgfAdminBallotUploadStep,
      props: { round, voters, existingBallots },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        message:
          'The ballot was uploaded successfully. Voters can still update their ballot while voting remains open.',
        action: 'close',
      },
    }),
  ],
});

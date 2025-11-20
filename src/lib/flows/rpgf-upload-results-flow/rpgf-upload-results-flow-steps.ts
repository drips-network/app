import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import type { Round } from '$lib/utils/rpgf/types/round';
import UploadResults from './upload-results.svelte';

export default (round: Round) => ({
  steps: [
    makeStep({
      component: UploadResults,
      props: { round },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        message: 'The round results have been successfully imported. You can now publish them.',
        action: 'link',
        linkText: 'Back to the round',
        href: () => `/app/rpgf/rounds/${round.urlSlug}`,
      },
    }),
  ],
});

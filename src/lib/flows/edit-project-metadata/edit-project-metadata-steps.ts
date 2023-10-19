import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { get } from 'svelte/store';
import walletStore from '$lib/stores/wallet/wallet.store';
import SetNewMetadata from './steps/set-new-metadata.svelte';
import type { ClaimedProject } from '$lib/graphql/generated/graphql';

export default (project: ClaimedProject) => ({
  context: undefined,
  steps: [
    makeStep({
      component: SetNewMetadata,
      props: {
        project,
      },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        safeAppMode: Boolean(get(walletStore).safe),
        message:
          'Your project has successfully been updated. Please note that it may take some time for your dashboard to update.',
      },
    }),
  ],
});

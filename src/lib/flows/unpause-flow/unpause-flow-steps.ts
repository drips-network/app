import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import Unpause from './unpause.svelte';
import type { UnpauseFlowStreamFragment } from './__generated__/gql.generated';

export default (stream: UnpauseFlowStreamFragment) => ({
  context: undefined,
  steps: [
    makeStep({
      component: Unpause,
      props: {
        stream,
      },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        safeAppMode: Boolean(get(walletStore).safe),
        message: 'Your stream has been unpaused.',
      },
    }),
  ],
});

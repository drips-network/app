import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import Pause from './pause.svelte';
import type { PauseFlowStreamFragment } from './__generated__/gql.generated';

export default (stream: PauseFlowStreamFragment) => ({
  context: undefined,
  steps: [
    makeStep({
      component: Pause,
      props: {
        stream,
      },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        safeAppMode: Boolean(get(walletStore).safe),
        message: 'Your stream has been paused.',
      },
    }),
  ],
});

import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import type { Stream } from '$lib/stores/streams/types';
import walletStore from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import EnterNewDetails from './enter-new-details.svelte';

export default (stream: Stream) => ({
  context: undefined,
  steps: [
    makeStep({
      component: EnterNewDetails,
      props: {
        stream,
      },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        safeAppMode: Boolean(get(walletStore).safe),
        message:
          'Your stream has successfully been edited. It may take some time for your dashboard to update.',
      },
    }),
  ],
});

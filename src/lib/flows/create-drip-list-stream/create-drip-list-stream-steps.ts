import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { get } from 'svelte/store';
import ConfigureStream from './steps/configure-stream.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';

export default (dripListId: string) => ({
  context: undefined,
  steps: [
    makeStep({
      component: ConfigureStream,
      props: { dripListId },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        safeAppMode: Boolean(get(walletStore).safe),
        message:
          'Your support stream has successfully been created. Please refresh the app to see your changes.',
      },
    }),
  ],
});

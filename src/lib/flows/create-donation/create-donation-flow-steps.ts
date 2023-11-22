import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import createDonationFlowState from './create-donation-flow-state';
import InputDetails from './input-details.svelte';
import type {
  NFTDriverAccount,
  RepoDriverAccount,
} from '$lib/components/drip-visual/drip-visual.svelte';
import type { AddressDriverAccount } from '$lib/stores/streams/types';

export default (receiver?: NFTDriverAccount | AddressDriverAccount | RepoDriverAccount) => ({
  context: createDonationFlowState,
  steps: [
    makeStep({
      component: InputDetails,
      props: {
        receiver,
      },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        safeAppMode: Boolean(get(walletStore).safe),
        message:
          'Your donation has been sent. ' +
          'Please note that it may take a while for your dashboard to update.',
      },
    }),
  ],
});

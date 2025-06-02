import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { get } from 'svelte/store';
import LoadData from './load-data.svelte';
import Review from './review.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';

export default (votingRoundId: string) => ({
  steps: [
    makeStep({
      component: LoadData,
      props: {
        votingRoundId,
      },
    }),
    makeStep({
      component: Review,
      props: {
        votingRoundId,
      },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        safeAppMode: Boolean(get(walletStore).safe),
        onAction: () => window.location.reload(),
        message: 'Your new Drip List has successfully been published on-chain.',
      },
    }),
  ],
});

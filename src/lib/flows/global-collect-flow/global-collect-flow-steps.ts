import { updateCollectButton } from '$lib/components/collect-button/collect-button.svelte';
import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import { get } from 'svelte/store';
import SelectTokens from './steps/select-tokens/select-tokens.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';

interface Amount {
  tokenAddress: string;
  amount: bigint;
}

export default function globalCollectFlowSteps(splittable: Amount[]) {
  return {
    steps: mapFilterUndefined(
      [
        makeStep({
          component: SelectTokens,
          props: {
            splittable,
          },
        }),
        makeStep({
          component: SuccessStep,
          props: {
            safeAppMode: Boolean(get(walletStore).safe),
            message: 'Your funds have successfully been delivered to your wallet address.',
            onAction: () => {
              updateCollectButton.set(true);
            },
          },
        }),
      ],
      (v) => v,
    ),
  };
}

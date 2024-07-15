import { invalidate } from '$lib/stores/fetched-data-cache/invalidate';
import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import SelectTokens from './steps/select-tokens/select-tokens.svelte';

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
            message: 'Your funds have successfully been delivered to your wallet address.',
            onAction: () => {
              // Refresh collectable balances
              invalidate('app-layout:user');
            },
          },
        }),
      ],
      (v) => v,
    ),
  };
}

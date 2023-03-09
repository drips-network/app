import collectFlowState from './collect-flow-state';
import SelectCollectTokenStep from './select-token.svelte';
import FetchCollectableAmounts from './fetch-collectable-amounts.svelte';
import CollectAmountsStep from './collect-amounts.svelte';
import { makeStep } from '$lib/components/stepper/types';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import { get } from 'svelte/store';
import walletStore from '$lib/stores/wallet/wallet.store';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import tokens from '$lib/stores/tokens';
import unreachable from '$lib/utils/unreachable';

export default function getCollectFlowSteps(tokenAddress: string | undefined = undefined) {
  const ctx = collectFlowState(tokenAddress);

  return {
    context: () => ctx,
    steps: mapFilterUndefined(
      [
        // need to select token?
        !tokenAddress
          ? makeStep({
              component: SelectCollectTokenStep,
              props: undefined,
            })
          : undefined,
        makeStep({
          component: FetchCollectableAmounts,
          props: undefined,
        }),
        makeStep({
          component: CollectAmountsStep,
          props: undefined,
        }),
        makeStep({
          component: SuccessStep,
          props: {
            message: `Your ${
              tokens.getByAddress(get(ctx).tokenAddress ?? unreachable())?.info.symbol
            } earnings have successfully been delivered to your wallet address.`,
            safeAppMode: Boolean(get(walletStore).safe),
          },
        }),
      ],
      (v) => v,
    ),
  };
}

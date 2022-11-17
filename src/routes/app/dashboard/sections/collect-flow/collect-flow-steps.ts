import collectFlowState from './collect-flow-state';
import SelectCollectTokenStep from './select-token.svelte';
import FetchCollectableAmounts from './fetch-collectable-amounts.svelte';
import CollectAmountsStep from './collect-amounts.svelte';
import Success from './success.svelte';
import { makeStep } from '$lib/components/stepper/types';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import { isAddress } from 'ethers/lib/utils';
import assert from '$lib/utils/assert';

export default function getCollectFlowSteps(tokenAddress: string | undefined = undefined) {
  if (tokenAddress) {
    assert(isAddress(tokenAddress));
    collectFlowState.update((c) => ({
      ...c,
      tokenAddress,
    }));
  }

  return {
    context: collectFlowState,
    steps: mapFilterUndefined(
      [
        // need to select token?
        !tokenAddress
          ? makeStep({
              component: SelectCollectTokenStep,
              props: {
                tokenAddress,
              },
            })
          : undefined,
        makeStep({
          component: FetchCollectableAmounts,
          props: {},
        }),
        makeStep({
          component: CollectAmountsStep,
          props: {},
        }),
        makeStep({
          component: Success,
          props: {},
        }),
      ],
      (v) => v,
    ),
  };
}

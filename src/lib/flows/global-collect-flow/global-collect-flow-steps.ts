import { makeStep } from '$lib/components/stepper/types';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import SelectTokens from './steps/select-tokens.svelte';

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
      ],
      (v) => v,
    ),
  };
}

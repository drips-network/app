import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import EnterAmount from './enter-amount.svelte';
import withdrawFlowState from './withdraw-flow-state';

export default function getWithdrawSteps(tokenAddress: string) {
  const state = withdrawFlowState(tokenAddress);

  return {
    context: state,
    steps: [
      makeStep({
        component: EnterAmount,
        props: undefined,
      }),
      makeStep({
        component: SuccessStep,
        props: {
          message:
            "You've successfully withdrawn, and your funds are back in your wallet. It may take some time for your dashboard to update.",
        },
      }),
    ],
  };
}

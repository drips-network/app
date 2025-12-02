import { makeStep } from '$lib/components/stepper/types';
import topUpFlowState from './top-up-flow-state';
import EnterAmountStep from './enter-amount.svelte';
import FetchAllowanceAndBalanceStep from './fetch-allowance-and-balance.svelte';
import SelectTokenStep from './select-token.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { get } from 'svelte/store';
import walletStore from '$lib/stores/wallet/wallet.store';

export default function getTopUpFlowSteps(tokenAddress?: string) {
  const ctx = topUpFlowState(tokenAddress);

  return {
    context: () => ctx,
    steps: [
      tokenAddress
        ? makeStep({
            component: FetchAllowanceAndBalanceStep,
            props: {},
          })
        : makeStep({
            component: SelectTokenStep,
            props: {},
          }),
      makeStep({
        component: EnterAmountStep,
        props: {
          backButton: !tokenAddress,
        },
      }),
      makeStep({
        component: SuccessStep,
        props: {
          safeAppMode: Boolean(get(walletStore).safe),
          message: `Youʼve successfully topped up tokens.
            You may need to refresh the app for your balance to update on your dashboard.`,
        },
      }),
    ],
  };
}

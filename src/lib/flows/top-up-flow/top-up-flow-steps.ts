import { makeStep } from '$lib/components/stepper/types';
import topUpFlowState, { type TopUpFlowState } from './top-up-flow-state';
import assert from '$lib/utils/assert';
import EnterAmountStep from './enter-amount.svelte';
import FetchAllowanceAndBalanceStep from './fetch-allowance-and-balance.svelte';
import SelectTokenStep from './select-token.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import tokens from '$lib/stores/tokens';
import formatTokenAmount from '$lib/utils/format-token-amount';
import { get } from 'svelte/store';
import walletStore from '$lib/stores/wallet/wallet.store';

function getSuccessMessage(state: TopUpFlowState) {
  const { tokenAddress, amountToTopUp } = state;
  assert(tokenAddress && amountToTopUp);

  const tokenInfo = tokens.getByAddress(tokenAddress);
  assert(tokenInfo);

  const formattedAmount = formatTokenAmount(
    { tokenAddress, amount: amountToTopUp },
    tokenInfo.info.decimals,
    1n,
  );

  return `
    You've successfully topped up ${formattedAmount} ${tokenInfo.info.name}.
    It may take some time for your balance to update on your dashboard.
  `;
}

export default function getTopUpFlowSteps(tokenAddress?: string) {
  const ctx = topUpFlowState(tokenAddress);

  return {
    context: () => ctx,
    steps: [
      tokenAddress
        ? makeStep({
            component: FetchAllowanceAndBalanceStep,
            props: undefined,
          })
        : makeStep({
            component: SelectTokenStep,
            props: undefined,
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
          message: () => getSuccessMessage(get(ctx)),
        },
      }),
    ],
  };
}

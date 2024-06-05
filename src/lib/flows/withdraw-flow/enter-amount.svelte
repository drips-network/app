<script lang="ts" context="module">
  export const WITHDRAW_FLOW_ENTER_AMOUNT_STEP_BALANCES_FRAGMENT = gql`
    ${CURRENT_AMOUNTS_USER_BALANCE_TIMELINE_ITEM_FRAGMENT}
    fragment WithdrawFlowEnterAmountStepBalances on UserBalances {
      tokenAddress
      outgoing {
        ...CurrentAmountsUserBalanceTimelineItem
      }
    }
  `;
</script>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import EmojiAndToken from '$lib/components/emoji-and-token/emoji-and-token.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import Token from '$lib/components/token/token.svelte';
  import tokens from '$lib/stores/tokens';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import unreachable from '$lib/utils/unreachable';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import { constants } from 'radicle-drips';
  import type { Writable } from 'svelte/store';
  import type { WithdrawFlowState } from './withdraw-flow-state';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import parseTokenAmount from '$lib/utils/parse-token-amount';
  import Toggle from '$lib/components/toggle/toggle.svelte';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import SafeAppDisclaimer from '$lib/components/safe-app-disclaimer/safe-app-disclaimer.svelte';
  import { buildBalanceChangePopulatedTx } from '$lib/utils/streams/streams';
  import { gql } from 'graphql-request';
  import {
    CURRENT_AMOUNTS_USER_BALANCE_TIMELINE_ITEM_FRAGMENT,
    streamCurrentAmountsStore,
  } from '../create-stream-flow/methods/current-amounts';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<WithdrawFlowState>;

  $: balance =
    $context.userOutgoingTokenBalances.find(
      (balance) => balance.tokenAddress.toLowerCase() === $context.tokenAddress.toLowerCase(),
    ) ?? unreachable();

  $: currentAmountsStore = streamCurrentAmountsStore(balance.outgoing, $context.tokenAddress);

  $: tokenInfo = tokens.getByAddress($context.tokenAddress) ?? unreachable();

  let amountWei: bigint | undefined;
  $: if ($context.amount) amountWei = parseTokenAmount($context.amount, tokenInfo.info.decimals);

  let validationState: TextInputValidationState;
  $: {
    if ($context.withdrawAll && $currentAmountsStore.currentAmount.amount > 0n) {
      validationState = { type: 'valid' };
    } else if (amountWei && amountWei > 0n) {
      if (
        amountWei * BigInt(constants.AMT_PER_SEC_MULTIPLIER) <
        $currentAmountsStore.currentAmount.amount
      ) {
        validationState = { type: 'valid' };
      } else {
        validationState = {
          type: 'invalid',
          message: 'You can only withdraw less than your current remaining streamable balance.',
        };
      }
    } else if ($context.amount && amountWei === undefined) {
      validationState = { type: 'invalid', message: 'Invalid amount.' };
    } else {
      validationState = { type: 'unvalidated' };
    }
  }

  function triggerWithdraw() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const assetDriverClient = await getAddressDriverClient();

          const MAX_INT_128 = 170141183460469231731687303715884105728n;

          const amountToWithdraw = $context.withdrawAll
            ? -MAX_INT_128
            : -(amountWei ?? unreachable());

          const tx = await buildBalanceChangePopulatedTx(
            assetDriverClient,
            tokenInfo.info.address,
            amountToWithdraw,
          );

          return {
            tx,
          };
        },

        transactions: ({ tx }) => [
          {
            transaction: tx,
            applyGasBuffer: true,
          },
        ],
      }),
    );
  }
</script>

<StepLayout>
  <EmojiAndToken emoji="🤑" tokenAddress={tokenInfo.info.address} animateTokenOnMount />
  <StepHeader
    headline={`Withdraw ${tokenInfo?.info.symbol}`}
    description="Withdraw funds from your outgoing streaming balance."
  />
  <FormField title="Balance">
    <div class="flex border rounded-drip-xl p-3 typo-text gap-2 items-center">
      <Token address={$context.tokenAddress} show="none" size="small" />
      <div class="flex-1 min-w-0 truncate">
        {tokenInfo.info.name ?? 'Unknown token'}
      </div>
      <div class="flex-1 min-w-0 truncate text-right text-foreground-level-4">
        {formatTokenAmount($currentAmountsStore.currentAmount.amount, tokenInfo.info.decimals)}
      </div>
      <div class="text-foreground-level-4">
        {tokenInfo.info.symbol}
      </div>
    </div>
  </FormField>
  <FormField title="Amount to withdraw">
    {#if $context.withdrawAll}
      <TextInput value="Entire balance" disabled {validationState} />
    {:else}
      <TextInput
        bind:value={$context.amount}
        disabled={$context.withdrawAll}
        variant={{ type: 'number', min: 0 }}
        suffix={tokenInfo.info.symbol}
        placeholder="Enter amount"
        {validationState}
      />
    {/if}
    <svelte:fragment slot="action">
      <Toggle bind:checked={$context.withdrawAll} label="Max" />
    </svelte:fragment>
  </FormField>
  <SafeAppDisclaimer disclaimerType="drips" />
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button variant="primary" disabled={validationState.type !== 'valid'} on:click={triggerWithdraw}
      >Withdraw</Button
    >
  </svelte:fragment>
</StepLayout>

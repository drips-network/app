<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import EmojiAndToken from '$lib/components/emoji-and-token/emoji-and-token.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import Token from '$lib/components/token/token.svelte';
  import balances from '$lib/stores/balances';
  import streams from '$lib/stores/streams';
  import tokens from '$lib/stores/tokens';
  import wallet from '$lib/stores/wallet/wallet.store';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import unreachable from '$lib/utils/unreachable';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import { constants } from 'radicle-drips';
  import { get, type Writable } from 'svelte/store';
  import assert from '$lib/utils/assert';
  import type { WithdrawFlowState } from './withdraw-flow-state';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import expect from '$lib/utils/expect';
  import { createEventDispatcher } from 'svelte';
  import parseTokenAmount from '$lib/utils/parse-token-amount';
  import Toggle from '$lib/components/toggle/toggle.svelte';
  import { formatUnits } from 'ethers/lib/utils';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import SafeAppDisclaimer from '$lib/components/safe-app-disclaimer/safe-app-disclaimer.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<WithdrawFlowState>;

  $: tokenInfo = tokens.getByAddress($context.tokenAddress) ?? unreachable();
  $: estimate =
    $balances.accounts[String($wallet.dripsUserId) ?? unreachable()].tokens[$context.tokenAddress]
      .total.totals.remainingBalance;

  let amount: string | undefined;
  let amountWei: bigint | undefined;
  let withdrawAll = false;
  $: if (withdrawAll) {
    amount = formatUnits(
      estimate / BigInt(constants.AMT_PER_SEC_MULTIPLIER),
      tokenInfo.info.decimals,
    );
  }

  $: if (amount) amountWei = parseTokenAmount(amount, tokenInfo.info.decimals);

  let validationState: TextInputValidationState;
  $: {
    if (withdrawAll && amountWei && amountWei > 0n) {
      validationState = { type: 'valid' };
    } else if (amountWei && amountWei > 0n) {
      if (amountWei * BigInt(constants.AMT_PER_SEC_MULTIPLIER) < estimate) {
        validationState = { type: 'valid' };
      } else {
        validationState = {
          type: 'invalid',
          message: 'You can only withdraw less than your current remaining streamable balance.',
        };
      }
    } else if (amount && amountWei === undefined) {
      validationState = { type: 'invalid', message: 'Invalid amount.' };
    } else {
      validationState = { type: 'unvalidated' };
    }
  }

  function getAssetConfigHistory(dripsUserId: string, tokenAddress: string) {
    return (
      get(streams).accounts[dripsUserId].assetConfigs.find(
        (ac) => ac.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
      ) ?? unreachable()
    ).history;
  }

  function triggerWithdraw() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const { address, dripsUserId } = $wallet;
          assert(address && dripsUserId);

          const addressDriverClient = await getAddressDriverClient();

          const ownAccount = $streams.accounts[dripsUserId];
          assert(ownAccount, "App hasn't yet fetched user's own account");

          const assetConfig = ownAccount.assetConfigs.find(
            (ac) => ac.tokenAddress.toLowerCase() === $context.tokenAddress.toLowerCase(),
          );
          assert(assetConfig, "App hasn't yet fetched the right asset config");

          const currentReceivers = mapFilterUndefined(assetConfig.streams, (stream) =>
            stream.paused
              ? undefined
              : {
                  userId: stream.receiver.userId,
                  config: stream.dripsConfig.raw,
                },
          );

          assert(amountWei);

          const tx = addressDriverClient.setDrips(
            $context.tokenAddress,
            currentReceivers,
            currentReceivers,
            address,
            -amountWei,
          );

          return {
            tx,
            dripsUserId,
          };
        },
        transactions: (transactContext) => ({
          transaction: () => transactContext.tx,
        }),
        after: async (_, transactContext) => {
          const currentAssetConfigHistoryLength = getAssetConfigHistory(
            transactContext.dripsUserId,
            $context.tokenAddress,
          ).length;

          await expect(
            streams.refreshUserAccount,
            () => {
              const newLength = getAssetConfigHistory(
                transactContext.dripsUserId,
                $context.tokenAddress,
              ).length;

              return newLength > currentAssetConfigHistoryLength;
            },
            5000,
            1000,
          );
        },
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
    <div class="balance">
      <ListSelect
        blockInteraction
        searchable={false}
        items={{
          '': {
            type: 'selectable',
            label: tokenInfo.info.name ?? 'Unknown token',
            text: `${formatTokenAmount(estimate, tokenInfo.info.decimals)} ${
              tokenInfo.info.symbol
            }`,
            image: {
              component: Token,
              props: {
                address: $context.tokenAddress,
                show: 'none',
                size: 'small',
              },
            },
          },
        }}
      />
    </div>
  </FormField>
  <FormField title="Amount to withdraw">
    <TextInput
      bind:value={amount}
      disabled={withdrawAll}
      variant={{ type: 'number', min: 0 }}
      suffix={tokenInfo.info.symbol}
      placeholder="Enter amount"
      {validationState}
    />
    <svelte:fragment slot="toggle">
      <Toggle bind:checked={withdrawAll} label="Max" />
    </svelte:fragment>
  </FormField>
  <SafeAppDisclaimer disclaimerType="drips" />
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')}>Cancel</Button>
    <Button variant="primary" disabled={validationState.type !== 'valid'} on:click={triggerWithdraw}
      >Withdraw</Button
    >
  </svelte:fragment>
</StepLayout>

<style>
  .balance {
    border: 1px solid var(--color-foreground);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    overflow: hidden;
  }
</style>

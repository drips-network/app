<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import LineItems from '$lib/components/line-items/line-items.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents, UpdateAwaitStepFn } from '$lib/components/stepper/types';
  import tokens from '$lib/stores/tokens';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import {
    getAddressDriverClient,
    getCallerClient,
    getNetworkConfig,
  } from '$lib/utils/get-drips-clients';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import unreachable from '$lib/utils/unreachable';
  import Emoji from '$lib/components/emoji/Emoji.svelte';
  import type { Writable } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';
  import type { CollectFlowState } from './collect-flow-state';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import wallet from '$lib/stores/wallet';
  import assert from '$lib/utils/assert';
  import EmojiAndToken from '$lib/components/emoji-and-token/emoji-and-token.svelte';
  import formatDate from '$lib/utils/format-date';
  import { getSplitPercent } from '$lib/utils/get-split-percent';
  import { AddressDriverPresets } from 'radicle-drips';
  import etherscanLink from '$lib/utils/etherscan-link';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<CollectFlowState>;

  $: cycle = $context.currentDripsCycle ?? unreachable();
  $: currentCycleEnd = new Date(cycle.start.getTime() + cycle.durationMillis);

  $: splitsConfig = $context.splitsConfig ?? unreachable();

  $: tokenAddress = $context.tokenAddress ?? unreachable();
  $: balances = $context.balances ?? unreachable();
  $: ownSplitsWeight = $context.ownSplitsWeight ?? unreachable();

  $: selectedToken = tokens.getByAddress($context.tokenAddress ?? '')?.info ?? unreachable();

  $: splittableAfterReceive = balances.receivable + balances.splittable;
  $: collectableAfterSplit =
    (splittableAfterReceive * ownSplitsWeight) / 1000000n + balances.collectable;

  function makeAmount(fromBalance: bigint) {
    return {
      tokenAddress: tokenAddress ?? unreachable(),
      amount: fromBalance,
    };
  }

  async function receiveSplitCollect(updateAwaitStep: UpdateAwaitStepFn) {
    const callerClient = await getCallerClient();
    const addressDriverClient = await getAddressDriverClient();
    const userId = await addressDriverClient.getUserId();

    const { address: userAddress, network } = $wallet;
    assert(userAddress);

    const { CONTRACT_DRIPS_HUB, CONTRACT_ADDRESS_DRIVER } = getNetworkConfig();

    const collectFlow = AddressDriverPresets.Presets.createCollectFlow({
      driverAddress: CONTRACT_ADDRESS_DRIVER,
      dripsHubAddress: CONTRACT_DRIPS_HUB,
      userId,
      tokenAddress,
      // TODO: Replace with dynamic maxCycles
      maxCycles: 1000,
      currentReceivers: splitsConfig,
      transferToAddress: userAddress,
    });

    updateAwaitStep({
      message: 'Please confirm the collect transaction in your wallet',
      icon: {
        component: Emoji,
        props: {
          emoji: '👛',
          size: 'huge',
        },
      },
    });

    const tx = await callerClient.callBatched(collectFlow);

    updateAwaitStep({
      message: 'Waiting for your transaction to be confirmed…',
      link: {
        url: etherscanLink(network.name, tx.hash),
        label: 'View on Etherscan',
      },
    });

    await tx.wait();

    context.update((c) => ({
      ...c,
      // TODO: Display the real value from the `Collected` event emitted during the batch call,
      // once this is added to the subgraph client.
      amountCollected: collectableAfterSplit,
    }));
  }

  function startCollect() {
    dispatch('await', {
      promise: receiveSplitCollect,
      message: 'Getting ready to collect...',
    });
  }
</script>

<StepLayout>
  <EmojiAndToken emoji="👛" {tokenAddress} animateTokenOnMount={splittableAfterReceive !== 0n} />
  <StepHeader
    headline={`Collect ${selectedToken.symbol}`}
    description={splittableAfterReceive === 0n
      ? `You currently don't have any ${selectedToken.symbol} to collect this cycle.`
      : `${selectedToken.symbol} earnings can be collected from your account.`}
  />
  <FormField
    title="Review"
    description={`
      Tokens streamed to your account become “receivable” on a weekly cycle. Your receivable balance
      updates next on ${formatDate(currentCycleEnd)}.`}
  >
    <LineItems
      lineItems={mapFilterUndefined(
        [
          {
            title: `Receivable ${selectedToken.symbol}`,
            subtitle: 'from incoming streams',
            value: formatTokenAmount(makeAmount(balances.receivable), selectedToken.decimals, 1n),
            symbol: selectedToken.symbol,
            disabled: balances.receivable === 0n,
          },
          {
            title: `Splittable ${selectedToken.symbol}`,
            subtitle: 'from already-received streams or incoming splits & gives',
            value:
              '+' + formatTokenAmount(makeAmount(balances.splittable), selectedToken.decimals, 1n),
            symbol: selectedToken.symbol,
            disabled: balances.splittable === 0n,
          },
          {
            title: `Splitting ${getSplitPercent(1000000n - ownSplitsWeight, 'pretty')}`,
            value:
              '-' +
              formatTokenAmount(
                makeAmount(collectableAfterSplit - splittableAfterReceive),
                selectedToken.decimals,
                1n,
              ),
            disabled: ownSplitsWeight === 1000000n,
            symbol: selectedToken.symbol,
          },
          balances.collectable !== 0n
            ? {
                title: `Previously-split funds`,
                value:
                  '+' +
                  formatTokenAmount(makeAmount(balances.collectable), selectedToken.decimals, 1n),
                symbol: selectedToken.symbol,
              }
            : undefined,
          {
            title: 'You collect',
            subtitle: 'These funds will be sent to your wallet.',
            value: formatTokenAmount(makeAmount(collectableAfterSplit), selectedToken.decimals, 1n),
            symbol: selectedToken.symbol,
            disabled: collectableAfterSplit === 0n,
            highlight: true,
          },
        ],
        (v) => v,
      )}
    />
  </FormField>
  <svelte:fragment slot="actions">
    <Button
      disabled={splittableAfterReceive === 0n && balances.collectable === 0n}
      on:click={startCollect}>Collect {selectedToken.symbol}</Button
    >
  </svelte:fragment>
</StepLayout>

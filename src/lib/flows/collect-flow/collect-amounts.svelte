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
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import type { Writable } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';
  import type { CollectFlowState } from './collect-flow-state';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import wallet from '$lib/stores/wallet';
  import assert from '$lib/utils/assert';
  import EmojiAndToken from '$lib/components/emoji-and-token/emoji-and-token.svelte';
  import formatDate from '$lib/utils/format-date';
  import { getSplitPercent } from '$lib/utils/get-split-percent';
  import { AddressDriverPresets, constants } from 'radicle-drips';
  import etherscanLink from '$lib/utils/etherscan-link';
  import Toggleable from '$lib/components/toggleable/toggleable.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import balancesStore from '$lib/stores/balances/balances.store';
  import type { User } from '$lib/stores/streams/types';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import getSqueezeArgs from './get-squeeze-args';
  import modal from '$lib/stores/modal';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<CollectFlowState>;

  $: cycle = $context.currentDripsCycle ?? unreachable();
  $: currentCycleEnd = new Date(cycle.start.getTime() + cycle.durationMillis);

  $: splitsConfig = $context.splitsConfig ?? unreachable();

  $: tokenAddress = $context.tokenAddress ?? unreachable();
  $: balances = $context.balances ?? unreachable();
  $: ownSplitsWeight = $context.ownSplitsWeight ?? unreachable();

  $: selectedToken = tokens.getByAddress($context.tokenAddress ?? '')?.info ?? unreachable();

  function makeAmount(fromBalance: bigint) {
    return {
      tokenAddress: tokenAddress ?? unreachable(),
      amount: fromBalance,
    };
  }

  interface StreamEstimateByReceiver {
    sender: User;
    amount: bigint;
  }

  $: incomingEstimatesBySender =
    $balancesStore &&
    balancesStore
      .getStreamEstimatesByReceiver('currentCycle', $wallet.dripsUserId ?? unreachable())
      .reduce<StreamEstimateByReceiver[]>((acc, streamEstimate) => {
        const senderAddress = streamEstimate.sender.address;
        const existingEntry = acc.find((e) => e.sender.address === senderAddress);

        if (existingEntry) {
          acc[acc.indexOf(existingEntry)] = {
            ...existingEntry,
            amount: existingEntry.amount + streamEstimate.totalStreamed,
          };
        } else {
          acc.push({
            sender: streamEstimate.sender,
            amount: streamEstimate.totalStreamed,
          });
        }

        return acc;
      }, []);

  let currentCycleSenders: Items;
  $: currentCycleSenders = Object.fromEntries(
    mapFilterUndefined(incomingEstimatesBySender, (estimate) => {
      if (estimate.amount === 0n) return;

      return [
        estimate.sender.userId,
        {
          type: 'selectable',
          label: {
            component: IdentityBadge,
            props: {
              address: estimate.sender.address,
              size: 'normal',
            },
          },
          text: `≈ ${formatTokenAmount(estimate.amount, selectedToken.decimals)} ${
            selectedToken.symbol
          }`,
        },
      ];
    }),
  );

  let squeezeEnabled = false;
  let selectedSqueezeSenderItems: string[] = [];

  $: totalSelectedSqueezeAmount = squeezeEnabled
    ? selectedSqueezeSenderItems.reduce<bigint>(
        (acc, sender) =>
          acc +
          (incomingEstimatesBySender.find((e) => e.sender.userId === sender)?.amount ??
            unreachable()),
        0n,
      ) / BigInt(constants.AMT_PER_SEC_MULTIPLIER)
    : 0n;

  $: splittableAfterReceive =
    balances.receivable + balances.splittable + totalSelectedSqueezeAmount;
  $: collectableAfterSplit =
    (splittableAfterReceive * ownSplitsWeight) / 1000000n + balances.collectable;

  async function receiveSplitCollect(updateAwaitStep: UpdateAwaitStepFn) {
    modal.setHideable(false);

    const callerClient = await getCallerClient();
    const addressDriverClient = await getAddressDriverClient();
    const userId = await addressDriverClient.getUserId();

    const { address: userAddress, network } = $wallet;
    assert(userAddress);

    const { CONTRACT_DRIPS_HUB, CONTRACT_ADDRESS_DRIVER } = getNetworkConfig();

    let squeezeArgs: Awaited<ReturnType<typeof getSqueezeArgs>> | undefined;
    if (squeezeEnabled && selectedSqueezeSenderItems.length > 0) {
      squeezeArgs = await getSqueezeArgs(selectedSqueezeSenderItems, tokenAddress);
    }

    const collectFlow = AddressDriverPresets.Presets.createSqueezeCollectFlow({
      squeezeArgs,
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

    modal.setHideable(true);
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
  <StepHeader headline={`Collect ${selectedToken.symbol}`} />
  <p>
    Tokens streamed to your account automatically become “receivable” on a weekly cycle. Your
    receivable balance updates next on {formatDate(currentCycleEnd)}. Before this, you can choose to
    collect earnings from the current cycle already, but you'll need to pay slightly higher gas
    fees.
  </p>
  <Toggleable label="Include funds from current cycle" bind:toggled={squeezeEnabled}>
    <p>
      Select which senders from the current cycle you would like to collect from. The network fee to
      collect will increase with each sender. Please note that the amounts shown here are estimates
      based on your current system time, and the amounts you actually end up collecting may slightly
      differ.
    </p>
    <div class="list-wrapper">
      <ListSelect
        items={currentCycleSenders}
        multiselect
        bind:selected={selectedSqueezeSenderItems}
        searchable={false}
      />
    </div>
  </Toggleable>
  <FormField title="Review">
    <LineItems
      lineItems={mapFilterUndefined(
        [
          {
            title: `${selectedToken.symbol} from current cycle`,
            subtitle: 'from incoming streams',
            value:
              '≈ ' +
              formatTokenAmount(
                makeAmount(totalSelectedSqueezeAmount ?? 0n),
                selectedToken.decimals,
                1n,
              ),
            symbol: selectedToken.symbol,
            disabled: !totalSelectedSqueezeAmount,
          },
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
              (squeezeEnabled ? '≈ ' : '') +
              formatTokenAmount(
                makeAmount(collectableAfterSplit - splittableAfterReceive),
                selectedToken.decimals,
                1n,
              ),
            disabled:
              ownSplitsWeight === 1000000n || collectableAfterSplit - splittableAfterReceive === 0n,
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
            value:
              (squeezeEnabled ? '≈ ' : '') +
              formatTokenAmount(makeAmount(collectableAfterSplit), selectedToken.decimals, 1n),
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
      variant="primary"
      disabled={splittableAfterReceive === 0n && balances.collectable === 0n}
      on:click={startCollect}>Collect {selectedToken.symbol}</Button
    >
  </svelte:fragment>
</StepLayout>

<style>
  p {
    color: var(--color-foreground-level-6);
    text-align: left;
  }

  .list-wrapper {
    margin-top: 1rem;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }
</style>

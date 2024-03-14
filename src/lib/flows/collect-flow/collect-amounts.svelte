<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import LineItems from '$lib/components/line-items/line-items.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import tokens from '$lib/stores/tokens';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import {
    getAddressDriverClient,
    getCallerClient,
    getNetworkConfig,
    getSubgraphClient,
  } from '$lib/utils/get-drips-clients';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import unreachable from '$lib/utils/unreachable';
  import type { Writable } from 'svelte/store';
  import type { CollectFlowState } from './collect-flow-state';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import wallet from '$lib/stores/wallet/wallet.store';
  import assert from '$lib/utils/assert';
  import EmojiAndToken from '$lib/components/emoji-and-token/emoji-and-token.svelte';
  import formatDate from '$lib/utils/format-date';
  import { getSplitPercent } from '$lib/utils/splits/get-split-percent';
  import { AddressDriverPresets, constants, type CollectedEvent } from 'radicle-drips';
  import Toggleable from '$lib/components/toggleable/toggleable.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import balancesStore from '$lib/stores/balances/balances.store';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import getSqueezeArgs from './get-squeeze-args';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import expect from '$lib/utils/expect';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher, onMount } from 'svelte';
  import SafeAppDisclaimer from '$lib/components/safe-app-disclaimer/safe-app-disclaimer.svelte';
  import type { AddressDriverAccount } from '$lib/stores/streams/types';
  import nextSettlementDate from '$lib/utils/settlement-date';

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
    sender: AddressDriverAccount;
    amount: bigint;
  }

  $: incomingEstimatesBySender =
    $balancesStore &&
    balancesStore
      .getStreamEstimatesByReceiver('currentCycle', $wallet.dripsAccountId ?? unreachable())
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

  // Initially select all incoming squeeze senders by default, unless there's prior state.
  onMount(() => {
    if ($context.selectedSqueezeSenderItems?.length === 0 && !$context.squeezeEnabled) {
      $context.selectedSqueezeSenderItems = incomingEstimatesBySender.map(
        (e) => e.sender.accountId,
      );
    }
  });

  let currentCycleSenders: Items;
  $: currentCycleSenders = Object.fromEntries(
    mapFilterUndefined(incomingEstimatesBySender, (estimate) => {
      if (estimate.amount === 0n) return;

      return [
        estimate.sender.accountId,
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

  $: totalSelectedSqueezeAmount = $context.squeezeEnabled
    ? $context.selectedSqueezeSenderItems.reduce<bigint>(
        (acc, sender) =>
          acc +
          (incomingEstimatesBySender.find((e) => e.sender.accountId === sender)?.amount ??
            unreachable()),
        0n,
      ) / BigInt(constants.AMT_PER_SEC_MULTIPLIER)
    : 0n;

  $: splittableAfterReceive =
    balances.receivable + balances.splittable + totalSelectedSqueezeAmount;
  $: collectableAfterSplit =
    (splittableAfterReceive * ownSplitsWeight) / 1000000n + balances.collectable;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  async function startCollect() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const addressDriverClient = await getAddressDriverClient();
          const accountId = await addressDriverClient.getAccountId();

          const { address: userAddress, signer } = $wallet;
          assert(userAddress);

          const { DRIPS, ADDRESS_DRIVER } = getNetworkConfig();

          let squeezeArgs: Awaited<ReturnType<typeof getSqueezeArgs>> | undefined;
          if ($context.squeezeEnabled && $context.selectedSqueezeSenderItems.length > 0) {
            squeezeArgs = await getSqueezeArgs($context.selectedSqueezeSenderItems, tokenAddress);
          }

          const collectFlow = await AddressDriverPresets.Presets.createCollectFlow({
            signer,
            squeezeArgs,
            driverAddress: ADDRESS_DRIVER,
            dripsAddress: DRIPS,
            accountId,
            tokenAddress,
            // TODO: Replace with dynamic maxCycles
            maxCycles: 1000,
            currentReceivers: splitsConfig,
            transferToAddress: userAddress,
          });

          const callerClient = await getCallerClient();
          const tx = await callerClient.populateCallBatchedTx(collectFlow);

          return {
            tx,
            accountId,
          };
        },

        transactions: ({ tx }) => [
          {
            transaction: tx,
            applyGasBuffer: false,
          },
        ],

        after: async (receipts, transactContext) => {
          const receipt = receipts[0];
          const { provider } = $wallet;
          const { timestamp } = await provider.getBlock(receipt.blockNumber);
          assert(timestamp);

          const subgraph = getSubgraphClient();

          function findMatchingEvent(events: CollectedEvent[], timestamp: number) {
            return events.find((e) => e.blockTimestamp === BigInt(timestamp));
          }

          // Wait for the collect event to be indexed by the subgraph so we know how much was actually
          // collected.
          const expectation = await expect(
            async () => subgraph.getCollectedEventsByAccountId(transactContext.accountId),
            (collectedEvents) => Boolean(findMatchingEvent(collectedEvents, timestamp)),
            15000,
            1000,
          );

          const amountCollected = expectation.failed
            ? undefined
            : findMatchingEvent(expectation.result, timestamp)?.collected;

          context.update((c) => ({
            ...c,
            amountCollected,
            receipt,
          }));

          // The squeeze event should be indexed by now, so this should cause the dashboard to update
          // in the background to reflect the newly reduced incoming balance.
          if ($context.squeezeEnabled) {
            await balancesStore.updateSqueezeHistory(transactContext.accountId);
          }
        },
      }),
    );
  }
</script>

<StepLayout>
  <EmojiAndToken emoji="👛" {tokenAddress} animateTokenOnMount={splittableAfterReceive !== 0n} />
  <StepHeader headline={`Collect ${selectedToken.symbol}`} />
  <div>
    <p>
      Received funds settle on the last Thursday of every month. The next settlement date is <span
        class="typo-text-bold">{formatDate(nextSettlementDate(), 'onlyDay')}</span
      >.
    </p>
  </div>
  {#if incomingEstimatesBySender.length > 0}
    <div class="squeeze-section">
      <Toggleable label="Include unsettled stream funds" bind:toggled={$context.squeezeEnabled}>
        <AnnotationBox type="warning">
          The network fee for collecting increases with each selected sender. Unsettled funds are
          estimates, so you may collect less than expected.
        </AnnotationBox>
        <div class="list-wrapper">
          <ListSelect
            items={currentCycleSenders}
            multiselect
            bind:selected={$context.selectedSqueezeSenderItems}
            searchable={false}
            emptyStateText="You don't have any unsettled funds from streams."
          />
        </div>
      </Toggleable>
    </div>
  {/if}
  <FormField title="Review">
    <LineItems
      lineItems={mapFilterUndefined(
        [
          balances.receivable > 0n
            ? {
                title: `Streams`,
                subtitle: $context.squeezeEnabled ? 'Including unsettled funds' : undefined,
                value:
                  $context.squeezeEnabled && totalSelectedSqueezeAmount > 0n
                    ? '≈ ' +
                      formatTokenAmount(
                        makeAmount(balances.receivable + (totalSelectedSqueezeAmount ?? 0n)),
                        selectedToken.decimals,
                        1n,
                      )
                    : formatTokenAmount(
                        makeAmount(balances.receivable),
                        selectedToken.decimals,
                        1n,
                      ),
                symbol: selectedToken.symbol,
              }
            : undefined,
          balances.splittable > 0n
            ? {
                title: 'Drip Lists and projects',
                value: formatTokenAmount(
                  makeAmount(balances.splittable),
                  selectedToken.decimals,
                  1n,
                ),
                symbol: selectedToken.symbol,
                disabled: balances.splittable === 0n,
              }
            : undefined,
          /*
          It used to be possible to set splits for your own AddressDriver account in the Drips App.
          Even though it's no longer possible to do so, maybe some old account still has splits set,
          or maybe the user manually configured splits outside the app. For this reason, we display
          the splitting percentage while collecting, but only if it's more than 0%.
          */
          ownSplitsWeight < 1000000n
            ? {
                title: `Splitting ${getSplitPercent(1000000n - ownSplitsWeight, 'pretty')}`,
                value:
                  ($context.squeezeEnabled ? '≈ ' : '') +
                  formatTokenAmount(
                    makeAmount(collectableAfterSplit - splittableAfterReceive),
                    selectedToken.decimals,
                    1n,
                  ),
                disabled:
                  ownSplitsWeight === 1000000n ||
                  collectableAfterSplit - splittableAfterReceive === 0n,
                symbol: selectedToken.symbol,
              }
            : undefined,
          balances.collectable !== 0n
            ? {
                title: `Previously-split funds`,
                value: formatTokenAmount(
                  makeAmount(balances.collectable),
                  selectedToken.decimals,
                  1n,
                ),
                symbol: selectedToken.symbol,
              }
            : undefined,
          {
            title: 'You collect',
            subtitle: 'These funds will be sent to your wallet.',
            value:
              ($context.squeezeEnabled && totalSelectedSqueezeAmount > 0n ? '≈ ' : '') +
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
  <SafeAppDisclaimer disclaimerType="drips" />
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

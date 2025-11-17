<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AccountBox from '$lib/components/account-box/account-box.svelte';
  import { createEventDispatcher } from 'svelte';
  import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
  import PenIcon from '$lib/components/icons/Pen.svelte';
  import ListIcon from '$lib/components/icons/DripList.svelte';
  import TransactionsIcon from '$lib/components/icons/Transactions.svelte';
  import type { Writable } from 'svelte/store';
  import unreachable from '$lib/utils/unreachable';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import CoinIcon from '$lib/components/icons/Coin.svelte';
  import WalletIcon from '$lib/components/icons/Wallet.svelte';
  import type { State } from '../../create-drip-list-flow';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import expect from '$lib/utils/expect';
  import Pause from '$lib/components/icons/Pause.svelte';
  import ContinuousSupportReviewCard from './components/continuous-support-review-card.svelte';
  import TokenStreams from '$lib/components/icons/TokenStreams.svelte';
  import OneTimeDonationReviewCard from './components/one-time-donation-review-card.svelte';
  import Heart from '$lib/components/icons/Heart.svelte';
  import network from '$lib/stores/wallet/network';
  import { invalidateAll } from '$app/navigation';
  import invalidateAccountCache from '$lib/utils/cache/remote/invalidate-account-cache';
  import WhatsNextCard from '$lib/components/whats-next/whats-next-card.svelte';
  import WhatsNextSection from '$lib/components/whats-next/whats-next-section.svelte';
  import WhatsNextItem from '$lib/components/whats-next/whats-next-item.svelte';
  import { buildDripListCreationTxs } from '$lib/utils/driplist/buildDripListCreationTxs';
  import { sdkManager } from '$lib/utils/sdk/sdk-manager';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    context: Writable<State>;
    connectedWalletHidden?: boolean;
  }

  let { context, connectedWalletHidden = false }: Props = $props();

  async function createDripList() {
    const sdk = sdkManager.sdk;
    if (!sdk) throw new Error('SDK not initialized');

    dispatch(
      'transact',
      makeTransactPayload({
        headline: 'Create your Drip List',
        messages: {
          duringBefore: 'Preparing Drip List creation transactions…',
        },
        before: async () => {
          return await buildDripListCreationTxs($context);
        },

        transactions: ({ txs }) => txs,

        after: async (_, { dripListId }) => {
          const tryFetchList = async (listId: string) => {
            try {
              const dripList = await sdk.dripLists.getById(BigInt(listId), network.chainId);
              return dripList && dripList.isVisible;
            } catch {
              return false;
            }
          };

          await expect(
            () => tryFetchList(dripListId),
            (result) => Boolean(result),
            120000,
            1000,
          );

          await invalidateAccountCache(dripListId);
          await invalidateAll();

          $context.dripListId = dripListId;
        },
      }),
    );
  }

  function goBack() {
    dispatch('goBackward');
  }
</script>

<StandaloneFlowStepLayout headline="Review" description="Here's everything you set up.">
  <FormField type="div" title="Your Drip List">
    {#snippet action()}
      <Button variant="ghost" onclick={() => dispatch('goForward', { by: -4 })} icon={PenIcon}
        >Edit</Button
      >
    {/snippet}
    <h2 class="pixelated drip-list-title">{$context.dripList.title}</h2>
    {#if ($context.dripList.description ?? '').length > 0}
      <p class="my-4">{$context.dripList.description}</p>
    {/if}
    <ListEditor
      bind:weights={$context.dripList.weights}
      bind:items={$context.dripList.items}
      isEditable={false}
    />
  </FormField>

  {#if $context.selectedSupportOption !== undefined}
    <FormField type="div" title="Your support">
      {#snippet action()}
        <Button variant="ghost" onclick={() => dispatch('goForward', { by: -3 })} icon={PenIcon}
          >Edit</Button
        >
      {/snippet}
      {#if $context.selectedSupportOption === 1}
        <div class="card">
          <ContinuousSupportReviewCard
            topUpAmountValueParsed={$context.continuousSupportConfig.topUpAmountValueParsed ?? 0n}
            tokenAddress={$context.continuousSupportConfig.listSelected[0] ?? unreachable()}
            streamRateValueParsed={$context.continuousSupportConfig.streamRateValueParsed ?? 0n}
          />
        </div>
      {:else if $context.selectedSupportOption === 2}
        <div class="card">
          <OneTimeDonationReviewCard
            amount={$context.oneTimeDonationConfig.amount ?? unreachable()}
            tokenAddress={$context.oneTimeDonationConfig.selectedTokenAddress?.[0] ?? unreachable()}
          />
        </div>
      {/if}
    </FormField>
  {/if}

  {#if !connectedWalletHidden}
    <FormField type="div" title="Your connected wallet">
      {#snippet action()}
        <Button variant="ghost" onclick={() => dispatch('goForward', { by: -4 })} icon={PenIcon}
          >Edit</Button
        >
      {/snippet}
      <AccountBox hideDisconnect />
    </FormField>
  {/if}

  <WhatsNextSection>
    <WhatsNextCard>
      {#snippet title()}
        On transaction confirmation…
      {/snippet}
      {#snippet items()}
        {#if $context.selectedSupportOption === 1}
          {#if $context.continuousSupportConfig.topUpAmountValueParsed && $context.continuousSupportConfig.streamRateValueParsed && $context.continuousSupportConfig.listSelected[0]}
            {@const token =
              tokensStore.getByAddress($context.continuousSupportConfig.listSelected[0]) ??
              unreachable()}
            <WhatsNextItem icon={TransactionsIcon}>
              <span class="typo-text-bold">
                {formatTokenAmount(
                  $context.continuousSupportConfig.topUpAmountValueParsed,
                  token.info.decimals,
                  1n,
                  false,
                )}
                {token.info.symbol} will be transferred from your wallet into your Drips account</span
              >
              and immediately begin streaming to your Drip List recipients at a rate of
              <span class="typo-text-bold">
                {formatTokenAmount(
                  $context.continuousSupportConfig.streamRateValueParsed,
                  token.info.decimals,
                  undefined,
                  false,
                )}
                {token.info.symbol} per month</span
              >.
            </WhatsNextItem>
          {/if}
        {/if}
        {#if $context.selectedSupportOption === 2}
          {@const token =
            tokensStore.getByAddress(
              $context.oneTimeDonationConfig.selectedTokenAddress?.[0] ?? unreachable(),
            ) ?? unreachable()}
          <WhatsNextItem icon={TransactionsIcon}>
            <span class="typo-text-bold">
              {formatTokenAmount(
                $context.oneTimeDonationConfig.amount ?? unreachable(),
                token.info.decimals,
                1n,
                false,
              )}
              {token.info.symbol} will be transferred from your wallet</span
            >
            and distributed to your list.
          </WhatsNextItem>
        {/if}
        <WhatsNextItem icon={ListIcon}
          >Your new Drip List will appear on your <span class="typo-text-bold">public profile</span
          >.</WhatsNextItem
        >
      {/snippet}
    </WhatsNextCard>
    <WhatsNextCard>
      {#snippet title()}
        After transaction confirmation…
      {/snippet}
      {#snippet items()}
        {#if $context.selectedSupportOption === 1}
          <WhatsNextItem icon={CoinIcon}>
            <span class="typo-text-bold">Add funds</span> (or withdraw any unstreamed funds) from your
            Drips dashboard.
          </WhatsNextItem>
          <WhatsNextItem icon={Pause}>
            <span class="typo-text-bold">Pause or cancel</span> your support anytime.
          </WhatsNextItem>
          <WhatsNextItem icon={Heart}>
            <span class="typo-text-bold">Create additional support streams</span> or make one-time donations
            anytime.
          </WhatsNextItem>
        {/if}
        {#if $context.selectedSupportOption === 2}
          <WhatsNextItem icon={Heart}>
            <span class="typo-text-bold">Make more one-time donations</span> or start a continuous support
            stream anytime.
          </WhatsNextItem>
        {/if}
        {#if $context.selectedSupportOption === undefined}
          <WhatsNextItem icon={TokenStreams}>
            You can <span class="typo-text-bold">start supporting</span> your Drip List anytime.
          </WhatsNextItem>
        {/if}
        <WhatsNextItem icon={PenIcon}
          ><span class="typo-text-bold">Edit</span> your Drip List anytime.</WhatsNextItem
        >
      {/snippet}
    </WhatsNextCard>
  </WhatsNextSection>

  {#snippet left_actions()}
    <Button icon={ArrowLeft} onclick={goBack}>Back</Button>
  {/snippet}

  {#snippet actions()}
    <Button icon={WalletIcon} variant="primary" onclick={createDripList}>Confirm in wallet</Button>
  {/snippet}
</StandaloneFlowStepLayout>

<style>
  .drip-list-title {
    margin-bottom: 1rem;
  }
</style>

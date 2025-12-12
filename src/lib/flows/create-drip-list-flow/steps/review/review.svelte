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
  import type { Writable } from 'svelte/store';
  import WalletIcon from '$lib/components/icons/Wallet.svelte';
  import type { State } from '../../create-drip-list-flow';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import expect from '$lib/utils/expect';
  import TokenStreams from '$lib/components/icons/TokenStreams.svelte';
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
      <Button variant="ghost" onclick={() => dispatch('goForward', { by: -3 })} icon={PenIcon}
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

  {#if !connectedWalletHidden}
    <FormField type="div" title="Your connected wallet">
      {#snippet action()}
        <Button variant="ghost" onclick={() => dispatch('goForward', { by: -1 })} icon={PenIcon}
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
        <WhatsNextItem icon={TokenStreams}>
          You can <span class="typo-text-bold">start supporting</span> your Drip List anytime.
        </WhatsNextItem>

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

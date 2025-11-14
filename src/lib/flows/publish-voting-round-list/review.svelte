<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from './publish-voting-round-list-flow-steps';
  import { buildVotingRoundDripListCreationTxs } from '$lib/utils/driplist/buildVotingRoundDripListCreationTxs';
  import expect from '$lib/utils/expect';
  import * as multiplayer from '$lib/utils/multiplayer';
  import DripList from '$lib/components/icons/DripList.svelte';
  import TokenStreams from '$lib/components/icons/TokenStreams.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import { invalidateAll } from '$app/navigation';
  import network from '$lib/stores/wallet/network';
  import { sdkManager } from '$lib/utils/sdk/sdk-manager';
  import WhatsNextSection from '$lib/components/whats-next/whats-next-section.svelte';
  import WhatsNextCard from '$lib/components/whats-next/whats-next-card.svelte';
  import WhatsNextItem from '$lib/components/whats-next/whats-next-item.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    context: Writable<State>;
    votingRoundId: string;
  }

  let { context, votingRoundId }: Props = $props();

  function submit() {
    dispatch(
      'transact',
      makeTransactPayload({
        headline: 'Publish Drip List',
        before: async () => {
          return await buildVotingRoundDripListCreationTxs({
            title: $context.dripListConfig.title,
            description: $context.dripListConfig.description,
            weights: $context.dripListConfig.weights,
            items: $context.dripListConfig.items,
            votingRoundId: votingRoundId,
            isVisible: true,
          });
        },

        transactions: ({ txs }) => txs,

        afterSafe: async (sendTransactionResponse, { dripListId }) => {
          await multiplayer.linkVotingRoundToDripList(
            votingRoundId,
            dripListId,
            sendTransactionResponse.safeTxHash,
          );
        },

        after: async (_, { dripListId }) => {
          const tryFetchList = async (listId: string) => {
            try {
              const sdk = sdkManager.sdk;
              if (!sdk) return false;

              const dripList = await sdk.dripLists.getById(BigInt(listId), network.chainId);
              return dripList;
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

          await multiplayer.linkVotingRoundToDripList(votingRoundId, dripListId);

          $context.publishedDripListId = dripListId;

          await invalidateAll();
        },
      }),
    );
  }
</script>

<StepLayout>
  <StepHeader
    emoji="🗳️"
    headline="Review"
    description="Last step: Review your list before publishing."
  />
  <FormField title="Name">
    <span class="typo-text">{$context.dripListConfig.title}</span>
  </FormField>

  <FormField title="Description">
    {#if !$context.dripListConfig.description}
      <span class="typo-text" style:color="var(--color-foreground-level-4)">No description</span>
    {:else}
      <span class="typo-text">{$context.dripListConfig.description}</span>
    {/if}
  </FormField>

  <FormField title="Recipients">
    {#if Object.keys($context.dripListConfig.weights).length === 0}
      <span class="typo-text" style:color="var(--color-foreground-level-4)">No recipients</span>
    {:else}
      <ListEditor
        isEditable={false}
        items={$context.dripListConfig.items}
        weights={$context.dripListConfig.weights}
      />
    {/if}
  </FormField>

  <WhatsNextSection>
    <WhatsNextCard>
      {#snippet title()}
            After transaction confirmation…
          {/snippet}
      {#snippet items()}
          
          <WhatsNextItem icon={DripList}
            >The published Drip List will appear on your <span class="typo-text-bold"
              >public profile</span
            >.</WhatsNextItem
          >
          <WhatsNextItem icon={TokenStreams}
            >You or anyone else can <span class="typo-text-bold">support the Drip List</span> with continuous
            or one-time donations.</WhatsNextItem
          >
          <WhatsNextItem icon={Pen}
            >You can <span class="typo-text-bold">edit the Drip List</span> anytime, or start another voting
            round.</WhatsNextItem
          >
        
          {/snippet}
    </WhatsNextCard>
  </WhatsNextSection>

  {#snippet actions()}
  
      <Button onclick={() => dispatch('conclude')} variant="ghost">Cancel</Button>
      <Button
        onclick={() => submit()}
        variant="primary"
        disabled={Object.keys($context.dripListConfig.weights).length === 0}
        icon={Wallet}>Confirm in wallet</Button
      >
    
  {/snippet}
</StepLayout>

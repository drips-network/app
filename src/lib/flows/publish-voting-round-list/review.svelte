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
  import DripListService from '$lib/utils/driplist/DripListService';
  import query from '$lib/graphql/dripsQL';
  import { gql } from 'graphql-request';
  import expect from '$lib/utils/expect';
  import type {
    DripListExistsQuery,
    DripListExistsQueryVariables,
  } from './__generated__/gql.generated';
  import * as multiplayer from '$lib/utils/multiplayer';
  import DripList from '$lib/components/icons/DripList.svelte';
  import TokenStreams from '$lib/components/icons/TokenStreams.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import { invalidateAll } from '$lib/stores/fetched-data-cache/invalidate';
  import network from '$lib/stores/wallet/network';
  import WhatsNextSection from '$lib/components/whats-next/whats-next-section.svelte';
  import WhatsNextCard from '$lib/components/whats-next/whats-next-card.svelte';
  import WhatsNextItem from '$lib/components/whats-next/whats-next-item.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let votingRoundId: string;

  function submit() {
    dispatch(
      'transact',
      makeTransactPayload({
        headline: 'Publish Drip List',
        before: async () => {
          const dripListService = await DripListService.new();

          return await dripListService.buildTransactContext({
            listTitle: $context.dripListConfig.title,
            listDescription: $context.dripListConfig.description,
            weights: $context.dripListConfig.weights,
            items: $context.dripListConfig.items,
            support: undefined,
            latestVotingRoundId: votingRoundId,
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
          const dripListExistsQuery = gql`
            query DripListExists($id: ID!, $chain: SupportedChain!) {
              dripList(id: $id, chain: $chain) {
                account {
                  accountId
                }
              }
            }
          `;

          const tryFetchList = async (listId: string) => {
            try {
              return await query<DripListExistsQuery, DripListExistsQueryVariables>(
                dripListExistsQuery,
                {
                  id: listId,
                  chain: network.gqlName,
                },
              );
            } catch {
              return false;
            }
          };

          await expect(
            () => tryFetchList(dripListId),
            (result) => (typeof result === 'boolean' ? result : Boolean(result.dripList)),
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
      <svelte:fragment slot="title">After transaction confirmation…</svelte:fragment>
      <svelte:fragment slot="items">
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
      </svelte:fragment>
    </WhatsNextCard>
  </WhatsNextSection>

  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button
      on:click={() => submit()}
      variant="primary"
      disabled={Object.keys($context.dripListConfig.weights).length === 0}
      icon={Wallet}>Confirm in wallet</Button
    >
  </svelte:fragment>
</StepLayout>

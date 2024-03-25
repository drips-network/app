<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from './publish-voting-round-list-flow-steps';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import DripListService from '$lib/utils/driplist/DripListService';
  import query from '$lib/graphql/dripsQL';
  import { gql } from 'graphql-request';
  import expect from '$lib/utils/expect';
  import type {
    DripListExistsQuery,
    DripListExistsQueryVariables,
  } from './__generated__/gql.generated';
  import * as multiplayer from '$lib/utils/multiplayer';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let votingRoundId: string;

  function submit() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const dripListService = await DripListService.new();

          return await dripListService.buildTransactContext({
            listTitle: $context.dripListConfig.title,
            listDescription: $context.dripListConfig.description,
            percentages: $context.dripListConfig.percentages,
            support: undefined,
            latestVotingRoundId: votingRoundId,
          });
        },

        transactions: ({ txs }) => txs,

        after: async (_, { dripListId }) => {
          const dripListExistsQuery = gql`
            query DripListExists($id: ID!) {
              dripList(id: $id) {
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

  <FormField title="Recipients">
    <ListEditor
      isEditable={false}
      items={$context.dripListConfig.items}
      percentages={$context.dripListConfig.percentages}
    />
  </FormField>

  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button on:click={() => submit()} variant="primary" icon={Wallet}>Confirm in wallet</Button>
  </svelte:fragment>
</StepLayout>

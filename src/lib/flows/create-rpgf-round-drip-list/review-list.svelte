<script lang="ts">
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from './create-rpgf-round-drip-list-flow';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import unreachable from '$lib/utils/unreachable';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import { createEventDispatcher } from 'svelte';
  import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
  import DripListService from '$lib/utils/driplist/DripListService';
  import _ from 'lodash';
  import { gql } from 'graphql-request';
  import query from '$lib/graphql/dripsQL';
  import network from '$lib/stores/wallet/network';
  import expect from '$lib/utils/expect';
  import invalidateAccountCache from '$lib/utils/cache/remote/invalidate-account-cache';
  import { invalidateAll } from '$app/navigation';
  import type {
    DripListExistsQuery,
    DripListExistsQueryVariables,
  } from './__generated__/gql.generated';
  import Button from '$lib/components/button/button.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import { linkDripListsToRound } from '$lib/utils/rpgf/rpgf';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    roundName: string;
    roundId: string;
    context: Writable<State>;
  }

  let { roundName, roundId, context }: Props = $props();

  function handlePublish() {
    dispatch(
      'transact',
      makeTransactPayload({
        headline: 'Publish Drip List',
        messages: {
          duringBefore: 'Preparing Drip List creation transactions…',
        },

        async before() {
          const dripListService = await DripListService.new();

          return dripListService.buildTransactContext({
            listTitle: `${roundName} - Distribution List`,
            isVisible: true,
            weights: $context.weights ?? unreachable(),
            items: $context.items ?? unreachable(),
          });
        },

        transactions({ txs }) {
          return txs;
        },

        async after(_, { dripListId }) {
          const dripListExistsQuery = gql`
            query DripListExists($id: ID!, $chain: SupportedChain!) {
              dripList(id: $id, chain: $chain) {
                account {
                  accountId
                }
                isVisible
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
            (result) =>
              typeof result === 'boolean' ? result : Boolean(result.dripList?.isVisible),
            120000,
            1000,
          );

          try {
            await linkDripListsToRound(undefined, roundId, [dripListId]);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            throw e;
          } finally {
            await invalidateAccountCache(dripListId);
            await invalidateAll();
          }
        },
      }),
    );
  }
</script>

<StandaloneFlowStepLayout headline="Review Drip List Weights">
  <p class="typo-text" style:text-align="left">
    Review the weights below, and confirm the Drip List creation in your wallet. Once the Drip List
    has been created, you or anyone else can fund it to distribute rewards accordingly. As soon as
    your Drip List is created, it will be publicly visible on the round page. You may make changes
    to the Drip List after creation.
  </p>

  <AnnotationBox type="info">
    <p class="typo-text-small">
      Weights are calculated as percentages with a precision of 0.0001% based on the fraction of the
      total votes allocated to every particular project.
    </p>
    {#snippet actions()}
      <Button
        variant="ghost"
        href="https://docs.drips.network/rpgf/administering-your-round#automatically-preparing-a-drip-list"
        target="_blank">Learn more</Button
      >
    {/snippet}
  </AnnotationBox>

  <ListEditor
    isEditable={false}
    weights={$context.weights ?? unreachable()}
    items={$context.items ?? unreachable()}
  />

  {#snippet actions()}
    <Button variant="primary" icon={Wallet} onclick={handlePublish}>Confirm in wallet</Button>
  {/snippet}
</StandaloneFlowStepLayout>

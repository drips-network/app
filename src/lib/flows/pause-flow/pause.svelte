<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const PAUSE_FLOW_STREAM_FRAGMENT = gql`
    fragment PauseFlowStream on Stream {
      id
      sender {
        account {
          accountId
        }
      }
    }
  `;
</script>

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
  import expect from '$lib/utils/expect';
  import type {
    CheckUserStreamPausedQuery,
    CheckUserStreamPausedQueryVariables,
    PauseFlowStreamFragment,
  } from './__generated__/gql.generated';
  import { buildPauseStreamPopulatedTx } from '$lib/utils/streams/streams';
  import query from '$lib/graphql/dripsQL';
  import { invalidateAll } from '$lib/stores/fetched-data-cache/invalidate';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import network from '$lib/stores/wallet/network';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let stream: PauseFlowStreamFragment;

  onMount(() => {
    dispatch(
      'transact',
      makeTransactPayload({
        headline: 'Pausing stream',
        before: async () => {
          const tx = await buildPauseStreamPopulatedTx(stream.id);

          return { tx, accountId: stream.sender.account.accountId };
        },

        transactions: ({ tx }) => [
          {
            transaction: tx,
            applyGasBuffer: true,
            title: 'Pause stream',
          },
        ],

        after: async (_, { accountId }) => {
          await expect(
            () =>
              query<CheckUserStreamPausedQuery, CheckUserStreamPausedQueryVariables>(
                gql`
                  query CheckUserStreamPaused($accountId: ID!, $chains: [SupportedChain!]) {
                    userById(accountId: $accountId, chains: $chains) {
                      chainData {
                        chain
                        streams {
                          outgoing {
                            id
                            isPaused
                          }
                        }
                      }
                    }
                  }
                `,
                { accountId, chains: [network.gqlName] },
              ),
            (res) =>
              filterCurrentChainData(res.userById.chainData).streams?.outgoing?.find(
                (s) => s.id.toLowerCase() === stream.id.toLowerCase(),
              )?.isPaused === true,
            10000,
            1000,
          );

          await invalidateAll();
        },
      }),
    );
  });
</script>

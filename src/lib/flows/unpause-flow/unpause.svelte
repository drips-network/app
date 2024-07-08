<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const UNPAUSE_FLOW_STREAM_FRAGMENT = gql`
    fragment UnpauseFlowStream on Stream {
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
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import expect from '$lib/utils/expect';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import type {
    CheckUserStreamPausedQuery,
    CheckUserStreamPausedQueryVariables,
    UnpauseFlowStreamFragment,
  } from './__generated__/gql.generated';
  import { buildUnpauseStreamPopulatedTx } from '$lib/utils/streams/streams';
  import query from '$lib/graphql/dripsQL';
  import { invalidateAll } from '$lib/stores/fetched-data-cache/invalidate';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import network from '$lib/stores/wallet/network';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let stream: UnpauseFlowStreamFragment;

  onMount(() => {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const addressDriverClient = await getAddressDriverClient();

          const tx = await buildUnpauseStreamPopulatedTx(addressDriverClient, stream.id);

          return { tx, accountId: stream.sender.account.accountId };
        },

        transactions: ({ tx }) => [
          {
            transaction: tx,
            applyGasBuffer: true,
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
            (res) => {
              const chainData = res.userById?.chainData
                ? filterCurrentChainData(res.userById.chainData)
                : undefined;

              return (
                chainData?.streams?.outgoing?.find(
                  (s) => s.id.toLowerCase() === stream.id.toLowerCase(),
                )?.isPaused === false
              );
            },
            10000,
            1000,
          );

          await invalidateAll();
        },
      }),
    );
  });
</script>

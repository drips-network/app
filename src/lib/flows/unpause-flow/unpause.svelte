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
  import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
  import expect from '$lib/utils/expect';
  import type {
    CheckUserStreamPausedQuery,
    CheckUserStreamPausedQueryVariables,
    UnpauseFlowStreamFragment,
  } from './__generated__/gql.generated';
  import { buildUnpauseStreamPopulatedTx } from '$lib/utils/streams/streams';
  import query from '$lib/graphql/dripsQL';
  import { invalidateAll } from '$lib/stores/fetched-data-cache/invalidate';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let stream: UnpauseFlowStreamFragment;

  onMount(() => {
    dispatch(
      'transact',
      makeTransactPayload({
        headline: 'Unpause stream',
        before: async () => {
          const addressDriverClient = await getAddressDriverClient();

          const tx = await buildUnpauseStreamPopulatedTx(addressDriverClient, stream.id);

          return { tx, accountId: stream.sender.account.accountId };
        },

        transactions: ({ tx }) => [
          {
            transaction: tx,
            applyGasBuffer: true,
            title: 'Unpause stream',
          },
        ],

        after: async (_, { accountId }) => {
          await expect(
            () =>
              query<CheckUserStreamPausedQuery, CheckUserStreamPausedQueryVariables>(
                gql`
                  query CheckUserStreamPaused($accountId: ID!) {
                    userById(accountId: $accountId) {
                      streams {
                        outgoing {
                          id
                          isPaused
                        }
                      }
                    }
                  }
                `,
                { accountId },
              ),
            (res) =>
              res.userById?.streams?.outgoing?.find(
                (s) => s.id.toLowerCase() === stream.id.toLowerCase(),
              )?.isPaused === false,
            10000,
            1000,
          );

          await invalidateAll();
        },
      }),
    );
  });
</script>

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
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
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

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let stream: PauseFlowStreamFragment;

  onMount(() => {
    dispatch(
      'transact',
      makeTransactPayload({
        headline: 'Pausing stream',
        before: async () => {
          const addressDriverClient = await getAddressDriverClient();

          const tx = await buildPauseStreamPopulatedTx(addressDriverClient, stream.id);

          return { tx, accountId: stream.sender.account.accountId };
        },

        transactions: ({ tx }) => [
          {
            transaction: tx,
            applyGasBuffer: true,
            title: 'Pausing stream',
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

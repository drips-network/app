<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import GitProjectService from '$lib/utils/project/GitProjectService';
  import { getCallerClient } from '$lib/utils/get-drips-clients';
  import { gql } from 'graphql-request';
  import unreachable from '$lib/utils/unreachable';
  import query from '$lib/graphql/dripsQL';
  import type {
    ProjectIsClaimedQuery,
    ProjectIsClaimedQueryVariables,
  } from './__generated__/gql.generated';
  import expect from '$lib/utils/expect';
  import isClaimed from '$lib/utils/project/is-claimed';
  import invalidateAccountCache from '$lib/utils/cache/remote/invalidate-account-cache';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import network from '$lib/stores/wallet/network';
  import { invalidateAll } from '$lib/stores/fetched-data-cache/invalidate';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  onMount(() =>
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const gitProjectService = await GitProjectService.new();

          const setSplitsAndEmitMetadataBatch = await gitProjectService.buildBatchTx($context);

          const callerClient = await getCallerClient();
          const tx = await callerClient.populateCallBatchedTx(setSplitsAndEmitMetadataBatch);

          return { tx };
        },
        messages: {
          duringBefore: {
            message: 'Preparing to claim project...',
          },
        },
        transactions: ({ tx }) => [
          {
            transaction: tx,
            applyGasBuffer: false,
            waitingSignatureMessage: {
              message: 'Waiting for you to confirm the transaction in your wallet…',
              subtitle:
                "This transaction applies your project's splits, sets metadata, and concludes the claiming process.",
            },
          },
        ],
        after: async () => {
          const projectId = $context.project?.account.accountId ?? unreachable();

          const projectClaimedQuery = gql`
            query ProjectIsClaimed($id: ID!, $chains: [SupportedChain!]) {
              projectById(id: $id, chains: $chains) {
                chainData {
                  ... on ClaimedProjectData {
                    chain
                  }
                  ... on UnClaimedProjectData {
                    chain
                  }
                }
              }
            }
          `;

          await expect(
            () =>
              query<ProjectIsClaimedQuery, ProjectIsClaimedQueryVariables>(projectClaimedQuery, {
                id: projectId,
                chains: [network.gqlName],
              }),
            (result) =>
              Boolean(
                result.projectById &&
                  isClaimed(filterCurrentChainData(result.projectById.chainData)),
              ),
            300000,
            2000,
          );

          // Invalidate cached project page (if any). This should happen automatically, but without
          // awaiting it here in addition, there could be a race condition. Better safe than sorry!
          await invalidateAccountCache(projectId);
          await invalidateAll();
        },
      }),
    ),
  );
</script>

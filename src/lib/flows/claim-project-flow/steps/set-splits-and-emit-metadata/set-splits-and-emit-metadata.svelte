<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
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

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  onMount(() =>
    dispatch(
      'transact',
      makeTransactPayload({
        headline: 'Claim your project',
        before: async () => {
          const gitProjectService = await GitProjectService.new();

          const setSplitsAndEmitMetadataBatch = await gitProjectService.buildBatchTx($context);

          const callerClient = await getCallerClient();
          const tx = await callerClient.populateCallBatchedTx(setSplitsAndEmitMetadataBatch);

          return { tx };
        },
        messages: {
          duringBefore: 'Preparing to claim project...',
        },
        transactions: ({ tx }) => [
          {
            transaction: tx,
            applyGasBuffer: false,
            title: "Apply project's splits and set metadata",
          },
        ],
        after: async () => {
          const projectId = $context.project?.account.accountId ?? unreachable();

          const projectClaimedQuery = gql`
            query ProjectIsClaimed($id: ID!) {
              projectById(id: $id) {
                ... on ClaimedProject {
                  account {
                    accountId
                  }
                }
              }
            }
          `;

          await expect(
            () =>
              query<ProjectIsClaimedQuery, ProjectIsClaimedQueryVariables>(projectClaimedQuery, {
                id: projectId,
              }),
            (result) => Boolean(result.projectById && isClaimed(result.projectById)),
            300000,
            2000,
          );

          // Invalidate cached project page (if any). This should happen automatically, but without
          // awaiting it here in addition, there could be a race condition. Better safe than sorry!
          await invalidateAccountCache(projectId);
        },
      }),
    ),
  );
</script>

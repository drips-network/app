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

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  onMount(() =>
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const gitProjectService = await GitProjectService.new();

          const setSplitsAndEmitMetadataBatch = await gitProjectService.buildBatchTx($context);

          return { callerClient: await getCallerClient(), setSplitsAndEmitMetadataBatch };
        },
        messages: {
          duringBefore: {
            message: 'Preparing to claim project...',
          },
        },
        transactions: ({ callerClient, setSplitsAndEmitMetadataBatch }) => ({
          transaction: () => callerClient.callBatched(setSplitsAndEmitMetadataBatch),
          waitingSignatureMessage: {
            message: 'Waiting for you to confirm the transaction in your wallet…',
            subtitle:
              "This transaction applies your project's splits, sets metadata, and concludes the claiming process.",
          },
        }),
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
        },
      }),
    ),
  );
</script>

<script lang="ts">
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import query from '$lib/graphql/dripsQL';
  import { gql } from 'graphql-request';
  import expect from '$lib/utils/expect';
  import unreachable from '$lib/utils/unreachable';
  import type {
    CheckProjectVerificationStatusQuery,
    CheckProjectVerificationStatusQueryVariables,
  } from './__generated__/gql.generated';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import network from '$lib/stores/wallet/network';
  import assert from '$lib/utils/assert';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  onMount(() =>
    dispatch('await', {
      promise: pollApi,
      message: 'Waiting for the verification to finalize…',
      subtitle: 'This might take a while. Please donʼt close this window.',
    }),
  );

  async function pollApi() {
    const projectAccountId = $context.project?.account.accountId ?? unreachable();

    const checkProjectVerificationStatusQuery = gql`
      query CheckProjectVerificationStatus($projectId: ID!, $chains: [SupportedChain!]) {
        projectById(id: $projectId, chains: $chains) {
          chainData {
            ... on UnClaimedProjectData {
              chain
              verificationStatus
            }
            ... on ClaimedProjectData {
              chain
              verificationStatus
            }
          }
        }
      }
    `;

    assert($context.gaslessOwnerUpdateTaskId, 'Gasless owner update task ID is missing');

    // First, wait for Gelato Relay to resolve the update task.
    await expect(
      async () => {
        const res = await fetch(`/api/gasless/track/${$context.gaslessOwnerUpdateTaskId}`);
        if (!res.ok) throw new Error('Failed to track gasless owner update task');

        const { task } = await res.json();
        assert(typeof task === 'object', 'Invalid task');
        const { taskState } = task;
        assert(typeof taskState === 'string', 'Invalid task state');

        return taskState;
      },
      (taskState) => {
        switch (taskState) {
          case 'ExecSuccess':
            return true;
          case 'Cancelled':
            throw new Error(
              'Failed to gaslessly update the repository owner on-chain. Please reach out to us on Discord.',
            );
          default:
            return false;
        }
      },
      300000,
      2000,
    );

    // Next, wait for the new owner to be indexed by our infra.
    await expect(
      () =>
        query<CheckProjectVerificationStatusQuery, CheckProjectVerificationStatusQueryVariables>(
          checkProjectVerificationStatusQuery,
          {
            projectId: projectAccountId,
            chains: [network.gqlName],
          },
        ),
      (response) => {
        if (!response.projectById?.chainData) return false;

        const projectChainData = filterCurrentChainData(response.projectById.chainData);

        return (
          projectChainData.verificationStatus === 'PendingMetadata' ||
          projectChainData.verificationStatus === 'OwnerUpdated'
        );
      },
      300000,
      2000,
    );
  }
</script>

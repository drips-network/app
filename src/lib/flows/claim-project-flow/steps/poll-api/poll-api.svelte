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

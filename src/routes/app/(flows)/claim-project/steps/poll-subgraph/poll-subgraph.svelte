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

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  onMount(() =>
    dispatch('await', {
      promise: pollSubgraph,
      message: 'Waiting for the verification to finalize…',
      subtitle: 'This might take a while. Please donʼt close this window.',
    }),
  );

  async function pollSubgraph() {
    const projectAccountId = $context.project?.account.accountId ?? unreachable();

    const checkProjectVerificationStatusQuery = gql`
      query CheckProjectVerificationStatus($projectId: ID!) {
        projectById(id: $projectId) {
          ... on UnclaimedProject {
            verificationStatus
          }
          ... on ClaimedProject {
            verificationStatus
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
          },
        ),
      (response) => response.projectById?.verificationStatus === 'OwnerUpdated',
      300000,
      2000,
    );
  }
</script>

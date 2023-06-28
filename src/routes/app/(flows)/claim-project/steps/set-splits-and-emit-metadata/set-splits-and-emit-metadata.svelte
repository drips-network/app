<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import GitProjectService from '$lib/utils/project/GitProjectService';
  import { getCallerClient } from '$lib/utils/get-drips-clients';
  import { goto } from '$app/navigation';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  onMount(() =>
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const gitProjectService = await GitProjectService.new();

          const setSplitsAndEmitMetadataBatch =
            await gitProjectService.buildSetSplitsAndEmitMetadataBatchTx($context);
          console.log(
            '💧 ~ file: set-splits-and-emit-metadata.svelte:23 ~ before: ~ setSplitsAndEmitMetadataBatch:',
            setSplitsAndEmitMetadataBatch,
          );

          return { callerClient: await getCallerClient(), setSplitsAndEmitMetadataBatch };
        },
        messages: {
          duringBefore: {
            message:
              'Preparing transactions for setting the Drip List splits and emitting the IPFS metadata...',
          },
        },
        transactions: ({ callerClient, setSplitsAndEmitMetadataBatch }) => ({
          transaction: () => callerClient.callBatched(setSplitsAndEmitMetadataBatch),
        }),
        after: async () => {
          goto('/app');
        },
      }),
    ),
  );
</script>

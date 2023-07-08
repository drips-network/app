<script lang="ts">
  import type { Writable } from 'svelte/store';
  import type { State } from '../edit-project-splits-steps';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { getSubgraphClient } from '$lib/utils/get-drips-clients';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  onMount(() => {
    dispatch('await', {
      promise: async () => {
        const subgraph = getSubgraphClient();

        const splitsConfig = await subgraph.getSplitsConfigByAccountId(
          $context.project.repoDriverAccount.accountId,
        );

        $context.onChainSplitsConfig = splitsConfig;
      },
      message: 'Fetching current splits...',
    });
  });
</script>

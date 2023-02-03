<script lang="ts">
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { getSubgraphClient } from '$lib/utils/get-drips-clients';
  import type { Writable } from 'svelte/store';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { EditSplitsFlowState } from './edit-splits-flow-state';
  import wallet from '$lib/stores/wallet/wallet.store';
  import unreachable from '$lib/utils/unreachable';

  export let context: Writable<EditSplitsFlowState>;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  async function getCurrentSplits() {
    const subgraphClient = getSubgraphClient();
    const splits = await subgraphClient.getSplitsConfigByUserId(
      $wallet.dripsUserId ?? unreachable(),
    );

    context.update((c) => ({
      ...c,
      splits,
    }));
  }

  onMount(() =>
    dispatch('await', {
      promise: getCurrentSplits,
      message: 'Fetching splits...',
    }),
  );
</script>

<script lang="ts">
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { getDripsHubClient } from '$lib/utils/get-drips-clients';
  import type { Writable } from 'svelte/store';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { CollectFlowState } from './collect-flow-state';
  import balances from '$lib/stores/balances';

  export let context: Writable<CollectFlowState>;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  async function fetchDripsCycle() {
    const client = await getDripsHubClient();

    const cycleDurationMillis = (await client.cycleSecs()) * 1000;
    const currentCycleMillis = new Date().getTime() % cycleDurationMillis;
    const currentCycleStart = new Date().getTime() - currentCycleMillis;

    context.update((c) => ({
      ...c,
      currentDripsCycle: {
        start: new Date(currentCycleStart),
        durationMillis: cycleDurationMillis,
      },
    }));
  }

  async function updateCollectable() {
    await balances.updateBalances();
  }

  async function promise() {
    await fetchDripsCycle();
    await updateCollectable();
  }

  onMount(() =>
    dispatch('await', {
      promise,
      message: 'Preparing to collect…',
    }),
  );
</script>

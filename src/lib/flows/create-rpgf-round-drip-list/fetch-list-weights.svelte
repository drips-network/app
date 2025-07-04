<script lang="ts">
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { getDripListWeightsForRound } from '$lib/utils/rpgf/rpgf';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from './create-rpgf-round-drip-list-flow';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let roundSlug: string;

  onMount(() => {
    dispatch('await', {
      message: 'Fetching list weights…',
      promise: async () => {
        const weights = await getDripListWeightsForRound(undefined, roundSlug);

        $context.weights = weights;
      },
    });
  });
</script>

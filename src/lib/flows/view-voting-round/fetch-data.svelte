<script lang="ts">
  import type { VotingRound } from '$lib/utils/multiplayer/schemas';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { mapSplitsFromMultiplayerResults } from '$lib/components/splits/utils';
  import type { State } from './view-voting-round-flow-steps';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let votingRound: VotingRound;

  onMount(async () => {
    dispatch('await', {
      message: 'Fetching vote data…',
      promise: async () => {
        if (votingRound.result) {
          $context.splits = await mapSplitsFromMultiplayerResults(votingRound.result);
        }
      },
    });
  });
</script>

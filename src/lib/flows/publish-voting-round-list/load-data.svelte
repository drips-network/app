<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from './publish-voting-round-list-flow-steps';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import * as multiplayer from '$lib/utils/multiplayer';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let votingRoundId: string;

  onMount(async () => {
    dispatch('await', {
      message: 'Fetching voting round data…',
      promise: async () => {
        $context.results = await multiplayer.getVotingRoundResult(votingRoundId);
        $context.dripListConfig = {
          ...$context.dripListConfig,
          ...(await multiplayer.mapVoteReceiversToListEditorConfig($context.results)),
        };
      },
    });
  });
</script>

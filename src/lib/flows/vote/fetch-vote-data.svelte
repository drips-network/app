<script lang="ts">
  import { mapVoteReceiversToListEditorConfig } from '$lib/components/list-editor/list-editor.svelte';
  import type { Vote } from '$lib/utils/multiplayer/schemas';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import type { State } from './vote-flow-steps';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let previousVote: Vote | undefined;

  onMount(async () => {
    dispatch('await', {
      message: 'Fetching vote data…',
      promise: async () => {
        if (previousVote && 'latestVote' in previousVote) {
          $context.listEditorConfig = await mapVoteReceiversToListEditorConfig(
            previousVote.latestVote,
          );
        }
      },
    });
  });
</script>

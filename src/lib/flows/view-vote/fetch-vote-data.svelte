<script lang="ts">
  import type { Vote } from '$lib/utils/multiplayer/schemas';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { State } from './view-vote-flow-steps';
  import type { Writable } from 'svelte/store';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { mapVoteReceiversToListEditorConfig } from '$lib/utils/multiplayer';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    context: Writable<State>;
    vote: Vote;
  }

  let { context, vote }: Props = $props();

  onMount(async () => {
    dispatch('await', {
      message: 'Fetching vote data…',
      promise: async () => {
        if (vote.latestVote) {
          $context.listEditorConfig = await mapVoteReceiversToListEditorConfig(vote.latestVote);
        }
      },
    });
  });
</script>

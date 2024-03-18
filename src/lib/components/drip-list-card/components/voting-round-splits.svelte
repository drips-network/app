<script lang="ts">
  import { onMount } from 'svelte';
  import * as multiplayer from '$lib/utils/multiplayer';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import Emoji from '$lib/components/emoji/emoji.svelte';

  export let votingRoundId: string;

  let result: Awaited<ReturnType<typeof multiplayer.getVotingRoundResult>> | undefined;
  onMount(async () => {
    result = await multiplayer.getVotingRoundResult(votingRoundId);
  });
</script>

<div class="results">
  {#if result === undefined}
    <Spinner />
  {:else if result?.length === 0}
    <div class="empty-state">
      <Emoji emoji="🫙" size="huge" />
      <h4>No recipients yet</h4>
      <p>Collaborators are currently voting on the recipients of this Drip List.</p>
    </div>
  {:else}
    splits
  {/if}
</div>

<style>
  .results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 16rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    max-width: 16rem;
    text-align: center;
  }
</style>

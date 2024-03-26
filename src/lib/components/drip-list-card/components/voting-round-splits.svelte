<script lang="ts">
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import Splits, { type SplitsComponentSplitsReceiver } from '$lib/components/splits/splits.svelte';
  import type { VotingRound } from '$lib/utils/multiplayer/schemas';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';
  import { fade } from 'svelte/transition';

  export let votingRound: VotingRound & { splits?: SplitsComponentSplitsReceiver[] };
  export let maxRows: number | undefined = undefined;
</script>

<TransitionedHeight transitionHeightChanges>
  <div class="results" style:min-height={!votingRound.result ? '16rem' : undefined} out:fade>
    {#if !votingRound.result && votingRound.status === 'started'}
      <div class="empty-state" in:fade>
        <Emoji emoji="🗳️" size="huge" />
        <h4>Awaiting nominations</h4>
        <p>No one has voted yet.</p>
      </div>
    {:else if votingRound.result?.length === 0 && votingRound.status === 'completed'}
      <div class="empty-state" in:fade>
        <Emoji emoji="🗳️" size="huge" />
        <h4>No recipients</h4>
        <p>No collaborators voted.</p>
      </div>
    {:else if votingRound.splits}
      <div class="splits" in:fade>
        <Splits draft list={votingRound.splits} {maxRows} />
      </div>
    {/if}
  </div>
</TransitionedHeight>

<style>
  .results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .splits {
    height: 100%;
    width: 100%;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    max-width: 16rem;
    text-align: center;
    min-height: 16rem;
  }
</style>

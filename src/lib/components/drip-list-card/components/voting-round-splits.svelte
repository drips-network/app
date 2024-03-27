<script lang="ts">
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import Splits, { type SplitsComponentSplitsReceiver } from '$lib/components/splits/splits.svelte';
  import type { VotingRound } from '$lib/utils/multiplayer/schemas';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';
  import { fade } from 'svelte/transition';
  import { getVotingRoundStatusReadable } from '$lib/utils/multiplayer';

  export let votingRound: VotingRound & { splits?: SplitsComponentSplitsReceiver[] };

  const status = getVotingRoundStatusReadable(votingRound);
</script>

<TransitionedHeight transitionHeightChanges>
  <div class="results" style:min-height={!votingRound.result ? '16rem' : undefined} out:fade|local>
    {#if !votingRound.result && $status === 'started'}
      <div class="empty-state" in:fade|local>
        <Emoji emoji="🫙" size="huge" />
        <h4>No recipients yet</h4>
        <p>Collaborators are currently voting on the recipients of this Drip List.</p>
      </div>
    {:else if (!votingRound.result || votingRound.result?.length === 0) && $status === 'completed'}
      <div class="empty-state" in:fade|local>
        <Emoji emoji="🫙" size="huge" />
        <h4>No recipients</h4>
        <p>No collaborators voted.</p>
      </div>
    {:else if votingRound.splits}
      <div class="splits" in:fade|local>
        <Splits draft list={votingRound.splits} />
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
    gap: 0.75rem;
    max-width: 16rem;
    text-align: center;
    min-height: 16rem;
    justify-content: center;
  }
</style>

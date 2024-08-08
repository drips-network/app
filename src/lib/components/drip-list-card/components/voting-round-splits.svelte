<script lang="ts">
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import Splits, { mapSplitsFromMultiplayerResults, type SplitsComponentSplitsReceiver } from '$lib/components/splits/splits.svelte';
  import type { VotingRound } from '$lib/utils/multiplayer/schemas';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';
  import { fade } from 'svelte/transition';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import Button from '$lib/components/button/button.svelte';
  import * as multiplayer from '$lib/utils/multiplayer';
  import unreachable from '$lib/utils/unreachable';
  import Drip from '$lib/components/illustrations/drip.svelte';

  export let votingRound: VotingRound & { splits?: SplitsComponentSplitsReceiver[] };
  export let maxRows: number | undefined = undefined;
  export let listingMode: boolean;

  const status = multiplayer.getVotingRoundStatusReadable(votingRound);

  $: isOwnVotingRound =
    votingRound.publisherAddress.toLowerCase() === $walletStore.address?.toLowerCase();

  let revealedResultsSplits: SplitsComponentSplitsReceiver[] | undefined;

  async function handleRevealResults() {
    if (!$walletStore.connected) return;

    const { signer, address } = $walletStore;

    const timestamp = new Date();

    const signature = await multiplayer.signRevealResults(
      signer,
      timestamp,
      address,
      votingRound.id,
    );

    const revealedResults = await multiplayer.revealResults(votingRound.id, {
      signature,
      date: timestamp,
    });

    revealedResultsSplits = await mapSplitsFromMultiplayerResults(revealedResults.result);
  }
</script>

<TransitionedHeight transitionHeightChanges>
  <div class="results" style:min-height={!(votingRound.result || revealedResultsSplits) ? '16rem' : undefined} out:fade>
    {#if !revealedResultsSplits && !votingRound.result && $status === 'Started'}
      <div class="empty-state" in:fade>
        <Emoji emoji="🗳️" size="huge" />
        <h4>Awaiting votes</h4>
        {#if votingRound.areVotesPrivate}
          <p>Vote results will be revealed after the voting period ends.</p>
          {#if isOwnVotingRound && !listingMode}
            <Button on:click={handleRevealResults}>Preview results</Button>
          {/if}
        {:else}
          <p>No one has voted yet.</p>
        {/if}
      </div>
    {:else if (!votingRound.result || votingRound.result?.length === 0) && $status === 'Completed'}
      <div class="empty-state" in:fade>
        <Emoji emoji="🫙" size="huge" />
        <h4>No recipients</h4>
        <p>No collaborators voted.</p>
      </div>
    {:else if votingRound.splits || revealedResultsSplits}
      <div class="splits" in:fade>
                    <div style:transform="translateX(-10px)" class="drip-icon">
                      <Drip fill="var(--color-foreground-level-5)" />
                    </div>
        <Splits draft list={votingRound.splits ?? revealedResultsSplits ?? unreachable()} {maxRows} />
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
    justify-content: center;
  }
</style>

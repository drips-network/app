<script lang="ts">
  import type { WrappedRoundAdmin, WrappedRoundPublic } from '$lib/utils/rpgf/schemas';
  import storedWritable from '@efstajas/svelte-stored-writable';
  import AnnotationBox from '../annotation-box/annotation-box.svelte';
  import Button from '../button/button.svelte';
  import Ledger from '../icons/Ledger.svelte';
  import { z } from 'zod';
  import Trophy from '../icons/Trophy.svelte';

  export let hasExistingBallot: boolean;
  export let round: WrappedRoundPublic['round'] | WrappedRoundAdmin['round'];
  export let signedIn: boolean;
  export let isRoundVoter: boolean;
  $: state = round.state;

  const localApplicationState = storedWritable(
    `rpgf-form-data-${round.urlSlug}`,
    z.object({
      projectName: z.string().min(1).max(255).optional(),
      dripsAccountId: z.string().min(1).optional(),

      fields: z.record(z.string(), z.any()),
    }),
    {
      projectName: undefined,
      dripsAccountId: undefined,
      fields: {},
    },
  );

  $: localApplicationDraftExists =
    $localApplicationState.projectName !== undefined ||
    $localApplicationState.dripsAccountId !== undefined ||
    Object.keys($localApplicationState.fields).length > 0;

  const inProgressBallotExists =
    localStorage.getItem(`in-progress-ballot-${round.urlSlug}`) !== null;
</script>

{#if state !== 'pending-intake'}
  <div class="card">
    {#if state === 'intake'}
      <h2 class="pixelated">Apply to this round</h2>
      <p class="typo-text">This round is currently accepting applications.</p>
      <Button
        href="/app/rpgf/rounds/{round.urlSlug}/applications/new"
        icon={Ledger}
        variant="primary"
        size="large"
      >
        {#if localApplicationDraftExists}
          Continue application
        {:else}
          Apply now
        {/if}
      </Button>
    {:else if state === 'pending-voting'}
      <h2 class="pixelated">Registration closed</h2>
      <p class="typo-text">
        The round is no longer accepting new applications. The round organizers are now reviewing
        submitted projects.
      </p>
    {:else if state === 'voting'}
      {#if !signedIn}
        <h2 class="pixelated">Voting is open</h2>
        <p class="typo-text">
          The badgeholders of this round are now voting on the applications. After votes are
          tallied, the results will be announced.
        </p>
        <AnnotationBox type="info"
          >Are you a badgeholder? Connect your wallet and sign in to submit your ballot.</AnnotationBox
        >
      {:else if isRoundVoter}
        <h2 class="pixelated">Cast your ballot</h2>
        <p class="typo-text">
          You're a badgeholder of this round.
          {#if hasExistingBallot}
            You already submitted a ballot, but you can edit it while the round is accepting votes.
          {:else}
            Cast your ballot now.
          {/if}
        </p>
        <Button
          href={hasExistingBallot
            ? `/app/rpgf/rounds/${round.urlSlug}/applications/ballot`
            : `/app/rpgf/rounds/${round.urlSlug}/applications`}
          icon={Ledger}
          variant="primary"
          size="large"
        >
          {#if hasExistingBallot}
            Edit your ballot
          {:else if inProgressBallotExists}
            Continue voting
          {:else}
            Vote now
          {/if}
        </Button>
      {:else}
        <h2 class="pixelated">Voting is open</h2>
        <p class="typo-text">
          The badgeholders of this round are now voting on the applications. After votes are
          tallied, the results will be announced.
        </p>
      {/if}
    {:else if !round.resultsPublished}
      <h2 class="pixelated">Pending results</h2>
      <p class="typo-text">
        The round organizers are currently reviewing submitted ballots and preparing the
        distribution.
      </p>
    {:else if round.resultsPublished}
      <h2 class="pixelated">Results available</h2>
      <p class="typo-text">
        The round's results have been published, and the distribution is being prepared by the round
        organizers.
      </p>

      <Button
        href="/app/rpgf/rounds/{round.urlSlug}/applications?sortBy=allocation"
        icon={Trophy}
        variant="primary"
        size="large"
      >
        View results
      </Button>
    {/if}
  </div>
{/if}

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    border: 1px solid var(--color-foreground-level-3);
  }
</style>

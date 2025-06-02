<script lang="ts">
  import type { WrappedRoundAdmin, WrappedRoundPublic } from '$lib/utils/rpgf/schemas';
  import storedWritable from '@efstajas/svelte-stored-writable';
  import AnnotationBox from '../annotation-box/annotation-box.svelte';
  import Button from '../button/button.svelte';
  import Ledger from '../icons/Ledger.svelte';
  import { z } from 'zod';

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
    {/if}
    {#if state === 'pending-voting'}
      <h2 class="pixelated">Registration closed</h2>
      <p class="typo-text">
        The round is no longer accepting new applications. The round admins are now reviewing
        submitted projects.
      </p>
    {/if}
    {#if state === 'voting'}
      {#if !signedIn}
        <h2 class="pixelated">Voting is open</h2>
        <p class="typo-text">
          The badgeholders of this round are now voting on the applications. After votes are
          tallied, the results will be announced.
        </p>
        <AnnotationBox type="info"
          >Are you a badgeholder? Connect your wallet and sign in to submit your vote.</AnnotationBox
        >
      {:else if isRoundVoter}
        <h2 class="pixelated">Cast your ballot</h2>
        <p class="typo-text">
          You're a badgeholder of this round. Submit your ballot now to vote on the applications.
        </p>
        <Button
          href="/app/rpgf/rounds/{round.urlSlug}/applications"
          icon={Ledger}
          variant="primary"
          size="large"
        >
          Vote now
        </Button>
      {:else}
        <h2 class="pixelated">Voting is open</h2>
        <p class="typo-text">
          The badgeholders of this round are now voting on the applications. After votes are
          tallied, the results will be announced.
        </p>
      {/if}
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

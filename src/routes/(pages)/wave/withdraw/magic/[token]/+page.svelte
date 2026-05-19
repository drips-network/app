<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { exchangeMagicLinkToken } from '$lib/utils/wave/grants/action-context';

  let errorMessage = $state<string | null>(null);

  onMount(async () => {
    const token = page.params.token;
    if (!token) {
      errorMessage = 'Missing magic link token.';
      return;
    }

    try {
      await exchangeMagicLinkToken(token);
      // Replace the URL so the token never lingers in browser history. Using
      // replaceState() means the back button won't return to the token URL.
      await goto('/wave/withdraw/magic/session', { replaceState: true });
    } catch (e) {
      errorMessage = e instanceof Error ? e.message : 'Failed to activate magic link.';
    }
  });
</script>

<svelte:head>
  <meta name="referrer" content="no-referrer" />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<HeadMeta title="Activating withdrawal link…" />

<div class="page">
  {#if errorMessage}
    <div class="card">
      <h2 class="typo-header-3">Couldn't activate this link</h2>
      <p class="typo-text">{errorMessage}</p>
      <p class="typo-text-small subtle">
        This link may have expired or been revoked. Please contact the admin who issued it.
      </p>
    </div>
  {:else}
    <div class="card">
      <p class="typo-text">Activating withdrawal link…</p>
    </div>
  {/if}
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1rem;
  }

  .card {
    max-width: 32rem;
    width: 100%;
    padding: 2rem;
    background-color: var(--color-background);
    box-shadow: var(--elevation-low);
    border-radius: 1rem 0 1rem 1rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .subtle {
    color: var(--color-foreground-level-5);
  }
</style>

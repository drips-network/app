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

{#if errorMessage}
  <h2 class="typo-header-3">Couldn't activate this link</h2>
  <p class="typo-text">{errorMessage}</p>
  <p class="typo-text-small subtle">
    This link may have expired or been revoked. Please contact the admin who issued it.
  </p>
{:else}
  <p class="typo-text">Activating withdrawal link…</p>
{/if}

<style>
  .subtle {
    color: var(--color-foreground-level-5);
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto, invalidateAll } from '$app/navigation';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import performLinking from './perform-linking';

  let { data } = $props();

  let error = $state<string | null>(data.error === 'cancelled' ? 'cancelled' : null);

  const errorMessages: Record<string, string> = {
    cancelled: 'Discord authorization was cancelled.',
    conflict: 'This Discord account is already linked to a different Drips Wave account.',
    expired: 'The link request expired. Please try again.',
    default: 'Failed to link Discord. Please try again.',
  };

  onMount(async () => {
    if (error) return;

    try {
      await performLinking(page.url);
      await invalidateAll();

      return goto('/wave/link-discord/callback/success');
    } catch (err) {
      // Check if it's a LinkingError with a code
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (code in errorMessages) {
          error = code;
        } else {
          error = 'default';
        }
      } else {
        error = 'default';
      }
    }
  });
</script>

<HeadMeta title="Linking Discord | Wave" />

<div
  class="typo-text"
  style:display="flex"
  style:flex-direction="column"
  style:align-items="center"
  style:gap="1rem"
>
  {#if error}
    <div class="typo-heading-3" style:text-align="center" style:color="var(--color-error)">
      {errorMessages[error] || errorMessages.default}
    </div>

    <Button href="/wave/settings/identity-and-payments">Back to Settings</Button>
  {:else}
    <Spinner />
    Linking your Discord account...
  {/if}
</div>

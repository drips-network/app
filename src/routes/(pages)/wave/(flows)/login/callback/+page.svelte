<script lang="ts">
  import { onMount } from 'svelte';
  import performLogin from './perform-login';
  import { page } from '$app/state';
  import { goto, invalidateAll } from '$app/navigation';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import Button from '$lib/components/button/button.svelte';

  let { data } = $props();
  let { backTo, skipWelcome } = $derived(data);

  let error = $state<boolean>(false);

  onMount(async () => {
    try {
      const { newUser: isNewUser } = await performLogin(page.url);
      await invalidateAll();

      if (isNewUser && !skipWelcome) {
        return goto(`/wave/welcome?backTo=${encodeURIComponent(backTo || '')}`);
      }

      return goto(backTo || '/wave');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Login callback error:', err);
      error = true;
    }
  });
</script>

<div
  class="typo-text"
  style:display="flex"
  style:flex-direction="column"
  style:align-items="center"
  style:gap="1rem"
>
  {#if error}
    <div class="typo-heading-3" style:text-align="center" style:color="var(--color-error)">
      Something went wrong. Please try again, and if this problem persists, contact us at
      support@drips.network.
    </div>

    <Button href="/wave/login">Try again</Button>
  {:else}
    <Spinner />
    One moment please, you're being logged in...
  {/if}
</div>

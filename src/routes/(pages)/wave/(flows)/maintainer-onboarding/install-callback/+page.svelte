<script lang="ts">
  import { invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  let timer: ReturnType<typeof setInterval>;

  onMount(() => {
    timer = setInterval(() => {
      invalidate('wave:maintainer-onboarding-install-callback');
    }, 2000);
  });

  onDestroy(() => {
    clearInterval(timer);
  });

  let showTakingLongerMessage = $state(false);

  onMount(() => {
    const timeout = setTimeout(() => {
      showTakingLongerMessage = true;
    }, 15000);

    return () => {
      clearTimeout(timeout);
    };
  });
</script>

<div class="loading">
  <Spinner />
  Please wait, we are syncing your repos...
  {#if showTakingLongerMessage}
    <div in:fade={{ duration: 300 }} class="taking-longer-message">
      <AnnotationBox>
        This is taking longer than usual. The import process may take a while depending on the
        amount of repos and issues. You can safely close this screen now, and return to <a
          href="/wave/maintainers/repos">Orgs & Repos</a
        > → Add Repos later to continue the process.
      </AnnotationBox>
    </div>
  {/if}
</div>

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
    color: var(--color-foreground-level-5);
  }
</style>

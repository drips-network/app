<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { onDestroy, onMount } from 'svelte';

  let timer: ReturnType<typeof setInterval>;

  onMount(() => {
    timer = setInterval(() => {
      invalidate('wave:maintainer-onboarding-install-callback');
    }, 2000);
  });

  onDestroy(() => {
    clearInterval(timer);
  });
</script>

Please wait, we are syncing your repos...

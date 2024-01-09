<script lang="ts">
  import { fade } from 'svelte/transition';
  import Drip from '../illustrations/drip.svelte';
  import { onMount } from 'svelte';

  export let visibilityDelay = 300; // so doesn't flash on loading site from cache
  let render = false;
  onMount(() =>
    setTimeout(() => {
      render = true;
    }, visibilityDelay),
  );
</script>

{#if render}
  <div class="w-6 h-6 drip-animation flex justify-center" in:fade|local={{ duration: 150 }}>
    <Drip height="100%" />
  </div>
{/if}

<style>
  .drip-animation {
    animation: dripping 750ms ease infinite;
    /* start from frame: 0% so it doesn't flash */
    transform-origin: top center;
    transform: scale(0, 0);
  }

  @keyframes dripping {
    0% {
      transform-origin: top center;
      transform: scale(0, 0);
    }
    50% {
      transform-origin: top center;
      transform: scale(1, 1);
    }
    51% {
      transform-origin: bottom center;
      transform: scale(1, 1);
    }
    100% {
      transform-origin: bottom center;
      transform: scale(0, 0);
    }
  }
</style>

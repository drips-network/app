<script lang="ts">
  import Drip from '../illustrations/drip.svelte';
</script>

<div class="w-6 h-6 drip-animation flex justify-center">
  <Drip height="100%" />
</div>

<style>
  .drip-animation {
    animation: dripping 750ms linear infinite;
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

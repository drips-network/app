<script lang="ts">
  import Dot from '$lib/components/illustrations/dot.svelte';
  import Star from '$lib/components/illustrations/star.svelte';

  export let stars = false;
</script>

<div class="card">
  <slot />
  {#if stars}
    <div class="stars">
      <div><Dot /></div>
      <div><Star /></div>
      <div><Star /></div>
      <div><Dot /></div>
    </div>
  {/if}
</div>

<style>
  .card {
    position: relative;
    border: 1px solid var(--color-foreground);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    overflow: hidden;
    background-color: var(--color-background);
  }

  .stars * {
    padding: 1.5rem;
    position: absolute;
  }

  .stars *:first-child {
    top: 0;
    left: 0;
  }

  .stars *:nth-child(2) {
    top: 0;
    right: 0;
  }

  .stars *:nth-child(3) {
    bottom: 0;
    left: 0;
  }

  .stars *:nth-child(4) {
    bottom: 0;
    right: 0;
  }

  @media (max-width: 577px) {
    .stars *:nth-child(3),
    .stars *:nth-child(4) {
      display: none;
    }
  }
</style>

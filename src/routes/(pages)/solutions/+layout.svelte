<script>
  import LpHeader from '$lib/components/lp-header/lp-header.svelte';
</script>

<div class="wrapper">
  <LpHeader />
  <div class="content">
    <slot />
  </div>
</div>

<style>
  .wrapper {
    background-color: var(--color-foreground-level-1);
    padding-top: 6rem;
    padding-bottom: 2rem;
    width: 100vw;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .content {
    position: relative;
    width: 100%;
    max-width: calc(1373px + 1rem);
    padding-top: 2rem;
    padding-left: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rem;
  }
</style>

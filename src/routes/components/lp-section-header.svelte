<script>
  import Star from '$lib/components/illustrations/star.svelte';
  import Dot from '$lib/components/illustrations/dot.svelte';
</script>

<div class="section-header">
  <div class="illus hide-mobile">
    <Dot />
    <Star />
  </div>
  <div class="content">
    <slot />
  </div>
  <div class="illus">
    <Star />
    <Dot />
  </div>
</div>

<style>
  .section-header {
    padding: 0 var(--spacing-m);
    display: flex;
    gap: var(--spacing-m);
    margin-top: var(--spacing-m);
    justify-content: center;
    margin-bottom: var(--spacing-m);
  }

  .illus {
    display: flex;
    align-items: center;
    gap: var(--spacing-m);
  }

  @media (max-width: 577px) {
    .section-header {
      justify-content: space-between;
    }

    .hide-mobile {
      display: none;
    }
  }
</style>

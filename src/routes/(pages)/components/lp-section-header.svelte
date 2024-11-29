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
    display: flex;
    justify-content: center;
  }

  .illus {
    display: flex;
    align-items: center;
    gap: 1rem;
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

<script>
  import Star from '$lib/components/illustrations/star.svelte';
</script>

<div class="section-header">
  <div class="illus hide-mobile">
    <Star />
  </div>
  <h1 class="content">
    <slot />
  </h1>
  <div class="illus">
    <Star />
  </div>
</div>

<style>
  .section-header {
    margin-top: 4rem;
    margin-bottom: 2rem;
    display: flex;
    justify-content: center;
    gap: 3rem;
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

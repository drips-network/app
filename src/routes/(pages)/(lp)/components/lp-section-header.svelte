<script>
  import Star from '$lib/components/illustrations/star.svelte';
</script>

<div class="section-header">
  <div class="illus">
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
    align-items: center;
    gap: 3rem;
  }

  .illus {
    display: flex;
    align-items: center;
    gap: 1rem;
    height: 2rem;
  }

  @media (max-width: 577px) {
    .section-header {
      gap: 0rem;
    }

    h1 {
      font-size: 1.5rem;
    }

    .illus {
      height: 1.5rem;
    }

    .section-header {
      justify-content: space-between;
    }
  }
</style>

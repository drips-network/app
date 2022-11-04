<script>
  import Dot from './dot.svelte';
  import Star from './star.svelte';
</script>

<section class="part dots-stars">
  <div class="dots-stars-box">
    <Dot class="bottom-right" />
    <Star class="bottom-left" />
    <slot />
    <Star class="top-right" />
    <Dot class="top-left" />
  </div>
</section>

<style>
  .dots-stars-box {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-m);
    margin-bottom: var(--spacing-m);
  }
</style>

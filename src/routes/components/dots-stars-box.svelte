<script>
  import Dot from './dot.svelte';
  import Star from './star.svelte';
</script>

<div class="dots-stars-box">
  <div class="assets">
    <Dot />
    <Dot />
    <Star />
    <Star />
  </div>
  <slot />
</div>

<style>
</style>

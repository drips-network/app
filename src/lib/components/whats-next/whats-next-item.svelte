<script lang="ts">
  import type { ComponentType } from 'svelte';
  import UlIconLi from '../ul-icon-li/ul-icon-li.svelte';

  export let icon: ComponentType;
</script>

<div class="whats-next-item typo-text">
  <UlIconLi {icon}>
    <slot />
  </UlIconLi>
</div>

<style>
</style>

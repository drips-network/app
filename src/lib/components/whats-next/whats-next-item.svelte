<script lang="ts">
  import type { Component } from 'svelte';
  import UlIconLi from '../ul-icon-li/ul-icon-li.svelte';

  interface Props {
    icon: Component;
    children?: import('svelte').Snippet;
  }

  let { icon, children }: Props = $props();
</script>

<div class="whats-next-item typo-text">
  <UlIconLi {icon}>
    {@render children?.()}
  </UlIconLi>
</div>

<style>
</style>

<script lang="ts">
  import NavProgressBar from '$lib/components/nav-progress-bar/nav-progress-bar.svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();
</script>

<div class="nav-progress-bar">
  <NavProgressBar color="var(--color-primary)" />
</div>

{@render children?.()}

<style>
  .nav-progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    view-transition-name: nav-progress-bar-wrapper;
  }
</style>

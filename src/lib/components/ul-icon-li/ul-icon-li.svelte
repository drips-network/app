<script lang="ts">
  import type { ComponentType } from 'svelte';

  export let icon: ComponentType;
</script>

<li class="ul-icon-li">
  <div class="icon">
    <svelte:component this={icon} style="fill: var(--color-foreground)" />
  </div>
  <div class="content"><slot /></div>
</li>

<style>
  .ul-icon-li {
    display: flex;
    gap: 0.5rem;
  }
</style>

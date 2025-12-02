<script lang="ts">
  import type { Component } from 'svelte';

  interface Props {
    icon: Component;
    children?: import('svelte').Snippet;
  }

  let { icon: Icon, children }: Props = $props();
</script>

<li class="ul-icon-li">
  <div class="icon">
    <Icon style="fill: var(--color-foreground)" />
  </div>
  <div class="content">{@render children?.()}</div>
</li>

<style>
  .ul-icon-li {
    display: flex;
    gap: 0.5rem;
  }
</style>

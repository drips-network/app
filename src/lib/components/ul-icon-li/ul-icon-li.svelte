<script lang="ts">
  import type { ComponentType } from 'svelte';

  interface Props {
    icon: ComponentType;
    children?: import('svelte').Snippet;
  }

  let { icon, children }: Props = $props();

  const SvelteComponent = $derived(icon);
</script>

<li class="ul-icon-li">
  <div class="icon">
    <SvelteComponent style="fill: var(--color-foreground)" />
  </div>
  <div class="content">{@render children?.()}</div>
</li>

<style>
  .ul-icon-li {
    display: flex;
    gap: 0.5rem;
  }
</style>

<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  import type { Component } from 'svelte';

  interface Props {
    label: string;
    href: string;
    active: boolean;
    icon: Component<{ style: string }>;
    external?: boolean;
    backgroundOnActive?: boolean;
  }

  let { label, href, active, icon, external = false, backgroundOnActive = false }: Props = $props();

  const IconComponent = $derived(icon);
</script>

<a
  data-highlightid="sidenav-{href}"
  data-testid="sidenav-item-{label}"
  class="sidenav-item typo-text"
  class:active
  class:background-on-active={backgroundOnActive}
  {href}
  target={external ? '_blank' : undefined}
  onclick={bubble('click')}
>
  <IconComponent
    style="fill: {active
      ? 'var(--color-primary-level-6)'
      : 'var(--color-foreground)'}; transition: fill 0.3s;"
  />
  {label}
</a>

<style>
  .sidenav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--color-foreground);
    height: 3rem;
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    padding: 0.75rem;
    transition:
      background-color 0.3s,
      box-shadow 0.3s,
      color 0.3s;
    overflow: hidden;
  }

  .sidenav-item.active {
    color: var(--color-primary-level-6);
  }

  .sidenav-item.background-on-active.active {
    background-color: var(--color-primary-level-1);
    box-shadow: var(--elevation-low);
  }

  .sidenav-item:focus {
    outline: none;
  }

  .sidenav-item:not(.active):hover,
  .sidenav-item:focus-visible {
    background-color: var(--color-primary-level-1);
  }

  @media (max-width: 1252px) {
    .sidenav-item {
      width: 3rem;
    }
  }
</style>

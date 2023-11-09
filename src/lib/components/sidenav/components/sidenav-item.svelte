<script lang="ts">
  import type { ComponentType } from 'svelte';

  export let label: string;
  export let href: string;
  export let active: boolean;
  export let icon: ComponentType;
  export let external = false;
</script>

<a
  data-highlightid="sidenav-{href}"
  class="sidenav-item typo-text"
  class:active
  {href}
  target={external ? '_blank' : undefined}
>
  <svelte:component
    this={icon}
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
    transition: background-color 0.3s, color 0.3s;
    overflow: hidden;
  }

  .sidenav-item.active {
    color: var(--color-primary-level-6);
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

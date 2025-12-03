<script lang="ts">
  import type { Component, Snippet } from 'svelte';

  interface Props {
    icon: Component<{ style: string }>;
    onclick?: () => void;
    children: Snippet;
    href?: string;
    variant?: 'normal' | 'primary';
    disabled?: boolean;
  }

  let { icon: Icon, onclick, children, href, variant = 'normal', disabled }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element
  this={href ? 'a' : 'button'}
  {href}
  target="_blank"
  rel="noopener noreferrer"
  class="sidebar-button {variant} typo-text"
  class:disabled
  {onclick}
  aria-label="Sidebar Action"
  {disabled}
>
  <Icon style="fill: var(--color-foreground)" />
  {@render children()}
</svelte:element>

<style>
  .sidebar-button {
    height: 3rem;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .sidebar-button:not(:first-child) {
    border-top: 1px solid var(--color-foreground-level-3);
  }

  .sidebar-button:not(:last-child) {
    border-bottom: 1px solid var(--color-foreground-level-3);
  }

  .sidebar-button.disabled {
    cursor: not-allowed;
    opacity: 0.6;
    pointer-events: none;
  }

  .sidebar-button.normal {
    color: var(--color-foreground);
  }

  .sidebar-button.normal:not(.disabled):hover {
    background-color: var(--color-foreground-level-1);
  }

  .sidebar-button.normal:not(.disabled):active {
    background-color: var(--color-foreground-level-2);
  }

  .sidebar-button.primary {
    background-color: var(--color-primary-level-1);
  }

  .sidebar-button.primary:not(.disabled):hover {
    background-color: var(--color-primary-level-2);
  }
</style>

<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  import ChevronRight from '$lib/components/icons/ChevronRight.svelte';
  import type { ComponentType } from 'svelte';

  interface Props {
    disabled?: boolean;
    icon?: ComponentType | undefined;
    href?: string | undefined;
    left?: import('svelte').Snippet;
    title?: import('svelte').Snippet;
    right?: import('svelte').Snippet;
  }

  let {
    disabled = false,
    icon = undefined,
    href = undefined,
    left,
    title,
    right
  }: Props = $props();
</script>

<a {href} onclick={bubble('click')} class:disabled class:clickable={href} class="account-menu-item-wrapper">
  {#if !icon}
    {@render left?.()}
  {:else}
    <div class="icon-wrapper">
      {#if icon}{@const SvelteComponent = icon}
      {#if icon}<SvelteComponent style="fill: var(--color-background)" />{/if}
    </div>
  {/if}
  <div class="description typo-text">
    {@render title?.()}
  </div>
  {#if right}{@render right()}{:else}
    <ChevronRight />
  {/if}
</a>

<style>
  .account-menu-item-wrapper {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.5rem;
    border-radius: 1rem 0 1rem 1rem;
    transition: background-color 0.3s;
  }

  .account-menu-item-wrapper > * {
    min-width: 0;
  }

  .account-menu-item-wrapper.clickable {
    cursor: pointer;
  }

  .account-menu-item-wrapper.clickable:hover {
    background-color: var(--color-foreground-level-1);
  }

  .account-menu-item-wrapper.clickable:focus {
    background-color: var(--color-foreground-level-2);
    outline: none;
  }

  .account-menu-item-wrapper.disabled {
    opacity: 0.5;
  }

  .icon-wrapper {
    height: 3rem;
    width: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-foreground);
    border-radius: 1.5rem;
  }

  .description {
    flex: 1;
    color: var(--color-foreground);
  }
</style>

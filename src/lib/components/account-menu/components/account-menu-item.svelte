<script lang="ts">
  import ChevronRight from 'radicle-design-system/icons/ChevronRight.svelte';
  import type { SvelteComponent } from 'svelte';

  export let disabled = false;
  export let icon: typeof SvelteComponent | undefined = undefined;
  export let onClick: (() => void) | undefined = undefined;
</script>

<div
  class:disabled
  class:clickable={onClick}
  class="account-menu-item-wrapper"
  on:click={() => !disabled && onClick && onClick()}
  tabindex={onClick ? 0 : undefined}
>
  <slot name="left">
    <div class="icon-wrapper">
      {#if icon}<svelte:component this={icon} style="fill: var(--color-primary)" />{/if}
    </div>
  </slot>
  <div class="description typo-text-bold">
    <slot name="title" />
  </div>
  <slot name="right">
    <ChevronRight />
  </slot>
</div>

<style>
  .account-menu-item-wrapper {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: background-color 0.3s;
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
    background-color: var(--color-primary-level-1);
    border-radius: 1.5rem;
  }

  .description {
    flex: 1;
    color: var(--color-foreground-level-6);
  }
</style>

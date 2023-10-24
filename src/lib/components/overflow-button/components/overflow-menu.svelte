<script lang="ts" context="module">
  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';
  import type { ComponentType } from 'svelte';

  interface BaseOption {
    label: string;
    icon: ComponentType;
  }

  interface LinkOption extends BaseOption {
    type: 'link';
    href: string;
  }

  interface ActionOption extends BaseOption {
    type: 'action';
    handler: () => void;
  }

  export type Option = LinkOption | ActionOption;
</script>

<script lang="ts">
  export let options: Option[];

  function fireHandler(handler: () => void) {
    cupertinoPaneStore.closeSheet();
    handler();
  }
</script>

<div class="overflow-menu">
  {#each options as option}
    <svelte:element
      this={option.type === 'link' ? 'a' : 'button'}
      on:click={option.type === 'link'
        ? undefined
        : () => 'handler' in option && fireHandler(option.handler)}
      class="option"
    >
      <div class="icon">
        <svelte:component this={option.icon} style="fill: var(--color-foreground)" />
      </div>
      <span class="label">
        {option.label}
      </span>
    </svelte:element>
  {/each}
</div>

<style>
  .overflow-menu {
    display: flex;
    flex-direction: column;
  }

  .option {
    height: 3rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 1rem;
    white-space: nowrap;
  }

  .option:hover {
    background-color: var(--color-foreground-level-2);
  }

  .option:not(:last-child) {
    border-bottom: 1px solid var(--color-foreground-level-3);
  }
</style>

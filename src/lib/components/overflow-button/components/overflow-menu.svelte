<script lang="ts" context="module">
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
    action: () => void;
  }

  export type Option = LinkOption | ActionOption;
</script>

<script lang="ts">
  export let options: Option[];
</script>

<div class="overflow-menu">
  {#each options as option}
    <svelte:element
      this={option.type === 'link' ? 'a' : 'button'}
      on:click={option.type === 'link' ? undefined : option.action}
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
    padding: 2rem;
    display: flex;
    flex-direction: column;
  }

  .option {
    height: 3rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-foreground-level-3);
  }
</style>

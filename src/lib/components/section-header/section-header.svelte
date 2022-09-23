<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import Button from '../button/button.svelte';

  export let icon: typeof SvelteComponent | undefined = undefined;
  export let label: string;
  export let actions: { handler: () => void; label?: string; icon?: typeof SvelteComponent }[] = [];
</script>

<div class="section-header">
  <div class="title">
    {#if icon}
      <div data-testid="section-icon" class="icon-wrapper">
        <svelte:component this={icon} style="fill: var(--color-primary)" />
      </div>
    {/if}
    <h3>{label}</h3>
  </div>
  <div class="actions">
    {#each actions as action}
      <Button icon={action.icon} on:click={action.handler}>{action.label}</Button>
    {/each}
  </div>
</div>

<style>
  .section-header {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: space-between;
  }

  .icon-wrapper {
    background-color: var(--color-primary-level-1);
    height: 2rem;
    width: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 1rem;
  }

  .actions,
  .title {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import type { ComponentType } from 'svelte';

  export let id: string;
  export let title: string;
  export let description: string;
  export let illustration: ComponentType;
  export let actions: {
    handler: () => void;
    label: string;
    icon?: ComponentType;
    primary?: true;
  }[] = [];
</script>

<div class="edu-card">
  <div class="illustration-outer">
    <div class="illustration">
      <svelte:component this={illustration} />
    </div>
  </div>
  <div class="content">
    <div class="text">
      <h3 class="pixelated">{title}</h3>
      <p>{description}</p>
    </div>
    <div class="actions gap-1">
      <Button variant="ghost" on:click={() => dismissablesStore.dismiss(id)}>Dismiss</Button>
      {#each actions as action}
        <Button
          icon={action.icon}
          variant={action.primary ? 'primary' : undefined}
          on:click={action.handler}>{action.label}</Button
        >
      {/each}
    </div>
  </div>
</div>

<style>
  .edu-card {
    position: relative;
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    display: flex;
    overflow: hidden;
    align-items: center;
    height: 100%;
    user-select: none;
  }

  .illustration-outer {
    /* padding: 0.75rem; */
    height: 100%;
    background-color: var(--color-primary-level-1);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .illustration {
    height: 10rem;
    width: 10rem;
    padding: 1rem;
  }

  .content {
    height: 100%;
    width: 100%;
    flex-grow: 1;
    flex-basis: 65%;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 2rem;
  }

  .content .actions {
    display: flex;
    justify-content: flex-end;
  }

  h3 {
    margin-bottom: 0.5rem;
    margin-right: 1.5rem;
  }

  @media (max-width: 768px) {
    .edu-card {
      flex-direction: column;
      align-items: flex-start;
    }

    .illustration-outer {
      width: 100%;
      height: 10rem;
    }

    .illustration {
      width: 100%;
    }

    .content {
      flex-direction: column;
      flex-grow: 1;
    }
  }
</style>

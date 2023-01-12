<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import type { SvelteComponent } from 'svelte';
  import CrossSmall from 'radicle-design-system/icons/CrossSmall.svelte';

  export let id: string;
  export let title: string;
  export let description: string;
  export let illustration: typeof SvelteComponent;
  export let actions: {
    handler: () => void;
    label: string;
    icon?: typeof SvelteComponent;
    primary?: true;
  }[] = [];
</script>

<div class="edu-card">
  <button class="close-button" on:click={() => dismissablesStore.dismiss(id)}>
    <CrossSmall />
  </button>
  <div>
    <div class="illustration">
      <svelte:component this={illustration} />
    </div>
  </div>
  <div class="content">
    <div class="text">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
    <div class="actions">
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
  }

  .illustration {
    margin: 0.75rem;
    border-radius: 0.5rem 0 0.5rem 0.5rem;
    flex: 0 0 auto;
    padding: 0.75rem;
  }

  .content {
    height: 100%;
    flex-basis: 65%;
    flex-shrink: 0;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 2rem;
    width: 100%;
  }

  .content .actions {
    display: flex;
    justify-content: flex-end;
  }

  h3 {
    margin-bottom: 0.5rem;
    margin-right: 1.5rem;
  }

  .close-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    transition: background-color 0.3s;
    border-radius: 1rem;
  }

  .close-button:hover {
    background-color: var(--color-foreground-level-1);
  }

  .close-button:focus {
    background-color: var(--color-foreground-level-2);
  }

  @media (max-width: 577px) {
    .edu-card {
      flex-direction: column;
      align-items: flex-start;
    }

    .illustration {
      height: 10rem;
      width: 10rem;
    }

    .content {
      flex-direction: column;
      flex-basis: 0;
      flex-grow: 1;
    }
  }
</style>

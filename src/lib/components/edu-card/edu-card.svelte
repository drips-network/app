<script lang="ts">
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import { fade } from 'svelte/transition';
  import Cross from 'radicle-design-system/icons/Cross.svelte';
  import TransitionedHeight from '../transitioned-height/transitioned-height.svelte';

  export let dimissableId: string;
  export let negativeMarginWhileCollapsed: string | undefined = undefined;
</script>

<TransitionedHeight removeFromTabIndexWhileCollapsed={false} {negativeMarginWhileCollapsed}>
  {#if !$dismissablesStore.includes(dimissableId)}
    <div out:fade|local={{ duration: 300 }} class="edu-card">
      <div class="text">
        <slot name="text" />
      </div>
      <div class="illustration">
        <slot name="illustration" />
      </div>
      <button on:click={() => dismissablesStore.dismiss(dimissableId)} class="close-button">
        <Cross />
      </button>
    </div>
  {/if}
</TransitionedHeight>

<style>
  .edu-card {
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    gap: 3rem;
    padding: 2rem;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  .edu-card .text {
    width: 50%;
    max-width: 32rem;
    display: flex;
    gap: 1rem;
    flex-direction: column;
  }

  .edu-card .illustration {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .edu-card button {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    right: 1rem;
    top: 1rem;
    border-radius: 50%;
    height: 2rem;
    width: 2rem;
    z-index: 1;
    background-color: var(--color-background);
  }

  .edu-card button:focus-visible {
    background-color: var(--color-foreground-level-2);
  }

  @media (max-width: 768px) {
    .edu-card {
      flex-direction: column-reverse;
      gap: 2rem;
      padding: 1rem;
    }

    .edu-card .text {
      width: 100%;
      max-width: 100%;
    }
  }
</style>

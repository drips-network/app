<script lang="ts">
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import { fade } from 'svelte/transition';
  import TransitionedHeight from '../transitioned-height/transitioned-height.svelte';
  import Button from '../button/button.svelte';

  export let dismissableId: string | undefined = undefined;
  export let negativeMarginWhileCollapsed: string | undefined = undefined;
</script>

<TransitionedHeight removeFromTabIndexWhileCollapsed={false} {negativeMarginWhileCollapsed}>
  {#if dismissableId ? !$dismissablesStore.includes(dismissableId) : true}
    <div out:fade={{ duration: 300 }} class="edu-card">
      <div class="text">
        <slot name="text" />
        <div class="flex gap-1">
          <slot name="buttons" />
          {#if dismissableId}
            <Button
              variant="ghost"
              on:click={() => dismissableId && dismissablesStore.dismiss(dismissableId)}
              >Dismiss</Button
            >
          {/if}
        </div>
      </div>
      <div class="illustration">
        <slot name="illustration" />
      </div>
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

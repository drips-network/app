<script lang="ts">
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import EyeClosed from '$lib/components/icons/EyeClosed.svelte';
  import ResultComponent from './result.svelte';
  import type { Result } from '../types';
  import { fade } from 'svelte/transition';
  import Cross from '$lib/components/icons/Cross.svelte';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';

  export let results: Result[];
  export let loading: boolean;
  export let error: boolean;
  export let resultElems: HTMLDivElement[] = [];
</script>

<TransitionedHeight transitionHeightChanges={true}>
  <div class="results">
    {#if loading}
      <div class="loading-state" transition:fade={{ duration: 100 }}><Spinner /></div>
    {/if}

    {#if error}
      <div class="empty-state">
        <Cross />
        <p class="typo-text">Sorry, something went wrong while searching.</p>
      </div>
    {:else if results.length === 0}
      <div class="empty-state">
        <EyeClosed />
        <p class="typo-text">No results</p>
      </div>
    {:else}
      {#each results as result, index}
        <div class="result" bind:this={resultElems[index]}>
          <ResultComponent on:click item={result} />
        </div>
      {/each}
    {/if}
  </div>
</TransitionedHeight>

<style>
  .results {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    max-height: 24rem;
    min-height: 3.5rem;
    padding: 0.5rem;
  }

  .result {
    width: 100%;
  }

  .loading-state {
    position: absolute;
    background: var(--color-background);
    width: 100%;
    height: calc(100% - 1rem);
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--color-foreground);
    flex-direction: column;
    z-index: 10;
  }

  .empty-state {
    height: 4rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  @media (max-width: 768px) {
    .results {
      max-height: initial;
    }
  }
</style>

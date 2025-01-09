<script lang="ts">
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import EyeClosed from '$lib/components/icons/EyeClosed.svelte';
  import ResultComponent from './result.svelte';
  import type { Result } from '../types';
  import { fade } from 'svelte/transition';
  import Cross from '$lib/components/icons/Cross.svelte';

  export let results: Result[];
  export let loading: boolean;
  export let error: boolean;
  export let resultElems: HTMLDivElement[] = [];
</script>

<div class="results">
  {#if loading}
    <div class="loading-state" transition:fade={{ duration: 100 }}><Spinner /></div>
  {:else if error}
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

<style>
  .results {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    height: 24rem;
  }

  .result {
    width: 100%;
  }

  .empty-state,
  .loading-state {
    position: absolute;
    background: var(--color-background);
    width: 100%;
    height: 100%;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--color-foreground);
    flex-direction: column;
  }
</style>

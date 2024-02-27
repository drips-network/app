<script lang="ts">
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import unreachable from '$lib/utils/unreachable';
  import fuzzysort from 'fuzzysort';
  import EyeClosed from '$lib/components/icons/EyeClosed.svelte';
  import type search from '../search';
  import Result from './result.svelte';

  export let results: ReturnType<typeof search>;
  export let loading: boolean;
  export let resultElems: HTMLDivElement[] = [];
</script>

<div class="results">
  {#each results as result, index}
    <div class="result" bind:this={resultElems[index]}>
      <Result
        on:click
        item={result.obj}
        highlighted={fuzzysort.highlight(
          result[0] ?? result[1] ?? result[2],
          '<div class="search-highlight">',
          '</div>',
        ) ?? unreachable()}
      />
    </div>
  {/each}
  {#if loading}
    <div class="loading-state"><Spinner /></div>
  {:else if results.length === 0}
    <div class="empty-state">
      <EyeClosed />
      <p class="typo-text">No results</p>
    </div>
  {/if}
</div>

<style>
  .results {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
  }

  .result {
    width: 100%;
  }

  .empty-state,
  .loading-state {
    height: 8rem;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--color-foreground);
    flex-direction: column;
  }
</style>

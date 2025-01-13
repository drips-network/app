<script lang="ts">
  import SearchIcon from '$lib/components/icons/MagnifyingGlass.svelte';
  import CloseIcon from '$lib/components/icons/CrossSmall.svelte';

  import { tick } from 'svelte';
  import { sineIn, sineInOut, sineOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import scroll from '$lib/stores/scroll';
  import Results from './components/results.svelte';
  import { search } from './search';
  import type { Result } from './types';
  import InfoCircle from '../icons/InfoCircle.svelte';
  import { browser } from '$app/environment';

  let searchTerm: string | undefined;

  let searchElem: HTMLDivElement;

  export let searchOpen = false;

  async function focusOnSearch() {
    await tick();
    searchElem.focus();
  }

  $: {
    if (searchOpen && browser) {
      scroll.lock();
      focusOnSearch();
    } else if (browser) {
      scroll.unlock();
    }
  }

  $: {
    if (!searchOpen) searchTerm = undefined;
  }

  function closeSearch() {
    searchOpen = false;
  }

  let loading = false;
  let error = false;

  let results: Result[] = [];
  let resultElems: HTMLElement[] = [];

  let searchTimeout: ReturnType<typeof setTimeout>;
  let searchNumber = 0;

  function handleSearchTermChange(searchTerm: string | undefined) {
    clearTimeout(searchTimeout);

    if (!searchTerm) {
      results = [];
      loading = false;
      return;
    }

    loading = true;

    searchTimeout = setTimeout(async () => {
      const currentSearchNumber = searchNumber;
      searchNumber++;

      try {
        results = await search(searchTerm);

        // prevent in-flight requests from overwriting the results
        if (currentSearchNumber !== searchNumber - 1) return;

        loading = false;
        error = false;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        loading = false;
        error = true;
      }
    }, 300);
  }
  $: handleSearchTermChange(searchTerm);

  function handleKeyboard(e: KeyboardEvent) {
    if (e.metaKey && e.key === 'k') {
      searchOpen = true;
      e.preventDefault();
      return;
    }

    if (e.key === 'Escape') {
      closeSearch();
      return;
    }

    if (!(e.key === 'ArrowDown' || e.key === 'ArrowUp')) return;

    const focussedElem = document.activeElement;

    if (!focussedElem) return;
    if (!(focussedElem === searchElem || resultElems.includes(focussedElem as HTMLDivElement))) {
      closeSearch();
      return;
    }

    const selectedIndex = resultElems.findIndex((e) => e === focussedElem);
    const changeIndexBy = e.key === 'ArrowDown' ? +1 : -1;
    const nextElem = resultElems[selectedIndex + changeIndexBy];

    if (nextElem) {
      (nextElem as HTMLElement)?.focus();
    } else if (selectedIndex === 0 && changeIndexBy === -1) {
      searchElem.focus();
    }

    e.preventDefault();
  }
</script>

<svelte:window on:keydown={handleKeyboard} />

{#if searchOpen}
  <div
    class="search-bar"
    class:focus={searchOpen}
    transition:fly={{ duration: 300, x: 64, easing: sineInOut }}
  >
    <div class="search-bar-input-wrapper">
      <SearchIcon style="fill: var(--color-foreground)" />
      <input
        type="text"
        placeholder="Search claimed projects, Drip Lists and addresses"
        bind:this={searchElem}
        bind:value={searchTerm}
        autocomplete="off"
      />
      {#if searchOpen}<div transition:fly={{ duration: 300, y: 4 }}>
          <CloseIcon style="cursor: pointer;" on:click={closeSearch} />
        </div>{/if}
    </div>
    {#if searchOpen}
      <div
        class="hint typo-text-small"
        in:fly|global={{ duration: 200, y: 8, easing: sineOut }}
        out:fly|global={{ duration: 200, y: 8, easing: sineIn }}
      >
        <InfoCircle /> Paste a GitHub URL to jump to that project
      </div>
    {/if}
    {#if searchOpen && searchTerm}
      <div
        in:fly|global={{ duration: 200, y: 8, easing: sineOut }}
        out:fly|global={{ duration: 200, y: 8, easing: sineIn }}
        class="results"
      >
        <Results bind:resultElems {results} {loading} {error} on:click={closeSearch} />
      </div>
    {/if}
  </div>
{/if}

<style>
  input {
    height: 3rem;
    width: 100%;
    text-overflow: ellipsis;
  }

  input:focus {
    outline: none;
    text-overflow: ellipsis;
  }

  .search-bar {
    display: block;
    display: flex;
    align-items: center;
    height: 3rem;
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    max-width: 32rem;
    width: 100%;
    border: 1px solid var(--color-foreground);
    transition: border 0.3s;
    z-index: 100;
    position: relative;
    transition:
      border 0.3s,
      background-color 0.3s,
      box-shadow 0.3s;
  }

  .search-bar.focus {
    background-color: var(--color-foreground-level-1);
    box-shadow: var(--elevation-medium);
  }

  .search-bar:hover:not(.focus) {
    box-shadow: var(--elevation-low);
  }

  .search-bar-input-wrapper {
    width: 100%;
    display: flex;
    padding: 0 1rem;
    align-items: center;
    gap: 1rem;
  }

  .hint {
    position: absolute;
    top: 4rem;
    right: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    color: var(--color-foreground-level-5);
  }

  .results {
    position: absolute;
    top: 4rem;
    right: -2px;
    left: -2px;
    display: flex;
    justify-content: center;
    z-index: 2;
    max-height: calc(100dvh - 6rem);
    overflow: scroll;
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    box-shadow: var(--elevation-medium);
  }

  @media (max-width: 768px) {
    .search-bar {
      width: calc(100vw - 1rem);
      left: 0.5rem;
    }

    .search-bar-input-wrapper {
      padding: 1rem 0.5rem;
      gap: 0.25rem;
    }

    .results {
      padding: 0;
    }
  }
</style>

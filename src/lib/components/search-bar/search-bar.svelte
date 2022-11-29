<script lang="ts">
  import SearchIcon from 'radicle-design-system/icons/MagnifyingGlass.svelte';
  import CloseIcon from 'radicle-design-system/icons/CrossSmall.svelte';

  import { onMount, tick } from 'svelte';
  import { sineIn, sineInOut, sineOut } from 'svelte/easing';
  import { fade, fly } from 'svelte/transition';
  import search, { updateSearchItems } from './search';
  import scroll from '$lib/stores/scroll';
  import streams from '$lib/stores/streams';
  import tokens from '$lib/stores/tokens';
  import wallet from '$lib/stores/wallet';
  import Results from './components/results.svelte';

  let focus = false;
  let mobileSearchActive = false;

  $: focus ? scroll.lock() : scroll.unlock();

  let searchTerm: string;

  let desktopSearchElem: HTMLDivElement;
  let mobileSearchElem: HTMLDivElement;

  function getActiveSearchElem() {
    return window.getComputedStyle(desktopSearchElem, null).display === 'none'
      ? mobileSearchElem
      : desktopSearchElem;
  }

  async function triggerMobileSearch() {
    mobileSearchActive = true;
    focus = true;
    await tick();

    getActiveSearchElem().focus();
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeSearch();
    }
  }

  function closeSearch() {
    searchTerm = '';
    getActiveSearchElem().blur();
    focus = false;
    mobileSearchActive = false;
  }

  let loading = true;

  const { fetchStatuses } = streams;
  $: {
    const { dripsUserId } = $wallet;

    if (dripsUserId && $fetchStatuses[dripsUserId] !== 'fetched') {
      loading = true;
    } else {
      loading = false;
    }
  }

  let results: ReturnType<typeof search> = [];
  $: results = search(searchTerm);

  $: {
    $streams;
    $tokens;
    if (!loading) {
      updateSearchItems($wallet.dripsUserId);
      results = search(searchTerm);
    }
  }

  let resultElems: HTMLDivElement[] = [];

  function handleKeyboard(e: KeyboardEvent) {
    if (e.metaKey === true && e.key === 'k') {
      getActiveSearchElem().focus();
      e.preventDefault();
      return;
    }

    const focussedElem = document.activeElement;
    const accountMenuItemElems = resultElems.map((e) => e?.firstChild);

    if (!focussedElem) return;
    if (!(e.key === 'ArrowDown' || e.key === 'ArrowUp')) return;
    if (
      !(
        focussedElem === getActiveSearchElem() ||
        accountMenuItemElems.includes(focussedElem as HTMLDivElement)
      )
    ) {
      return;
    }

    const selectedIndex = accountMenuItemElems.findIndex((e) => e === focussedElem);
    const changeIndexBy = e.key === 'ArrowDown' ? +1 : -1;
    const nextElem = resultElems[selectedIndex + changeIndexBy];

    if (nextElem) {
      (nextElem.firstChild as HTMLElement)?.focus();
    } else if (selectedIndex === 0 && changeIndexBy === -1) {
      getActiveSearchElem().focus();
    }

    e.preventDefault();
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyboard);

    return () => window.removeEventListener('keydown', handleKeyboard);
  });
</script>

<svelte:window on:keydown={handleEscape} />

<div class="search-bar desktop" class:focus>
  <div class="search-bar-input-wrapper">
    <SearchIcon />
    <input
      type="text"
      data-testid="searchbar"
      placeholder="Search addresses, accounts, streams..."
      bind:this={desktopSearchElem}
      bind:value={searchTerm}
      on:focus={() => (focus = true)}
    />
    {#if focus}<CloseIcon style="cursor: pointer;" on:click={closeSearch} />{/if}
  </div>
  {#if focus && searchTerm}
    <div
      in:fly={{ duration: 200, y: 8, easing: sineOut }}
      out:fly={{ duration: 200, y: 8, easing: sineIn }}
      class="results"
    >
      <Results bind:resultElems {results} {loading} on:click={closeSearch} />
    </div>
  {/if}
</div>

<div class="mobile">
  {#if mobileSearchActive}
    <div class="search-bar search-bar-overlay">
      <div class="search-bar-input-wrapper">
        <SearchIcon />
        <input
          bind:this={mobileSearchElem}
          bind:value={searchTerm}
          type="text"
          placeholder="Search addresses, accounts, streams..."
        />
        {#if focus}<CloseIcon style="cursor: pointer;" on:click={closeSearch} />{/if}
      </div>
      {#if results.length > 0 && focus}
        <div class="results">
          <Results bind:resultElems {results} {loading} on:click={closeSearch} />
        </div>
      {/if}
    </div>
  {/if}
  <div class="mobile-search-button">
    <SearchIcon on:click={triggerMobileSearch} />
  </div>
</div>

{#if focus}<div
    class="overlay"
    on:click={closeSearch}
    transition:fade={{ duration: 200, easing: sineInOut }}
  />{/if}

<style>
  .search-bar {
    display: block;
  }

  .search-bar.focus {
    border: 2px solid var(--color-foreground-level-3);
  }

  input {
    height: 100%;
    width: 100%;
  }

  input:focus {
    outline: none;
  }

  input::placeholder {
    color: var(--color-foreground-level-4);
  }

  .search-bar {
    display: flex;
    align-items: center;
    height: 3rem;
    border-radius: 1.5rem;
    background-color: var(--color-foreground-level-1);
    max-width: 32rem;
    width: 100%;
    border: 2px solid transparent;
    transition: border 0.3s;
    z-index: 2;
    position: relative;
  }

  .search-bar-input-wrapper {
    width: 100%;
    display: flex;
    padding: 0 1rem;
    align-items: center;
    gap: 1rem;
  }

  .overlay {
    position: fixed;
    /* top: 4rem; */
    right: 0;
    left: 0;
    bottom: 0;
    background-color: var(--color-background);
    opacity: 0.75;
    z-index: 1;
  }

  .search-bar-overlay {
    height: 4rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: var(--color-background);
    z-index: 1;
    padding: 0.5rem;
  }

  .mobile {
    display: none;
  }

  .mobile .mobile-search-button {
    height: 2rem;
    width: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-foreground-level-1);
    border-radius: 1rem;
  }

  .mobile input {
    display: none;
  }

  .results {
    position: absolute;
    top: 3.5rem;
    right: -2px;
    left: -2px;
    display: flex;
    justify-content: center;
    z-index: 2;
    max-height: calc(100vh - 5rem);
    overflow: scroll;
    background-color: var(--color-background);
    border: 2px solid var(--color-foreground-level-1);
    border-radius: 2.5rem;
    padding: 0.5rem;
  }

  @media (max-width: 768px) {
    .mobile {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      z-index: 2;
    }

    .search-bar-input-wrapper {
      padding: 1rem;
    }

    .mobile input {
      display: block;
    }

    .desktop {
      display: none;
    }

    .desktop input {
      display: none;
    }

    .overlay {
      opacity: 1;
    }

    .results {
      border: none;
      padding: 0;
    }
  }
</style>

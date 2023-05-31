<script lang="ts">
  import SearchIcon from 'radicle-design-system/icons/MagnifyingGlass.svelte';
  import CloseIcon from 'radicle-design-system/icons/CrossSmall.svelte';

  import { tick } from 'svelte';
  import { sineIn, sineInOut, sineOut } from 'svelte/easing';
  import { fade, fly } from 'svelte/transition';
  import search, { updateSearchItems } from './search';
  import scroll from '$lib/stores/scroll';
  import streams from '$lib/stores/streams';
  import tokens from '$lib/stores/tokens';
  import wallet from '$lib/stores/wallet/wallet.store';
  import Results from './components/results.svelte';
  import accountFetchStatussesStore from '$lib/stores/account-fetch-statusses/account-fetch-statusses.store';

  let focus = false;
  let mobileSearchActive = false;

  $: focus ? scroll.lock() : scroll.unlock();

  let searchTerm: string | undefined;

  let desktopSearchElem: HTMLDivElement;
  let mobileSearchElem: HTMLDivElement;

  function getActiveSearchElem() {
    return window.getComputedStyle(desktopSearchElem, null).display === 'none'
      ? mobileSearchElem
      : desktopSearchElem;
  }

  async function triggerSearch() {
    mobileSearchActive = true;
    focus = true;
    await tick();

    getActiveSearchElem().focus();
  }

  function closeSearch() {
    searchTerm = '';
    getActiveSearchElem().blur();
    focus = false;
    mobileSearchActive = false;
  }

  let loading = true;

  $: {
    const { dripsUserId } = $wallet;

    if (dripsUserId && $accountFetchStatussesStore[dripsUserId]?.all !== 'fetched') {
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
  $: accountMenuItemElems = resultElems.map((e) => e?.firstChild);

  function handleKeyboard(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      closeSearch();
      return;
    }

    if (e.metaKey === true && e.key === 'k') {
      getActiveSearchElem().focus();
      e.preventDefault();
      return;
    }

    if (!(e.key === 'ArrowDown' || e.key === 'ArrowUp')) return;

    const focussedElem = document.activeElement;

    if (!focussedElem) return;
    if (
      !(
        focussedElem === getActiveSearchElem() ||
        accountMenuItemElems.includes(focussedElem as HTMLDivElement)
      )
    ) {
      focus = false;
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

  function handleSearchBlur(e: FocusEvent) {
    const focussedElem = e.relatedTarget as HTMLElement;

    if (!accountMenuItemElems.includes(focussedElem) && focussedElem !== desktopSearchElem) {
      searchTerm = undefined;
      focus = false;
    }
  }
</script>

<svelte:window on:keydown={handleKeyboard} />

<div class="search-bar desktop" class:focus>
  <div class="search-bar-input-wrapper">
    <SearchIcon style="fill: var(--color-foreground)" />
    <input
      type="text"
      data-testid="searchbar"
      placeholder="Search addresses, accounts, streams..."
      bind:this={desktopSearchElem}
      bind:value={searchTerm}
      on:focus={() => (focus = true)}
      on:focusout={handleSearchBlur}
      autocomplete="off"
    />
    {#if focus}<div transition:fly={{ duration: 300, y: 4 }}>
        <CloseIcon style="cursor: pointer;" on:click={closeSearch} />
      </div>{/if}
  </div>
  {#if focus && searchTerm}
    <div
      in:fly={{ duration: 200, y: 8, easing: sineOut }}
      out:fly={{ duration: 200, y: 8, easing: sineIn }}
      class="results"
      on:focusout={handleSearchBlur}
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
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          bind:this={mobileSearchElem}
          bind:value={searchTerm}
          type="text"
          placeholder="Search addresses, accounts, streams..."
        />
        {#if focus}
          <CloseIcon style="cursor: pointer;" on:click={closeSearch} />
        {/if}
      </div>
      {#if results.length > 0 && focus}
        <div class="results">
          <Results bind:resultElems {results} {loading} on:click={closeSearch} />
        </div>
      {/if}
    </div>
  {/if}
  <div class="mobile-search-button">
    <SearchIcon on:click={triggerSearch} />
  </div>
</div>

{#if focus}<div
    class="overlay"
    on:click={closeSearch}
    on:keydown={closeSearch}
    transition:fade={{ duration: 200, easing: sineInOut }}
  />{/if}

<style>
  .search-bar {
    display: block;
  }

  .search-bar.focus {
    background-color: var(--color-foreground-level-1);
    box-shadow: var(--elevation-medium);
  }

  input {
    height: 3rem;
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
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    max-width: 32rem;
    width: 100%;
    border: 1px solid var(--color-foreground);
    transition: border 0.3s;
    z-index: 2;
    position: relative;
    transition: border 0.3s, background-color 0.3s, box-shadow 0.3s;
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
    border-radius: 1.5rem 0 1.5rem 1.5rem;
  }

  .mobile input {
    display: none;
  }

  .results {
    position: absolute;
    top: 4rem;
    right: -2px;
    left: -2px;
    display: flex;
    justify-content: center;
    z-index: 2;
    max-height: calc(100vh - 5rem);
    overflow: scroll;
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    padding: 0.5rem;
    box-shadow: var(--elevation-medium);
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

    .search-bar {
      border: none;
    }

    .results {
      box-shadow: none;
      border: none;
    }
  }
</style>

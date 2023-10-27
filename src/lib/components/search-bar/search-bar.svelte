<script lang="ts">
  import SearchIcon from 'radicle-design-system/icons/MagnifyingGlass.svelte';
  import CloseIcon from 'radicle-design-system/icons/CrossSmall.svelte';

  import { createEventDispatcher, onMount } from 'svelte';
  import { sineIn, sineInOut, sineOut } from 'svelte/easing';
  import { fade, fly } from 'svelte/transition';
  import search, { updateSearchItems } from './search';
  import scroll from '$lib/stores/scroll';
  import streams from '$lib/stores/streams';
  import tokens from '$lib/stores/tokens';
  import wallet from '$lib/stores/wallet/wallet.store';
  import Results from './components/results.svelte';
  import accountFetchStatussesStore from '$lib/stores/account-fetch-statusses/account-fetch-statusses.store';

  const dispatch = createEventDispatcher<{ dismiss: undefined }>();

  let focus = false;

  $: focus ? scroll.lock() : scroll.unlock();

  let searchTerm: string | undefined;

  let searchElem: HTMLDivElement;

  function closeSearch() {
    searchTerm = '';
    searchElem.blur();
    focus = false;

    dispatch('dismiss');
  }

  let loading = true;

  $: {
    const { dripsAccountId } = $wallet;

    if (dripsAccountId && $accountFetchStatussesStore[dripsAccountId]?.all !== 'fetched') {
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
      updateSearchItems($wallet.dripsAccountId);
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

    if (!(e.key === 'ArrowDown' || e.key === 'ArrowUp')) return;

    const focussedElem = document.activeElement;

    if (!focussedElem) return;
    if (
      !(
        focussedElem === searchElem || accountMenuItemElems.includes(focussedElem as HTMLDivElement)
      )
    ) {
      closeSearch();
      return;
    }

    const selectedIndex = accountMenuItemElems.findIndex((e) => e === focussedElem);
    const changeIndexBy = e.key === 'ArrowDown' ? +1 : -1;
    const nextElem = resultElems[selectedIndex + changeIndexBy];

    if (nextElem) {
      (nextElem.firstChild as HTMLElement)?.focus();
    } else if (selectedIndex === 0 && changeIndexBy === -1) {
      searchElem.focus();
    }

    e.preventDefault();
  }

  function handleSearchBlur(e: FocusEvent) {
    const focussedElem = e.relatedTarget as HTMLElement;

    if (!accountMenuItemElems.includes(focussedElem) && focussedElem !== searchElem) {
      searchTerm = undefined;
      closeSearch();
    }
  }

  onMount(() => {
    searchElem.focus();
  });
</script>

<svelte:window on:keydown={handleKeyboard} />

<div class="search-bar" class:focus>
  <div class="search-bar-input-wrapper">
    <SearchIcon style="fill: var(--color-foreground)" />
    <input
      type="text"
      placeholder="Search addresses, accounts, streams..."
      bind:this={searchElem}
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

{#if focus}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="overlay"
    on:click={closeSearch}
    on:keydown={closeSearch}
    transition:fade={{ duration: 200, easing: sineInOut }}
  />
{/if}

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
    z-index: 100;
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

  .results {
    position: absolute;
    top: 4rem;
    right: -2px;
    left: -2px;
    display: flex;
    justify-content: center;
    z-index: 2;
    max-height: calc(100vh - 6rem);
    overflow: scroll;
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    padding: 0.5rem;
    box-shadow: var(--elevation-medium);
  }

  @media (max-width: 768px) {
    .search-bar {
      width: calc(100vw - 2rem);
      left: 1rem;
    }

    .search-bar-input-wrapper {
      padding: 1rem;
    }

    .overlay {
      opacity: 1;
    }

    .results {
      border: none;
      box-shadow: none;
      padding: 0 0.5rem;
      top: 3.5rem;
      left: -1rem;
      right: -1rem;
      border-radius: 0;
      min-height: 100vh;
    }
  }
</style>

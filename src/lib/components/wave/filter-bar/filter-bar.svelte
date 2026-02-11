<script lang="ts">
  import Cross from '$lib/components/icons/Cross.svelte';
  import MagnifyingGlass from '$lib/components/icons/MagnifyingGlass.svelte';
  import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
  import { fly } from 'svelte/transition';
  import type { Snippet } from 'svelte';

  interface Props {
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange: (value: string | undefined) => void;
    sortOptions?: { value: string; label: string }[];
    currentSort?: string;
    onSortChange?: (value: string) => void;
    customFilters?: Snippet;
  }

  let {
    searchPlaceholder = 'Search...',
    searchValue = '',
    onSearchChange,
    sortOptions,
    currentSort,
    onSortChange,
    customFilters,
  }: Props = $props();

  let internalSearchValue = $derived.by(() => searchValue);
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;

  function handleSearchInput() {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      onSearchChange(internalSearchValue || undefined);
    }, 300);
  }

  let currentSortLabel = $derived(
    sortOptions?.find((o) => o.value === currentSort)?.label ?? sortOptions?.[0]?.label,
  );

  let showSortDropdown = $state(false);
  let sortButtonEl = $state<HTMLButtonElement>();
  let sortDropdownEl = $state<HTMLDivElement>();

  function handleSortChange(value: string) {
    onSortChange?.(value);
    showSortDropdown = false;
  }

  function handleWindowClick(e: MouseEvent) {
    if (e.target instanceof HTMLElement) {
      if (
        showSortDropdown &&
        !sortButtonEl?.contains(e.target) &&
        !sortDropdownEl?.contains(e.target)
      ) {
        showSortDropdown = false;
      }
    }
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="filter-bar typo-text">
  <div class="filter-bar-left">
    <div class="search-wrapper">
      <MagnifyingGlass style="fill: var(--color-foreground-level-5); flex-shrink: 0;" />
      <input
        type="text"
        class="search-input typo-text"
        placeholder={searchPlaceholder}
        bind:value={internalSearchValue}
        oninput={handleSearchInput}
      />
      {#if internalSearchValue}
        <button
          class="clear-search"
          aria-label="Clear search"
          onclick={() => {
            internalSearchValue = '';
            onSearchChange(undefined);
          }}
        >
          <Cross style="fill: var(--color-foreground-level-5); width: 1.25rem; height: 1.25rem;" />
        </button>
      {/if}
    </div>

    {#if customFilters}
      <div class="divider"></div>

      {@render customFilters()}
    {/if}
  </div>

  {#if sortOptions && onSortChange}
    <div class="sort-section">
      <span class="sort-label">Sort by</span>
      <div class="sort-wrapper">
        <button
          bind:this={sortButtonEl}
          class="sort-button"
          onclick={() => (showSortDropdown = !showSortDropdown)}
        >
          <span>{currentSortLabel}</span>
          <ChevronDown
            style="width: 1rem; height: 1rem; fill: var(--color-foreground-level-5); transition: transform 0.2s; {showSortDropdown
              ? 'transform: rotate(180deg);'
              : ''}"
          />
        </button>

        {#if showSortDropdown}
          <div
            bind:this={sortDropdownEl}
            class="sort-dropdown"
            transition:fly={{ duration: 200, y: 8 }}
          >
            {#each sortOptions as option (option.value)}
              <button
                class="dropdown-option"
                class:active={currentSort === option.value}
                onclick={() => handleSortChange(option.value)}
              >
                {option.label}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .filter-bar {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .filter-bar-left {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
    flex: 1;
  }

  .search-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 0.5rem;
    background: var(--color-background);
    min-width: 200px;
    flex: 1;
    max-width: 300px;
    height: 2.25rem;
    box-sizing: border-box;
  }

  .search-input {
    border: none;
    outline: none;
    background: none;
    flex: 1;
    min-width: 0;
    color: var(--color-foreground);
  }

  .search-input::placeholder {
    color: var(--color-foreground-level-4);
  }

  .clear-search {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.125rem;
    border-radius: 0.25rem;
    background: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
    flex-shrink: 0;
  }

  .clear-search:hover {
    background-color: var(--color-foreground-level-2);
  }

  .divider {
    width: 1px;
    height: 1.5rem;
    background-color: var(--color-foreground-level-3);
  }

  .sort-section {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .sort-label {
    color: var(--color-foreground-level-5);
    white-space: nowrap;
  }

  .sort-wrapper {
    position: relative;
  }

  .sort-button {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.625rem;
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 0.5rem;
    background: var(--color-background);
    cursor: pointer;
    color: var(--color-foreground);
    transition:
      border-color 0.2s,
      background-color 0.2s;
  }

  .sort-button:hover {
    border-color: var(--color-foreground-level-4);
    background-color: var(--color-foreground-level-1);
  }

  .sort-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background: var(--color-background);
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 0.5rem;
    box-shadow: var(--shadow-elevation-4);
    z-index: 10;
    min-width: 120px;
    white-space: nowrap;
  }

  .dropdown-option {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .dropdown-option:hover {
    background-color: var(--color-foreground-level-1);
  }

  .dropdown-option:first-child {
    border-radius: 0.5rem 0.5rem 0 0;
  }

  .dropdown-option:last-child {
    border-radius: 0 0 0.5rem 0.5rem;
  }

  .dropdown-option.active {
    background-color: var(--color-foreground-level-1);
    font-weight: 500;
  }

  @media (max-width: 600px) {
    .filter-bar {
      flex-direction: column;
      align-items: flex-start;
    }

    .filter-bar-left {
      width: 100%;
    }

    .search-wrapper {
      width: 100%;
      max-width: none;
    }

    .divider {
      display: none;
    }

    .sort-section {
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>

<script lang="ts">
  import Plus from '$lib/components/icons/Plus.svelte';
  import Cross from '$lib/components/icons/Cross.svelte';
  import MagnifyingGlass from '$lib/components/icons/MagnifyingGlass.svelte';
  import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
  import type {
    WaveProgramReposFilters,
    WaveProgramReposSortBy,
  } from '$lib/utils/wave/types/waveProgram';
  import MultiSelectFilter from './multi-select-filter.svelte';
  import { fly } from 'svelte/transition';

  interface FilterType {
    key: keyof WaveProgramReposFilters;
    label: string;
  }

  const AVAILABLE_FILTERS: FilterType[] = [{ key: 'primaryLanguages', label: 'Primary language' }];

  interface Props {
    filters: WaveProgramReposFilters;
    onFiltersChange: (filters: WaveProgramReposFilters) => void;
  }

  let { filters, onFiltersChange }: Props = $props();

  let searchValue = $state(filters.search ?? '');
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;

  // Track which filters are currently visible (shown in UI)
  // Initialize with filters that already have values
  let visibleFilterKeys = $state<(keyof WaveProgramReposFilters)[]>(
    AVAILABLE_FILTERS.filter((f) => {
      const value = filters[f.key];
      return value !== undefined && value !== '';
    }).map((f) => f.key),
  );

  // Filters that can still be added
  let availableFiltersToAdd = $derived(
    AVAILABLE_FILTERS.filter((f) => !visibleFilterKeys.includes(f.key)),
  );

  // Get current primary languages as array
  let selectedLanguages = $derived(
    filters.primaryLanguages ? filters.primaryLanguages.split(',') : [],
  );

  // Language options promise
  const languageOptionsPromise = new Promise<{ value: string; label: string }[]>((resolve) => {
    import('$lib/components/programming-language-breakdown/colors.json').then((colors) => {
      resolve(
        Object.keys(colors).map((lang) => ({
          label: lang,
          value: lang,
        })),
      );
    });
  });

  // Sort options
  const SORT_OPTIONS: { value: WaveProgramReposSortBy; label: string }[] = [
    { value: 'stargazersCount', label: 'Stars' },
    { value: 'forksCount', label: 'Forks' },
    { value: 'issueCount', label: 'Issue count' },
  ];

  let currentSort = $derived<WaveProgramReposSortBy>(filters.sortBy ?? 'stargazersCount');
  let currentSortLabel = $derived(
    SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? 'Stars',
  );

  let showSortDropdown = $state(false);
  let sortButtonEl = $state<HTMLButtonElement>();
  let sortDropdownEl = $state<HTMLDivElement>();

  function handleSortChange(sortBy: WaveProgramReposSortBy) {
    onFiltersChange({
      ...filters,
      sortBy,
    });
    showSortDropdown = false;
  }

  function handleSearchInput() {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      onFiltersChange({
        ...filters,
        search: searchValue || undefined,
      });
    }, 300);
  }

  function handleLanguagesChange(languages: string[]) {
    onFiltersChange({
      ...filters,
      primaryLanguages: languages.length > 0 ? languages.join(',') : undefined,
    });
  }

  function addFilter(filterKey: keyof WaveProgramReposFilters) {
    // Add the filter to visible filters
    if (!visibleFilterKeys.includes(filterKey)) {
      visibleFilterKeys = [...visibleFilterKeys, filterKey];
    }
    showAddFilterDropdown = false;
  }

  function removeFilter(filterKey: keyof WaveProgramReposFilters) {
    // Remove from visible filters
    visibleFilterKeys = visibleFilterKeys.filter((k) => k !== filterKey);
    // Also clear the filter value
    const newFilters = { ...filters };
    newFilters[filterKey] = undefined;
    onFiltersChange(newFilters);
  }

  let showAddFilterDropdown = $state(false);
  let addFilterButtonEl = $state<HTMLButtonElement>();
  let dropdownEl = $state<HTMLDivElement>();

  function handleWindowClick(e: MouseEvent) {
    if (e.target instanceof HTMLElement) {
      if (
        showAddFilterDropdown &&
        !addFilterButtonEl?.contains(e.target) &&
        !dropdownEl?.contains(e.target)
      ) {
        showAddFilterDropdown = false;
      }
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
      <MagnifyingGlass style="fill: var(--color-foreground-level-5)" />
      <input
        type="text"
        class="search-input typo-text"
        placeholder="Search repos..."
        bind:value={searchValue}
        oninput={handleSearchInput}
      />
      {#if searchValue}
        <button
          class="clear-search"
          aria-label="Clear search"
          onclick={() => {
            searchValue = '';
            onFiltersChange({ ...filters, search: undefined });
          }}
        >
          <Cross style="fill: var(--color-foreground-level-5); width: 1.25rem; height: 1.25rem;" />
        </button>
      {/if}
    </div>

    <div class="divider"></div>

    <div class="filters-section">
      {#if visibleFilterKeys.includes('primaryLanguages')}
        <div class="filter-item" transition:fly={{ duration: 200, y: 8 }}>
          <span class="filter-label">Language</span>
          <div class="filter-dropdown">
            <MultiSelectFilter
              optionsPromise={languageOptionsPromise}
              selectedValues={selectedLanguages}
              onchange={handleLanguagesChange}
              placeholder="Any"
            />
          </div>
          <button
            class="remove-filter"
            aria-label="Remove language filter"
            onclick={() => removeFilter('primaryLanguages')}
          >
            <Cross style="fill: var(--color-foreground-level-5)" />
          </button>
        </div>
      {/if}

      {#if availableFiltersToAdd.length > 0}
        <div class="add-filter-wrapper">
          <button
            bind:this={addFilterButtonEl}
            class="add-filter-button"
            in:fly={{ duration: 200, y: -8, delay: 200 }}
            onclick={() => (showAddFilterDropdown = !showAddFilterDropdown)}
          >
            <Plus style="fill: var(--color-foreground)" />
            <span>Add filter</span>
          </button>

          {#if showAddFilterDropdown}
            <div
              bind:this={dropdownEl}
              class="add-filter-dropdown"
              transition:fly={{ duration: 200, y: 8 }}
            >
              {#each availableFiltersToAdd as filter (filter.key)}
                <button class="dropdown-option" onclick={() => addFilter(filter.key)}>
                  {filter.label}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

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
          {#each SORT_OPTIONS as option (option.value)}
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
  }

  .search-input {
    border: none;
    outline: none;
    background: none;
    flex: 1;
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
  }

  .clear-search:hover {
    background-color: var(--color-foreground-level-2);
  }

  .divider {
    width: 1px;
    height: 1.5rem;
    background-color: var(--color-foreground-level-3);
  }

  .filters-section {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .filter-item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .filter-label {
    color: var(--color-foreground-level-6);
    white-space: nowrap;
  }

  .remove-filter {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    border-radius: 0.25rem;
    background: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .remove-filter:hover {
    background-color: var(--color-foreground-level-2);
  }

  .add-filter-wrapper {
    position: relative;
  }

  .add-filter-button {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    border: 1px dashed var(--color-foreground-level-4);
    border-radius: 0.5rem;
    background: none;
    cursor: pointer;
    color: var(--color-foreground-level-6);
    transition:
      border-color 0.2s,
      background-color 0.2s,
      color 0.2s;
  }

  .add-filter-button:hover {
    border-color: var(--color-foreground-level-5);
    background-color: var(--color-foreground-level-1);
    color: var(--color-foreground);
  }

  .add-filter-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    background: var(--color-background);
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 0.5rem;
    box-shadow: var(--shadow-elevation-4);
    z-index: 10;
    min-width: 150px;
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

    .filters-section {
      width: 100%;
    }

    .sort-section {
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>

<script lang="ts">
  import Plus from '$lib/components/icons/Plus.svelte';
  import Cross from '$lib/components/icons/Cross.svelte';
  import type {
    WaveProgramOrgDto,
    WaveProgramReposFilters,
    WaveProgramReposSortBy,
  } from '$lib/utils/wave/types/waveProgram';
  import MultiSelectFilter from './multi-select-filter.svelte';
  import FilterBar from '$lib/components/wave/filter-bar/filter-bar.svelte';
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  interface FilterType {
    key: keyof WaveProgramReposFilters;
    label: string;
  }

  const AVAILABLE_FILTERS: FilterType[] = [
    { key: 'primaryLanguages', label: 'Primary language' },
    { key: 'orgId', label: 'Org' },
  ];

  interface Props {
    filters: WaveProgramReposFilters;
    onFiltersChange: (filters: WaveProgramReposFilters) => void;
    orgsPromise?: Promise<WaveProgramOrgDto[]>;
  }

  let { filters, onFiltersChange, orgsPromise }: Props = $props();

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

  // Combined list for {#each} so animate:flip works across all items
  let filterSectionItems = $derived<string[]>([...visibleFilterKeys, '__add_filter__']);

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

  // Org options promise
  let orgOptionsPromise = $derived(
    orgsPromise?.then((orgs) =>
      orgs.map((o) => ({
        label: o.gitHubOrgLogin,
        value: o.id,
      })),
    ),
  );

  // Get selected org as array (MultiSelectFilter expects array)
  let selectedOrgs = $derived(filters.orgId ? [filters.orgId] : []);

  // Sort options
  const SORT_OPTIONS: { value: WaveProgramReposSortBy; label: string }[] = [
    { value: 'stargazersCount', label: 'Stars' },
    { value: 'forksCount', label: 'Forks' },
    { value: 'issueCount', label: 'Issue count' },
  ];

  let currentSort = $derived<WaveProgramReposSortBy>(filters.sortBy ?? 'stargazersCount');

  function handleSortChange(value: string) {
    onFiltersChange({
      ...filters,
      sortBy: value as WaveProgramReposSortBy,
    });
  }

  function handleSearchChange(value: string | undefined) {
    onFiltersChange({
      ...filters,
      search: value,
    });
  }

  function handleLanguagesChange(languages: string[]) {
    onFiltersChange({
      ...filters,
      primaryLanguages: languages.length > 0 ? languages.join(',') : undefined,
    });
  }

  function handleOrgsChange(orgs: string[]) {
    onFiltersChange({
      ...filters,
      orgId: orgs.length > 0 ? orgs[0] : undefined,
    });
  }

  function addFilter(filterKey: keyof WaveProgramReposFilters) {
    if (!visibleFilterKeys.includes(filterKey)) {
      visibleFilterKeys = [...visibleFilterKeys, filterKey];
    }
    showAddFilterDropdown = false;
  }

  function removeFilter(filterKey: keyof WaveProgramReposFilters) {
    visibleFilterKeys = visibleFilterKeys.filter((k) => k !== filterKey);
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
    }
  }
</script>

<svelte:window onclick={handleWindowClick} />

<FilterBar
  searchPlaceholder="Search repos..."
  searchValue={filters.search ?? ''}
  onSearchChange={handleSearchChange}
  sortOptions={SORT_OPTIONS}
  {currentSort}
  onSortChange={handleSortChange}
>
  {#snippet customFilters()}
    <div class="filters-section">
      {#each filterSectionItems as key (key)}
        {@const isAddButton = key === '__add_filter__'}
        <div
          animate:flip={{ duration: 200 }}
          in:fly={{ duration: 200, y: isAddButton ? -8 : 8, delay: isAddButton ? 200 : 0 }}
          out:fly={{ duration: 200, y: 8 }}
        >
          {#if key === 'primaryLanguages'}
            <div class="filter-item">
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
          {:else if key === 'orgId' && orgOptionsPromise}
            <div class="filter-item">
              <span class="filter-label">Org</span>
              <div class="filter-dropdown">
                <MultiSelectFilter
                  optionsPromise={orgOptionsPromise}
                  selectedValues={selectedOrgs}
                  onchange={handleOrgsChange}
                  placeholder="Any"
                  singleSelect
                />
              </div>
              <button
                class="remove-filter"
                aria-label="Remove org filter"
                onclick={() => removeFilter('orgId')}
              >
                <Cross style="fill: var(--color-foreground-level-5)" />
              </button>
            </div>
          {:else if isAddButton}
            <div class="add-filter-wrapper">
              <button
                bind:this={addFilterButtonEl}
                class="add-filter-button"
                disabled={availableFiltersToAdd.length === 0}
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
      {/each}
    </div>
  {/snippet}
</FilterBar>

<style>
  .filters-section {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .filter-item {
    display: flex;
    align-items: stretch;
    background: var(--color-foreground-level-1);
    border-radius: 0.5rem;
    height: 2.25rem;
    box-sizing: border-box;
  }

  .filter-label {
    color: var(--color-foreground-level-6);
    white-space: nowrap;
    display: flex;
    align-items: center;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .filter-dropdown {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: stretch;
  }

  .remove-filter {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.25rem 0 0.5rem;
    margin-left: -0.25rem;
    border-radius: 0 0.5rem 0.5rem 0;
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
      color 0.2s,
      opacity 0.2s;
  }

  .add-filter-button:hover:not(:disabled) {
    border-color: var(--color-foreground-level-5);
    background-color: var(--color-foreground-level-1);
    color: var(--color-foreground);
  }

  .add-filter-button:disabled {
    opacity: 0.4;
    cursor: default;
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
</style>

<script lang="ts" module>
  export const AVAILABLE_FILTERS: Partial<Record<keyof IssueFilters, FilterConfig>> = {
    state: {
      type: 'single-select',
      label: 'Status',
      options: [
        {
          label: 'Open',
          value: 'open',
        },
        {
          label: 'Closed',
          value: 'closed',
        },
      ],
    },
  };
</script>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { IssueFilters } from '$lib/utils/wave/types/issue';
  import SingleSelectFilterItem from './components/single-select-filter-item.svelte';
  import type { FilterConfig } from './types';

  let {
    onapply,
    appliedFilters,
  }: {
    onapply: (filters: IssueFilters) => void;
    appliedFilters: IssueFilters;
  } = $props();

  let filters = $state<IssueFilters>(appliedFilters);

  function handleSelectFilter<K extends keyof IssueFilters>(
    filterKey: K,
    value: IssueFilters[K] | null,
  ) {
    if (value === null) {
      delete filters[filterKey];
    } else {
      filters[filterKey] = value;
    }
  }

  function handleApply() {
    onapply(filters);
  }

  let filterItems = $state<Array<SingleSelectFilterItem<{ label: string; value: string }[]>>>([]);

  function handleClear() {
    filterItems.forEach((item) => item.clear());
    filters = {};

    onapply(filters);
  }

  export function reset() {
    filters = appliedFilters;
  }
</script>

<div class="filter-config-wrapper">
  {#each Object.entries(AVAILABLE_FILTERS) as [filterKey, filterConfig], i}
    <div class="filter-config-item">
      <h5>{filterConfig.label}</h5>
      {#if filterConfig.type === 'single-select'}
        <SingleSelectFilterItem
          bind:this={filterItems[i]}
          selected={filters[filterKey as keyof IssueFilters]}
          config={filterConfig}
          onchange={(value) => handleSelectFilter(filterKey as keyof IssueFilters, value)}
        />
      {/if}
    </div>
  {/each}

  <div class="actions">
    <Button onclick={handleClear}>Clear all</Button>
    <Button variant="primary" onclick={handleApply}>Apply Filters</Button>
  </div>
</div>

<style>
  .filter-config-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .filter-config-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
</style>

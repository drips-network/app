<script lang="ts" module>
  export const AVAILABLE_FILTERS = (
    ownUserId: string | null,
    mode: 'maintainer' | 'contributor' | 'wave',
  ): Partial<Record<keyof IssueFilters, FilterConfig>> =>
    ({
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
      ...(ownUserId && mode === 'contributor'
        ? {
            assignedToUser: {
              type: 'single-select',
              label: 'Assignment',
              options: [
                {
                  label: 'Assigned to me',
                  value: ownUserId,
                },
              ],
            },
          }
        : {}),
      ...(ownUserId && mode === 'wave'
        ? {
            appliedToByUser: {
              type: 'single-select',
              label: 'Applications',
              options: [
                {
                  label: 'Applied to by me',
                  value: ownUserId,
                },
              ],
            },
          }
        : {}),
      ...(mode === 'maintainer' || mode === 'wave'
        ? {
            applicantAssigned: {
              type: 'single-select',
              label: 'Applicant assignment',
              options: [
                {
                  label: 'Assigned to an applicant',
                  value: 'true',
                },
                {
                  label: 'Not assigned',
                  value: 'false',
                },
              ],
            },
          }
        : {}),
      ...(mode === 'maintainer'
        ? {
            isInWave: {
              type: 'single-select',
              label: 'Wave Membership',
              options: [
                {
                  label: 'Part of a Wave',
                  value: 'true',
                },
              ],
            },
          }
        : {}),
    }) as const;
</script>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { IssueFilters } from '$lib/utils/wave/types/issue';
  import SingleSelectFilterItem from './components/single-select-filter-item.svelte';
  import type { FilterConfig } from './types';

  let {
    onapply,
    appliedFilters,
    ownUserId,
    mode,
  }: {
    onapply: (filters: IssueFilters) => void;
    appliedFilters: IssueFilters;
    ownUserId: string | null;
    mode: 'maintainer' | 'contributor' | 'wave';
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
  {#each Object.entries(AVAILABLE_FILTERS(ownUserId, mode)) as [filterKey, filterConfig], i (filterKey)}
    <div class="filter-config-item">
      <h5>{filterConfig.label}</h5>
      {#if filterConfig.type === 'single-select'}
        <SingleSelectFilterItem
          bind:this={filterItems[i]}
          selected={filters[filterKey as keyof IssueFilters] as string | undefined}
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

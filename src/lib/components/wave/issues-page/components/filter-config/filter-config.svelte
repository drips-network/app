<script lang="ts" module>
  export const AVAILABLE_FILTERS = (
    ownUserId: string | null,
    mode: 'maintainer' | 'contributor' | 'wave',
    /** The wave ID if mode is `wave`. Used to fetch available repo filters */
    currentWaveProgramId?: string,
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

      hasPr: {
        type: 'single-select',
        label: 'Linked PR',
        options: [
          { label: 'All', value: 'all' },
          { label: 'Linked', value: 'true' },
          { label: 'None', value: 'false' },
        ],
      },

      ...(mode === 'maintainer' || mode === 'wave'
        ? {
            hasApplications: {
              type: 'single-select',
              label: 'Applications',
              options: [
                { label: 'All', value: 'all' },
                { label: 'Has', value: 'true' },
                { label: 'None', value: 'false' },
              ],
            },
          }
        : {}),

      ...(mode === 'maintainer' || mode === 'wave'
        ? {
            applicantAssigned: {
              type: 'single-select',
              label: 'Assigned',
              options: [
                { label: 'All', value: 'all' },
                { label: 'Yes', value: 'true' },
                { label: 'No', value: 'false' },
              ],
            },
          }
        : {}),

      ...(ownUserId && mode === 'contributor'
        ? {
            assignedToUser: {
              type: 'toggle',
              label: 'Assigned to me',
              onValue: ownUserId,
            },
          }
        : {}),

      ...(mode === 'maintainer'
        ? {
            isInWaveProgram: {
              type: 'single-select',
              label: 'Part of Wave',
              options: [
                { label: 'All', value: 'all' },
                { label: 'Yes', value: 'true' },
                { label: 'No', value: 'false' },
              ],
            },
          }
        : {}),

      ...(mode === 'maintainer' || mode === 'wave'
        ? {
            repoId: {
              type: 'dropdown',
              label: 'Repo',
              optionsPromise: (async () => {
                if (mode === 'wave') {
                  if (!currentWaveProgramId) {
                    throw new Error('currentWaveId is required for wave mode');
                  }

                  const { data: reposInWave } = await getWaveProgramRepos(
                    undefined,
                    currentWaveProgramId,
                    // todo(wave): pagination
                    { limit: 100 },
                  );

                  return reposInWave.map((waveProgramRepo) => ({
                    label: waveProgramRepo.repo.gitHubRepoFullName,
                    value: waveProgramRepo.repo.id,
                  }));
                } else {
                  const { data: allRepos } = await getOwnWaveProgramRepos(
                    undefined,
                    // todo(wave): pagination
                    { limit: 100 },
                  );

                  return allRepos.map((waveProgramRepo) => ({
                    label: waveProgramRepo.repo.gitHubRepoFullName,
                    value: waveProgramRepo.repo.id,
                  }));
                }
              })(),
            },
          }
        : {}),
    }) as const;
</script>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import SegmentedControl from '$lib/components/segmented-control/segmented-control.svelte';
  import Toggle from '$lib/components/toggle/toggle.svelte';
  import type { IssueFilters } from '$lib/utils/wave/types/issue';
  import { getOwnWaveProgramRepos, getWaveProgramRepos } from '$lib/utils/wave/wavePrograms';
  import DropdownFilterItem from './components/dropdown-filter-item.svelte';
  import SingleSelectFilterItem from './components/single-select-filter-item.svelte';
  import type { FilterConfig } from './types';

  let {
    onapply,
    appliedFilters,
    ownUserId,
    mode,
    currentWaveProgramId,
    flash = false,
  }: {
    onapply: (filters: IssueFilters) => void;
    appliedFilters: IssueFilters;
    ownUserId: string | null;
    mode: 'maintainer' | 'contributor' | 'wave';
    currentWaveProgramId?: string;
    flash?: boolean;
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

  type StatusValue = 'open' | 'closed' | 'all';

  const statusOptions: { title: string; value: StatusValue }[] = [
    { title: 'All', value: 'all' },
    { title: 'Open', value: 'open' },
    { title: 'Closed', value: 'closed' },
  ];

  const statusDefault: StatusValue = mode === 'maintainer' ? 'open' : 'all';

  let statusActive = $derived<StatusValue>((filters.state ?? statusDefault) as StatusValue);

  function getSegmentedValue(value: string | boolean | undefined | null) {
    if (value === undefined || value === null) return 'all';
    if (value === true) return 'true';
    if (value === false) return 'false';
    return value;
  }

  function handleApply() {
    onapply(filters);
  }

  function handleClear() {
    filters = {};

    onapply(filters);
  }

  function normalizedFilterEntries(value: IssueFilters) {
    return Object.entries(value).filter(([key, entryValue]) => {
      if (entryValue === undefined) return false;
      if (key === 'state' && entryValue === 'open' && (mode === 'maintainer' || mode === 'wave')) {
        return false;
      }
      if (mode === 'maintainer' && key === 'mine' && entryValue === true) return false;
      if (mode === 'maintainer' && key === 'eligibleForWave' && entryValue === true) return false;
      if (mode === 'contributor' && key === 'isInWaveProgram' && entryValue === true) return false;
      if (mode === 'contributor' && key === 'appliedToByUser' && entryValue === ownUserId)
        return false;
      if (mode === 'wave' && key === 'waveProgramId') return false;
      return true;
    });
  }

  function isSameFilters(a: IssueFilters, b: IssueFilters) {
    const aEntries = normalizedFilterEntries(a);
    const bEntries = normalizedFilterEntries(b);

    if (aEntries.length !== bEntries.length) return false;

    return aEntries.every(([key, value]) => b[key as keyof IssueFilters] === value);
  }

  let hasChanges = $derived(!isSameFilters(filters, appliedFilters));
  let hasAppliedFilters = $derived(normalizedFilterEntries(appliedFilters).length > 0);

  export function reset() {
    filters = appliedFilters;
  }

  export function hasChangesInFilters() {
    return hasChanges;
  }

  export function hasAppliedFiltersInView() {
    return hasAppliedFilters;
  }

  let filterEntries = $derived(
    Object.entries(AVAILABLE_FILTERS(ownUserId, mode, currentWaveProgramId)) as [
      keyof IssueFilters,
      FilterConfig,
    ][],
  );

</script>

<div class="filter-config-wrapper">
  <div class="options">
    {#each filterEntries as [filterKey, filterConfig], i (filterKey)}
      <div class="filter-config-item">
        {#if filterConfig.type === 'single-select'}
          {#if filterKey === 'state'}
            <div class="filter-config-item--row">
              <span class="filter-row-label">Status</span>
              <div class="filter-row-control">
                <SegmentedControl
                  options={statusOptions}
                  active={statusActive}
                  defaultValue={statusDefault}
                  onTabChange={(value) =>
                    handleSelectFilter(
                      'state',
                      (value as StatusValue) === 'all' ? null : (value as StatusValue),
                    )}
                />
              </div>
            </div>
          {:else}
            <div class="filter-config-item--row">
              <span class="filter-row-label">{filterConfig.label}</span>
              <div class="filter-row-control">
                <SegmentedControl
                  options={filterConfig.options.map((option) => ({
                    title: option.label,
                    value: option.value,
                  }))}
                  active={getSegmentedValue(filters[filterKey as keyof IssueFilters])}
                  defaultValue="all"
                  onTabChange={(value) =>
                    handleSelectFilter(
                      filterKey as keyof IssueFilters,
                      value === 'all' ? null : (value as IssueFilters[keyof IssueFilters]),
                    )}
                />
              </div>
            </div>
          {/if}
        {:else if filterConfig.type === 'toggle'}
          <div class="filter-config-item--row">
            <span class="filter-row-label">{filterConfig.label}</span>
            <div class="filter-row-control">
              <Toggle
                checked={filters[filterKey as keyof IssueFilters] === filterConfig.onValue}
                onchange={(checked) =>
                  handleSelectFilter(
                    filterKey as keyof IssueFilters,
                    checked ? (filterConfig.onValue as IssueFilters[keyof IssueFilters]) : null,
                  )}
              />
            </div>
          </div>
        {:else if filterConfig.type === 'dropdown'}
          <div class="filter-config-item--row">
            <span class="filter-row-label">{filterConfig.label}</span>
            <div class="filter-row-control">
              <DropdownFilterItem
                config={filterConfig}
                selectedOption={filters[filterKey as keyof IssueFilters] as string | undefined}
                onchange={(value) => handleSelectFilter(filterKey as keyof IssueFilters, value)}
              />
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="actions" class:actions-flash={flash}>
    <Button onclick={handleClear} disabled={!hasChanges && !hasAppliedFilters}>Reset</Button>
    <Button variant="primary" onclick={handleApply} disabled={!hasChanges}>Apply filters</Button>
  </div>
</div>

<style>
  .filter-config-wrapper {
    height: fit-content;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 60svh;
    overflow-y: auto;
    padding: 1rem 1rem 2rem 1rem;
  }

  .filter-config-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-config-item--row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-width: 0;
  }

  .filter-row-label {
    font-weight: 400;
    font-family: var(--typeface-regular);
    font-size: 1rem;
    flex-shrink: 0;
  }

  .filter-row-control :global(.segmented-control) {
    font-size: 1rem;
  }

  .filter-row-control {
    display: flex;
    justify-content: flex-end;
    flex: 1;
    min-width: 0;
  }

  .filter-row-control :global(.single-select-filter-item) {
    justify-content: flex-end;
  }

  .filter-config-item :global(.segmented-control .option) {
    font-weight: 400;
  }

  .filter-config-item :global(.dropdown-trigger) {
    width: 100%;
    max-width: none;
  }

  .actions {
    position: sticky;
    bottom: 0.25rem;
    padding: 0.5rem;
    background-color: var(--color-background);
    border-top: 1px solid var(--color-foreground-level-3);
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    transition: background-color 0.3s;
  }

  .actions.actions-flash {
    background-color: var(--color-primary-level-1);
  }
</style>

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

      ...(mode === 'maintainer' || mode === 'wave'
        ? {
            applicantAssigned: {
              type: 'toggle',
              label: 'Applicant assignment',
              toggleLabel: 'Assigned to an applicant',
            },
          }
        : {}),

      ...(mode === 'maintainer' || mode === 'wave'
        ? {
            hasApplications: {
              type: 'toggle',
              label: 'Applications',
              toggleLabel: 'Has applications',
            },
          }
        : {}),

      hasPr: {
        type: 'toggle',
        label: 'Pull Requests',
        toggleLabel: 'Has linked PR',
      },

      ...(mode === 'maintainer'
        ? {
            isInWaveProgram: {
              type: 'toggle',
              label: 'Wave Membership',
              toggleLabel: 'Part of a Wave',
            },
          }
        : {}),

      ...(mode === 'maintainer' || mode === 'wave'
        ? {
            repoId: {
              type: 'dropdown',
              label: 'Repository',
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
  import type { IssueFilters } from '$lib/utils/wave/types/issue';
  import { getOwnWaveProgramRepos, getWaveProgramRepos } from '$lib/utils/wave/wavePrograms';
  import DropdownFilterItem from './components/dropdown-filter-item.svelte';
  import SingleSelectFilterItem from './components/single-select-filter-item.svelte';
  import Toggle from '$lib/components/toggle/toggle.svelte';
  import type { FilterConfig } from './types';

  let {
    onapply,
    appliedFilters,
    ownUserId,
    mode,
    currentWaveProgramId,
  }: {
    onapply: (filters: IssueFilters) => void;
    appliedFilters: IssueFilters;
    ownUserId: string | null;
    mode: 'maintainer' | 'contributor' | 'wave';
    currentWaveProgramId?: string;
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

  type ToggleFilterKey = 'applicantAssigned' | 'hasApplications' | 'hasPr' | 'isInWaveProgram';
  type StatusValue = 'open' | 'closed';

  function handleToggleFilter(filterKey: ToggleFilterKey, checked: boolean) {
    handleSelectFilter(filterKey, checked ? 'true' : null);
  }

  function isToggleFilterKey(filterKey: keyof IssueFilters): filterKey is ToggleFilterKey {
    return (
      filterKey === 'applicantAssigned' ||
      filterKey === 'hasApplications' ||
      filterKey === 'hasPr' ||
      filterKey === 'isInWaveProgram'
    );
  }

  const statusOptions: { title: string; value: StatusValue }[] = [
    { title: 'Open', value: 'open' },
    { title: 'Closed', value: 'closed' },
  ];

  let statusActive = $derived<StatusValue>((filters.state ?? 'open') as StatusValue);

  function handleApply() {
    onapply(filters);
  }

  function handleClear() {
    filters = {};

    onapply(filters);
  }

  export function reset() {
    filters = appliedFilters;
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
                  onTabChange={(value) => handleSelectFilter('state', value as StatusValue)}
                />
              </div>
            </div>
          {:else}
            <h5>{filterConfig.label}</h5>
            <SingleSelectFilterItem
              selected={filters[filterKey as keyof IssueFilters] as string | undefined}
              config={filterConfig}
              onchange={(value) => handleSelectFilter(filterKey as keyof IssueFilters, value)}
            />
          {/if}
        {:else if filterConfig.type === 'toggle'}
          {#if isToggleFilterKey(filterKey)}
            {@const toggleKey = filterKey}
            <Toggle
              checked={filters[filterKey] === 'true'}
              label={filterConfig.toggleLabel}
              onchange={(checked) => handleToggleFilter(toggleKey, checked)}
            />
          {/if}
        {:else if filterConfig.type === 'dropdown'}
          <DropdownFilterItem
            config={filterConfig}
            selectedOption={filters[filterKey as keyof IssueFilters] as string | undefined}
            onchange={(value) => handleSelectFilter(filterKey as keyof IssueFilters, value)}
          />
        {/if}
      </div>
    {/each}
  </div>

  <div class="actions">
    <Button onclick={handleClear}>Reset</Button>
    <Button variant="primary" onclick={handleApply}>Apply filters</Button>
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
  }

  .filter-row-label {
    font-weight: 400;
    font-family: var(--typeface-regular);
    font-size: 1rem;
  }

  .filter-row-control :global(.segmented-control) {
    font-size: 1rem;
  }

  .filter-row-control {
    display: flex;
    justify-content: flex-end;
  }

  .filter-row-control :global(.single-select-filter-item) {
    justify-content: flex-end;
  }

  .filter-config-item :global(.toggle .label) {
    font-weight: 400;
    font-family: var(--typeface-regular);
  }

  .filter-config-item :global(.toggle .label.typo-text-bold) {
    font-weight: 400;
    font-family: var(--typeface-regular);
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
  }
</style>

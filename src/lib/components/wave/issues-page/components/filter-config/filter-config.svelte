<script lang="ts" module>
  export const AVAILABLE_FILTERS = (
    ownUserId: string | null,
    mode: 'maintainer' | 'contributor' | 'wave',
    /** The wave program info if mode is `wave`. Used to fetch available repo filters */
    currentWaveProgram: Pick<WaveProgramDto, 'id' | 'slug'> | undefined,
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

      ...(mode === 'maintainer' || mode === 'wave'
        ? {
            hasApplications: {
              type: 'single-select',
              label: 'Applications',
              options: [
                {
                  label: 'Has applications',
                  value: 'true',
                },
                {
                  label: 'No applications',
                  value: 'false',
                },
              ],
            },
          }
        : {}),

      hasPr: {
        type: 'single-select',
        label: 'Pull Requests',
        options: [
          {
            label: 'Has linked PR',
            value: 'true',
          },
          {
            label: 'No linked PR',
            value: 'false',
          },
        ],
      },

      ...(mode === 'maintainer' || mode === 'wave'
        ? {
            repoId: {
              type: 'dropdown',
              label: 'Repository',
              link:
                mode === 'wave'
                  ? {
                      label: 'Browse repos',
                      href: `/wave/${currentWaveProgram?.slug}/repos`,
                    }
                  : undefined,
              optionsPromise: (async () => {
                if (mode === 'wave') {
                  if (!currentWaveProgram) {
                    throw new Error('currentWaveProgram is required for wave mode');
                  }

                  const { data: reposInWave } = await getWaveProgramRepos(
                    undefined,
                    currentWaveProgram.id,
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

      ...(mode === 'maintainer'
        ? {
            isInWaveProgram: {
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
  import type { WaveProgramDto } from '$lib/utils/wave/types/waveProgram';
  import { getOwnWaveProgramRepos, getWaveProgramRepos } from '$lib/utils/wave/wavePrograms';
  import { onMount } from 'svelte';
  import DropdownFilterItem from './components/dropdown-filter-item.svelte';
  import SingleSelectFilterItem from './components/single-select-filter-item.svelte';
  import type { FilterConfig } from './types';

  let {
    onapply,
    appliedFilters,
    defaultFilters,
    ownUserId,
    mode,
    currentWaveProgram,
  }: {
    onapply: (filters: IssueFilters) => void;
    appliedFilters: IssueFilters;
    defaultFilters: IssueFilters;
    ownUserId: string | null;
    mode: 'maintainer' | 'contributor' | 'wave';
    currentWaveProgram?: Pick<WaveProgramDto, 'id' | 'slug'>;
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
    filters = defaultFilters;

    onapply(filters);
  }

  export function reset() {
    filters = appliedFilters;
  }

  let availableFilters = $state<ReturnType<typeof AVAILABLE_FILTERS>>({});
  onMount(() => {
    availableFilters = AVAILABLE_FILTERS(ownUserId, mode, currentWaveProgram);
  });
</script>

<div class="filter-config-wrapper">
  <div class="options">
    {#each Object.entries(availableFilters) as [filterKey, filterConfig], i (filterKey)}
      <div class="filter-config-item">
        <div class="label-and-link">
          <h5>{filterConfig.label}</h5>
          {#if filterConfig.link}
            <a href={filterConfig.link.href} class="typo-text-small">
              {filterConfig.link.label}
            </a>
          {/if}
        </div>
        {#if filterConfig.type === 'single-select'}
          <SingleSelectFilterItem
            bind:this={filterItems[i]}
            selected={filters[filterKey as keyof IssueFilters] as string | undefined}
            config={filterConfig}
            onchange={(value) => handleSelectFilter(filterKey as keyof IssueFilters, value)}
          />
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
    <Button onclick={handleClear}>Reset to default</Button>
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

  .filter-config-item .label-and-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .filter-config-item .label-and-link a {
    text-decoration: underline;
    color: var(--color-foreground-level-6);
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

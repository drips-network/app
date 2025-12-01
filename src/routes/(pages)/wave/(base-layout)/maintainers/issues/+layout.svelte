<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { PageData } from './$types';
  import IssuesPage from '$lib/components/wave/issues-page/issues-page.svelte';
  import type { IssueFilters } from '$lib/utils/wave/types/issue';
  import { goto } from '$app/navigation';

  let {
    data,
    children,
  }: {
    data: PageData;
    children: Snippet;
  } = $props();

  async function handleApplyFilters(filters: IssueFilters) {
    const encodedFilters = Object.values(filters).length === 0 ? '' : btoa(JSON.stringify(filters));
    await goto(`?filters=${encodedFilters}`, {
      replaceState: true,
      noScroll: true,
      keepFocus: true,
    });
  }
</script>

<IssuesPage
  viewKey="maintainers"
  ownWaveRepos={data.waveRepos.data}
  waves={data.waves.data}
  issues={data.issues}
  appliedFilters={data.appliedFilters}
  onapplyfilters={handleApplyFilters}
  allowAddToWave
  pathPrefix="/wave/maintainers/issues/"
  breadcrumbs={[{ label: 'Maintainer Dashboard' }, { label: 'Issues' }]}
  showNewApplicationsBadge
>
  {@render children()}
</IssuesPage>

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
  filtersMode="wave"
  noOfPreappliedFilters={1}
  ownUserId={data.user?.id ?? null}
  viewKey={data.wave.id}
  waves={data.waves.data}
  issues={data.issues}
  pathPrefix="/wave/{data.wave.id}/issues/"
  appliedFilters={data.appliedFilters}
  onapplyfilters={handleApplyFilters}
  breadcrumbs={[
    { label: 'Waves', href: '/wave' },
    { label: data.wave.name, href: `/wave/${data.wave.id}` },
    { label: 'Issues' },
  ]}
>
  {@render children()}
</IssuesPage>

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
    if (Object.values(filters).length === 0) {
      await goto('?filters=', { replaceState: true });
      return;
    }

    const encodedFilters = btoa(JSON.stringify(filters));
    await goto(`?filters=${encodedFilters}`, { replaceState: true });
  }
</script>

<IssuesPage
  issues={data.issues}
  appliedFilters={data.appliedFilters}
  onapplyfilters={handleApplyFilters}
>
  {@render children()}
</IssuesPage>

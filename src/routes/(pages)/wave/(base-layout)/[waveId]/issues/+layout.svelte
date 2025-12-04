<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { PageData } from './$types';
  import IssuesPage from '$lib/components/wave/issues-page/issues-page.svelte';

  let {
    data,
    children,
  }: {
    data: PageData;
    children: Snippet;
  } = $props();
</script>

<IssuesPage {...data}>
  {@render children()}
</IssuesPage>

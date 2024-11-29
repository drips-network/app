<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import type { PageData } from './$types';
  import DefaultExplorePage from './components/default-explore-page.svelte';
  import FilecoinExplorePage from './components/filecoin-explore-page.svelte';

  export let data: PageData;
</script>

<HeadMeta title="Explore" />

{#if data.explorePageVersion === 'filecoin'}
  <FilecoinExplorePage {...data} />
{:else}
  <DefaultExplorePage {...data} />
{/if}

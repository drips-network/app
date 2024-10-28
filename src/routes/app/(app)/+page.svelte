<script lang="ts">
  import type { PageData } from './$types';
  import DefaultExplorePage from './components/default-explore-page.svelte';
  import FilecoinExplorePage from './components/filecoin-explore-page.svelte';

  export let data: PageData;
</script>

{#if data.explorePageVersion === 'filecoin'}
  <FilecoinExplorePage {...data} />
{:else}
  <DefaultExplorePage {...data} />
{/if}

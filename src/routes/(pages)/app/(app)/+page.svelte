<script lang="ts" context="module">
  import DefaultExplorePage from './components/default-explore-page.svelte';
  import DistributionExplorePage from './components/distribution-explore-page.svelte';

  export const EXPLORE_PAGE_VARIANT_COMPONENTS = {
    default: DefaultExplorePage,
    distribution: DistributionExplorePage,
  };
</script>

<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import type { PageData } from './$types';
  import type { ComponentType } from 'svelte';

  export let data: PageData;

  $: component = EXPLORE_PAGE_VARIANT_COMPONENTS[data.variant] as ComponentType;
</script>

<HeadMeta title="Explore" />

<svelte:component this={component} {...data.data} />

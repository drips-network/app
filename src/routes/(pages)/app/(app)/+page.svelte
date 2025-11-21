<script lang="ts" module>
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
  import type { Component } from 'svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let component = $derived<Component<any>>(EXPLORE_PAGE_VARIANT_COMPONENTS[data.variant]);

  const SvelteComponent = $derived(component);
</script>

<HeadMeta title="Explore" />

<SvelteComponent {...data.data} />

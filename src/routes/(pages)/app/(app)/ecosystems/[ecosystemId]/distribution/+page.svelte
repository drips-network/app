<script lang="ts">
  import EcosystemDistribution from '../components/ecosystem-distribution/ecosystem-distribution.svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<EcosystemDistribution full ecosystem={data.ecosystem} />

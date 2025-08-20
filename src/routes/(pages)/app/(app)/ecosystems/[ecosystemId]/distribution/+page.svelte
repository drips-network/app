<script lang="ts">
  import EcosystemDistribution from '../components/ecosystem-distribution/ecosystem-distribution.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<EcosystemDistribution full ecosystem={data.ecosystem} />

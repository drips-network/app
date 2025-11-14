<script lang="ts">
  import type { PageData } from './$types';
  import EcosytemProfile from './components/ecosystem-profile.svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<EcosytemProfile ecosystem={data.ecosystem} ecosystemFragment={data.ecosystemChainData} />

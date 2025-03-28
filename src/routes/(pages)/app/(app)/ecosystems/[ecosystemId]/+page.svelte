<script lang="ts">
  import type { PageData } from './$types';
  import EcosytemProfile from './components/ecosystem-profile.svelte';

  export let data: PageData;
</script>

<EcosytemProfile ecosystem={data.ecosystem} />

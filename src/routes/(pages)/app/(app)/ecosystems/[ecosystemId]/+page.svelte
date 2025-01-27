<script lang="ts">
  import type { PageData } from './$types';
  import EcosytemProfile from './components/ecosystem-profile.svelte';

  export let data: PageData;
</script>

<EcosytemProfile
  project={data.project}
  description={data.description}
  newRepo={data.newRepo}
  correctCasingRepo={data.correctCasingRepo}
/>

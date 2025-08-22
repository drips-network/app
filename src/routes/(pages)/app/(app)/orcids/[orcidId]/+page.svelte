<script lang="ts">
  import type { PageData } from './$types';
  import OrcidProfile from './components/orcid-profile.svelte';

  export let data: PageData;
</script>

<OrcidProfile orcid={data.orcid} orcidAccount={data.orcidAccount} />

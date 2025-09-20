<script lang="ts">
  import { hydrate } from '$lib/reviver';
  import type Orcid from '$lib/utils/orcids/entities';
  import type { PageData } from './$types';
  import OrcidProfile from './components/orcid-profile.svelte';

  export let data: PageData;

  // Revive the plain data object back into an Orcid class instance
  const orcid: Orcid = hydrate(data).orcid;
</script>

<OrcidProfile {orcid} orcidAccount={data.orcidAccount} />

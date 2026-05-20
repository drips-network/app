<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import GrantDetail from '$lib/components/wave/rewards/grant-detail.svelte';
  import { authenticatedGrantActionContext } from '$lib/utils/wave/grants/action-context';

  let { data } = $props();

  let { grant, kycStatus, kybStatus } = $derived(data);

  let actionContext = $derived(authenticatedGrantActionContext(grant.id));
</script>

<HeadMeta title="{grant.waveProgramName} Wave {grant.waveNumber} Reward | Wave" />

<div class="page-wrapper">
  <Breadcrumbs
    crumbs={[
      { href: '/wave/rewards', label: 'Reward Grants' },
      { label: `${grant.waveProgramName} Wave ${grant.waveNumber}` },
    ]}
  />

  <GrantDetail {grant} {actionContext} {kycStatus} {kybStatus} />
</div>

<style>
  .page-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 90rem;
    width: 100%;
    margin: 0 auto;
  }
</style>

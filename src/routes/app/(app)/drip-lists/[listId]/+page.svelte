<script lang="ts">
  import DripListCard from '$lib/components/drip-list-card/drip-list-card.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<HeadMeta title={data.dripList.name} />

<div class="owner">
  <IdentityBadge address={data.dripList.account.owner.address} />
  <span>created a Drip List…</span>
</div>
<SectionSkeleton loaded={Boolean(data.dripList)}>
  <DripListCard dripList={data.dripList} representationalSplits={data.representationalSplits} />
</SectionSkeleton>

<style>
  .owner {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 2rem;
  }

  .owner span {
    color: var(--color-foreground-level-6);
  }
</style>

<script lang="ts">
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  import Balances from '../funds/sections/balances.section.svelte';
  import Streams from '../funds/sections/streams.section.svelte';
  import SocialLink from '$lib/components/social-link/social-link.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import { fade } from 'svelte/transition';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ProjectsSection from '$lib/components/projects-section/projects-section.svelte';
  import DripListsSection from '$lib/components/drip-lists-section/drip-lists-section.svelte';
  import Developer from '$lib/components/developer-section/developer.section.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import Supporters from '$lib/components/supporters-section/supporters.section.svelte';

  export let data;

  $: socialLinkValues = {
    'com.twitter': data.ensData?.records['com.twitter'],
    'com.github': data.ensData?.records['com.github'],
    url: data.ensData?.records.url,
  };

  let description: string | undefined;
  $: description = data.ensData?.records.description;

  $: isSelf =
    data.profileData?.account.address &&
    data.profileData.account.address.toLowerCase() === $walletStore.address?.toLowerCase();
</script>

<HeadMeta title={data.ensData?.ensName ?? data.profileData?.account.address ?? undefined} />

{#if data.error && data.type === 'is-repo-driver-account-id'}
  <LargeEmptyState
    emoji="🕸️"
    headline="Unable to jump to projects by account ID"
    description="Sorry, but jumping to a Drips Project by its account ID is currently not supported."
  />
{:else if data.error && data.type === 'ens-not-resolved'}
  <LargeEmptyState
    emoji="🕸️"
    headline="Not found"
    description="Sorry, but we couldn't find that ENS name."
  />
{:else if data.profileData}
  <article class="flex flex-col gap-16">
    <SectionSkeleton placeholderOutline={false} loaded>
      <header class="flex flex-wrap sm:flex-nowrap gap-4">
        <IdentityBadge
          disableLink
          address={data.profileData.account.address}
          size="gigantic"
          showIdentity={false}
          disableTooltip
        />
        <div class="flex items-center sm:py-4">
          <div class="flex flex-col gap-4">
            <h1 class="w-full -mb-2">
              <IdentityBadge
                disableLink
                address={data.profileData.account.address}
                size="gigantic"
                showAvatar={false}
                disableTooltip
              />
            </h1>
            <ul class="social-links">
              <div in:fade|local>
                <SocialLink network="ethereum" value={data.profileData.account.address} />
              </div>
              {#each Object.entries(socialLinkValues ?? {}) as [network, value]}
                {#if value}<li in:fade|local>
                    <SocialLink {network} {value} />
                  </li>{/if}
              {/each}
            </ul>
            {#if description}<p in:fade|local>{description}</p>{/if}
          </div>
        </div>
      </header>
    </SectionSkeleton>
    <Developer accountId={data.profileData.account.accountId} />
    <ProjectsSection
      collapsable
      collapsed={mapFilterUndefined(data.profileData.projects, (v) => (v === null ? undefined : v))
        .length === 0}
      projects={mapFilterUndefined(data.profileData.projects, (v) => (v === null ? undefined : v))}
    />
    <DripListsSection
      collapsable
      collapsed={[
        ...data.profileData.votingRounds,
        ...mapFilterUndefined(data.profileData.dripLists, (v) => (v === null ? undefined : v)),
      ].length === 0}
      votingRounds={data.profileData.votingRounds}
      dripLists={mapFilterUndefined(data.profileData.dripLists, (v) =>
        v === null ? undefined : v,
      )}
    />
    <Supporters
      collapsable
      collapsed={data.profileData.support.length === 0}
      type="address"
      supportItems={data.profileData.support}
    />
    <Streams
      hideIncoming
      collapsable
      collapsed={data.profileData.streams.outgoing.length === 0}
      userStreams={data.profileData.streams}
      disableActions={!isSelf}
      accountId={data.profileData.account.accountId}
    />
    <Balances
      collapsable
      collapsed={data.profileData.balances.length === 0}
      userBalances={data.profileData.balances}
      accountId={data.profileData.account.accountId}
    />
  </article>
{/if}

<style>
  .social-links {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .social-links * {
    display: flex;
    gap: 0.375rem;
  }
</style>

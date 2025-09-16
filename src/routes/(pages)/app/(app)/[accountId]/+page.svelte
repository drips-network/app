<script lang="ts">
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  import Balances from '../funds/sections/balances.section.svelte';
  import Streams from '../funds/sections/streams.section.svelte';
  import SocialLink, { isNetwork } from '$lib/components/social-link/social-link.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import { fade } from 'svelte/transition';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import YourProjectsSection from '$lib/components/your-projects-section/your-projects-section.svelte';
  import YourDripListsSection from '$lib/components/your-drip-lists-section/your-drip-lists-section.svelte';
  import Developer from '$lib/components/developer-section/developer.section.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import Supporters from '$lib/components/supporters-section/supporters.section.svelte';
  import unreachable from '$lib/utils/unreachable';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import SupportCard from '$lib/components/support-card/support-card.svelte';
  import LinkedIdentitiesCard from './components/linked-identities-card.svelte';

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

  $: profileChainData = filterCurrentChainData(data.profileData?.chainData ?? []);
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
  <article>
    <div class="article-header">
      <SectionSkeleton placeholderOutline={false} loaded horizontalScroll={false}>
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
                <div in:fade>
                  <SocialLink network="ethereum" value={data.profileData.account.address} />
                </div>
                {#each Object.entries(socialLinkValues ?? {}) as [network, value]}
                  {#if value}<li in:fade>
                      <SocialLink network={isNetwork(network) ? network : unreachable()} {value} />
                    </li>{/if}
                {/each}
              </ul>
              {#if description}<p in:fade>{description}</p>{/if}
            </div>
          </div>
        </header>
      </SectionSkeleton>
    </div>
    <div class="article-content gap-16">
      <Developer accountId={data.profileData.account.accountId} />
      <YourProjectsSection
        collapsable
        collapsed={mapFilterUndefined([profileChainData], (v) => (v === null ? undefined : v))
          .length === 0}
        projects={mapFilterUndefined(profileChainData.projects, (v) =>
          v === null ? undefined : v,
        )}
        withClaimProjectButton={true}
      />
      <YourDripListsSection
        collapsable
        collapsed={[
          ...data.profileData.votingRounds,
          ...mapFilterUndefined(profileChainData.dripLists, (v) => (v === null ? undefined : v)),
        ].length === 0}
        votingRounds={data.profileData.votingRounds}
        dripLists={mapFilterUndefined(profileChainData.dripLists, (v) =>
          v === null ? undefined : v,
        )}
        withCreateButton={true}
      />
      <Supporters
        collapsable
        collapsed={profileChainData.support.length === 0}
        type="address"
        supportItems={profileChainData.support}
      />
      <Streams
        hideIncoming
        collapsable
        collapsed={profileChainData.streams.outgoing.length === 0}
        userStreams={profileChainData.streams}
        disableActions={!isSelf}
        accountId={data.profileData.account.accountId}
      />
      <Balances
        collapsable
        collapsed={profileChainData.balances.length === 0}
        userBalances={profileChainData.balances}
        accountId={data.profileData.account.accountId}
      />
    </div>
    <aside class="article-sidebar">
      <SupportCard user={data.profileData} />
      <LinkedIdentitiesCard
        linkedIdentities={profileChainData.linkedIdentities}
        canLinkIdentity={isSelf}
      ></LinkedIdentitiesCard>
    </aside>
  </article>
{/if}

<style>
  article {
    display: flex;
    gap: 3rem 2rem;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .article-header {
    width: 100%;
  }

  .article-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 4rem;
  }

  .social-links {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .article-sidebar {
    width: 100%;
    max-width: 18rem;
    position: sticky;
    top: 20px;
    align-self: flex-start;
    display: flex;
    gap: 1.5rem;
    flex-direction: column;
  }

  .social-links * {
    display: flex;
    gap: 0.375rem;
  }

  @media (max-width: 768px) {
    .article-sidebar {
      max-width: none;
    }
  }
</style>

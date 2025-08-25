<script lang="ts" context="module">
  // TODO: may have to differentiate these
  import { SUPPORTER_PILE_FRAGMENT } from '$lib/components/drip-list-card/methods/get-supporters-pile';
  import { SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT } from '$lib/components/supporters-section/supporters.section.svelte';
  import mergeWithdrawableBalances, { MERGE_WITHDRAWABLE_BALANCES_FRAGMENT } from '$lib/utils/merge-withdrawable-balances';
  import { gql } from 'graphql-request';

  export const ORCID_PROFILE_FRAGMENT = gql`
    ${SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT}
    ${SUPPORTER_PILE_FRAGMENT}
    ${MERGE_WITHDRAWABLE_BALANCES_FRAGMENT}
    ${ORCID_PROFILE_HEADER_FRAGMENT}
    fragment OrcidProfile on OrcidAccount {
      ...OrcidProfileHeader
      account {
        accountId
        driver
      }
      source {
        url
      }
      chainData {
        ... on UnClaimedOrcidAccountData {
          chain
          linkedTo {
            accountId
          }
          support {
            ...SupportersSectionSupportItem
            ...SupporterPile
          }
          withdrawableBalances {
            ...MergeWithdrawableBalances
          }
        }
        ... on ClaimedOrcidAccountData {
          chain
          maybeLinkedTo: linkedTo {
            accountId
          }
          support {
            ...SupportersSectionSupportItem
            ...SupporterPile
          }
          totalEarned {
            tokenAddress
            amount
          }
        }
      }
    }
  `;
</script>

<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import SupportCard from '$lib/components/support-card/support-card.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import KeyValuePair from '$lib/components/key-value-pair/key-value-pair.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import SupportersSection from '$lib/components/supporters-section/supporters.section.svelte';
  import type { OrcidProfileFragment } from './__generated__/gql.generated';
  import getSupportersPile from '$lib/components/drip-list-card/methods/get-supporters-pile';
  import Pile from '$lib/components/pile/pile.svelte';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import Developer from '$lib/components/developer-section/developer.section.svelte';
  import type Orcid from '$lib/utils/orcids/entities';
  import filterCurrentChainData from '$lib/utils/orcids/filter-current-chain-data';
  import OrcidProfileHeader, { ORCID_PROFILE_HEADER_FRAGMENT } from './orcid-profile-header.svelte';
  import isClaimed from '$lib/utils/orcids/is-claimed';
  import buildOrcidUrl from '$lib/utils/orcids/build-orcid-url';

  export let orcid: Orcid;
  export let orcidAccount: OrcidProfileFragment;

  let supportersSectionSkeleton: SectionSkeleton | undefined;

  // TODO: implement
  $: imageBaseUrl = `/api/share-images/orcid/${encodeURIComponent(orcid.id)}.png`;
  $: chainData = filterCurrentChainData(orcidAccount.chainData);
  $: orcidSupport = chainData?.support || [];
  $: origin = typeof window !== 'undefined' && window ? window.location.origin : 'https://drips.network';
</script>

<HeadMeta
  title={orcid.name}
  description="Support {orcid.name} on Drips and help make Open-Source Software sustainable."
  image="{imageBaseUrl}?target=og"
  twitterImage="{imageBaseUrl}?target=twitter"
/>

<svelte:head>
  <link rel="canonical" href={`https://drips.network/app/orcids/${orcid.id}`} />
</svelte:head>

<PrimaryColorThemer colorHex={undefined}>
  <article class="orcid-profile">
    <header class="header card">
      <div>
        <OrcidProfileHeader {orcid} {orcidAccount}                     shareButton={{
            url: `${origin}${buildOrcidUrl(orcid.id)}`,
            downloadableImageUrl: `${imageBaseUrl}?target=og`,
          }} />
      </div>

      <div class="stats">
        {#if isClaimed(chainData)}
          <div class="stat drip-bordered">
            <KeyValuePair key="Donations">
              <AggregateFiatEstimate amounts={chainData?.totalEarned} />
            </KeyValuePair>
          </div>
        {:else if chainData.withdrawableBalances.length > 0}
          <div class="stat drip-bordered">
            <KeyValuePair key="Donations">
              <AggregateFiatEstimate  amounts={mergeWithdrawableBalances(chainData.withdrawableBalances)} />
            </KeyValuePair>
          </div>
        {/if}
        {#if [orcidSupport].flat().length > 0}
          <div class="stat drip-bordered">
            <!-- ("Supporters" stat) -->
            <a href="#support" on:click={() => supportersSectionSkeleton?.highlightSection()}>
              <KeyValuePair key="Supporters">
                <Pile maxItems={4} components={getSupportersPile(orcidSupport)} />
              </KeyValuePair>
            </a>
          </div>
        {/if}
      </div>
    </header>
    <section id="graph">
      <Developer accountId={orcidAccount?.account.accountId} />
    </section>

    <section id="support">
      <SupportersSection
        bind:sectionSkeleton={supportersSectionSkeleton}
        type="ecosystem"
        supportItems={orcidSupport}
      />
    </section>
    <aside>
      <div class="become-supporter-card">
        <SupportCard orcid={orcidAccount} />
      </div>
    </aside>
  </article>
</PrimaryColorThemer>

<style>
  .orcid-profile > * {
    min-width: 0;
  }

  .orcid-profile {
    display: grid;
    grid-template-columns: 3fr minmax(auto, 18rem);
    gap: 3rem;
  }

  .orcid-profile > * {
    max-width: 100%;
  }

  section {
    grid-column: span 2;
  }

  section#graph {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  aside {
    grid-row-start: 1;
    grid-column-start: 2;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    justify-content: space-between;
  }

  .stats {
    overflow: scroll;
    gap: 1.5rem;
    display: flex;
  }

  .stats .stat {
    padding: 1rem;
    min-height: 6.125rem;
    flex-grow: 1;
    flex-basis: 33%;
  }

  .card {
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .drip-bordered {
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
  }

  .become-supporter-card {
    height: 100%;
  }

  @media (max-width: 1080px) {
    .header {
      margin-bottom: 0;
    }

    aside {
      height: auto;
    }

    .orcid-profile,
    section#graph {
      gap: 1.5rem;
    }

    .header {
      grid-row-start: 1;
      grid-column: span 2;
    }

    aside {
      grid-row-start: 3;
      grid-column: span 2;
    }
  }

  @media (max-width: 768px) {
    .stats {
      gap: 1rem;
      grid-template-columns: auto auto;
    }

    .stats .stat:first-child {
      grid-column: span 2;
      grid-row-start: 2;
    }

    .header {
      gap: 1.5rem;
    }
  }
</style>

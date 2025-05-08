<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const ECOSYSTEM_PROFILE_FRAGMENT = gql`
    ${STREAM_STATE_STREAM_FRAGMENT}
    ${CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT}
    fragment EcosystemProfile on EcosystemMainAccount {
      account {
        accountId
        driver
      }
      name
      description
      creator
      owner {
        accountId
        address
      }
      totalEarned {
        tokenAddress
        amount
      }
      support {
        ... on OneTimeDonationSupport {
          account {
            accountId
            address
          }
          amount {
            amount
            tokenAddress
          }
          date
        }
        ... on StreamSupport {
          stream {
            ...StreamStateStream
            config {
              amountPerSecond {
                amount
                tokenAddress
              }
              dripId
            }
            createdAt
            sender {
              account {
                accountId
                address
              }
            }
            timeline {
              ...CurrentAmountsTimelineItem
            }
          }
          date
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
  import EcosystemProfileHeader from './ecosystem-profile-header.svelte';
  import EcosystemCardInteractive from './ecosystem-card-interactive.svelte';
  import EcosystemMetadata from './ecosystem-metadata.svelte';
  import EcosystemDistribution from './ecosystem-distribution/ecosystem-distribution.svelte';
  import SupportersSection from '$lib/components/supporters-section/supporters.section.svelte';
  import type { Ecosystem } from '$lib/utils/ecosystems/schemas';
  import type { EcosystemProfileFragment } from './__generated__/gql.generated';
  import getSupportersPile from '$lib/components/drip-list-card/methods/get-supporters-pile';
  import Pile from '$lib/components/pile/pile.svelte';
  import { STREAM_STATE_STREAM_FRAGMENT } from '$lib/utils/stream-state';
  import { CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT } from '$lib/utils/current-amounts';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import formatNumber from '$lib/utils/format-number';

  export let ecosystem: Ecosystem;
  export let ecosystemFragment: EcosystemProfileFragment | undefined;

  $: ecosystemSupport = ecosystemFragment?.support || [];
  let supportersSectionSkeleton: SectionSkeleton | undefined;

  const imageBaseUrl = `/api/share-images/ecosystem/${encodeURIComponent(ecosystem.id as string)}.png`;

  // all nodes except the root node
  $: recipientsFormatted = formatNumber(ecosystem.graph ? ecosystem.graph.nodes.length - 1 : 0);
</script>

<HeadMeta
  title={ecosystem.name}
  description="Support {ecosystem.name} on Drips and help make Open-Source Software sustainable."
  image="{imageBaseUrl}?target=og"
  twitterImage="{imageBaseUrl}?target=twitter"
/>

<svelte:head>
  <link rel="canonical" href={`https://drips.network/app/ecosystems/${ecosystem.id}`} />
</svelte:head>

<PrimaryColorThemer colorHex={ecosystem.color}>
  <article class="ecosystem-profile">
    <header class="header card">
      <div>
        <EcosystemProfileHeader {ecosystem} />
      </div>

      <div class="stats">
        <div class="stat drip-bordered">
          <KeyValuePair key="Donations">
            <AggregateFiatEstimate amounts={ecosystemFragment?.totalEarned} />
          </KeyValuePair>
        </div>
        <div class="stat drip-bordered">
          <KeyValuePair key="Recipients">{recipientsFormatted}</KeyValuePair>
        </div>
        {#if [ecosystemSupport].flat().length > 0}
          <div class="stat drip-bordered">
            <!-- ("Supporters" stat) -->
            <a href="#support" on:click={() => supportersSectionSkeleton?.highlightSection()}>
              <KeyValuePair key="Supporters">
                <Pile maxItems={4} components={getSupportersPile(ecosystemSupport)} />
              </KeyValuePair>
            </a>
          </div>
        {/if}
      </div>
    </header>
    <section id="graph">
      <EcosystemCardInteractive {ecosystem} />
    </section>
    <section id="metadata">
      <EcosystemMetadata {ecosystem} />
    </section>
    <section id="distribution">
      <EcosystemDistribution {ecosystem} />
    </section>

    <section id="support">
      <SupportersSection
        bind:sectionSkeleton={supportersSectionSkeleton}
        type="ecosystem"
        supportItems={ecosystemSupport}
      />
    </section>
    <aside>
      <div class="become-supporter-card">
        <SupportCard ecosystem={ecosystemFragment} />
      </div>
    </aside>
  </article>
</PrimaryColorThemer>

<style>
  .ecosystem-profile > * {
    min-width: 0;
  }

  .ecosystem-profile {
    display: grid;
    grid-template-columns: 3fr minmax(auto, 18rem);
    gap: 3rem;
  }

  .ecosystem-profile > * {
    max-width: 100%;
  }

  section {
    grid-column: span 2;
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

    .ecosystem-profile {
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

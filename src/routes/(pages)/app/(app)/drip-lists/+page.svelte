<script lang="ts" context="module">
  export const DRIP_LISTS_PAGE_DRIP_LIST_FRAGMENT = gql`
    ${DRIP_LISTS_SECTION_DRIP_LIST_FRAGMENT}
    fragment DripListsPageDripList on DripList {
      ...DripListsSectionDripList
    }
  `;
</script>

<script lang="ts">
  import YourDripListsSection, {
    DRIP_LISTS_SECTION_DRIP_LIST_FRAGMENT,
  } from '$lib/components/your-drip-lists-section/your-drip-lists-section.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import DripList from '$lib/components/illustrations/drip-list.svelte';
  import Button from '$lib/components/button/button.svelte';
  import EduCard from '$lib/components/edu-card/edu-card.svelte';
  import { gql } from 'graphql-request';
  import type { PageData } from './$types';
  import CreateDripListStepper from '$lib/flows/create-drip-list-flow/create-drip-list-stepper.svelte';
  import modal from '$lib/stores/modal';
  import Plus from '$lib/components/icons/Plus.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import StatsSection from '$lib/components/stats-section/stats-section.svelte';
  import ProminentKeyValuePair from '$lib/components/key-value-pair/prominent-key-value-pair.svelte';
  import Section from '$lib/components/section/section.svelte';
  import DripListsGrid from '../components/drip-lists-grid.svelte';
  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';

  export let data: PageData;
</script>

<HeadMeta title="Drip List" />

<div class="page">
  <EduCard dismissableId="drip-lists-page-intro" negativeMarginWhileCollapsed="-4rem">
    <svelte:fragment slot="text">
      <h1 class="pixelated">What’s a Drip List?</h1>
      <p>
        A Drip List is a fundable list of anything that is fundable on Drips. That includes
        projects, users, other Drip Lists, or Ecosystems. Each recipient in the list is assigned a
        percentage, which determines the amount of funds that recipient receives when funds are sent
        to the list.
      </p>
    </svelte:fragment>
    <svelte:fragment slot="buttons">
      <Button
        icon={Plus}
        variant="primary"
        on:click={() =>
          modal.show(CreateDripListStepper, undefined, {
            skipWalletConnect: $walletStore.connected,
            isModal: true,
          })}>Create a Drip List</Button
      >
      <Button icon={ArrowBoxUpRight} href="https://docs.drips.network/support-your-dependencies"
        >Learn More</Button
      >
    </svelte:fragment>
    <svelte:fragment slot="illustration">
      <div class="edu-card-illustration-bg" />
      <div class="edu-card-illustration-wrapper">
        <DripList />
      </div>
    </svelte:fragment>
  </EduCard>

  <YourDripListsSection
    votingRounds={data.votingRounds}
    dripLists={data.yourDripLists}
    showCreateNewListCard={true}
    withCreateButton={true}
    showVisibilityToggle={true}
  />

  <StatsSection>
    <ProminentKeyValuePair key="Total Donations">
      ><AggregateFiatEstimate
        compact
        amounts={data.totalDrippedAmounts}
        prices={data.totalDrippedPrices}
      /></ProminentKeyValuePair
    >
    <ProminentKeyValuePair key="Total Drips Lists" value={data.chainStats.dripListsCount}
    ></ProminentKeyValuePair>
    <ProminentKeyValuePair key="Total Splits" value={data.chainStats.receiversCount}
    ></ProminentKeyValuePair>
  </StatsSection>

  <Section
    header={{
      icon: DripListIcon,
      label: 'Featured Drip Lists',
    }}
    skeleton={{
      loaded: true,
      empty: !data.featuredDripLists.length,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: 'No Featured Drip Lists',
      emptyStateText: 'We couldn’t find any featured Drip Lists.',
    }}
  >
    <DripListsGrid dripLists={data.featuredDripLists} />
  </Section>

  <Section
    header={{
      icon: DripListIcon,
      label: 'Recently created Drip Lists',
    }}
    skeleton={{
      loaded: true,
      empty: !data.restDripLists?.length,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: 'No recenltly created Drip Lists',
      emptyStateText: 'We couldn’t find any recently created Drip Lists.',
    }}
  >
    <DripListsGrid cardVariant="minimal" dripLists={data.restDripLists} />
  </Section>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .edu-card-illustration-bg {
    position: absolute;
    background-color: var(--color-primary-level-2);
    top: 0;
    width: 35%;
    height: 50%;
    border-radius: 0 0 1rem 1rem;
  }

  .edu-card-illustration-wrapper {
    max-width: 16rem;
    z-index: 1;
  }

  h1 {
    color: var(--color-foreground);
  }

  @media (max-width: 768px) {
    .edu-card-illustration-bg {
      width: 100%;
      height: 30%;
      border-radius: 0;
    }
  }
</style>

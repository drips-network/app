<script lang="ts" context="module">
  export const DRIP_LISTS_PAGE_DRIP_LIST_FRAGMENT = gql`
    ${DRIP_LISTS_SECTION_DRIP_LIST_FRAGMENT}
    fragment DripListsPageDripList on DripList {
      ...DripListsSectionDripList
    }
  `;
</script>

<script lang="ts">
  import walletStore from '$lib/stores/wallet/wallet.store';
  import guardConnected from '$lib/utils/guard-connected';
  import DripListsSection, {
    DRIP_LISTS_SECTION_DRIP_LIST_FRAGMENT,
  } from '$lib/components/drip-lists-section/drip-lists-section.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import DripList from '$lib/components/illustrations/drip-list.svelte';
  import Button from '$lib/components/button/button.svelte';
  import EduCard from '$lib/components/edu-card/edu-card.svelte';
  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import { gql } from 'graphql-request';
  import type { PageData } from './$types';
  import CreateDripListStepper from '$lib/flows/create-drip-list-flow/create-drip-list-stepper.svelte';
  import modal from '$lib/stores/modal';

  export let data: PageData;

  $: votingRounds = data.votingRounds ?? [];
  $: dripLists = data.dripLists ?? [];

  const walletInitialized = walletStore.initialized;

  $: {
    $walletStore.connected;
    $walletInitialized;

    guardConnected();
  }
</script>

<HeadMeta title="Drip List" />

<div class="page">
  <EduCard dismissableId="drip-lists-page-intro" negativeMarginWhileCollapsed="-4rem">
    <svelte:fragment slot="text">
      <h2 class="pixelated">Support all your dependencies at once with a&nbsp;Drip&nbsp;List</h2>
      <p>
        Stream any ERC-20 token to a list of individuals, Git projects, or other Drip
        Lists&mdash;weighted by their importance to you. <a
          href="https://docs.drips.network/support-your-dependencies"
          class="text-foreground-level-5 hover:text-foreground hover:underline transition duration-150 focus-visible:bg-primary-level-1 focus-visible:text-foreground focus-visible:underline px-1 py-0.5 -mx-1 rounded focus:outline-none"
          >Learn&nbsp;more</a
        >
      </p>
    </svelte:fragment>
    <svelte:fragment slot="buttons">
      <Button
        icon={DripListIcon}
        variant="primary"
        on:click={() =>
          modal.show(CreateDripListStepper, undefined, {
            skipWalletConnect: true,
            isModal: true,
          })}>Create a Drip List</Button
      >
    </svelte:fragment>
    <svelte:fragment slot="illustration">
      <div class="edu-card-illustration-bg" />
      <div class="edu-card-illustration-wrapper">
        <DripList />
      </div>
    </svelte:fragment>
  </EduCard>
  <DripListsSection
    {votingRounds}
    {dripLists}
    showCreateNewListCard={true}
    withCreateButton={true}
    showVisibilityToggle={true}
  />
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 4rem;
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

  @media (max-width: 768px) {
    .edu-card-illustration-bg {
      width: 100%;
      height: 30%;
      border-radius: 0;
    }
  }
</style>

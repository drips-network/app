<script lang="ts" module>
  export const DRIP_LIST_PAGE_FRAGMENT = gql`
    ${DRIP_LIST_CARD_FRAGMENT}
    ${SUPPORT_CARD_DRIP_LIST_FRAGMENT}
    ${SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT}
    fragment DripListPage on DripList {
      ...DripListCard
      ...SupportCardDripList
      account {
        accountId
      }
      owner {
        accountId
        address
      }
      support {
        ...SupportersSectionSupportItem
      }
    }
  `;
</script>

<script lang="ts">
  import Developer from '$lib/components/developer-section/developer.section.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import SupportCard, {
    SUPPORT_CARD_DRIP_LIST_FRAGMENT,
  } from '$lib/components/support-card/support-card.svelte';
  import Supporters, {
    SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT,
  } from '$lib/components/supporters-section/supporters.section.svelte';
  import type { PageData } from './$types';
  import DripListCard, {
    DRIP_LIST_CARD_FRAGMENT,
  } from '$lib/components/drip-list-card/drip-list-card.svelte';
  import { gql } from 'graphql-request';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import EyeClosed from '$lib/components/icons/EyeClosed.svelte';
  import Registered from '$lib/components/icons/Registered.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import checkIsUser from '$lib/utils/check-is-user';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import editDripListSteps from '$lib/flows/edit-drip-list/edit-members/edit-drip-list-steps';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let dripList = $derived(data.dripList);
  let isOwnList = $derived($walletStore && checkIsUser(dripList.owner.accountId));
</script>

{#if dripList.name}
  {@const imageBaseUrl = `/api/share-images/drip-list/${dripList.account.accountId}.png`}
  <HeadMeta
    title="{dripList.name} | Drip List"
    description={dripList.description ??
      `"${dripList.name}" is a Drip List of open source projects, Ethereum addresses, or Drip Lists. Anyone with an Ethereum wallet can send one-time or continuous donations to it.`}
    image="{imageBaseUrl}?target=og"
    twitterImage="{imageBaseUrl}?target=twitter"
  />
{/if}

<svelte:head>
  {#if !dripList.isVisible}
    <meta name="robots" content="noindex" />
  {/if}
</svelte:head>

{#if !dripList.isVisible}
  <div class="notice">
    <AnnotationBox type="info" icon={EyeClosed}>
      <span class="typo-text-small-bold">{dripList.name}</span> is hidden.
      {isOwnList ? '' : "If you're the owner, connect your wallet to un-hide it."}
      <a
        style="text-decoration: underline;"
        target="_blank"
        href="https://docs.drips.network/advanced/drip-list-and-project-visibility">Learn more</a
      >.
      {#snippet actions()}
        {#if isOwnList}
          <div class="flex gap-3">
            <Button
              size="small"
              icon={Registered}
              variant="primary"
              onclick={() => {
                modal.show(Stepper, undefined, editDripListSteps(dripList));
              }}>Unhide it</Button
            >
          </div>
        {/if}
      {/snippet}
    </AnnotationBox>
  </div>
{/if}

<article class="drip-list-page" class:hidden-by-user={!dripList.isVisible}>
  <main class="list">
    <DripListCard clampTitle={false} data={{ dripList }} />
  </main>

  <aside class="support">
    <div>
      <SupportCard disabled={!dripList.isVisible} {dripList} />
    </div>
  </aside>

  <div class="sections">
    <Developer accountId={dripList.account.accountId} />

    <Supporters
      headline="Support"
      infoTooltip="A Drip List can be supported by continuous donations, one-time donations, or funds split by projects and other Drip Lists."
      type="dripList"
      supportItems={dripList.support}
      ownerAccountId={dripList.owner.accountId}
    />
  </div>
</article>

<style>
  .drip-list-page {
    display: grid;
    grid-template-columns: 1fr minmax(auto, 18rem);
    grid-template-rows: auto auto;
    grid-template-areas:
      'list support'
      'sections support';
    gap: 3rem;
  }

  .drip-list-page > * {
    min-width: 0;
  }

  .list {
    grid-area: list;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .support {
    grid-area: support;
    grid-row: 1 / span 2;
  }

  .support > div {
    position: sticky;
    top: 6rem;
  }

  .sections {
    grid-area: sections;
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .notice {
    margin-bottom: 2rem;
  }

  .hidden-by-user {
    opacity: 0.5;
  }

  @media (max-width: 1080px) {
    .drip-list-page {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      grid-template-areas:
        'list'
        'support'
        'sections';
      min-width: 0;
    }

    .support > div {
      margin-top: 0;
      position: relative;
      top: 0;
    }

    .drip-list-page > * {
      min-width: 0;
    }

    .support {
      grid-row: auto;
    }
  }
</style>

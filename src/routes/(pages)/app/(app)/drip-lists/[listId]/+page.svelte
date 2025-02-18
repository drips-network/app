<script lang="ts" context="module">
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
  import Section from '$lib/components/section/section.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import formatDate from '$lib/utils/format-date';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import viewVotingRoundFlowSteps from '$lib/flows/view-voting-round/view-voting-round-flow-steps';
  import type { VotingRound } from '$lib/utils/multiplayer/schemas';
  import EyeClosed from '$lib/components/icons/EyeClosed.svelte';
  import Registered from '$lib/components/icons/Registered.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import checkIsUser from '$lib/utils/check-is-user';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import editDripListSteps from '$lib/flows/edit-drip-list/edit-members/edit-drip-list-steps';

  export let data: PageData;

  $: dripList = data.dripList;
  $: votingRound = data.votingRounds.current;

  function handleVotingRoundClick(votingRound: VotingRound) {
    modal.show(Stepper, undefined, viewVotingRoundFlowSteps(votingRound));
  }

  $: isOwnList = dripList && $walletStore && checkIsUser(dripList.owner.accountId);
</script>

{#if dripList?.name || votingRound?.name}
  {@const imageBaseUrl = `/api/share-images/drip-list/${
    dripList?.account.accountId || votingRound?.id
  }.png`}
  <HeadMeta
    title="{dripList?.name || votingRound?.name} | Drip List"
    description={dripList?.description ??
      votingRound?.description ??
      (dripList
        ? `"${dripList.name}" is a Drip List of open source projects, Ethereum addresses, or Drip Lists. Anyone with an Ethereum wallet can send one-time or continuous donations to it.`
        : undefined)}
    image="{imageBaseUrl}?target=og"
    twitterImage="{imageBaseUrl}?target=twitter"
  />
{/if}

<svelte:head>
  {#if dripList && !dripList.isVisible}
    <meta name="robots" content="noindex" />
  {/if}
</svelte:head>

{#if dripList && !dripList.isVisible}
  <div class="notice">
    <AnnotationBox type="info" icon={EyeClosed}>
      <span class="typo-text-small-bold">{dripList.name}</span> is hidden.
      {isOwnList ? '' : "If you're the owner, connect your wallet to un-hide it."}
      <a
        style="text-decoration: underline;"
        target="_blank"
        href="https://docs.drips.network/advanced/drip-list-and-project-visibility">Learn more</a
      >.
      <svelte:fragment slot="actions">
        {#if isOwnList}
          <div class="flex gap-3">
            <Button
              size="small"
              icon={Registered}
              variant="primary"
              on:click={() => {
                modal.show(Stepper, undefined, editDripListSteps(dripList));
              }}>Unhide it</Button
            >
          </div>
        {/if}
      </svelte:fragment>
    </AnnotationBox>
  </div>
{/if}

<article class="drip-list-page" class:hidden-by-user={dripList && !dripList.isVisible}>
  <main class="list">
    <DripListCard clampTitle={false} data={{ dripList, votingRound }} />
  </main>

  <aside class="support">
    <div>
      <SupportCard
        disabled={Boolean(dripList && !dripList.isVisible)}
        dripList={dripList ?? undefined}
        draftListMode={Boolean(!dripList && votingRound)}
      />
    </div>
  </aside>

  <div class="sections">
    {#if dripList}
      <Developer accountId={dripList.account.accountId} />
    {/if}

    {#if dripList}
      <Supporters
        headline="Support"
        infoTooltip="A Drip List can be supported by continuous donations, one-time donations, or funds split by projects and other Drip Lists."
        type="dripList"
        supportItems={dripList.support}
        ownerAccountId={dripList.owner.accountId}
      />
    {/if}

    {#if data.votingRounds.past.length > 0}
      <Section
        header={{
          label: 'Voting rounds',
          icon: Proposals,
        }}
        skeleton={{ loaded: true, empty: false }}
      >
        <p class="voting-rounds-section-description">
          Each time the recipients of this Drip List are voted on and changed, it’ll show up here.
        </p>
        <div class="voting-rounds">
          {#each data.votingRounds.past as votingRound}
            <button on:click={() => handleVotingRoundClick(votingRound)} class="voting-round">
              <div class="left">
                <h4 class="typo-text">
                  {formatDate(new Date(votingRound.schedule.voting.endsAt), 'dayAndYear')}
                </h4>
                {#if !votingRound.areVotesPrivate}
                  <span class="typo-text-small" style:color="var(--color-foreground-level-5)">
                    {votingRound.result?.length === 1
                      ? '1 recipient'
                      : `${votingRound.result?.length ?? 0} recipients`}
                  </span>
                {/if}
              </div>
              {#if !votingRound.areVotesPrivate}
                <div class="right">
                  <span class="typo-text"
                    >{votingRound.votes?.length ?? 0}
                    {votingRound.votes?.length === 1 ? 'vote' : 'votes'}</span
                  >
                </div>
              {/if}
            </button>
          {/each}
        </div>
      </Section>
    {/if}
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

  .voting-rounds-section-description {
    margin-bottom: 1rem;
  }

  .voting-rounds {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .voting-rounds .voting-round {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    text-align: left;
    transition: background-color 0.3s;
  }

  .voting-rounds .voting-round:focus-visible,
  .voting-rounds .voting-round:hover {
    background-color: var(--color-primary-level-1);
  }

  .voting-rounds .voting-round:not(:only-child):not(:last-child) {
    border-bottom: 1px solid var(--color-foreground);
  }

  .voting-rounds .voting-round .left {
    display: flex;
    flex-direction: column;
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

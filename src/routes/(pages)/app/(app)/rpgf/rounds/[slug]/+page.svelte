<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import ExpandableText from '$lib/components/expandable-text/expandable-text.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import RpgfApplicationsTable from '$lib/components/rpgf-applications-table/rpgf-applications-table.svelte';
  import RpgfHeaderCard from '$lib/components/rpgf-header-card/rpgf-header-card.svelte';
  import RpgfScheduleCard from '$lib/components/rpgf-schedule-card/rpgf-schedule-card.svelte';
  import RpgfSiweButton from '$lib/components/rpgf-siwe-button/rpgf-siwe-button.svelte';
  import Section from '$lib/components/section/section.svelte';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';
  import { fade } from 'svelte/transition';
  import RpgfBaseLayout from '../../components/rpgf-base-layout.svelte';
  import RpgfCtaCard from '$lib/components/rpgf-cta-card/rpgf-cta-card.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import DripListsGrid from '../../../components/drip-lists-grid.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import editRpgfRoundLinkedDripListsFlow from '$lib/flows/edit-rpgf-round-linked-drip-lists/edit-rpgf-round-linked-drip-lists-flow';
  import Pen from '$lib/components/icons/Pen.svelte';

  export let data;
  $: round = data.wrappedRound.round;

  $: userIsAdmin = round.adminWalletAddresses.includes(data.rpgfUserData?.walletAddress || '');
</script>

<HeadMeta title={round.name} description={round.description ?? undefined} />

<RpgfBaseLayout>
  <svelte:fragment slot="sidebar">
    <RpgfCtaCard
      hasExistingBallot={Boolean(data.existingBallot)}
      signedIn={Boolean(data.rpgfUserData)}
      isRoundVoter={data.isRoundVoter}
      {round}
    />
    <RpgfScheduleCard schedule={round} />
  </svelte:fragment>

  <svelte:fragment slot="header">
    <TransitionedHeight transitionHeightChanges negativeMarginWhileCollapsed="-1rem">
      {#if !data.rpgfUserData}
        <div transition:fade={{ duration: 300 }}>
          <AnnotationBox type="info">
            Sign in to Drips RPGF to view your own applications and other private data.
            <svelte:fragment slot="actions">
              <RpgfSiweButton />
            </svelte:fragment>
          </AnnotationBox>
        </div>
      {/if}
    </TransitionedHeight>
    <RpgfHeaderCard roundSlugOrDraftId={round.urlSlug} roundOrDraft={round} />
  </svelte:fragment>

  {#if round.description}
    <div style:padding="0 1rem">
      <ExpandableText>
        <Markdown content={round.description} />
      </ExpandableText>
    </div>
  {/if}

  <Section
    header={{
      label: 'Applications',
      icon: Ledger,
      actions: [
        {
          label: 'View all',
          href: `/app/rpgf/rounds/${round.urlSlug}/applications`,
          icon: ArrowRight,
        },
      ],
    }}
    skeleton={{
      empty: data.applications.length === 0,
      loaded: true,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: 'No applications',
      emptyStateText: `There are currently no ${!userIsAdmin ? 'approved ' : ''}applications for this round.`,
    }}
  >
    <RpgfApplicationsTable searchable={false} {round} applications={data.applications} />
  </Section>

  {#if data.isRoundAdmin}
    <Section
      header={{
        label: 'Ballots',
        icon: Proposals,
        actions: [
          {
            label: 'View all',
            href: `/app/rpgf/rounds/${round.urlSlug}/ballots`,
            icon: ArrowRight,
            disabled: !data.ballotStats || data.ballotStats.numberOfBallots === 0,
          },
        ],
      }}
      skeleton={{
        empty: !data.ballotStats,
        loaded: true,
        emptyStateEmoji: '🫙',
        emptyStateHeadline: 'No ballots yet',
        emptyStateText:
          'As an admin, you can see ballots as they are submitted in the voting phase.',
      }}
    >
      {#if data.ballotStats}
        <div class="ballot-stats">
          <div class="stat">
            <h5>Voters</h5>
            <span class="typo-header-1">{data.ballotStats.numberOfVoters}</span>
          </div>
          <div class="stat">
            <h5>Recorded Ballots</h5>
            <span class="typo-header-1">{data.ballotStats.numberOfBallots}</span>
          </div>
        </div>
      {/if}
    </Section>
  {/if}

  <Section
    header={{
      label: 'Distribution',
      anchorTarget: 'distribution',
      icon: Trophy,
      actions: data.isRoundAdmin
        ? [
            {
              label: 'Edit linked lists',
              icon: Pen,
              handler: () =>
                modal.show(
                  Stepper,
                  undefined,
                  editRpgfRoundLinkedDripListsFlow(round.urlSlug, data.linkedDripLists),
                ),
            },
          ]
        : undefined,
    }}
    skeleton={{
      empty: data.linkedDripLists.length === 0,
      loaded: true,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: 'No linked Drip Lists',
      emptyStateText:
        'Rewards for the round will be distributed via Drip Lists, which will appear here.',
    }}
  >
    <DripListsGrid dripLists={data.linkedDripLists} />
  </Section>
</RpgfBaseLayout>

<style>
  .ballot-stats {
    display: flex;
    gap: 2.5rem;
    flex-wrap: wrap;
  }
</style>

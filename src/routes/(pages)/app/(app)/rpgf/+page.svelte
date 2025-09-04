<script lang="ts">
  import { goto } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowCounterClockwiseHeart from '$lib/components/icons/ArrowCounterClockwiseHeart.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import RpgfRoundCard from '$lib/components/rpgf-round-card/rpgf-round-card.svelte';
  import Section from '$lib/components/section/section.svelte';
  import { INBOUND_LEAD_FORM_URL } from '$lib/constants';
  import network from '$lib/stores/wallet/network';
  import doWithErrorModal from '$lib/utils/do-with-error-modal.js';
  import emoji from '$lib/utils/emoji/emoji.js';
  import possibleColors from '$lib/utils/project/possible-colors.js';
  import { createRound } from '$lib/utils/rpgf/rpgf.js';
  import type { PossibleColor } from '$lib/utils/rpgf/types/round.js';

  export let data;
  $: ownRoundsAndDrafts = data.own ?? [];
  $: otherRounds = data.rounds ?? [];

  let loading = false;

  async function handleCreateRoundDraft() {
    doWithErrorModal(
      async () => {
        if (!data.rpgfUserData) {
          return;
        }

        loading = true;

        const emojiWithoutFlags = emoji.filter((e) => e.category !== 'Flags');

        const randomEmoji =
          emojiWithoutFlags[Math.floor(Math.random() * emojiWithoutFlags.length)].unicode;
        const randomColor = possibleColors[
          Math.floor(Math.random() * possibleColors.length)
        ] as PossibleColor;

        const round = await createRound(undefined, {
          draft: true,
          emoji: randomEmoji,
          chainId: network.chainId,
          color: randomColor,
          name: null,
          customAvatarCid: null,
          urlSlug: null,
          description: null,
          applicationPeriodStart: null,
          applicationPeriodEnd: null,
          votingPeriodStart: null,
          votingPeriodEnd: null,
          resultsPeriodStart: null,
          maxVotesPerVoter: null,
          maxVotesPerProjectPerVoter: null,
          voterGuidelinesLink: null,
        });

        await goto(`/app/rpgf/rounds/${round.id}`);

        loading = false;
      },
      () => {
        loading = false;
      },
    );
  }
</script>

<HeadMeta title="Retro PGF" />

<div class="page">
  {#if !data.rpgfUserData?.whitelisted}
    <AnnotationBox type="info">
      <span class="typo-text-small-bold"
        >Currently, only whitelisted users can create new RetroPGF rounds.</span
      >
      Ready to run your round on Drips? Reach out to the team now.

      <svelte:fragment slot="actions">
        <Button variant="primary" href={INBOUND_LEAD_FORM_URL} target="_blank" icon={ArrowRight}>
          Get in touch
        </Button>
      </svelte:fragment>
    </AnnotationBox>
  {/if}

  <Section
    header={{
      label: `Your rounds`,
      icon: ArrowCounterClockwiseHeart,
      actions: [
        {
          label: 'New round',
          icon: Plus,
          handler: handleCreateRoundDraft,
          loading,
          disabled: !data.rpgfUserData?.whitelisted,
        },
      ],
    }}
    skeleton={{
      loaded: true,
      empty: ownRoundsAndDrafts.length === 0,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: data.rpgfUserData
        ? 'Nothing to see here'
        : 'Connect your wallet to manage your rounds',
      emptyStateText: data.rpgfUserData
        ? 'You have no rounds or drafts that you are an admin of.'
        : 'Click "Connect" above to get started.',
    }}
  >
    <div class="card-grid">
      {#each ownRoundsAndDrafts ?? [] as round}
        <RpgfRoundCard {round} />
      {/each}
    </div>
  </Section>

  {#if otherRounds.length > 0}
    <Section
      header={{
        label: `All rounds on ${network.label}`,
        icon: ArrowCounterClockwiseHeart,
      }}
      skeleton={{
        loaded: true,
        empty: otherRounds.length === 0,
        emptyStateEmoji: '🫙',
        emptyStateHeadline: 'No rounds found',
        emptyStateText: 'There are no rounds available at the moment.',
      }}
    >
      <div class="card-grid">
        {#each otherRounds ?? [] as round}
          <RpgfRoundCard {round} />
        {/each}
      </div>
    </Section>
  {/if}
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .card-grid {
    display: grid;
    max-width: 100%;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1rem;
  }
</style>

<script lang="ts">
  import { goto } from '$app/navigation';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowCounterClockwiseHeart from '$lib/components/icons/ArrowCounterClockwiseHeart.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import RpgfRoundCard from '$lib/components/rpgf-round-card/rpgf-round-card.svelte';
  import Section from '$lib/components/section/section.svelte';
  import network from '$lib/stores/wallet/network';
  import doWithErrorModal from '$lib/utils/do-with-error-modal.js';
  import emoji from '$lib/utils/emoji/emoji.js';
  import possibleColors from '$lib/utils/project/possible-colors.js';
  import { DEFAULT_PRESET } from '$lib/utils/rpgf/application-form-presets.js';
  import { createDraft } from '$lib/utils/rpgf/rpgf.js';
  import type { PossibleColor } from '$lib/utils/rpgf/schemas.js';

  export let data;
  $: ownRoundsAndDrafts = [
    ...data.rounds.filter((round) => round.isAdmin),
    ...data.drafts.filter((draft) => draft.isAdmin),
  ];
  $: otherRounds = data.rounds.filter((round) => !round.isAdmin);

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

        const draft = await createDraft(undefined, {
          chainId: network.chainId,
          emoji: randomEmoji,
          color: randomColor,
          adminWalletAddresses: [data.rpgfUserData.walletAddress ?? ''],
          applicationFormat: DEFAULT_PRESET,
        });

        await goto(`/app/rpgf/drafts/${draft.id}`);

        loading = false;
      },
      () => {
        loading = false;
      },
    );
  }
</script>

<HeadMeta title="Retro PGF | Drips" />

<div class="page">
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
          disabled: !data.rpgfUserData,
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
      {#each ownRoundsAndDrafts ?? [] as wrappedRoundOrDraft}
        <RpgfRoundCard {wrappedRoundOrDraft} />
      {/each}
    </div>
  </Section>

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
      {#each otherRounds ?? [] as wrappedRound}
        <RpgfRoundCard wrappedRoundOrDraft={wrappedRound} />
      {/each}
    </div>
  </Section>
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

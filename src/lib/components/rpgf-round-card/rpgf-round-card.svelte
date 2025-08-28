<script lang="ts">
  import type {
    RoundState,
    WrappedRoundAdmin,
    WrappedRoundDraft,
    WrappedRoundPublic,
  } from '$lib/utils/rpgf/schemas';
  import EmojiOrIpfsAvatar from '../emoji-or-ipfs-avatar/EmojiOrIpfsAvatar.svelte';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import PrimaryColorThemer from '../primary-color-themer/primary-color-themer.svelte';

  export let wrappedRoundOrDraft: WrappedRoundPublic | WrappedRoundAdmin | WrappedRoundDraft;
  $: url =
    wrappedRoundOrDraft.type === 'round-draft'
      ? `/app/rpgf/drafts/${wrappedRoundOrDraft.id}`
      : `/app/rpgf/rounds/${wrappedRoundOrDraft.round.urlSlug}`;

  $: draftOrRound =
    wrappedRoundOrDraft.type === 'round-draft'
      ? wrappedRoundOrDraft.draft
      : wrappedRoundOrDraft.round;

  $: roundSlugOrDraftId =
    wrappedRoundOrDraft.type === 'round-draft'
      ? wrappedRoundOrDraft.id
      : wrappedRoundOrDraft.round.urlSlug;

  const stateLabels: Record<RoundState, string> = {
    'pending-intake': 'Pending intake',
    intake: 'Accepting applications',
    'pending-voting': 'Pending voting',
    voting: 'Voting in progress',
    'pending-results': 'Pending results',
    results: 'Results available',
  };

  $: stateLabel =
    wrappedRoundOrDraft.type === 'round-draft'
      ? 'Draft'
      : stateLabels[wrappedRoundOrDraft.round.state];
</script>

<PrimaryColorThemer colorHex={draftOrRound.color}>
  <a class="rpgf-round-card" href={url}>
    <div class="card-content">
      <div
        style:view-transition-name="rpgf-header-card-avatar-{roundSlugOrDraftId}"
        style:view-transition-class="element-handover"
      >
        <EmojiOrIpfsAvatar
          emoji={draftOrRound.emoji}
          ipfsCid={draftOrRound.customAvatarCid ?? undefined}
          size="large"
        />
      </div>
      <h2 class="pixelated">{draftOrRound.name ?? 'Unnamed draft'}</h2>
      <IdentityBadge address={wrappedRoundOrDraft.createdBy.walletAddress} />
    </div>
    <div class="details">
      <span class="typo-text-bold">{stateLabel}</span>
    </div>
  </a>
</PrimaryColorThemer>

<style>
  .rpgf-round-card {
    margin-top: 0.25rem;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: var(--elevation-low);
    border-radius: 1rem 0 1rem 1rem;
    text-decoration: none;
    background-color: var(--color-background);
    min-height: 22rem;
    transition:
      box-shadow 0.3s ease,
      transform 0.3s ease,
      background-position 0.3s ease;
    background: linear-gradient(to bottom, var(--color-primary-level-2), var(--color-background));
  }

  .rpgf-round-card:hover {
    box-shadow: var(--elevation-medium);
    transform: translateY(-0.25rem);
    background: linear-gradient(to bottom, var(--color-primary-level-2), var(--color-background));
  }

  .card-content {
    display: flex;
    padding: 2rem;
    gap: 1rem;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    flex-grow: 1;
  }

  h2 {
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .details {
    height: 4rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid var(--color-foreground-level-3);
  }
</style>

<script lang="ts">
  import type { Round } from '$lib/utils/rpgf/types/round';
  import EmojiOrIpfsAvatar from '../emoji-or-ipfs-avatar/EmojiOrIpfsAvatar.svelte';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import PrimaryColorThemer from '../primary-color-themer/primary-color-themer.svelte';

  export let round: Round;

  $: url = `/app/rpgf/rounds/${round.urlSlug ?? round.id}`;

  $: roundSlugOrDraftId = round.urlSlug ?? round.id;

  enum EnrichedState {
    Draft,
    PendingIntake,
    Intake,
    PendingVoting,
    Voting,
    PendingResults,
    Results,
  }
  let enrichedState: EnrichedState;

  $: {
    if (!round.state) {
      enrichedState = EnrichedState.Draft;
    } else if (round.resultsPublished) {
      enrichedState = EnrichedState.Results;
    } else {
      switch (round.state) {
        case 'intake':
          enrichedState = EnrichedState.Intake;
          break;
        case 'voting':
          enrichedState = EnrichedState.Voting;
          break;
        case 'pending-intake':
          enrichedState = EnrichedState.PendingIntake;
          break;
        case 'pending-voting':
          enrichedState = EnrichedState.PendingVoting;
          break;
        case 'pending-results':
        case 'results':
          enrichedState = EnrichedState.PendingResults;
          break;
      }
    }
  }

  const stateLabels: Record<EnrichedState, string> = {
    [EnrichedState.Draft]: 'Draft',
    [EnrichedState.PendingIntake]: 'Pending intake',
    [EnrichedState.Intake]: 'Registrations open',
    [EnrichedState.PendingVoting]: 'Application review',
    [EnrichedState.Voting]: 'Voting open',
    [EnrichedState.PendingResults]: 'Tallying',
    [EnrichedState.Results]: 'Results available',
  };

  $: stateLabel = stateLabels[enrichedState];
</script>

<PrimaryColorThemer colorHex={round.color}>
  <a class="rpgf-round-card" href={url}>
    <div class="card-content">
      <div
        style:view-transition-name="rpgf-header-card-avatar-{roundSlugOrDraftId}"
        style:view-transition-class="element-handover"
      >
        <EmojiOrIpfsAvatar
          emoji={round.emoji}
          ipfsCid={round.customAvatarCid ?? undefined}
          size="large"
        />
      </div>
      <h2 class="pixelated">{round.name ?? 'Unnamed round'}</h2>
      <IdentityBadge address={round.createdByUser.walletAddress} />
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

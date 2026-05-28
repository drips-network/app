<script lang="ts">
  import Checkbox from '$lib/components/checkbox/checkbox.svelte';
  import WaveMockPointsPill from './wave-mock-points-pill.svelte';
  import WaveMockRepoBadge from './wave-mock-repo-badge.svelte';

  type State =
    | 'open'
    | 'new-applications'
    | 'assigned'
    | 'assigned-to-you'
    | 'pr-submitted'
    | 'resolved';

  let {
    number,
    title,
    repo,
    points,
    multiplier,
    state = 'open',
    selectable = false,
    selected = false,
    highlighted = false,
  }: {
    number: number | string;
    title: string;
    repo: { name: string; avatarUrl?: string };
    points: number;
    multiplier?: number;
    state?: State;
    selectable?: boolean;
    selected?: boolean;
    highlighted?: boolean;
  } = $props();

  type Badge = {
    text: string;
    variant: 'primary' | 'caution' | 'positive' | 'neutral';
    bold?: boolean;
  };

  let extraBadges = $derived.by<Badge[]>(() => {
    switch (state) {
      case 'new-applications':
        return [{ text: 'New applications', variant: 'caution', bold: true }];
      case 'assigned':
        return [{ text: 'Assigned', variant: 'caution', bold: true }];
      case 'assigned-to-you':
        return [{ text: 'Assigned to you', variant: 'positive', bold: true }];
      case 'pr-submitted':
        return [{ text: 'PR submitted', variant: 'caution', bold: true }];
      case 'resolved':
        return [{ text: 'Points earned', variant: 'positive', bold: true }];
      default:
        return [];
    }
  });

  let displayPoints = $derived(multiplier && multiplier > 1 ? points * multiplier : points);
</script>

<div class="row" class:highlighted class:selected>
  {#if selectable}
    <div class="checkbox-wrap">
      <Checkbox checked={selected} />
    </div>
  {/if}

  <div class="details">
    <div class="badges">
      <WaveMockPointsPill points={displayPoints} {multiplier} />
      {#each extraBadges as badge (badge.text)}
        <WaveMockPointsPill
          points={badge.text}
          label=""
          variant={badge.variant}
          bold={badge.bold}
        />
      {/each}
    </div>

    <h3 class="typo-text title">
      <span class="number">#{number}</span>
      {title}
    </h3>

    <div class="repo-row">
      <WaveMockRepoBadge name={repo.name} avatarUrl={repo.avatarUrl} size="small" />
    </div>
  </div>
</div>

<style>
  .row {
    position: relative;
    padding: 1rem;
    border-bottom: 1px solid var(--color-foreground-level-2);
    display: flex;
    gap: 0.5rem;
    box-sizing: border-box;
    background-color: var(--color-background);
  }

  /* Selection state is communicated by the checkbox alone — matches the real app.
     Only the "active" (currently-viewed) row gets the blue background. */
  .row.highlighted {
    background-color: var(--color-primary-level-1);
  }

  /* When a row enters the selected state (its checkbox animates in),
     give the whole row a small synchronized pop. Z-index sits it above
     neighbors so the brief overlap reads cleanly. */
  .row.selected {
    z-index: 1;
    animation: row-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  @keyframes row-pop {
    0% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.025);
    }
    100% {
      transform: scale(1);
    }
  }

  .checkbox-wrap {
    padding-top: 0.125rem;
    pointer-events: none;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    flex: 1;
  }

  .badges {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .title {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .number {
    color: var(--color-foreground-level-5);
  }

  .repo-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.25rem;
  }
</style>

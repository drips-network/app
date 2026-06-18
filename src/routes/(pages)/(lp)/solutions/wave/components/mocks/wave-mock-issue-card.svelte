<script lang="ts">
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
    width,
    highlighted = false,
  }: {
    number: number | string;
    title: string;
    repo: { name: string; avatarUrl?: string };
    points: number;
    multiplier?: number;
    state?: State;
    width?: string;
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

<div class="issue" class:highlighted class:shiny={multiplier && multiplier > 1} style:width>
  <div class="badges">
    <WaveMockPointsPill points={displayPoints} {multiplier} />
    {#each extraBadges as badge (badge.text)}
      <WaveMockPointsPill points={badge.text} label="" variant={badge.variant} bold={badge.bold} />
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

<style>
  .issue {
    padding: 1rem;
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    box-sizing: border-box;
  }

  .issue.highlighted {
    background-color: var(--color-primary-level-1);
    border-color: var(--color-primary-level-2);
  }

  .issue.shiny:not(.highlighted) {
    background: linear-gradient(
      135deg,
      var(--color-caution-level-1) 0%,
      var(--color-background) 60%
    );
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

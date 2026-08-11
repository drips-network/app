<script lang="ts">
  interface Entry {
    /** UTC calendar day, formatted YYYY-MM-DD. */
    date: string;
    value: number;
  }

  let {
    entries,
    unitLabel,
  }: {
    entries: Entry[];
    /** e.g. "points" or "applications" — used in tooltips and the empty note. */
    unitLabel: string;
  } = $props();

  const dayFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

  function formatDay(date: string): string {
    return dayFormatter.format(new Date(`${date}T00:00:00Z`));
  }

  let maxValue = $derived(Math.max(...entries.map((e) => e.value), 0));
  let hasActivity = $derived(maxValue > 0);

  // The single busiest day gets a direct label; everything else is tooltip-only.
  let maxIndex = $derived(entries.findIndex((e) => e.value === maxValue));

  function barHeightPct(value: number): number {
    if (!hasActivity || value <= 0) return 0;
    // Scaled to 88% so the tallest bar leaves headroom for its direct label.
    return Math.max((value / maxValue) * 88, 3);
  }

  // First, middle, and last day as sparse x-axis labels.
  let axisLabels = $derived(
    entries.length === 0
      ? []
      : [...new Set([0, Math.floor((entries.length - 1) / 2), entries.length - 1])].map((i) => ({
          index: i,
          label: formatDay(entries[i].date),
        })),
  );
</script>

<div class="daily-activity-chart">
  {#if !hasActivity}
    <div class="empty-note typo-text-small">No {unitLabel} this wave</div>
  {/if}
  <div class="plot" class:muted={!hasActivity} role="img" aria-label="{unitLabel} per day">
    {#each entries as entry, i (entry.date)}
      <div
        class="bar-slot"
        data-tooltip="{formatDay(entry.date)}: {entry.value} {unitLabel}"
        aria-label="{formatDay(entry.date)}: {entry.value} {unitLabel}"
      >
        {#if hasActivity && i === maxIndex && entry.value > 0}
          <span class="bar-label typo-text-small tnum">{entry.value}</span>
        {/if}
        <div class="bar" style:height="{barHeightPct(entry.value)}%"></div>
      </div>
    {/each}
  </div>
  <div class="axis">
    {#each axisLabels as { index, label } (index)}
      <span
        class="axis-label typo-text-small tnum"
        style:left="{entries.length > 1 ? (index / (entries.length - 1)) * 100 : 50}%"
        class:first={index === 0}
        class:last={index === entries.length - 1}
      >
        {label}
      </span>
    {/each}
  </div>
</div>

<style>
  .daily-activity-chart {
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .empty-note {
    position: absolute;
    inset: 0 0 1.5rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-foreground-level-4);
    pointer-events: none;
  }

  .plot {
    display: flex;
    align-items: stretch;
    gap: 2px;
    height: 8rem;
    border-bottom: 1px solid var(--color-foreground-level-3);
  }

  .plot.muted {
    background-image: linear-gradient(
      to top,
      var(--color-foreground-level-1),
      var(--color-background)
    );
  }

  .bar-slot {
    flex: 1;
    min-width: 0;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 0.125rem;
    border-radius: 2px 2px 0 0;
  }

  .bar-slot:hover {
    background-color: var(--color-foreground-level-1);
  }

  /* Lightweight CSS tooltip. The app-wide Tooltip component only renders
     snippet content (its `text` prop is copy-only) and its fit-content
     wrapper breaks the bar height chain — and 31 instances each attach
     window listeners. A ::after bubble does the job here.

     `content: none` when not hovered — an always-rendered bubble (even at
     opacity 0) still counts as scrollable overflow and made the section
     scroll horizontally. */
  .bar-slot::after {
    content: none;
    position: absolute;
    bottom: calc(100% + 0.5rem);
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--color-background);
    color: var(--color-foreground);
    box-shadow: var(--elevation-medium);
    border-radius: 0.75rem 0 0.75rem 0.75rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    white-space: nowrap;
    pointer-events: none;
    z-index: 2;
    animation: tooltip-in 0.15s ease-out;
  }

  .bar-slot:hover::after {
    content: attr(data-tooltip);
  }

  /* Keep tooltips of bars near the edges inside the card. */
  .bar-slot:nth-child(-n + 4)::after {
    left: 0;
    transform: none;
  }

  .bar-slot:nth-last-child(-n + 4)::after {
    left: auto;
    right: 0;
    transform: none;
  }

  @keyframes tooltip-in {
    from {
      opacity: 0;
      translate: 0 2px;
    }
    to {
      opacity: 1;
      translate: 0 0;
    }
  }

  .bar {
    width: 100%;
    background-color: var(--color-primary-level-6);
    border-radius: 2px 2px 0 0;
    transition: height 0.3s ease;
  }

  .bar-label {
    color: var(--color-foreground-level-6);
    line-height: 1;
  }

  .axis {
    position: relative;
    height: 1.25rem;
    margin-top: 0.25rem;
  }

  .axis-label {
    position: absolute;
    transform: translateX(-50%);
    color: var(--color-foreground-level-4);
    white-space: nowrap;
  }

  .axis-label.first {
    transform: none;
  }

  .axis-label.last {
    transform: translateX(-100%);
  }
</style>

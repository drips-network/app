<script lang="ts">
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import ArrowUpRight from '$lib/components/icons/ArrowUpRight.svelte';
  import Stars from '$lib/components/icons/Stars.svelte';
  import formatDate from '$lib/utils/format-date';
  import type { WaveReportAiSummary } from '$lib/utils/wave/types/waveReport';

  let {
    aiSummary,
    reviewCount,
    generatedAt,
    basedOn = 'maintainers you worked with',
  }: {
    aiSummary: WaveReportAiSummary;
    reviewCount: number;
    generatedAt: Date | null;
    /** e.g. "maintainers you worked with" or "contributors who worked with your org" */
    basedOn?: string;
  } = $props();

  let paragraphs = $derived(
    aiSummary.summary
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean),
  );
</script>

<div class="ai-summary">
  <div class="card-header">
    <div class="icon-badge">
      <Stars style="height: 1.5rem; width: 1.5rem; fill: var(--color-primary-level-6)" />
    </div>
    <h3>Your Wave, summarized</h3>
    <span class="ai-pill typo-text-small">AI-generated</span>
  </div>

  <div class="summary-text">
    {#each paragraphs as paragraph, i (i)}
      <p class="typo-text">{paragraph}</p>
    {/each}
  </div>

  {#if aiSummary.strengths.length > 0 || aiSummary.growthAreas.length > 0}
    <div class="highlights">
      {#if aiSummary.strengths.length > 0}
        <div class="highlight-column">
          <h5>Strengths</h5>
          <ul>
            {#each aiSummary.strengths as strength, i (i)}
              <li>
                <span class="li-icon positive">
                  <CheckCircle style="height: 1.25rem; width: 1.25rem; fill: currentColor" />
                </span>
                <span class="typo-text">{strength}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
      {#if aiSummary.growthAreas.length > 0}
        <div class="highlight-column">
          <h5>Growth areas</h5>
          <ul>
            {#each aiSummary.growthAreas as growthArea, i (i)}
              <li>
                <span class="li-icon primary">
                  <ArrowUpRight style="height: 1.25rem; width: 1.25rem; fill: currentColor" />
                </span>
                <span class="typo-text">{growthArea}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  {/if}

  <p class="footnote typo-text-small">
    Based on {reviewCount}
    {reviewCount === 1 ? 'review' : 'reviews'} from {basedOn}{generatedAt
      ? `, generated ${formatDate(generatedAt, 'short')}`
      : ''}. AI-generated content may contain inaccuracies.
  </p>
</div>

<style>
  .ai-summary {
    position: relative;
    padding: 1.5rem;
    border-radius: 1rem 0 1rem 1rem;
    border: 1px solid var(--color-foreground-level-3);
    background-image: linear-gradient(
      160deg,
      var(--color-primary-level-1),
      var(--color-background) 70%
    );
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .icon-badge {
    height: 2.5rem;
    width: 2.5rem;
    border-radius: 50%;
    background-color: var(--color-primary-level-2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .ai-pill {
    padding: 0 0.5rem;
    border-radius: 0.5rem 0 0.5rem 0.5rem;
    background-color: var(--color-primary-level-2);
    color: var(--color-primary-level-6);
    white-space: nowrap;
  }

  .summary-text {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 48rem;
  }

  .highlights {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .highlight-column {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .highlight-column h5 {
    color: var(--color-foreground-level-6);
  }

  .highlight-column ul {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    list-style: none;
  }

  .highlight-column li {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .li-icon {
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .li-icon.positive {
    color: var(--color-positive-level-6);
  }

  .li-icon.primary {
    color: var(--color-primary-level-6);
  }

  .footnote {
    color: var(--color-foreground-level-5);
  }

  @media (max-width: 768px) {
    .highlights {
      grid-template-columns: 1fr;
    }
  }
</style>

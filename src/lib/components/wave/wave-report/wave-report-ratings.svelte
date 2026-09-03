<script lang="ts">
  export interface RatingDimension {
    key: string;
    value: number | null;
  }

  let {
    dimensions,
    overallExperience,
    experienceHeading,
  }: {
    dimensions: RatingDimension[];
    overallExperience: {
      belowExpectations: number;
      alright: number;
      exceededExpectations: number;
    };
    experienceHeading: string;
  } = $props();

  let experienceSegments = $derived(
    [
      {
        key: 'Exceeded expectations',
        count: overallExperience.exceededExpectations,
        colorClass: 'positive',
      },
      {
        key: 'Alright',
        count: overallExperience.alright,
        colorClass: 'neutral',
      },
      {
        key: 'Below expectations',
        count: overallExperience.belowExpectations,
        colorClass: 'negative',
      },
    ].filter((s) => s.count > 0),
  );

  let experienceTotal = $derived(experienceSegments.reduce((acc, s) => acc + s.count, 0));
</script>

<div class="ratings-breakdown">
  {#if experienceTotal > 0}
    <div class="experience">
      <h5>{experienceHeading}</h5>
      <div class="experience-bar" role="img" aria-label="Overall experience distribution">
        {#each experienceSegments as segment (segment.key)}
          <div
            class="experience-segment {segment.colorClass}"
            style:flex-grow={segment.count}
          ></div>
        {/each}
      </div>
      <div class="experience-legend">
        {#each experienceSegments as segment (segment.key)}
          <span class="legend-item typo-text-small">
            <span class="legend-dot {segment.colorClass}"></span>
            {segment.key}
            <span class="tnum legend-count">{segment.count}</span>
          </span>
        {/each}
      </div>
    </div>
  {/if}

  <div class="dimensions">
    {#each dimensions as dimension (dimension.key)}
      <div class="dimension">
        <div class="dimension-labels">
          <span class="typo-text-small">{dimension.key}</span>
          {#if dimension.value !== null}
            <span class="typo-text-small-bold tnum"
              >{dimension.value.toFixed(1)}<span class="out-of">/5</span></span
            >
          {:else}
            <span class="typo-text-small not-rated">Not rated</span>
          {/if}
        </div>
        <div class="meter-track">
          {#if dimension.value !== null}
            <div class="meter-fill" style:width="{(dimension.value / 5) * 100}%"></div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .ratings-breakdown {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
    padding: 1.5rem;
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
  }

  .dimensions {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1.25rem;
  }

  .dimension {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .dimension-labels {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .out-of {
    color: var(--color-foreground-level-4);
    font-weight: normal;
  }

  .not-rated {
    color: var(--color-foreground-level-4);
  }

  .meter-track {
    height: 0.5rem;
    border-radius: 0.25rem 0 0.25rem 0.25rem;
    background-color: var(--color-foreground-level-2);
    overflow: hidden;
  }

  .meter-fill {
    height: 100%;
    border-radius: 0.25rem 0 0.25rem 0.25rem;
    background-color: var(--color-primary-level-6);
    transition: width 0.4s ease;
  }

  .experience {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .experience h5 {
    color: var(--color-foreground-level-6);
  }

  .experience-bar {
    display: flex;
    gap: 2px;
    height: 0.5rem;
  }

  .experience-segment {
    border-radius: 0.25rem 0 0.25rem 0.25rem;
    min-width: 0.25rem;
  }

  .experience-segment.positive,
  .legend-dot.positive {
    background-color: var(--color-positive-level-6);
  }

  .experience-segment.neutral,
  .legend-dot.neutral {
    background-color: var(--color-foreground-level-4);
  }

  .experience-segment.negative,
  .legend-dot.negative {
    background-color: var(--color-negative-level-6);
  }

  .experience-legend {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .legend-dot {
    height: 0.5rem;
    width: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .legend-count {
    color: var(--color-foreground-level-5);
  }

  @media (max-width: 768px) {
    .ratings-breakdown {
      grid-template-columns: 1fr;
    }
  }
</style>

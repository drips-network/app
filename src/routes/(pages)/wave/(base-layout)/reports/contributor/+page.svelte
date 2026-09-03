<script lang="ts">
  import Section from '$lib/components/section/section.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Graph from '$lib/components/icons/Graph.svelte';
  import Star from '$lib/components/icons/Star.svelte';
  import WaveReportAiSummary from '$lib/components/wave/wave-report/wave-report-ai-summary.svelte';
  import WaveReportStatTiles from '$lib/components/wave/wave-report/wave-report-stat-tiles.svelte';
  import WaveReportRatings from '$lib/components/wave/wave-report/wave-report-ratings.svelte';
  import DailyActivityChart from '$lib/components/wave/wave-report/daily-activity-chart.svelte';

  let { data } = $props();
  let { selectedWaveId, report } = $derived(data);

  let stats = $derived(report?.stats ?? null);

  let tiles = $derived(
    stats
      ? [
          {
            key: 'Points earned',
            value: stats.totals.pointsEarned,
            pctChange: stats.waveOverWave.pointsEarnedPctChange,
          },
          {
            key: 'Issues resolved',
            value: stats.totals.issuesResolved,
            pctChange: stats.waveOverWave.issuesResolvedPctChange,
          },
          {
            key: 'Applications',
            value: stats.totals.applicationsSubmitted,
            pctChange: stats.waveOverWave.applicationsSubmittedPctChange,
          },
          {
            key: 'Reviews received',
            value: stats.ratings.reviewCount,
            pctChange: null,
          },
        ]
      : [],
  );

  let ratingDimensions = $derived(
    stats
      ? [
          { key: 'Communication', value: stats.ratings.averages.communicationQuality },
          { key: 'Code quality', value: stats.ratings.averages.codeQuality },
          { key: 'Timeliness', value: stats.ratings.averages.timeliness },
          { key: 'Problem solving', value: stats.ratings.averages.problemSolving },
        ]
      : [],
  );

  let pointsPerDay = $derived(
    stats?.histograms.pointsPerDay.map((e) => ({ date: e.date, value: e.points })) ?? [],
  );
  let applicationsPerDay = $derived(
    stats?.histograms.applicationsPerDay.map((e) => ({ date: e.date, value: e.count })) ?? [],
  );

  let reportPreparing = $derived(
    report !== null && (report.status === 'pending' || report.status === 'failed'),
  );
</script>

{#if !selectedWaveId}
  <Section
    skeleton={{
      loaded: true,
      empty: true,
      emptyStateEmoji: '🫧',
      emptyStateHeadline: 'No waves yet',
      emptyStateText: 'Once this Wave Program has run its first wave, your stats will show here.',
    }}
  />
{:else if report === null}
  <Section
    skeleton={{
      loaded: true,
      empty: true,
      emptyStateEmoji: '🫧',
      emptyStateHeadline: 'No report for this wave',
      emptyStateText:
        'Personal reports are generated shortly after a wave’s review period ends. If you participated in this wave, check back soon.',
    }}
  />
{:else if reportPreparing || !stats}
  <Section
    skeleton={{
      loaded: true,
      empty: true,
      emptyStateEmoji: '⏳',
      emptyStateHeadline: 'Your report is being prepared',
      emptyStateText: 'We’re crunching the numbers for this wave. Check back in a bit!',
    }}
  />
{:else}
  {#if report.status === 'completed' && report.aiSummary}
    <WaveReportAiSummary
      aiSummary={report.aiSummary}
      reviewCount={stats.ratings.reviewCount}
      generatedAt={report.generatedAt}
    />
  {:else if report.status === 'insufficient_data'}
    <AnnotationBox type="info">
      You didn’t resolve enough issues in this wave to unlock a personal AI summary of your
      maintainer feedback. Resolve at least 5 issues in a wave to see one here.
    </AnnotationBox>
  {/if}

  <WaveReportStatTiles {tiles} previousWaveNumber={stats.waveOverWave.previousWaveNumber} />

  <Section
    header={{
      icon: Star,
      label: 'Maintainer feedback',
      infoTooltip: 'How maintainers rated working with you on the issues you completed this wave.',
    }}
    skeleton={{
      loaded: true,
      empty: stats.ratings.reviewCount === 0,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: 'No reviews received',
      emptyStateText: 'None of the maintainers you worked with this wave submitted a review.',
    }}
  >
    <WaveReportRatings
      dimensions={ratingDimensions}
      overallExperience={stats.ratings.overallExperience}
      experienceHeading="Overall experience working with you"
    />
  </Section>

  <Section
    header={{
      icon: Graph,
      label: 'Daily activity',
    }}
    skeleton={{ loaded: true }}
  >
    <div class="charts">
      <div class="chart-card">
        <h5>Points earned per day</h5>
        <DailyActivityChart entries={pointsPerDay} unitLabel="points" />
      </div>
      <div class="chart-card">
        <h5>Applications submitted per day</h5>
        <DailyActivityChart entries={applicationsPerDay} unitLabel="applications" />
      </div>
    </div>
  </Section>
{/if}

<style>
  .charts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .chart-card {
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
  }

  .chart-card h5 {
    color: var(--color-foreground-level-6);
  }

  @media (max-width: 768px) {
    .charts {
      grid-template-columns: 1fr;
    }
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Chart,
    BarController,
    BarElement,
    LineController,
    LineElement,
    PointElement,
    DoughnutController,
    ArcElement,
    RadarController,
    RadialLinearScale,
    CategoryScale,
    LinearScale,
    Tooltip as ChartTooltip,
    Legend,
    Filler,
  } from 'chart.js';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import Coin from '$lib/components/icons/Coin.svelte';
  import Issue from '$lib/components/icons/Issue.svelte';
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import Review from '$lib/components/icons/Review.svelte';
  import Star from '$lib/components/icons/Star.svelte';
  import type { ContributorStatsResponse } from '$lib/utils/wave/types/stats.js';

  Chart.register(
    BarController,
    BarElement,
    LineController,
    LineElement,
    PointElement,
    DoughnutController,
    ArcElement,
    RadarController,
    RadialLinearScale,
    CategoryScale,
    LinearScale,
    ChartTooltip,
    Legend,
    Filler,
  );

  let { data } = $props();
  let { stats, aiSummary } = $derived(data);

  // Canvas refs
  let pointsCanvas: HTMLCanvasElement | undefined = $state();
  let issuesCanvas: HTMLCanvasElement | undefined = $state();
  let reviewExpCanvas: HTMLCanvasElement | undefined = $state();
  let reviewRatingsCanvas: HTMLCanvasElement | undefined = $state();
  let leaderboardCanvases: Record<string, HTMLCanvasElement> = $state({});

  // Chart instances for cleanup
  let charts: Chart[] = [];

  // Theme colors
  let colors = $state({
    primary: '#5555ff',
    positive: '#00a83e',
    caution: '#e0a800',
    negative: '#d32f2f',
    foreground5: '#999999',
    foreground: '#000000',
    background: '#ffffff',
    primaryLevel2: '#e8e8ff',
  });

  function readCssColors() {
    const s = getComputedStyle(document.documentElement);
    colors = {
      primary: s.getPropertyValue('--color-primary').trim() || colors.primary,
      positive: s.getPropertyValue('--color-positive').trim() || colors.positive,
      caution: s.getPropertyValue('--color-caution').trim() || colors.caution,
      negative: s.getPropertyValue('--color-negative').trim() || colors.negative,
      foreground5: s.getPropertyValue('--color-foreground-level-5').trim() || colors.foreground5,
      foreground: s.getPropertyValue('--color-foreground').trim() || colors.foreground,
      background: s.getPropertyValue('--color-background').trim() || colors.background,
      primaryLevel2: s.getPropertyValue('--color-primary-level-2').trim() || colors.primaryLevel2,
    };
  }

  function destroyCharts() {
    for (const c of charts) c.destroy();
    charts = [];
  }

  function buildCharts() {
    destroyCharts();
    readCssColors();

    const fontFamily = getComputedStyle(document.documentElement)
      .getPropertyValue('--typeface-regular')
      .trim();

    Chart.defaults.font.family = fontFamily || undefined;
    Chart.defaults.color = colors.foreground5;

    // Points bar chart
    if (pointsCanvas && stats.points.byWave.length > 0) {
      const byWave = stats.points.byWave;
      const programColors = assignProgramColors(byWave);

      charts.push(
        new Chart(pointsCanvas, {
          type: 'bar',
          data: {
            labels: byWave.map((w) => `${w.waveProgramName} W${w.waveNumber}`),
            datasets: [
              {
                data: byWave.map((w) => w.points),
                backgroundColor: byWave.map((w) => programColors[w.waveProgramId]),
                borderRadius: 6,
                borderSkipped: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: colors.primaryLevel2 },
              },
              x: {
                grid: { display: false },
              },
            },
          },
        }),
      );
    }

    // Issues doughnut chart
    if (issuesCanvas && stats.issues.totalResolved > 0) {
      const c = stats.issues.byComplexity;
      const segments = [
        { label: 'Small', value: c.small, color: colors.positive },
        { label: 'Medium', value: c.medium, color: colors.caution },
        { label: 'Large', value: c.large, color: colors.negative },
        { label: 'Unset', value: c.unset, color: colors.foreground5 },
      ].filter((s) => s.value > 0);

      charts.push(
        new Chart(issuesCanvas, {
          type: 'doughnut',
          data: {
            labels: segments.map((s) => s.label),
            datasets: [
              {
                data: segments.map((s) => s.value),
                backgroundColor: segments.map((s) => s.color),
                borderWidth: 2,
                borderColor: colors.background,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' },
            },
          },
        }),
      );
    }

    // Leaderboard charts
    for (const program of stats.leaderboard.byProgram) {
      const canvas = leaderboardCanvases[program.waveProgramId];
      if (!canvas || program.waves.length <= 1) continue;

      charts.push(
        new Chart(canvas, {
          type: 'line',
          data: {
            labels: program.waves.map((w) => `Wave ${w.waveNumber}`),
            datasets: [
              {
                label: 'Rank',
                data: program.waves.map((w) => w.rank),
                borderColor: colors.primary,
                backgroundColor: colors.primaryLevel2,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                reverse: true,
                beginAtZero: false,
                min: 1,
                ticks: { stepSize: 1 },
                title: { display: true, text: 'Rank' },
                grid: { color: colors.primaryLevel2 },
              },
              x: {
                grid: { display: false },
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const wave = program.waves[ctx.dataIndex];
                    return `Rank ${wave.rank} of ${wave.totalParticipants} participants (${wave.points} pts)`;
                  },
                },
              },
            },
          },
        }),
      );
    }

    // Reviews experience doughnut
    if (reviewExpCanvas && stats.reviews) {
      const d = stats.reviews.experienceDistribution;
      const segments = [
        { label: 'Exceeded expectations', value: d.exceededExpectations, color: colors.positive },
        { label: 'Alright', value: d.alright, color: colors.caution },
        { label: 'Below expectations', value: d.belowExpectations, color: colors.negative },
      ].filter((s) => s.value > 0);

      charts.push(
        new Chart(reviewExpCanvas, {
          type: 'doughnut',
          data: {
            labels: segments.map((s) => s.label),
            datasets: [
              {
                data: segments.map((s) => s.value),
                backgroundColor: segments.map((s) => s.color),
                borderWidth: 2,
                borderColor: colors.background,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' },
            },
          },
        }),
      );
    }

    // Reviews ratings radar
    if (reviewRatingsCanvas && stats.reviews) {
      const r = stats.reviews.averageRatings;
      const ratingLabels = ['Communication', 'Code Quality', 'Timeliness', 'Problem Solving'];
      const ratingValues = [r.communicationQuality, r.codeQuality, r.timeliness, r.problemSolving];

      if (ratingValues.some((v) => v !== null)) {
        charts.push(
          new Chart(reviewRatingsCanvas, {
            type: 'radar',
            data: {
              labels: ratingLabels,
              datasets: [
                {
                  label: 'Average Rating',
                  data: ratingValues.map((v) => v ?? 0),
                  borderColor: colors.primary,
                  backgroundColor: colors.primaryLevel2,
                  fill: true,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  min: 0,
                  max: 5,
                  ticks: { stepSize: 1 },
                  grid: { color: colors.primaryLevel2 },
                  pointLabels: {
                    font: { size: 12 },
                  },
                },
              },
              plugins: {
                legend: { display: false },
              },
            },
          }),
        );
      }
    }
  }

  function assignProgramColors(
    byWave: ContributorStatsResponse['points']['byWave'],
  ): Record<string, string> {
    const palette = [colors.primary, colors.positive, colors.caution, colors.negative];
    const programIds = [...new Set(byWave.map((w) => w.waveProgramId))];
    const map: Record<string, string> = {};
    for (let i = 0; i < programIds.length; i++) {
      map[programIds[i]] = palette[i % palette.length];
    }
    return map;
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  onMount(() => {
    buildCharts();
    return () => destroyCharts();
  });
</script>

<HeadMeta title="My Stats | Wave" />

<div class="stats-grid">
  <!-- Points -->
  <Card>
    <div class="card-content">
      <SectionHeader label="Points" icon={Coin} />
      {#if stats.points.byWave.length === 0 && stats.points.totalAllTime === 0}
        <p class="typo-text-small empty-text">
          Earn points by completing issues within active Waves.
        </p>
      {:else}
        <div class="stat-highlight">
          <span class="stat-number typo-header-1">{stats.points.totalAllTime.toLocaleString()}</span
          >
          <span class="stat-label typo-text-small">Total points earned</span>
        </div>
        {#if stats.points.byWave.length > 0}
          <div class="chart-container">
            <canvas bind:this={pointsCanvas}></canvas>
          </div>
        {/if}
      {/if}
    </div>
  </Card>

  <!-- Issues -->
  <Card>
    <div class="card-content">
      <SectionHeader label="Issues" icon={Issue} />
      {#if stats.issues.totalResolved === 0}
        <p class="typo-text-small empty-text">Start contributing to see your issue stats here.</p>
      {:else}
        <div class="stat-highlight">
          <span class="stat-number typo-header-1">{stats.issues.totalResolved}</span>
          <span class="stat-label typo-text-small">Issues resolved</span>
        </div>
        <div class="chart-container chart-container-small">
          <canvas bind:this={issuesCanvas}></canvas>
        </div>
      {/if}
    </div>
  </Card>

  <!-- Leaderboard Ranks -->
  <Card>
    <div class="card-content">
      <SectionHeader label="Leaderboard Ranks" icon={Trophy} />
      {#if stats.leaderboard.byProgram.length === 0}
        <p class="typo-text-small empty-text">Participate in a Wave to see your rankings.</p>
      {:else}
        {#each stats.leaderboard.byProgram as program (program.waveProgramId)}
          <div class="leaderboard-program">
            <h4 class="typo-text-small-bold">{program.waveProgramName}</h4>
            {#if program.waves.length === 1}
              {@const wave = program.waves[0]}
              <div class="rank-card">
                <span class="stat-number typo-header-2">#{wave.rank}</span>
                <span class="stat-label typo-text-small">
                  of {wave.totalParticipants} participants &middot; Wave {wave.waveNumber} &middot; {wave.points}
                  pts
                </span>
              </div>
            {:else}
              <div class="chart-container">
                <canvas bind:this={leaderboardCanvases[program.waveProgramId]}></canvas>
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  </Card>

  <!-- Reviews -->
  <Card>
    <div class="card-content">
      <SectionHeader label="Reviews" icon={Review} />
      {#if stats.reviews === null}
        <p class="typo-text-small empty-text">Not enough reviews to display stats yet.</p>
      {:else}
        <div class="stat-highlight">
          <span class="stat-number typo-header-1">{stats.reviews.totalReceived}</span>
          <span class="stat-label typo-text-small">Reviews received</span>
        </div>
        <div class="review-charts">
          <div class="chart-container chart-container-small">
            <p class="typo-text-small-bold chart-label">Experience distribution</p>
            <canvas bind:this={reviewExpCanvas}></canvas>
          </div>
          <div class="chart-container chart-container-small">
            <p class="typo-text-small-bold chart-label">Average ratings</p>
            <canvas bind:this={reviewRatingsCanvas}></canvas>
          </div>
        </div>
      {/if}
    </div>
  </Card>

  <!-- AI Summary -->
  <div class="full-width">
    <Card>
      <div class="card-content">
        <SectionHeader label="AI Feedback Summary" icon={Star} />
        {#if aiSummary.summary === null}
          <p class="typo-text-small empty-text">
            Your AI feedback summary hasn't been generated yet.
          </p>
        {:else}
          <p class="typo-text">{aiSummary.summary}</p>
          {#if aiSummary.generatedAt}
            <p class="typo-text-small summary-footer">
              Generated on {formatDate(aiSummary.generatedAt)}
            </p>
          {/if}
        {/if}
      </div>
    </Card>
  </div>
</div>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .full-width {
    grid-column: 1 / -1;
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .empty-text {
    color: var(--color-foreground-level-5);
  }

  .stat-highlight {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-number {
    color: var(--color-foreground);
  }

  .stat-label {
    color: var(--color-foreground-level-5);
  }

  .chart-container {
    position: relative;
    height: 16rem;
    width: 100%;
  }

  .chart-container-small {
    height: 14rem;
  }

  .chart-label {
    color: var(--color-foreground-level-5);
    margin-bottom: 0.5rem;
  }

  .review-charts {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .leaderboard-program {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .rank-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: center;
    text-align: center;
    padding: 0.5rem 0;
  }

  .summary-footer {
    color: var(--color-foreground-level-5);
  }
</style>

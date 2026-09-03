<script lang="ts">
  import Section from '$lib/components/section/section.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import Graph from '$lib/components/icons/Graph.svelte';
  import Star from '$lib/components/icons/Star.svelte';
  import WaveReportAiSummary from '$lib/components/wave/wave-report/wave-report-ai-summary.svelte';
  import WaveReportStatTiles from '$lib/components/wave/wave-report/wave-report-stat-tiles.svelte';
  import WaveReportRatings from '$lib/components/wave/wave-report/wave-report-ratings.svelte';
  import DailyActivityChart from '$lib/components/wave/wave-report/daily-activity-chart.svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { SvelteURLSearchParams } from 'svelte/reactivity';

  let { data } = $props();
  let { selectedWaveId, orgReports, selectedOrgId } = $derived(data);

  let orgDropdownOptions = $derived(
    orgReports.map((entry) => ({
      value: entry.org.id,
      title: entry.org.gitHubOrgName ?? entry.org.gitHubOrgLogin,
      iconUrl: entry.org.gitHubOrgAvatarUrl ?? undefined,
    })),
  );

  function handleOrgChange(value: string) {
    const params = new SvelteURLSearchParams(page.url.search);
    params.set('orgId', value);
    goto(`${page.url.pathname}?${params.toString()}`, { keepFocus: true, noScroll: true });
  }

  let selectedOrgEntry = $derived(
    orgReports.find((entry) => entry.org.id === selectedOrgId) ?? null,
  );
  let orgReport = $derived(selectedOrgEntry?.report ?? null);
  let stats = $derived(orgReport?.stats ?? null);
  let selectedOrgName = $derived(
    selectedOrgEntry
      ? (selectedOrgEntry.org.gitHubOrgName ?? selectedOrgEntry.org.gitHubOrgLogin)
      : '',
  );

  let tiles = $derived(
    stats
      ? [
          {
            key: 'Points awarded',
            value: stats.totals.pointsAwarded,
            pctChange: stats.waveOverWave.pointsAwardedPctChange,
          },
          {
            key: 'Issues completed',
            value: stats.totals.issuesCompleted,
            pctChange: stats.waveOverWave.issuesCompletedPctChange,
          },
          {
            key: 'Applications received',
            value: stats.totals.applicationsReceived,
            pctChange: stats.waveOverWave.applicationsReceivedPctChange,
          },
          {
            key: 'Contributors',
            value: stats.totals.uniqueContributors,
            pctChange: null,
          },
        ]
      : [],
  );

  let ratingDimensions = $derived(
    stats
      ? [
          { key: 'Maintainer communication', value: stats.ratings.averages.communicationQuality },
          { key: 'Repo code quality', value: stats.ratings.averages.repoCodeQuality },
          { key: 'Issue clarity', value: stats.ratings.averages.issueClarity },
          { key: 'Timeliness', value: stats.ratings.averages.timeliness },
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
    orgReport !== null && (orgReport.status === 'pending' || orgReport.status === 'failed'),
  );
</script>

{#if !selectedWaveId}
  <Section
    skeleton={{
      loaded: true,
      empty: true,
      emptyStateEmoji: '🫧',
      emptyStateHeadline: 'No waves yet',
      emptyStateText: 'Once this Wave Program has run its first wave, org stats will show here.',
    }}
  />
{:else if orgReports.length === 0}
  <Section
    skeleton={{
      loaded: true,
      empty: true,
      emptyStateEmoji: '🫙',
      emptyStateHeadline: 'You don’t maintain any orgs',
      emptyStateText: 'Org reports are available to members of GitHub orgs participating in Wave.',
    }}
  />
{:else}
  <div
    class="org-selector"
    style:view-transition-name="reports-org-selector"
    style:view-transition-class="element-handover"
  >
    <Dropdown
      options={orgDropdownOptions}
      value={selectedOrgId ?? undefined}
      onchange={handleOrgChange}
    />
  </div>

  {#if orgReport === null}
    <Section
      skeleton={{
        loaded: true,
        empty: true,
        emptyStateEmoji: '🫧',
        emptyStateHeadline: 'No report for this wave',
        emptyStateText: `Org reports are generated shortly after a wave’s review period ends. If ${selectedOrgName} participated in this wave, check back soon.`,
      }}
    />
  {:else if reportPreparing || !stats}
    <Section
      skeleton={{
        loaded: true,
        empty: true,
        emptyStateEmoji: '⏳',
        emptyStateHeadline: 'This report is being prepared',
        emptyStateText: 'We’re crunching the numbers for this wave. Check back in a bit!',
      }}
    />
  {:else}
    {#if orgReport.status === 'completed' && orgReport.aiSummary}
      <WaveReportAiSummary
        aiSummary={orgReport.aiSummary}
        reviewCount={stats.ratings.reviewCount}
        generatedAt={orgReport.generatedAt}
        basedOn="contributors who worked with {selectedOrgName}"
      />
    {:else if orgReport.status === 'insufficient_data'}
      <AnnotationBox type="info">
        {selectedOrgName} didn’t have enough completed issues in this wave to unlock an AI summary of
        its contributor feedback. Complete at least 5 issues in a wave to see one here.
      </AnnotationBox>
    {/if}

    <WaveReportStatTiles {tiles} previousWaveNumber={stats.waveOverWave.previousWaveNumber} />

    <Section
      header={{
        icon: Star,
        label: 'Contributor feedback',
        infoTooltip:
          'How contributors rated working with this org on the issues they completed this wave.',
      }}
      skeleton={{
        loaded: true,
        empty: stats.ratings.reviewCount === 0,
        emptyStateEmoji: '🫙',
        emptyStateHeadline: 'No reviews received',
        emptyStateText:
          'None of the contributors who worked with this org this wave submitted a review.',
      }}
    >
      <WaveReportRatings
        dimensions={ratingDimensions}
        overallExperience={stats.ratings.overallExperience}
        experienceHeading="Overall contributor experience with {selectedOrgName}"
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
          <h5>Points awarded per day</h5>
          <DailyActivityChart entries={pointsPerDay} unitLabel="points" />
        </div>
        <div class="chart-card">
          <h5>Applications received per day</h5>
          <DailyActivityChart entries={applicationsPerDay} unitLabel="applications" />
        </div>
      </div>
    </Section>
  {/if}
{/if}

<style>
  .org-selector {
    max-width: 20rem;
    /* view-transition-name creates a stacking context at z-index auto, which
       would trap the dropdown's options behind later positioned siblings
       (e.g. the AI summary card). Lift the whole context above the content
       but below the sticky tab bar (z-index 2). */
    position: relative;
    z-index: 1;
  }

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

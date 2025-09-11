<script lang="ts">
  import { fade } from 'svelte/transition';
  import OsoLogo from '../illustrations/oso-logo.svelte';
  import MetricsGrid from '../metrics-grid/metrics-grid.svelte';
  import RpgfApplicationDetailsCard from '../rpgf-application-details-card/rpgf-application-details-card.svelte';

  export let keyMetrics: Promise<Record<string, string>>;

  const METRICS = {
    GITHUB_commits_over_all_time: 'Commits',
    GITHUB_contributors_over_all_time: 'Contributors',
    GITHUB_stars_over_all_time: 'Stars',
    GITHUB_forks_over_all_time: 'Forks',
    GITHUB_opened_issues_over_all_time: 'Issues',
  };
</script>

<RpgfApplicationDetailsCard title="Key code metrics" key="key-metrics">
  <svelte:fragment slot="right">
    <div
      class="oso-logo typo-text-small"
      style:display="flex"
      style:align-items="center"
      style:gap="0.25rem"
      style:white-space="nowrap"
    >
      <span>Powered by</span>
      <OsoLogo />
      <span class="typo-text-small-bold">Open Source Observer</span>
    </div>
  </svelte:fragment>

  <div class="content-wrapper">
    {#await keyMetrics}
      <div class="skeleton" />
    {:then value}
      <div in:fade={{ duration: 200 }} class="metrics-content">
        {#if Object.keys(value).length === 0}
          <div class="no-data">
            <span class="typo-text-small" style:color="var(--color-foreground-level-5)"
              >Repository not found on Open Source Observer.
              <a
                href="https://docs.opensource.observer/docs/projects/"
                target="_blank"
                class="typo-link">Learn how to add your repository</a
              >
            </span>
          </div>
        {:else}
          <MetricsGrid metricsMap={METRICS} data={value} />
        {/if}
      </div>
    {:catch}
      <div class="no-data">
        <span class="typo-text-small" style:color="var(--color-foreground-level-5)"
          >An error occured while fetching data from Open Source Observer.
        </span>
      </div>
    {/await}

    <!-- When there is no data being displayed, add a hidden element that makes the
         height of the content the same to keep the layout stable. -->
    {#await keyMetrics}
      <div class="height-placeholder" style:visibility="hidden">
        <MetricsGrid metricsMap={METRICS} data={{}} />
      </div>
    {/await}
  </div>
</RpgfApplicationDetailsCard>

<style>
  .content-wrapper {
    position: relative;
  }

  .skeleton {
    width: 100%;
    position: absolute;
    height: 100%;
    border-radius: 0.5rem;
    background-color: var(--color-foreground-level-3);
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.5;
    }
  }

  .no-data {
    min-height: 4rem;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .oso-logo {
    opacity: 0.5;
  }
</style>

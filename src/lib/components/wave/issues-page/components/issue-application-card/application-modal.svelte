<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ExpandableText from '$lib/components/expandable-text/expandable-text.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import Device from '$lib/components/icons/Device.svelte';
  import Graph from '$lib/components/icons/Graph.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import Markdown from '$lib/components/markdown/markdown.svelte';
  import ProgrammingLanguageBreakdown from '$lib/components/programming-language-breakdown/programming-language-breakdown.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import GithubUserBadge from '$lib/components/wave/github-user-badge/github-user-badge.svelte';
  import { type UserCodeMetricsDto, type WaveUser } from '$lib/utils/wave/types/user';
  import BinBadge from './bin-badge.svelte';
  import Metric from './metric.svelte';
  import { KEY_METRICS, TABLE_METRICS } from './metrics';

  interface Props {
    codeMetricsPromise: Promise<UserCodeMetricsDto | null>;
    applicant: WaveUser;
    applicationText: string;
    appliedAt: Date;
  }

  let { codeMetricsPromise, applicant, appliedAt, applicationText }: Props = $props();
</script>

<div class="application-modal">
  <section class="hero">
    <GithubUserBadge hideName size={48} user={applicant} />

    <div class="name-and-date">
      <div class="name-row typo-header-2">
        {applicant.gitHubUsername}
        <Button
          icon={ArrowBoxUpRight}
          size="small"
          href="/wave/users/{applicant.id}"
          target="_blank">View profile</Button
        >
      </div>
      <span style:color="var(--color-foreground-level-5)" class="typo-text-small"
        >Applied on {appliedAt.toLocaleDateString()}</span
      >
    </div>
  </section>

  <section>
    <SectionHeader label="Application text" icon={Pen} />

    <ExpandableText>
      <Markdown content={applicationText} />
    </ExpandableText>
  </section>

  <section>
    <SectionHeader label="Languages" icon={Device} />

    {#await codeMetricsPromise}
      <div class="no-data typo-text">Loading...</div>
    {:then metrics}
      {#if metrics && metrics.lifetime_language_profile.length > 0}
        <ProgrammingLanguageBreakdown languageProfile={metrics.lifetime_language_profile} />
      {:else}
        <div class="no-data typo-text">No data available</div>
      {/if}
    {/await}
  </section>

  <section>
    <SectionHeader label="Code metrics" icon={Graph} />

    <div class="key-metrics-grid">
      {#each KEY_METRICS as { key, label, description, fmt } (key)}
        <div class="key-metric">
          <div class="label typo-text">
            {label}
            {#if description}
              <Tooltip>
                <InfoCircle style="height: 1.25rem; width: 1.25rem;" />
                {#snippet tooltip_content()}
                  <div class="typo-text-small">{description}</div>
                {/snippet}
              </Tooltip>
            {/if}
          </div>
          <div class="value">
            <Metric {codeMetricsPromise} {key} {fmt} />
            <BinBadge {codeMetricsPromise} {key} />
          </div>
        </div>
      {/each}
    </div>

    <ul class="statistics">
      {#each TABLE_METRICS as { key, label, description, fmt } (key)}
        <li class="statistic typo-text-small">
          <span class="label">
            {label}
            {#if description}
              <Tooltip>
                <InfoCircle style="height: 1.25rem; width: 1.25rem;" />
                {#snippet tooltip_content()}
                  <div class="typo-text-small">{description}</div>
                {/snippet}
              </Tooltip>
            {/if}
          </span>
          <span class="value">
            <BinBadge {codeMetricsPromise} {key} />
            <Metric {codeMetricsPromise} {key} {fmt} />
          </span>
        </li>
      {/each}
    </ul>
  </section>
  <a href="https://docs.drips.network/wave/applicant-metrics" class="typo-link" target="_blank">
    Learn more about these metrics
  </a>
</div>

<style>
  .application-modal {
    padding: 1.5rem;
    width: 100%;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .hero {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }

  .hero .name-and-date {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .hero .name-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.25rem;
  }

  .key-metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 0.5rem;
  }

  .key-metric {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0.5rem;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 0.5rem 0 0.5rem 0.5rem;
  }

  .statistics {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .statistic {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-foreground-level-2);
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .statistic:last-child {
    border-bottom: none;
  }

  .label {
    color: var(--color-foreground-level-6);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .value {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .no-data {
    color: var(--color-foreground-level-5);
  }

  @media (max-width: 500px) {
    .statistic {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>

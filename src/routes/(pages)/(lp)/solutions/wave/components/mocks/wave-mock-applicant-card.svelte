<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import WaveMockBinBadge from './wave-mock-bin-badge.svelte';
  import WaveMockUserBadge from './wave-mock-user-badge.svelte';

  let {
    user,
    text,
    metrics,
    pointsThisWave,
    assignmentsThisWave,
    highlighted = false,
    width,
    showActions = false,
    status = 'pending',
    acceptVariant = 'normal',
    acceptButtonRef = $bindable<HTMLElement | null>(null),
  }: {
    user: { name: string; avatarUrl?: string; verified?: boolean };
    text: string;
    metrics: {
      ossActivity: 'good' | 'mid' | 'bad';
      mergedPRs: { value: number; bin: 'good' | 'mid' | 'bad' };
      mergeRate: { value: string; bin: 'good' | 'mid' | 'bad' };
    };
    pointsThisWave?: number;
    assignmentsThisWave?: number;
    highlighted?: boolean;
    width?: string;
    showActions?: boolean;
    /** When 'accepted', the action area shows the disabled "Applicant assigned" pill */
    status?: 'pending' | 'accepted';
    /** Visual variant of the Accept & assign button. Used by callers to highlight one card */
    acceptVariant?: 'normal' | 'primary';
    /** Bound to the Accept & assign button wrapper so the parent can target it (e.g. cursor anim) */
    acceptButtonRef?: HTMLElement | null;
  } = $props();
</script>

<div class="applicant" class:highlighted style:width>
  <WaveMockUserBadge name={user.name} avatarUrl={user.avatarUrl} verified={user.verified} />

  <p class="text typo-text-small">{text}</p>

  <hr class="divider" />

  <div class="metrics">
    {#if assignmentsThisWave !== undefined}
      <div class="metric">
        <span class="label typo-text-small">Assignments this Wave</span>
        <span class="value typo-text-small-bold">{assignmentsThisWave}</span>
      </div>
    {/if}
    {#if pointsThisWave !== undefined}
      <div class="metric">
        <span class="label typo-text-small">Points earned this Wave</span>
        <span class="value typo-text-small-bold">{pointsThisWave}</span>
      </div>
    {/if}
    <div class="metric">
      <span class="label typo-text-small">OSS Activity Score</span>
      <WaveMockBinBadge bin={metrics.ossActivity} />
    </div>
    <div class="metric">
      <span class="label typo-text-small">Total Merged PRs</span>
      <WaveMockBinBadge bin={metrics.mergedPRs.bin} label={String(metrics.mergedPRs.value)} />
    </div>
    <div class="metric">
      <span class="label typo-text-small">PR Merge Rate</span>
      <WaveMockBinBadge bin={metrics.mergeRate.bin} label={metrics.mergeRate.value} />
    </div>
  </div>

  {#if showActions}
    <hr class="divider" />

    <div class="actions">
      <Button>View details</Button>
      {#if status === 'pending'}
        <div class="accept-wrap" bind:this={acceptButtonRef}>
          <Button variant={acceptVariant} icon={Check}>Accept & assign</Button>
        </div>
      {:else}
        <Button icon={Check} disabled>Applicant assigned</Button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .applicant {
    padding: 1rem;
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    box-sizing: border-box;
  }

  .applicant.highlighted {
    background-color: var(--color-primary-level-1);
    border-color: var(--color-primary-level-2);
  }

  .text {
    color: var(--color-foreground-level-7);
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    /* Don't let the line-clamped box collapse to 0 inside a flex column parent
       under any height pressure — the 2-line height must be honored. */
    flex-shrink: 0;
  }

  .divider {
    border: none;
    border-top: 1px solid var(--color-foreground-level-2);
    margin: 0;
  }

  .metrics {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .metric {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .metric .label {
    color: var(--color-foreground-level-6);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Wrapper exists only to give the cursor animation a stable bindable element.
     It needs to be display: flex so the Button inside stretches to full width
     like its (non-wrapped) siblings. */
  .accept-wrap {
    display: flex;
    flex-direction: column;
  }
</style>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import GithubOrgBadge from '$lib/components/wave/github-org-badge/github-org-badge.svelte';
  import FlowStepWrapper from '../../../shared/flow-step-wrapper.svelte';
  import type { ApplicationLimitStatus } from '$lib/utils/wave/types/waveProgram';

  let { data } = $props();

  const perUser = $derived(data.applicationLimits.perUser);

  // The per-user limit is a single pool shared across every org, so it's the
  // headline number. `null` = no personal limit.
  let personalRemaining = $derived(
    perUser.limit === null ? null : Math.max(perUser.remaining ?? 0, 0),
  );
  let perUserFull = $derived(perUser.limit !== null && personalRemaining === 0);

  // Join the per-org usage rows with the org details so we can render names.
  let orgRows = $derived(
    data.applicationLimits.perOrg
      .filter((row) => row.limit !== null)
      .map((row) => ({
        status: row,
        org: data.ownOrgs.data.find((o) => o.org.id === row.orgId)?.org,
      }))
      .filter((row) => row.org !== undefined),
  );

  // Each repo counts against both the personal pool and its org, so an org only
  // restricts you *further* when its own remaining is below your personal
  // remaining. Orgs with more room than your personal cap can never be the
  // binding limit, so we don't show them. When there's no personal limit, every
  // org limit is binding.
  let bindingOrgRows = $derived(
    orgRows.filter(({ status }) => {
      const orgRemaining = Math.max(status.remaining ?? 0, 0);
      return personalRemaining === null || orgRemaining < personalRemaining;
    }),
  );

  let description = $derived.by(() => {
    const name = data.waveProgram.name;
    if (perUser.limit === null) {
      return `${name} doesn't limit how many repos you can apply overall, but some of your organizations have their own per-cycle limit.`;
    }
    if (perUserFull) {
      return `You've used all your repo applications for ${name} this Wave cycle. Your limit resets when the next Wave begins.`;
    }
    const n = personalRemaining ?? 0;
    return `You can apply ${n} more ${
      n === 1 ? 'repo' : 'repos'
    } to ${name} this Wave cycle, across all your organizations.`;
  });

  function orgRemainingLabel(status: ApplicationLimitStatus) {
    const remaining = Math.max(status.remaining ?? 0, 0);
    if (remaining === 0) return 'Org limit reached';
    return `${remaining} of ${status.limit} remaining`;
  }

  function meterFraction(status: ApplicationLimitStatus) {
    if (status.limit === null || status.limit === 0) return 0;
    return Math.min(status.used / status.limit, 1);
  }

  function isFull(status: ApplicationLimitStatus) {
    return status.limit !== null && (status.remaining ?? 0) <= 0;
  }
</script>

<FlowStepWrapper headline="Application limits" {description}>
  <Card style="text-align: left; width: 100%;">
    <div class="limits">
      {#if perUser.limit !== null}
        <div class="limit-row">
          <div class="limit-label">
            <span class="typo-text-bold">Your applications</span>
            <span class="typo-text-small subtle">Across all your organizations</span>
          </div>
          <div class="meter">
            <div class="track">
              <div
                class="fill"
                class:full={perUserFull}
                style:width="{meterFraction(perUser) * 100}%"
              ></div>
            </div>
            <span class="meter-label typo-text-small tnum" class:full={perUserFull}>
              {Math.max(perUser.remaining ?? 0, 0)} of {perUser.limit} remaining
            </span>
          </div>
        </div>
      {/if}

      {#if bindingOrgRows.length > 0}
        {#if perUser.limit !== null}
          <div class="divider"></div>
        {/if}
        <div class="section-header">
          <span class="typo-text-bold">Additional organization limits</span>
          <span class="typo-text-small subtle">
            {#if perUser.limit === null}
              These organizations cap how many of their repos can be applied each Wave cycle, across
              all their members — so you may be able to apply fewer repos from them than the counts
              below suggest if other members have already applied.
            {:else}
              These organizations have fewer slots left than your personal limit, so they — not your
              personal limit — are what restricts how many of their repos you can apply. The cap is
              shared across all members of the organization.
            {/if}
          </span>
        </div>
        {#each bindingOrgRows as { status, org } (org!.id)}
          <div class="limit-row">
            <div class="limit-label">
              <GithubOrgBadge org={org!} displayPersonalBadge={false} size="small" />
            </div>
            <span class="org-status typo-text-small tnum" class:full={isFull(status)}>
              {orgRemainingLabel(status)}
            </span>
          </div>
        {/each}
      {/if}
    </div>
  </Card>

  {#if perUserFull}
    <AnnotationBox type="warning">
      You've reached your application limit for this Wave cycle, so you can't apply more repos right
      now. Your limit resets when the next Wave begins.
      <a
        class="typo-link"
        href="https://docs.drips.network/wave/maintainers/repo-application-limits"
        target="_blank"
        rel="noreferrer">Learn more</a
      >
    </AnnotationBox>
  {:else}
    <AnnotationBox type="info">
      Limits reset at the start of each Wave cycle. Every repo you apply counts toward both your
      personal limit and its organization's limit, and rejected applications still count for the
      current cycle.
      <a
        class="typo-link"
        href="https://docs.drips.network/wave/maintainers/repo-application-limits"
        target="_blank"
        rel="noreferrer">Learn more</a
      >
    </AnnotationBox>
  {/if}

  {#snippet leftActions()}
    <Button icon={ArrowLeft} href="/wave/maintainer-onboarding/apply-to-wave-program"
      >Choose Wave Program</Button
    >
  {/snippet}

  {#snippet actions()}
    <Button
      variant="primary"
      icon={ArrowRight}
      disabled={perUserFull}
      href="/wave/maintainer-onboarding/apply-to-wave-program/{data.waveProgram.id}/select"
      >Pick repos to apply</Button
    >
  {/snippet}
</FlowStepWrapper>

<style>
  .limits {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .limit-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .limit-label {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .subtle {
    color: var(--color-foreground-level-6);
  }

  .section-header {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .divider {
    height: 1px;
    background-color: var(--color-foreground-level-2);
    width: 100%;
  }

  .meter {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
    flex-shrink: 0;
    min-width: 10rem;
  }

  .track {
    width: 100%;
    height: 0.5rem;
    border-radius: 0.5rem;
    background-color: var(--color-foreground-level-2);
    overflow: hidden;
  }

  .fill {
    height: 100%;
    background-color: var(--color-primary-level-6);
    transition: width 0.2s ease;
  }

  .fill.full {
    background-color: var(--color-caution-level-6);
  }

  .meter-label {
    color: var(--color-foreground-level-6);
  }

  .meter-label.full,
  .org-status.full {
    color: var(--color-caution-level-6);
  }

  .org-status {
    color: var(--color-foreground-level-6);
    flex-shrink: 0;
  }
</style>

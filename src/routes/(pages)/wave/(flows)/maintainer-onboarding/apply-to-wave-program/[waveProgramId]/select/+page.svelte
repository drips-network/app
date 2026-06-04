<script lang="ts">
  import { goto } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import Card from '$lib/components/wave/card/card.svelte';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';
  import FlowStepWrapper from '../../../../shared/flow-step-wrapper.svelte';

  let { data } = $props();

  // Hard cap on a single batch, independent of any configured limit.
  const HARD_MAX = 10;

  const perUser = $derived(data.applicationLimits.perUser);
  let orgStatusByOrgId = $derived(
    new Map(data.applicationLimits.perOrg.map((o) => [o.orgId, o] as const)),
  );

  // Whether the dedicated limits step exists (it's skipped entirely when the
  // program imposes no limits), so "back" lands on the right place.
  let hasAnyLimit = $derived(
    perUser.limit !== null || data.applicationLimits.perOrg.some((o) => o.limit !== null),
  );

  // Cap the whole selection to the user's remaining per-user slots (when limited).
  let maxSelected = $derived(
    perUser.remaining === null ? HARD_MAX : Math.min(HARD_MAX, Math.max(perUser.remaining, 0)),
  );

  function checkAlreadyApplied(repoId: string) {
    return data.ownWaveProgramRepos.data.some(
      (ownWaveProgramRepo) =>
        ownWaveProgramRepo.repo.id === repoId &&
        ownWaveProgramRepo.waveProgramId === data.waveProgram.id,
    );
  }

  let selected = $state<string[]>([]);

  // How many of the currently-selected repos belong to each org.
  let selectedCountByOrg = $derived.by(() => {
    const counts: Record<string, number> = {};
    for (const id of selected) {
      const repo = data.ownRepos.find((r) => r.id === id);
      if (!repo) continue;
      counts[repo.orgId] = (counts[repo.orgId] ?? 0) + 1;
    }
    return counts;
  });

  // New applications still allowed for an org this cycle (null = unlimited).
  function orgSlotsLeft(orgId: string): number | null {
    const status = orgStatusByOrgId.get(orgId);
    if (!status || status.limit === null) return null;
    return Math.max(status.remaining ?? 0, 0);
  }

  let items = $derived<Items>(
    Object.fromEntries(
      data.ownRepos
        .sort((a, b) => a.gitHubRepoFullName.localeCompare(b.gitHubRepoFullName))
        .map((repo) => {
          const alreadyApplied = checkAlreadyApplied(repo.id);
          const slotsLeft = orgSlotsLeft(repo.orgId);
          const isSelected = selected.includes(repo.id);
          // Block selecting more repos from an org than it has slots left.
          const orgLimitReached =
            !isSelected && slotsLeft !== null && (selectedCountByOrg[repo.orgId] ?? 0) >= slotsLeft;

          return [
            repo.id,
            {
              type: 'selectable',
              label: {
                component: RepoBadge,
                props: {
                  repo,
                  avatarUrl: data.ownOrgs.data.find((org) => org.org.id === repo.orgId)?.org
                    .gitHubOrgAvatarUrl,
                },
              },
              disabled: alreadyApplied || orgLimitReached,
              text: alreadyApplied
                ? 'Already applied'
                : orgLimitReached
                  ? 'Org limit reached'
                  : undefined,
              searchString: repo.gitHubRepoFullName,
            },
          ];
        }),
    ),
  );

  const STORAGE_KEY = `wave-apply-repos-${data.waveProgram.id}`;

  function handleContinue() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    goto(`/wave/maintainer-onboarding/apply-to-wave-program/${data.waveProgram.id}/form`);
  }
</script>

<FlowStepWrapper
  headline="Pick repos to apply"
  description="Choose which repos you'd like to apply to the {data.waveProgram.name} Wave Program."
>
  <AnnotationBox>
    Please apply related repos (e.g. backend, frontend, contracts for the same product) together.
    You'll answer a few questions about them in the next step.
  </AnnotationBox>

  {#if perUser.limit !== null}
    <AnnotationBox type="info">
      You can apply {Math.max(perUser.remaining ?? 0, 0)} more
      {(perUser.remaining ?? 0) === 1 ? 'repo' : 'repos'} this Wave cycle. Repos from organizations that
      have reached their limit can't be selected.
    </AnnotationBox>
  {/if}

  <Card style="padding: 0; text-align: left; width: 100%;">
    <ListSelect multiselect {maxSelected} {items} bind:selected />
  </Card>

  {#snippet leftActions()}
    {#if hasAnyLimit}
      <Button
        icon={ArrowLeft}
        href="/wave/maintainer-onboarding/apply-to-wave-program/{data.waveProgram.id}"
        >Application limits</Button
      >
    {:else}
      <Button icon={ArrowLeft} href="/wave/maintainer-onboarding/apply-to-wave-program"
        >Choose Wave Program</Button
      >
    {/if}
  {/snippet}

  {#snippet actions()}
    <Button
      variant="primary"
      disabled={selected.length === 0}
      icon={ArrowRight}
      onclick={handleContinue}>Continue</Button
    >
  {/snippet}
</FlowStepWrapper>

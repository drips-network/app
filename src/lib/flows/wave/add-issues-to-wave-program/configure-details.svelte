<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import type {
    WaveProgramDto,
    WaveProgramRepoWithDetailsDto,
  } from '$lib/utils/wave/types/waveProgram';
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import SegmentedControl from '$lib/components/segmented-control/segmented-control.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import { addIssueToWaveProgram } from '$lib/utils/wave/wavePrograms';
  import { invalidate } from '$app/navigation';
  import { notifyIssuesUpdated } from '$lib/components/wave/issues-page/issue-update-coordinator';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import { getIssue } from '$lib/utils/wave/issues';
  import { getPointsForComplexity } from '$lib/utils/wave/get-points-for-complexity';
  import { SvelteMap } from 'svelte/reactivity';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  let {
    waveProgramRepos,
    wavePrograms,
    issues,
    onsuccess,
  }: {
    waveProgramRepos: WaveProgramRepoWithDetailsDto[];
    wavePrograms: WaveProgramDto[];
    issues: IssueDetailsDto[];
    onsuccess?: () => void;
  } = $props();

  const pluralS = issues.length > 1 ? 's' : '';

  let eligibleIssues = $derived(
    issues
      .filter((issue) => !issue.waveProgramId && issue.state === 'open')
      .filter((issue) => {
        const matchingWaveProgramRepo = waveProgramRepos.find(
          (waveProgramRepo) =>
            waveProgramRepo.repo.id === issue.repo.id && waveProgramRepo.status === 'approved',
        );
        return Boolean(matchingWaveProgramRepo);
      }),
  );
  let hasIneligibleIssues = $derived(eligibleIssues.length < issues.length);

  let activeComplexity: 'small' | 'medium' | 'large' = $state('small');

  let pointsPerIssue = $derived(100 + getPointsForComplexity(activeComplexity));

  // Budget check: group eligible issues by repo and check against budget for selected wave program
  interface RepoBudgetInfo {
    repoId: string;
    repoName: string;
    issueCount: number;
    pointsNeeded: number;
    pointsRemaining: number | null;
    pointsBudget: number | null;
    canFit: number; // how many issues can fit within remaining budget
  }

  const firstWaveId = wavePrograms.find((w) =>
    waveProgramRepos.some((wpr) => wpr.waveProgramId === w.id),
  )?.id;
  let selectedWaveIds = $state<string[]>(firstWaveId ? [firstWaveId] : []);

  let repoBudgetInfos = $derived.by((): RepoBudgetInfo[] => {
    const selectedWaveId = selectedWaveIds[0];
    if (!selectedWaveId) return [];

    // Group eligible issues by repo
    const issuesByRepo: Record<string, IssueDetailsDto[]> = {};
    for (const issue of eligibleIssues) {
      const repoId = issue.repo.id;
      if (!issuesByRepo[repoId]) issuesByRepo[repoId] = [];
      issuesByRepo[repoId].push(issue);
    }

    const infos: RepoBudgetInfo[] = [];
    for (const [repoId, repoIssues] of Object.entries(issuesByRepo)) {
      const waveProgramRepo = waveProgramRepos.find(
        (wpr) => wpr.repo.id === repoId && wpr.waveProgramId === selectedWaveId,
      );
      if (!waveProgramRepo) continue;

      const remaining = waveProgramRepo.pointsRemaining;
      const budget = waveProgramRepo.pointsBudget;
      const needed = repoIssues.length * pointsPerIssue;
      const canFit =
        remaining === null
          ? repoIssues.length
          : Math.max(0, Math.floor(remaining / pointsPerIssue));

      infos.push({
        repoId,
        repoName: waveProgramRepo.repo.gitHubRepoFullName,
        issueCount: repoIssues.length,
        pointsNeeded: needed,
        pointsRemaining: remaining,
        pointsBudget: budget,
        canFit,
      });
    }

    return infos;
  });

  // Issues that will actually be submitted, respecting per-repo budget limits
  let submittableIssues = $derived.by(() => {
    const canFitByRepo = new SvelteMap<string, number>();
    for (const info of repoBudgetInfos) {
      canFitByRepo.set(info.repoId, info.canFit);
    }

    const result: IssueDetailsDto[] = [];
    const countByRepo = new SvelteMap<string, number>();

    for (const issue of eligibleIssues) {
      const repoId = issue.repo.id;
      const maxForRepo = canFitByRepo.get(repoId) ?? eligibleIssues.length;
      const usedSoFar = countByRepo.get(repoId) ?? 0;

      if (usedSoFar < maxForRepo) {
        result.push(issue);
        countByRepo.set(repoId, usedSoFar + 1);
      }
    }

    return result;
  });

  let budgetExceededRepos = $derived(
    repoBudgetInfos.filter((r) => r.pointsRemaining !== null && r.pointsNeeded > r.pointsRemaining),
  );

  let allBlocked = $derived(submittableIssues.length === 0 && eligibleIssues.length > 0);

  async function handleSubmit() {
    dispatch('await', {
      message: `Adding issue${pluralS} to Wave Program…`,
      promise: async () => {
        const selectedWaveId = selectedWaveIds[0];

        const results = await Promise.allSettled(
          submittableIssues.map((issue) =>
            addIssueToWaveProgram(undefined, selectedWaveId, issue.id, activeComplexity),
          ),
        );

        const failedResults = results.filter((result) => result.status === 'rejected');

        if (failedResults.length > 0) {
          // todo(wave): Make this error nicer and list out which issues failed
          throw new Error('Some issues could not be added to the Wave. Please try again.');
        }

        const updatedIssues = (
          await Promise.all(submittableIssues.map((issue) => getIssue(undefined, issue.id)))
        ).filter((issue): issue is IssueDetailsDto => issue !== null);

        notifyIssuesUpdated(updatedIssues);
        await invalidate('wave:issues');

        onsuccess?.();
      },
    });
  }

  let items = $derived<Items>(
    Object.fromEntries(
      waveProgramRepos.map((waveProgramRepo) => {
        const wave = wavePrograms.find((w) => w.id === waveProgramRepo.waveProgramId);
        if (!wave) throw new Error('Wave not found for WaveProgramRepoWithDetailsDto');

        return [
          wave.id,
          {
            type: 'selectable',
            label: wave.name,
          },
        ];
      }),
    ),
  );

  let valid = $derived(selectedWaveIds.length > 0 && !allBlocked);
</script>

<StandaloneFlowStepLayout
  headline="Add issue{pluralS} to a Wave Program"
  description="Assign a complexity and select which Wave Program you'd like to add the issue{pluralS} to."
>
  <FormField
    title="Complexity*"
    description="This will be used to determine the points earned when closing {pluralS
      ? 'these issues'
      : 'this issue'}. You can update the complexity later."
    type="div"
  >
    <div style:width="max-content">
      <SegmentedControl
        bind:active={activeComplexity}
        options={[
          { title: 'Trivial', value: 'small' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'large' },
        ]}
      />
    </div>
  </FormField>

  <FormField
    title="Points"
    description="The amount of Points earned for solving the issue{pluralS} is determined by the complexity you choose."
    type="div"
  >
    <span class="typo-text complexity-calc">
      <span style:color="var(--color-foreground-level-5)">
        100 <span class="typo-text-bold">Base Points</span> + {getPointsForComplexity(
          activeComplexity,
        )} <span class="typo-text-bold">Complexity Bonus</span> =
      </span>
      <span class="typo-text-bold">{pointsPerIssue} Points</span>
    </span>
  </FormField>

  <FormField
    title="Wave Program*"
    description="Choose which Wave Program you'd like to add the issue{pluralS} to. This only shows Wave Programs the the repo the issue belongs to is approved for."
    type="div"
  >
    <Card style="padding: 0; text-align: left; width: 100%;">
      <ListSelect {items} bind:selected={selectedWaveIds} />
    </Card>
  </FormField>

  {#if hasIneligibleIssues}
    <AnnotationBox>
      Some selected issues are already part of a Wave, or are not currently open. To add an issue to
      a different Wave, please remove it from its current Wave first.
    </AnnotationBox>
  {/if}

  {#if allBlocked}
    <AnnotationBox type="error">
      {#if repoBudgetInfos.length === 1}
        {@const repo = repoBudgetInfos[0]}
        <strong>{repo.repoName}</strong> has no remaining points budget for this wave ({repo.pointsRemaining}
        of {repo.pointsBudget} points remaining). You cannot add more issues until the current Wave ends.
        Review the remaining budget for your repos on the
        <a
          href="/wave/maintainers/repos?status=approved"
          target="_blank"
          rel="noopener noreferrer"
          class="typo-link">Orgs & Repos</a
        >
        screen.
        <a
          href="https://docs.drips.network/wave/maintainers/points-budgets"
          target="_blank"
          rel="noopener noreferrer"
          class="typo-link">Learn more</a
        >
      {:else}
        None of the selected repos have enough remaining points budget to add issues at this
        complexity. Wait until the current Wave ends. Review the remaining budget for your repos on
        the <a
          href="/wave/maintainers/repos?status=approved"
          target="_blank"
          rel="noopener noreferrer"
          class="typo-link">Orgs & Repos</a
        >
        screen.
        <a
          href="https://docs.drips.network/wave/maintainers/points-budgets"
          target="_blank"
          rel="noopener noreferrer"
          class="typo-link">Learn more</a
        >
      {/if}
    </AnnotationBox>
  {:else if budgetExceededRepos.length > 0}
    {@const skippedCount = eligibleIssues.length - submittableIssues.length}
    <AnnotationBox type="warning">
      {#each budgetExceededRepos as repo (repo.repoName)}
        <div class="budget-warning-row">
          <strong>{repo.repoName}</strong>: {repo.issueCount} issue{repo.issueCount > 1 ? 's' : ''} selected
          ({repo.pointsNeeded} points) but only {repo.pointsRemaining} of {repo.pointsBudget}
          points remaining. {#if repo.canFit > 0}Only {repo.canFit} issue{repo.canFit > 1
              ? 's'
              : ''} will be added at this complexity.{:else}No issues from this repo will be added
            at this complexity.{/if}
        </div>
      {/each}
      {skippedCount} issue{skippedCount > 1 ? 's' : ''} will be skipped. Review the remaining budget
      for your repos on the
      <a
        href="/wave/maintainers/repos?status=approved"
        target="_blank"
        rel="noopener noreferrer"
        class="typo-link">Orgs & Repos</a
      >
      screen.
      <a
        href="https://docs.drips.network/wave/maintainers/points-budgets"
        target="_blank"
        rel="noopener noreferrer"
        class="typo-link">Learn more</a
      >
    </AnnotationBox>
  {/if}

  {#snippet actions()}
    <Button variant="primary" disabled={!valid} icon={CheckCircle} onclick={handleSubmit}>
      {#if submittableIssues.length < eligibleIssues.length && submittableIssues.length > 0}
        Add {submittableIssues.length} of {eligibleIssues.length} issue{eligibleIssues.length > 1
          ? 's'
          : ''} to Wave
      {:else}
        Add issue{pluralS} to Wave
      {/if}
    </Button>
  {/snippet}
</StandaloneFlowStepLayout>

<style>
  .complexity-calc {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    background-color: var(--color-foreground-level-1);
    width: fit-content;
    padding: 0.5rem 1rem;
    border-radius: 2rem 0 2rem 2rem;
  }

  .budget-warning-row {
    margin-bottom: 0.25rem;
  }

  .budget-warning-row:last-child {
    margin-bottom: 0;
  }
</style>

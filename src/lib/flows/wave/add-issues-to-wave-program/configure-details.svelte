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
  import { addIssuesToWaveProgram, BULK_ADD_MAX_ISSUES } from '$lib/utils/wave/wavePrograms';
  import { invalidate } from '$app/navigation';
  import { notifyIssuesUpdated } from '$lib/components/wave/issues-page/issue-update-coordinator';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import { getIssue } from '$lib/utils/wave/issues';
  import { getPointsForComplexity } from '$lib/utils/wave/get-points-for-complexity';
  import extractApiErrorMessage from '$lib/utils/wave/utils/extract-api-error-message';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';

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

  // Open issues that aren't in a Wave yet but are already assigned to someone on
  // GitHub outside of Wave. The backend rejects these (see
  // `addIssueToWaveProgram` in wave-program-issue.service.ts), so we block them
  // up-front from the issue payload and surface a clear reason instead of firing
  // a request that's guaranteed to fail. (An in-Wave assignee is the
  // Wave-assigned contributor, so we scope this to issues not yet in a Wave.)
  let externallyAssignedIssues = $derived(
    issues.filter(
      (issue) => !issue.waveProgramId && issue.state === 'open' && issue.assignees.length > 0,
    ),
  );

  let eligibleIssues = $derived(
    issues
      .filter(
        (issue) => !issue.waveProgramId && issue.state === 'open' && issue.assignees.length === 0,
      )
      .filter((issue) => {
        const matchingWaveProgramRepo = waveProgramRepos.find(
          (waveProgramRepo) =>
            waveProgramRepo.repo.id === issue.repo.id && waveProgramRepo.status === 'approved',
        );
        return Boolean(matchingWaveProgramRepo);
      }),
  );
  // Issues that can't be added because they're already in a Wave or not open.
  // Externally-assigned issues get their own dedicated message below.
  let hasIneligibleIssues = $derived(
    issues.some((issue) => issue.waveProgramId || issue.state !== 'open'),
  );

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

  interface OrgBudgetInfo {
    orgId: string;
    orgLogin: string;
    issueCount: number;
    pointsNeeded: number;
    pointsRemaining: number | null;
    pointsBudget: number | null;
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

  // Group eligible issues by org (only counting issues from repos approved for the
  // selected wave), so we can compare against each org's shared per-wave budget.
  let orgBudgetInfos = $derived.by((): OrgBudgetInfo[] => {
    const selectedWaveId = selectedWaveIds[0];
    if (!selectedWaveId) return [];

    const repoInfoByRepoId = new SvelteMap<
      string,
      {
        orgId: string;
        orgLogin: string;
        orgRemaining: number | null;
        orgBudget: number | null;
      }
    >();
    for (const wpr of waveProgramRepos) {
      if (wpr.waveProgramId !== selectedWaveId || wpr.status !== 'approved') continue;
      repoInfoByRepoId.set(wpr.repo.id, {
        orgId: wpr.org.id,
        orgLogin: wpr.org.gitHubOrgLogin,
        orgRemaining: wpr.orgPointsRemaining ?? null,
        orgBudget: wpr.orgPointsBudget ?? null,
      });
    }

    const byOrg = new SvelteMap<
      string,
      { orgLogin: string; count: number; remaining: number | null; budget: number | null }
    >();
    for (const issue of eligibleIssues) {
      const info = repoInfoByRepoId.get(issue.repo.id);
      if (!info) continue;
      const existing = byOrg.get(info.orgId);
      if (existing) {
        existing.count += 1;
      } else {
        byOrg.set(info.orgId, {
          orgLogin: info.orgLogin,
          count: 1,
          remaining: info.orgRemaining,
          budget: info.orgBudget,
        });
      }
    }

    return [...byOrg.entries()].map(([orgId, v]) => ({
      orgId,
      orgLogin: v.orgLogin,
      issueCount: v.count,
      pointsNeeded: v.count * pointsPerIssue,
      pointsRemaining: v.remaining,
      pointsBudget: v.budget,
    }));
  });

  // Repos that are not approved for the selected wave program
  let unapprovedRepoIssues = $derived.by(() => {
    const selectedWaveId = selectedWaveIds[0];
    if (!selectedWaveId) return [];

    const approvedRepoIds = new SvelteSet(
      waveProgramRepos
        .filter((wpr) => wpr.waveProgramId === selectedWaveId && wpr.status === 'approved')
        .map((wpr) => wpr.repo.id),
    );

    return eligibleIssues.filter((issue) => !approvedRepoIds.has(issue.repo.id));
  });

  // Issues that will actually be submitted, respecting both per-repo and per-org budget
  // limits, and excluding issues from repos not approved for the selected wave
  let submittableIssues = $derived.by(() => {
    const selectedWaveId = selectedWaveIds[0];
    if (!selectedWaveId) return [];

    const wprByRepoId = new SvelteMap<string, WaveProgramRepoWithDetailsDto>();
    for (const wpr of waveProgramRepos) {
      if (wpr.waveProgramId !== selectedWaveId || wpr.status !== 'approved') continue;
      wprByRepoId.set(wpr.repo.id, wpr);
    }

    const canFitByRepo = new SvelteMap<string, number>();
    for (const info of repoBudgetInfos) canFitByRepo.set(info.repoId, info.canFit);

    // Running per-org remaining points across the loop; null means unbounded.
    const orgRemainingByOrgId = new SvelteMap<string, number | null>();
    for (const wpr of wprByRepoId.values()) {
      if (!orgRemainingByOrgId.has(wpr.org.id)) {
        orgRemainingByOrgId.set(wpr.org.id, wpr.orgPointsRemaining ?? null);
      }
    }

    const result: IssueDetailsDto[] = [];
    const countByRepo = new SvelteMap<string, number>();

    for (const issue of eligibleIssues) {
      const wpr = wprByRepoId.get(issue.repo.id);
      if (!wpr) continue;

      const repoId = issue.repo.id;
      const maxForRepo = canFitByRepo.get(repoId) ?? Infinity;
      const usedSoFar = countByRepo.get(repoId) ?? 0;
      if (usedSoFar >= maxForRepo) continue;

      const orgRemaining = orgRemainingByOrgId.get(wpr.org.id);
      if (orgRemaining !== null && orgRemaining !== undefined && orgRemaining < pointsPerIssue) {
        continue;
      }

      result.push(issue);
      countByRepo.set(repoId, usedSoFar + 1);
      if (orgRemaining !== null && orgRemaining !== undefined) {
        orgRemainingByOrgId.set(wpr.org.id, orgRemaining - pointsPerIssue);
      }
    }

    return result;
  });

  let budgetExceededRepos = $derived(
    repoBudgetInfos.filter((r) => r.pointsRemaining !== null && r.pointsNeeded > r.pointsRemaining),
  );

  let budgetExceededOrgs = $derived(
    orgBudgetInfos.filter((o) => o.pointsRemaining !== null && o.pointsNeeded > o.pointsRemaining),
  );

  let allBlocked = $derived(submittableIssues.length === 0 && eligibleIssues.length > 0);

  // Builds a readable, per-issue breakdown of which adds failed and why. Rendered
  // as-is on the stepper's error screen (newlines preserved), so keep it plain.
  function formatAddIssueFailures(
    failures: { issue: IssueDetailsDto; reason: unknown }[],
    total: number,
  ): string {
    const header =
      failures.length === total
        ? total === 1
          ? "The issue couldn't be added to the Wave Program:"
          : `None of the ${total} issues could be added to the Wave Program:`
        : `${failures.length} of ${total} ${total === 1 ? 'issue' : 'issues'} couldn't be added to the Wave Program:`;

    const lines = failures.map(
      ({ issue, reason }) =>
        `• ${issue.repo.gitHubRepoFullName}#${issue.gitHubIssueNumber}: ${extractApiErrorMessage(
          reason,
        )}`,
    );

    return [header, '', ...lines].join('\n');
  }

  async function handleSubmit() {
    dispatch('await', {
      message: `Adding issue${pluralS} to Wave Program…`,
      promise: async () => {
        const selectedWaveId = selectedWaveIds[0];
        const issuesToAdd = submittableIssues;

        // One bulk request per chunk of BULK_ADD_MAX_ISSUES, sequentially. The
        // backend adds each chunk in a single transaction with one org-lock
        // acquisition, reporting per-issue outcomes — unlike parallel single
        // adds, which serialize on that lock and can time out (wave#735).
        const resultByIssueId = new SvelteMap<string, { success: boolean; error: string | null }>();
        for (let i = 0; i < issuesToAdd.length; i += BULK_ADD_MAX_ISSUES) {
          const chunk = issuesToAdd.slice(i, i + BULK_ADD_MAX_ISSUES);
          try {
            const response = await addIssuesToWaveProgram(
              undefined,
              selectedWaveId,
              chunk.map((issue) => ({ issueId: issue.id, complexity: activeComplexity })),
            );
            for (const result of response.results) {
              resultByIssueId.set(result.issueId, result);
            }
          } catch (error) {
            // Whole-chunk failure (network, 5xx, batch-level 4xx): report every
            // issue in the chunk as failed but keep going — later chunks may
            // succeed, and earlier ones already have.
            for (const issue of chunk) {
              resultByIssueId.set(issue.id, {
                success: false,
                error: extractApiErrorMessage(error),
              });
            }
          }
        }

        // Refresh every issue that was added successfully — even on partial
        // failure — so the list reflects reality regardless of the outcome.
        const succeededIssues = issuesToAdd.filter(
          (issue) => resultByIssueId.get(issue.id)?.success,
        );
        if (succeededIssues.length > 0) {
          const updatedIssues = (
            await Promise.all(succeededIssues.map((issue) => getIssue(undefined, issue.id)))
          ).filter((issue): issue is IssueDetailsDto => issue !== null);

          notifyIssuesUpdated(updatedIssues);
          await invalidate('wave:issues');
        }

        const failures = issuesToAdd
          .filter((issue) => !resultByIssueId.get(issue.id)?.success)
          .map((issue) => ({
            issue,
            reason: resultByIssueId.get(issue.id)?.error ?? 'Unknown error',
          }));

        if (failures.length > 0) {
          throw new Error(formatAddIssueFailures(failures, issuesToAdd.length));
        }

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

  let valid = $derived(selectedWaveIds.length > 0 && submittableIssues.length > 0);
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

  {#if externallyAssignedIssues.length > 0}
    <AnnotationBox type="warning">
      {externallyAssignedIssues.length} issue{externallyAssignedIssues.length > 1 ? 's' : ''} will be
      skipped because {externallyAssignedIssues.length > 1 ? 'they are' : "it's"} already assigned to
      someone outside the Wave. Unassign them on GitHub first, then try adding {externallyAssignedIssues.length >
      1
        ? 'them'
        : 'it'} again.
      <ul class="issue-list">
        {#each externallyAssignedIssues as issue (issue.id)}
          <li>
            <strong>{issue.repo.gitHubRepoFullName}#{issue.gitHubIssueNumber}</strong>
            {issue.title}
          </li>
        {/each}
      </ul>
    </AnnotationBox>
  {/if}

  {#if unapprovedRepoIssues.length > 0}
    {@const repoNames = [...new Set(unapprovedRepoIssues.map((i) => i.repo.gitHubRepoFullName))]}
    <AnnotationBox type="warning">
      {unapprovedRepoIssues.length} issue{unapprovedRepoIssues.length > 1 ? 's' : ''} from
      {#if repoNames.length === 1}
        <strong>{repoNames[0]}</strong>
      {:else}
        {repoNames.length} repos
      {/if}
      will be skipped because {repoNames.length === 1 ? 'this repo is' : 'these repos are'} not approved
      for the selected Wave Program.
    </AnnotationBox>
  {/if}

  {#if allBlocked}
    <AnnotationBox type="error">
      {#if budgetExceededOrgs.length > 0 && budgetExceededRepos.length === 0}
        {#if budgetExceededOrgs.length === 1}
          {@const org = budgetExceededOrgs[0]}
          <strong>{org.orgLogin}</strong> has no remaining points budget for this Wave ({org.pointsRemaining}
          of {org.pointsBudget} points remaining, shared across all the org's approved repos). You cannot
          add more issues until the current Wave ends. Review the remaining budget for your orgs on the
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
          None of the selected orgs have enough remaining points budget to add issues at this
          complexity. Wait until the current Wave ends. Review the remaining budget for your orgs on
          the
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
        {/if}
      {:else if repoBudgetInfos.length === 1}
        {@const repo = repoBudgetInfos[0]}
        <strong>{repo.repoName}</strong> has no remaining points budget for this Wave ({repo.pointsRemaining}
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
  {:else if budgetExceededRepos.length > 0 || budgetExceededOrgs.length > 0}
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
      {#each budgetExceededOrgs as org (org.orgId)}
        <div class="budget-warning-row">
          <strong>{org.orgLogin}</strong> (org): {org.issueCount} issue{org.issueCount > 1
            ? 's'
            : ''} selected ({org.pointsNeeded} points) but only {org.pointsRemaining} of {org.pointsBudget}
          points remaining across the org's approved repos. Some issues will be skipped at this complexity.
        </div>
      {/each}
      {skippedCount} issue{skippedCount > 1 ? 's' : ''} will be skipped. Review the remaining budget
      for your repos and orgs on the
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

  .issue-list {
    margin: 0.5rem 0 0;
    padding-left: 1.25rem;
    list-style: disc;
  }

  .issue-list li {
    margin-bottom: 0.25rem;
  }

  .issue-list li:last-child {
    margin-bottom: 0;
  }
</style>

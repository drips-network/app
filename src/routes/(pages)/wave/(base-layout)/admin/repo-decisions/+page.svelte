<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Section from '$lib/components/section/section.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import Checkbox from '$lib/components/checkbox/checkbox.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import Cross from '$lib/components/icons/Cross.svelte';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import {
    approveWaveProgramRepo,
    findWaveProgramRepoApplications,
    rejectWaveProgramRepo,
  } from '$lib/utils/wave/wavePrograms';
  import type {
    WaveProgramRepoStatus,
    WaveProgramRepoWithDetailsDto,
  } from '$lib/utils/wave/types/waveProgram';
  import { isHttpError } from '@sveltejs/kit';
  import { parseRepoList } from './parse-repo-list';

  let { data } = $props();

  // Must match MALWARE_REJECTION_REASON in the wave backend (wave-program.service.ts).
  const MALWARE_REJECTION_REASON =
    'Malicious files were found in this repository. All members of your org were emailed the details and next steps.';
  // Backend lookup cap per request.
  const LOOKUP_CHUNK = 100;
  // Matches the backend limit on `rejectionReason`.
  const MAX_REASON_LENGTH = 5000;
  const REPOS_PLACEHOLDER = 'https://github.com/owner/repo\nowner/another-repo';

  type Action = 'approve' | 'reject';
  type RowResult = { state: 'running' | 'done' | 'failed'; message?: string };
  type Row = {
    fullName: string;
    application: WaveProgramRepoWithDetailsDto | null;
  };

  // The user's pick; falls back to the first program until they choose one.
  let chosenProgramId = $state<string | undefined>(undefined);
  let waveProgramId = $derived(chosenProgramId ?? data.wavePrograms.data[0]?.id);
  let input = $state('');
  let action = $state<Action>('approve');
  let reason = $state('');
  let includeMalware = $state(false);
  let includeApproved = $state(false);

  let rows = $state<Row[] | null>(null);
  let invalidEntries = $state<string[]>([]);
  // Set when the API refuses the lookup (user isn't an admin of the chosen program).
  let forbiddenProgramName = $state<string | null>(null);
  let lookedUpProgramId = $state<string | null>(null);
  let lookingUp = $state(false);
  let running = $state(false);
  let results = $state<Record<string, RowResult>>({});

  let programOptions = $derived(
    data.wavePrograms.data.map((wp) => ({ value: wp.id, title: wp.name })),
  );
  let programName = $derived(
    data.wavePrograms.data.find((wp) => wp.id === lookedUpProgramId)?.name ?? '',
  );
  let trimmedReason = $derived(reason.trim());
  let reasonTooLong = $derived(trimmedReason.length > MAX_REASON_LENGTH);

  function isMalware(application: WaveProgramRepoWithDetailsDto | null) {
    return application?.rejectionReason === MALWARE_REJECTION_REASON;
  }

  /** Why a row won't be sent for the chosen action, or null if it will be. */
  function skipReason(row: Row): string | null {
    const app = row.application;
    if (!app) return 'No application in this program';
    if (action === 'approve') {
      if (app.status === 'approved') return 'Already approved';
      if (isMalware(app) && !includeMalware) return 'Malware rejection (tick the box to include)';
      return null;
    }
    if (app.status === 'rejected') return 'Already rejected';
    if (app.status === 'approved' && !includeApproved)
      return 'Approved and live (tick the box to include)';
    return null;
  }

  let eligible = $derived(rows ? rows.filter((r) => skipReason(r) === null) : []);
  let malwareCount = $derived(rows ? rows.filter((r) => isMalware(r.application)).length : 0);
  let approvedCount = $derived(
    rows ? rows.filter((r) => r.application?.status === 'approved').length : 0,
  );

  function chunk<T>(items: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
  }

  /**
   * Access is decided by the API: program admins can review their own programs, users with
   * `reviewWaveProgramRepos` can review all. A 403 means "not an admin of this program", which
   * deserves a plain message rather than the generic error modal.
   */
  async function lookUpOrExplainForbidden(programId: string, fn: () => Promise<void>) {
    try {
      await fn();
    } catch (e) {
      if (isHttpError(e) && e.status === 403) {
        rows = null;
        forbiddenProgramName =
          data.wavePrograms.data.find((wp) => wp.id === programId)?.name ?? 'this program';
        return;
      }
      await doWithErrorModal(() => {
        throw e;
      });
    }
  }

  async function lookUp() {
    if (!waveProgramId) return;
    const programId = waveProgramId;
    const parsed = parseRepoList(input);
    invalidEntries = parsed.invalid;
    results = {};
    forbiddenProgramName = null;

    if (parsed.repoFullNames.length === 0) {
      rows = [];
      lookedUpProgramId = programId;
      return;
    }

    lookingUp = true;
    try {
      await lookUpOrExplainForbidden(programId, async () => {
        const byName: Record<string, WaveProgramRepoWithDetailsDto> = {};
        const statuses: WaveProgramRepoStatus[] = ['pending', 'rejected', 'approved'];
        for (const names of chunk(parsed.repoFullNames, LOOKUP_CHUNK)) {
          const responses = await Promise.all(
            statuses.map((status) =>
              findWaveProgramRepoApplications(fetch, programId, status, names),
            ),
          );
          for (const response of responses) {
            for (const app of response.data) {
              byName[app.repo.gitHubRepoFullName.toLowerCase()] = app;
            }
          }
        }
        rows = parsed.repoFullNames.map((fullName) => ({
          fullName,
          application: byName[fullName] ?? null,
        }));
        lookedUpProgramId = programId;
      });
    } finally {
      lookingUp = false;
    }
  }

  async function run() {
    if (!lookedUpProgramId || eligible.length === 0) return;
    const programId = lookedUpProgramId;
    const targets = [...eligible];
    const verb = action === 'approve' ? 'Approve' : 'Reject';
    const extra =
      action === 'approve' && targets.some((r) => isMalware(r.application))
        ? ' This includes repos rejected for MALWARE: only continue if their malicious files are confirmed removed.'
        : action === 'reject' && targets.some((r) => r.application?.status === 'approved')
          ? ' This includes APPROVED repos: they will be removed from the program.'
          : '';

    await doWithConfirmationModal(
      `${verb} ${targets.length} repo${targets.length === 1 ? '' : 's'} in ${programName}? Each org is notified.${extra}`,
      async () => {
        running = true;
        try {
          for (const row of targets) {
            const app = row.application!;
            results[row.fullName] = { state: 'running' };
            try {
              if (action === 'approve') {
                await approveWaveProgramRepo(fetch, programId, app.repo.id);
              } else {
                await rejectWaveProgramRepo(
                  fetch,
                  programId,
                  app.repo.id,
                  trimmedReason.length > 0 ? trimmedReason : undefined,
                );
              }
              results[row.fullName] = {
                state: 'done',
                message: action === 'approve' ? 'Approved' : 'Rejected',
              };
            } catch (e) {
              results[row.fullName] = {
                state: 'failed',
                message: e instanceof Error ? e.message : String(e),
              };
            }
          }
        } finally {
          running = false;
        }
      },
    );
  }

  let doneCount = $derived(Object.values(results).filter((r) => r.state === 'done').length);
  let failedCount = $derived(Object.values(results).filter((r) => r.state === 'failed').length);

  function statusLabel(app: WaveProgramRepoWithDetailsDto | null) {
    if (!app) return 'Not found';
    return app.status.charAt(0).toUpperCase() + app.status.slice(1);
  }

  function formatDate(date: Date | null) {
    return date ? date.toLocaleDateString() : '';
  }
</script>

<HeadMeta title="Repo decisions | Admin | Wave" />

<div class="page">
  <Section
    header={{
      label: 'Repo decisions',
      infoTooltip:
        'Approve or reject several repo applications at once, including re-approving rejected repos. Uses the same endpoints as the per-program review page.',
    }}
    skeleton={{ loaded: true }}
  >
    <div class="form">
      <FormField title="Wave program" type="div">
        <Dropdown
          value={waveProgramId}
          options={programOptions}
          onchange={(value) => {
            chosenProgramId = value;
            rows = null;
            forbiddenProgramName = null;
            results = {};
          }}
        />
      </FormField>

      <FormField
        title="Repos"
        description="One per line: GitHub URLs or owner/repo. Up to a few hundred at a time."
        type="div"
      >
        <TextArea bind:value={input} placeholder={REPOS_PLACEHOLDER} />
      </FormField>

      <div class="row-actions">
        <Button
          variant="primary"
          loading={lookingUp}
          disabled={!waveProgramId || !input.trim() || running}
          onclick={lookUp}>Look up</Button
        >
      </div>

      {#if forbiddenProgramName}
        <AnnotationBox type="warning">
          You're not an admin of {forbiddenProgramName}, so you can't approve or reject its repos.
          Pick a program you administer, or ask for the <code>reviewWaveProgramRepos</code> permission.
        </AnnotationBox>
      {/if}
    </div>
  </Section>

  {#if rows}
    <Section
      header={{
        label: `${rows.length} repo${rows.length === 1 ? '' : 's'} in ${programName}`,
      }}
      skeleton={{
        loaded: true,
        empty: rows.length === 0,
        emptyStateEmoji: '🔍',
        emptyStateHeadline: 'No repos to look up',
        emptyStateText: 'Paste at least one GitHub URL or owner/repo.',
      }}
    >
      {#if invalidEntries.length > 0}
        <AnnotationBox type="warning">
          Ignored {invalidEntries.length} entr{invalidEntries.length === 1 ? 'y' : 'ies'} that aren't
          GitHub repos: {invalidEntries.slice(0, 5).join(', ')}{invalidEntries.length > 5
            ? ', …'
            : ''}
        </AnnotationBox>
      {/if}

      <div class="decision">
        <div class="action-toggle" role="radiogroup" aria-label="Action">
          <label class="radio"
            ><input
              type="radio"
              name="action"
              value="approve"
              bind:group={action}
              disabled={running}
            /> Approve</label
          >
          <label class="radio"
            ><input
              type="radio"
              name="action"
              value="reject"
              bind:group={action}
              disabled={running}
            /> Reject</label
          >
        </div>

        {#if action === 'approve' && malwareCount > 0}
          <Checkbox
            bind:checked={includeMalware}
            label="Include {malwareCount} repo{malwareCount === 1
              ? ''
              : 's'} rejected for malware (only if the malicious files are confirmed removed)"
          />
        {/if}

        {#if action === 'reject'}
          {#if approvedCount > 0}
            <Checkbox
              bind:checked={includeApproved}
              label="Include {approvedCount} approved repo{approvedCount === 1
                ? ''
                : 's'} (removes them from the program)"
            />
          {/if}
          <FormField
            title="Reason"
            description="Optional. One reason for every rejected repo; stored and sent with the rejection notification."
            type="div"
            validationState={reasonTooLong
              ? {
                  type: 'invalid',
                  message: `Reason must not exceed ${MAX_REASON_LENGTH} characters.`,
                }
              : { type: 'valid' }}
          >
            <TextArea
              bind:value={reason}
              placeholder="E.g., Not related to the Stellar ecosystem"
            />
          </FormField>
        {/if}

        <div class="row-actions">
          <Button
            variant={action === 'approve' ? 'primary' : 'destructive'}
            icon={action === 'approve' ? Check : Cross}
            loading={running}
            disabled={eligible.length === 0 || running || (action === 'reject' && reasonTooLong)}
            onclick={run}
            >{action === 'approve' ? 'Approve' : 'Reject'}
            {eligible.length} repo{eligible.length === 1 ? '' : 's'}</Button
          >
          {#if doneCount + failedCount > 0}
            <span class="typo-text-small dim"
              >{doneCount} done{failedCount ? `, ${failedCount} failed` : ''}</span
            >
            <Button size="small" variant="normal" disabled={running} onclick={lookUp}
              >Refresh statuses</Button
            >
          {/if}
        </div>
      </div>

      <div class="table-wrap">
        <table class="typo-text-small">
          <thead>
            <tr>
              <th>Repo</th>
              <th>Current status</th>
              <th>Details</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {#each rows as row (row.fullName)}
              {@const skip = skipReason(row)}
              {@const result = results[row.fullName]}
              <tr class:skipped={skip !== null && !result}>
                <td class="repo">
                  {#if row.application}
                    <a href={row.application.repo.gitHubRepoUrl} target="_blank" rel="noreferrer"
                      >{row.application.repo.gitHubRepoFullName}</a
                    >
                  {:else}
                    {row.fullName}
                  {/if}
                </td>
                <td>
                  <span
                    class="status status-{row.application?.status ?? 'missing'}"
                    class:malware={isMalware(row.application)}
                    >{isMalware(row.application)
                      ? 'Rejected (malware)'
                      : statusLabel(row.application)}</span
                  >
                </td>
                <td class="details">
                  {#if row.application?.status === 'rejected'}
                    {formatDate(row.application.reviewedAt)} ·
                    {row.application.rejectionReason ?? 'No reason recorded'}
                  {:else if row.application?.status === 'approved'}
                    Approved {formatDate(row.application.reviewedAt)}
                  {:else if row.application}
                    Applied {formatDate(row.application.appliedAt)}
                  {/if}
                </td>
                <td class="result">
                  {#if result}
                    <span class="result-{result.state}"
                      >{result.state === 'running' ? 'Working…' : result.message}</span
                    >
                  {:else if skip}
                    <span class="dim">Skipped: {skip}</span>
                  {:else}
                    <span class="dim">Will {action}</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </Section>
  {/if}
</div>

<style>
  .page {
    display: flex;
    max-width: 90rem;
    margin: 0 auto;
    width: 100%;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form,
  .decision {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .decision {
    margin-bottom: 1rem;
  }

  .row-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .action-toggle {
    display: flex;
    gap: 1.5rem;
  }

  .radio {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    cursor: pointer;
  }

  .table-wrap {
    overflow-x: auto;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    text-align: left;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--color-foreground-level-2);
    vertical-align: top;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  th {
    color: var(--color-foreground-level-5);
    font-weight: 600;
  }

  tr.skipped {
    opacity: 0.6;
  }

  .repo,
  .details {
    overflow-wrap: anywhere;
  }

  .details {
    max-width: 28rem;
  }

  .status-missing,
  .malware,
  .result-failed {
    color: var(--color-negative);
  }

  .status-approved,
  .result-done {
    color: var(--color-positive);
  }

  .malware {
    font-weight: 600;
  }

  .dim {
    color: var(--color-foreground-level-5);
  }
</style>

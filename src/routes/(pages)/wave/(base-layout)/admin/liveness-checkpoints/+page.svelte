<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Section from '$lib/components/section/section.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import Button from '$lib/components/button/button.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import formatDate from '$lib/utils/format-date';
  import { getUser } from '$lib/utils/wave/users';
  import {
    getLivenessCheckpointStatus,
    grantLivenessCheckpointExemption,
    resetLivenessCheckpoint,
    revokeLivenessCheckpointExemption,
    type CheckpointPurpose,
    type CheckpointStatus,
  } from '$lib/utils/wave/admin/liveness-checkpoints';

  const PURPOSE_LABELS: Record<CheckpointPurpose, string> = {
    grant_access: 'Grant access',
  };

  type LookedUpUser = { id: string; gitHubUsername: string; gitHubAvatarUrl: string | null };

  /**
   * Device IDs are only ever compared against each other here — "is this the
   * device that passed?" — so the first block is enough to eyeball. The full
   * value stays available on hover.
   */
  const shortDeviceId = (id: string) => id.split('-')[0];

  let gitHubUsername = $state('');
  let lookupUser = $state<LookedUpUser | null>(null);
  let status = $state<CheckpointStatus | null>(null);
  let lookupError = $state<string | null>(null);
  let loadingLookup = $state(false);

  let reasons = $state<Record<string, string>>({});
  let exemptionReasons = $state<Record<string, string>>({});
  let busyPurpose = $state<string | null>(null);
  let busyExemptionPurpose = $state<string | null>(null);

  async function handleLookup() {
    if (!gitHubUsername.trim() || loadingLookup) return;

    loadingLookup = true;
    lookupError = null;
    status = null;
    lookupUser = null;
    reasons = {};
    exemptionReasons = {};

    try {
      const user = await getUser(fetch, gitHubUsername.trim());

      if (!user) {
        lookupError = `User "${gitHubUsername.trim()}" not found.`;
        return;
      }

      lookupUser = {
        id: user.id,
        gitHubUsername: user.gitHubUsername,
        gitHubAvatarUrl: user.gitHubAvatarUrl,
      };
      status = await getLivenessCheckpointStatus(fetch, user.id);
    } catch (e) {
      lookupError = e instanceof Error ? e.message : 'Lookup failed';
    } finally {
      loadingLookup = false;
    }
  }

  async function refreshStatus() {
    if (!lookupUser) return;
    const refreshed = await doWithErrorModal(() =>
      getLivenessCheckpointStatus(fetch, lookupUser!.id),
    );
    if (refreshed) status = refreshed;
  }

  async function handleReset(purpose: CheckpointPurpose) {
    if (!lookupUser) return;

    const reason = (reasons[purpose] ?? '').trim();
    if (!reason) return;

    const message =
      `You are about to clear ${lookupUser.gitHubUsername}'s identity check allowance for ` +
      `"${PURPOSE_LABELS[purpose]}". They will be able to attempt the check again immediately. ` +
      `This is recorded against your account along with the reason. Continue?`;

    await doWithConfirmationModal(message, async () => {
      busyPurpose = purpose;
      try {
        await doWithErrorModal(
          () => resetLivenessCheckpoint(fetch, lookupUser!.id, purpose, reason),
          undefined,
          { message: 'Allowance reset. The user can attempt the check again.', confetti: false },
        );
        reasons = { ...reasons, [purpose]: '' };
        await refreshStatus();
      } finally {
        busyPurpose = null;
      }
    });
  }

  async function handleGrantExemption(purpose: CheckpointPurpose) {
    if (!lookupUser) return;

    const reason = (exemptionReasons[purpose] ?? '').trim();
    if (!reason) return;

    const message =
      `You are about to turn the identity check off for ${lookupUser.gitHubUsername} on ` +
      `"${PURPOSE_LABELS[purpose]}". They will not be asked to pass it again until someone ` +
      `turns it back on. Only do this once you've confirmed who they are by other means. ` +
      `This is recorded against your account along with the reason. Continue?`;

    await doWithConfirmationModal(message, async () => {
      busyExemptionPurpose = purpose;
      try {
        await doWithErrorModal(
          () => grantLivenessCheckpointExemption(fetch, lookupUser!.id, purpose, reason),
          undefined,
          { message: 'Identity check turned off for this account.', confetti: false },
        );
        exemptionReasons = { ...exemptionReasons, [purpose]: '' };
        await refreshStatus();
      } finally {
        busyExemptionPurpose = null;
      }
    });
  }

  async function handleRevokeExemption(purpose: CheckpointPurpose) {
    if (!lookupUser) return;

    const reason = (exemptionReasons[purpose] ?? '').trim();

    const message =
      `You are about to turn the identity check back on for ${lookupUser.gitHubUsername} on ` +
      `"${PURPOSE_LABELS[purpose]}". They'll be asked to pass it again the next time they ` +
      `need it. Continue?`;

    await doWithConfirmationModal(message, async () => {
      busyExemptionPurpose = purpose;
      try {
        await doWithErrorModal(
          () =>
            revokeLivenessCheckpointExemption(fetch, lookupUser!.id, purpose, reason || undefined),
          undefined,
          { message: 'Identity check turned back on.', confetti: false },
        );
        exemptionReasons = { ...exemptionReasons, [purpose]: '' };
        await refreshStatus();
      } finally {
        busyExemptionPurpose = null;
      }
    });
  }
</script>

<HeadMeta title="Identity Check Limits | Admin | Wave" />

<div class="page">
  <Breadcrumbs
    crumbs={[{ label: 'Admin', href: '/wave/admin' }, { label: 'Identity check limits' }]}
  />

  <Section header={{ label: 'Identity check limits' }} skeleton={{ loaded: true }}>
    <p class="intro typo-text">
      Before a user can act on a grant, they may be asked to pass a quick selfie check. Failed
      attempts are capped, and a user who runs out is told to contact support. Reset the allowance
      here once you're satisfied the failures were genuine — a dropped connection, a broken camera,
      poor lighting.
    </p>
    <p class="intro typo-text">
      If the check itself is the problem — it keeps failing for someone you've already confirmed is
      who they say they are — you can turn it off for their account instead. More attempts won't
      help there. Confirm who they are first: once it's off, they're not asked again until someone
      turns it back on.
    </p>

    <div class="form-row">
      <FormField title="GitHub username">
        <TextInput
          bind:value={gitHubUsername}
          placeholder="e.g. octocat"
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleLookup();
            }
          }}
        />
      </FormField>
      <Button disabled={!gitHubUsername.trim() || loadingLookup} onclick={handleLookup}>
        {loadingLookup ? 'Looking up…' : 'Look up user'}
      </Button>
    </div>

    {#if lookupError}
      <AnnotationBox type="warning">{lookupError}</AnnotationBox>
    {/if}

    {#if lookupUser && status}
      <div class="user-header">
        {#if lookupUser.gitHubAvatarUrl}
          <img class="avatar" src={lookupUser.gitHubAvatarUrl} alt={lookupUser.gitHubUsername} />
        {/if}
        <p class="typo-text-bold">{lookupUser.gitHubUsername}</p>
      </div>

      {#each status.purposes as purposeState (purposeState.purpose)}
        <div class="purpose">
          <div class="purpose-header">
            <span class="typo-text-bold">{PURPOSE_LABELS[purposeState.purpose]}</span>
            {#if !purposeState.enabled}
              <span class="badge neutral typo-text-small">Not enabled here</span>
            {:else if purposeState.exemption}
              <!-- Takes precedence over every other state: while this stands the
                   counts below are real but inert, and reading "Locked out" here
                   would send support chasing a reset that changes nothing. -->
              <span class="badge exempt typo-text-small">Check turned off</span>
            {:else if purposeState.failedAttempts.exhausted}
              <span class="badge locked typo-text-small">Locked out</span>
            {:else if purposeState.starts.exhausted}
              <!-- A separate block, and a separate badge: this one also stops the
                   user starting a check, but it lifts by itself in hours rather
                   than needing anyone. Folding it into "Locked out" would send
                   support chasing resets that were about to be unnecessary. -->
              <span class="badge throttled typo-text-small">Throttled</span>
            {:else}
              <span class="badge ok typo-text-small">Not locked</span>
            {/if}
          </div>

          <dl class="facts typo-text-small">
            <div>
              <dt>Failed attempts</dt>
              <dd class="tnum">
                {purposeState.failedAttempts.used} / {purposeState.failedAttempts.max}
              </dd>
            </div>
            <div>
              <dt>Checks started</dt>
              <dd class="tnum">{purposeState.starts.used} / {purposeState.starts.max}</dd>
            </div>
            <div>
              <dt>Passed on a device</dt>
              <dd>
                {#if purposeState.hasApprovalOnSomeDevice}
                  Yes{#if purposeState.validUntil}, until {formatDate(
                      purposeState.validUntil,
                      'dayAndYear',
                    )}{/if}
                  {#if purposeState.approvedDeviceId}
                    <span class="subtle device" title={purposeState.approvedDeviceId}
                      >on {shortDeviceId(purposeState.approvedDeviceId)}</span
                    >
                  {/if}
                {:else}
                  No
                {/if}
              </dd>
            </div>
            <div>
              <dt>Frees up on its own</dt>
              <dd>
                {#if purposeState.failedAttempts.naturalResetAt}
                  {formatDate(purposeState.failedAttempts.naturalResetAt, 'dayAndYear')}
                {:else}
                  —
                {/if}
              </dd>
            </div>
          </dl>

          <!-- Both of these explain why a user is being asked to pass again.
               Neither applies while the check is off for them. -->
          {#if purposeState.starts.exhausted && !purposeState.failedAttempts.exhausted && !purposeState.exemption}
            <AnnotationBox type="warning" size="small">
              This user can't start a check right now — they've hit the ceiling on how many can be
              started in a short window. That's a separate limit from the failed attempts above, and
              it clears by itself within a few hours. A reset here clears it too, if they can't
              wait.
            </AnnotationBox>
          {/if}

          {#if purposeState.hasApprovalOnSomeDevice && !purposeState.exemption}
            <AnnotationBox type="info" size="small">
              A pass only counts on the device that earned it. If this user has since switched phone
              or browser, they're still being asked to pass again — compare the device above with
              the ones on their recent attempts.
            </AnnotationBox>
          {/if}

          {#if purposeState.exemption}
            <AnnotationBox type="warning" size="small">
              The identity check is turned off for this account. Turned off {formatDate(
                purposeState.exemption.grantedAt,
                'dayAndYear',
              )} — "{purposeState.exemption.reason}"
            </AnnotationBox>
          {/if}

          {#if purposeState.lastReset}
            <AnnotationBox type="info" size="small">
              Last reset {formatDate(purposeState.lastReset.at, 'dayAndYear')} — "{purposeState
                .lastReset.reason}"
            </AnnotationBox>
          {/if}

          {#if purposeState.recentAttempts.length > 0}
            <div class="attempts">
              <p class="attempts-title typo-text-small">Recent attempts</p>
              {#each purposeState.recentAttempts as attempt (attempt.id)}
                <div class="attempt typo-text-small">
                  <span class="status {attempt.status}">{attempt.status}</span>
                  <span class="subtle">{formatDate(attempt.createdAt, 'dayAndYear')}</span>
                  <span class="subtle device" title={attempt.deviceId}
                    >{shortDeviceId(attempt.deviceId)}</span
                  >
                  {#if attempt.rejectLabels?.length}
                    <span class="subtle">{attempt.rejectLabels.join(', ')}</span>
                  {/if}
                </div>
              {/each}
            </div>
          {:else}
            <p class="subtle typo-text-small">No attempts on record.</p>
          {/if}

          {#if purposeState.exemption}
            <!-- The reset form is deliberately gone while the check is off. It
                 would return attempts at something this user is no longer being
                 asked to do, which reads as if it were doing something. -->
            <div class="action">
              <FormField
                title="Reason for turning the check back on"
                description="Recorded against your account. Optional."
              >
                <TextArea
                  bind:value={exemptionReasons[purposeState.purpose]}
                  placeholder="e.g. User replaced their webcam and passed a check unaided."
                />
              </FormField>
              <Button
                disabled={busyExemptionPurpose === purposeState.purpose}
                onclick={() => handleRevokeExemption(purposeState.purpose)}
              >
                {busyExemptionPurpose === purposeState.purpose
                  ? 'Turning back on…'
                  : 'Turn the check back on'}
              </Button>
            </div>
          {:else}
            <div class="action">
              <FormField
                title="Reason for reset"
                description="Recorded against your account. Required."
              >
                <TextArea
                  bind:value={reasons[purposeState.purpose]}
                  placeholder="e.g. Confirmed over support call — user's webcam kept failing."
                />
              </FormField>
              <Button
                variant="destructive"
                disabled={!(reasons[purposeState.purpose] ?? '').trim() ||
                  busyPurpose === purposeState.purpose}
                onclick={() => handleReset(purposeState.purpose)}
              >
                {busyPurpose === purposeState.purpose ? 'Resetting…' : 'Reset allowance'}
              </Button>
            </div>

            <div class="action">
              <FormField
                title="Reason for turning off the identity check"
                description="How you confirmed who this person is, and why the check can't be passed. Recorded against your account. Required."
              >
                <TextArea
                  bind:value={exemptionReasons[purposeState.purpose]}
                  placeholder="e.g. Matched their passport and a video call against the photo on file — the check rejects every attempt."
                />
              </FormField>
              <Button
                variant="destructive"
                disabled={!(exemptionReasons[purposeState.purpose] ?? '').trim() ||
                  busyExemptionPurpose === purposeState.purpose}
                onclick={() => handleGrantExemption(purposeState.purpose)}
              >
                {busyExemptionPurpose === purposeState.purpose
                  ? 'Turning off…'
                  : 'Turn off the identity check'}
              </Button>
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </Section>
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

  .intro {
    color: var(--color-foreground-level-5);
    margin-bottom: 1rem;
  }

  .form-row {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    margin-bottom: 1rem;
  }

  .user-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background-color: var(--color-foreground-level-1);
    border-radius: 1rem 0 1rem 1rem;
    margin-bottom: 1rem;
  }

  .avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
  }

  .subtle {
    color: var(--color-foreground-level-5);
  }

  .device {
    font-family: var(--typeface-mono-regular);
  }

  .purpose {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
  }

  .purpose-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .badge {
    padding: 0.125rem 0.5rem;
    border-radius: 0.5rem;
  }

  .badge.ok {
    background-color: var(--color-positive-level-1);
    color: var(--color-positive-level-6);
  }

  .badge.locked {
    background-color: var(--color-negative-level-1);
    color: var(--color-negative-level-6);
  }

  .badge.throttled {
    background-color: var(--color-caution-level-1);
    color: var(--color-caution-level-6);
  }

  .badge.exempt {
    background-color: var(--color-caution-level-1);
    color: var(--color-caution-level-6);
  }

  .badge.neutral {
    background-color: var(--color-foreground-level-1);
    color: var(--color-foreground-level-5);
  }

  .facts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
    gap: 0.75rem 1.5rem;
    margin: 0;
  }

  .facts dt {
    color: var(--color-foreground-level-5);
  }

  .facts dd {
    margin: 0;
  }

  .attempts {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .attempts-title {
    color: var(--color-foreground-level-5);
  }

  .attempt {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .status {
    text-transform: capitalize;
  }

  .status.rejected {
    color: var(--color-negative-level-6);
  }

  .status.approved {
    color: var(--color-positive-level-6);
  }

  .action {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-foreground-level-2);
  }
</style>

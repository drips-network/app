<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Section from '$lib/components/section/section.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import Button from '$lib/components/button/button.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { getUser } from '$lib/utils/wave/users';
  import { eraseUser, type ErasureReport } from '$lib/utils/wave/adminErasure';

  let lookupUsername = $state('');
  let requestReference = $state('');
  let confirmUsername = $state('');
  let looking = $state(false);
  let erasing = $state(false);

  let subject = $state<Awaited<ReturnType<typeof getUser>>>(null);
  let report = $state<ErasureReport | null>(null);

  const confirmed = $derived(
    subject !== null &&
      confirmUsername.trim().toLowerCase() === subject.gitHubUsername.toLowerCase(),
  );

  async function handleLookup() {
    if (!lookupUsername.trim() || looking) return;

    looking = true;
    report = null;
    confirmUsername = '';

    try {
      const found = await doWithErrorModal(() => getUser(fetch, lookupUsername.trim()));
      if (!found) throw new Error(`No account found for “${lookupUsername.trim()}”.`);
      subject = found;
    } catch {
      subject = null;
    } finally {
      looking = false;
    }
  }

  async function handleErase() {
    if (!subject || !confirmed || erasing) return;

    const target = subject;

    await doWithConfirmationModal(
      `This will permanently erase ${target.gitHubUsername}'s personal data. It cannot be undone, ` +
        `and it cannot be repeated — check you have verified the request came from them before continuing.`,
      async () => {
        erasing = true;
        try {
          report = await doWithErrorModal(() =>
            eraseUser(fetch, {
              userId: target.id,
              confirmGitHubUsername: target.gitHubUsername,
              requestReference: requestReference.trim() || undefined,
            }),
          );
          subject = null;
          lookupUsername = '';
          confirmUsername = '';
          requestReference = '';
        } finally {
          erasing = false;
        }
      },
    );
  }

  function outcomeLabel(outcome: string) {
    if (outcome === 'done') return 'Erased';
    if (outcome === 'skipped') return 'Nothing to erase';
    return 'Needs doing by hand';
  }
</script>

<HeadMeta title="Erase User | Admin | Wave" />

<div class="page">
  <Breadcrumbs crumbs={[{ label: 'Admin', href: '/wave/admin' }, { label: 'Erase User' }]} />

  {#if report}
    <Section header={{ label: 'Erased' }} skeleton={{ loaded: true }}>
      <div class="report">
        <AnnotationBox type="warning">
          <strong>{report.erasedGitHubUsername}</strong> has been erased. This is the only place
          that username still appears — it is no longer anywhere in the database. File this page
          with the request before you navigate away.
          <br /><br />
          Wave user ID (search for this in Intercom): <code>{report.userId}</code>
        </AnnotationBox>

        <div class="block">
          <h4 class="typo-text-bold">What was erased</h4>
          <ul class="rows">
            {#each report.steps as step (step.key)}
              <li class="row {step.outcome}">
                <div class="row-head">
                  <span class="typo-text-bold">{step.label}</span>
                  <span class="chip typo-text-small">{outcomeLabel(step.outcome)}</span>
                </div>
                <p class="typo-text-small detail">{step.detail}</p>
              </li>
            {/each}
          </ul>
        </div>

        <div class="block">
          <h4 class="typo-text-bold">What was kept, and why</h4>
          <ul class="rows">
            {#each report.retained as note (note.label)}
              <li class="row">
                <span class="typo-text-bold">{note.label}</span>
                <p class="typo-text-small detail">{note.detail}</p>
              </li>
            {/each}
          </ul>
        </div>

        <div class="block">
          <h4 class="typo-text-bold">Still to do — by hand</h4>
          <AnnotationBox type="error">
            The user has <strong>not</strong> been deleted from Intercom. Nothing here does that
            automatically, and Intercom holds their email address, their name and every support
            conversation they have had with us. Once you have told the user the erasure is done and
            filed their request, open Intercom, find the contact by the user ID above, and choose
            <strong>Permanently delete</strong> — archiving keeps the data.
          </AnnotationBox>
          <ul class="rows">
            {#each report.manualFollowUps as note (note.label)}
              <li class="row">
                <span class="typo-text-bold">{note.label}</span>
                <p class="typo-text-small detail">{note.detail}</p>
              </li>
            {/each}
          </ul>
        </div>

        <Button onclick={() => (report = null)}>Erase another account</Button>
      </div>
    </Section>
  {:else}
    <Section header={{ label: 'Erase User' }} skeleton={{ loaded: true }}>
      <div class="form">
        <AnnotationBox type="warning">
          For answering a deletion request. The account's records stay — points, issue history and
          payment records are all kept, because we are required to keep them — but every identifier
          on the account is erased and it becomes “Deleted account” everywhere it appears. Signing
          in again with the same GitHub account creates a brand-new, empty account.
          <br /><br />
          <strong>This cannot be undone.</strong> Verify the request actually came from the account holder
          — through a signed-in session, not an email address — before you run it.
        </AnnotationBox>

        <FormField
          title="GitHub username"
          description="Who is asking. Look them up first so you can check you have the right account."
        >
          <TextInput
            bind:value={lookupUsername}
            placeholder="e.g. octocat"
            onkeydown={(e: KeyboardEvent) => {
              if (e.key === 'Enter') handleLookup();
            }}
          />
        </FormField>

        <Button disabled={!lookupUsername.trim() || looking} onclick={handleLookup}>
          {looking ? 'Looking up…' : 'Look up'}
        </Button>

        {#if subject}
          <div class="subject">
            <UserAvatar size={48} src={subject.gitHubAvatarUrl} />
            <div class="subject-info">
              <p class="typo-text-bold">{subject.gitHubUsername}</p>
              <p class="typo-text-small dim">{subject.id}</p>
            </div>
          </div>

          <FormField
            title="Where the request is filed"
            description="An Intercom conversation, a ticket reference — whatever points back at the original request. Recorded alongside the erasure."
          >
            <TextInput
              bind:value={requestReference}
              placeholder="e.g. intercom:conversation/1234"
            />
          </FormField>

          <FormField
            title="Type the username again to confirm"
            description="Erasure is irreversible, so a mistyped lookup should not be enough to trigger it."
          >
            <TextInput bind:value={confirmUsername} placeholder={subject.gitHubUsername} />
          </FormField>

          <Button variant="destructive" disabled={!confirmed || erasing} onclick={handleErase}>
            {erasing ? 'Erasing…' : `Erase ${subject.gitHubUsername}`}
          </Button>
        {/if}
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
  .report {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 40rem;
    margin: 0 auto;
    width: 100%;
  }

  .block {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .subject {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
  }

  .subject-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .rows {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    border-bottom: 1px solid var(--color-foreground-level-2);
  }

  .row:last-child {
    border-bottom: none;
  }

  .row-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .chip {
    flex-shrink: 0;
    padding: 0.125rem 0.5rem;
    border-radius: 0.5rem;
    background-color: var(--color-foreground-level-1);
    color: var(--color-foreground-level-6);
  }

  .row.failed .chip {
    background-color: var(--color-negative-level-1);
    color: var(--color-negative-level-6);
  }

  .row.skipped {
    opacity: 0.6;
  }

  .detail,
  .dim {
    color: var(--color-foreground-level-5);
  }

  code {
    font-family: var(--typeface-mono, monospace);
    word-break: break-all;
  }
</style>

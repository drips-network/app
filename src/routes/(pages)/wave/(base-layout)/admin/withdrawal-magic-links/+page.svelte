<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Section from '$lib/components/section/section.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import Button from '$lib/components/button/button.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import GrantStatusBadge from '$lib/components/wave/rewards/grant-status-badge.svelte';
  import Copyable from '$lib/components/copyable/copyable.svelte';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import formatDate from '$lib/utils/format-date';
  import {
    createMagicLink,
    getWithdrawableGrantsForUser,
    revokeMagicLink,
    type CreateMagicLinkResponse,
    type WithdrawableGrantSummary,
    type WithdrawableGrantsResponse,
  } from '$lib/utils/wave/admin/magic-links';

  function confirm(message: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      doWithConfirmationModal(
        message,
        () => resolve(true),
        () => resolve(false),
      );
    });
  }

  let gitHubUsername = $state('');
  let lookupResult = $state<WithdrawableGrantsResponse | null>(null);
  let lookupError = $state<string | null>(null);
  let loadingLookup = $state(false);

  let busyGrantId = $state<string | null>(null);
  let lastIssued = $state<CreateMagicLinkResponse | null>(null);

  async function handleLookup() {
    if (!gitHubUsername.trim()) return;
    loadingLookup = true;
    lookupError = null;
    lastIssued = null;
    try {
      lookupResult = await getWithdrawableGrantsForUser(fetch, gitHubUsername.trim());
    } catch (e) {
      lookupResult = null;
      lookupError = e instanceof Error ? e.message : 'Lookup failed';
    } finally {
      loadingLookup = false;
    }
  }

  async function refreshLookup() {
    if (!lookupResult) return;
    // Surface refresh failures (e.g. a network blip after a successful
    // generate/revoke) instead of silently desyncing the UI.
    const refreshed = await doWithErrorModal(() =>
      getWithdrawableGrantsForUser(fetch, lookupResult!.user.gitHubUsername),
    );
    if (refreshed) lookupResult = refreshed;
  }

  async function handleGenerate(grant: WithdrawableGrantSummary) {
    if (!lookupResult) return;
    const recipient = lookupResult.user;
    const activeLink = grant.activeMagicLink;

    if (grant.requiresRecipient) {
      // A real GitHub organization has no single owner: the link is issued to
      // the searched member, who will be able to withdraw the org's grant.
      const replacing = activeLink
        ? activeLink.recipientGitHubUsername &&
          activeLink.recipientGitHubUsername !== recipient.gitHubUsername
          ? ` This immediately revokes the active link issued to ${activeLink.recipientGitHubUsername}.`
          : ' This immediately revokes the currently active link.'
        : '';
      const proceed = await confirm(
        `This grant belongs to the GitHub organization ${grant.orgLogin ?? ''}. The link will let ${recipient.gitHubUsername} withdraw the full $${grant.currentAmountUSD.toLocaleString()} on the organization's behalf, so only continue once you have confirmed they are entitled to it.${replacing}`,
      );
      if (!proceed) return;
    } else if (activeLink) {
      const proceed = await confirm(
        'A magic link is already active for this grant. Generating a new one will immediately revoke the old one. Continue?',
      );
      if (!proceed) return;
    }

    busyGrantId = grant.id;
    try {
      const issued = await doWithErrorModal(() =>
        createMagicLink(fetch, grant.id, grant.requiresRecipient ? recipient.id : undefined),
      );
      if (issued) {
        lastIssued = issued;
        await refreshLookup();
      }
    } finally {
      busyGrantId = null;
    }
  }

  async function handleRevoke(magicLinkId: string) {
    busyGrantId = magicLinkId;
    try {
      await doWithErrorModal(() => revokeMagicLink(fetch, magicLinkId), undefined, {
        message: 'Magic link revoked.',
        confetti: false,
      });
      await refreshLookup();
    } finally {
      busyGrantId = null;
    }
  }
</script>

<HeadMeta title="Withdrawal Magic Links | Admin | Wave" />

<div class="page">
  <Breadcrumbs
    crumbs={[{ label: 'Admin', href: '/wave/admin' }, { label: 'Withdrawal magic links' }]}
  />

  <Section header={{ label: 'Withdrawal magic links' }} skeleton={{ loaded: true }}>
    <p class="intro typo-text">
      Issue a one-time withdrawal link for a user who can no longer sign in to Wave via GitHub. Send
      the URL to the user out-of-band — they can use it to initiate test transactions and
      withdrawals without an authenticated session. Covers their personal grants, grants issued to
      an installation on their own GitHub account, and grants issued to any GitHub organization they
      are a member of. An organization's grant has no single owner, so its link is issued to the
      member you looked up and withdraws on the organization's behalf (KYB rules still apply). Links
      last 7 days and can be revoked at any time.
    </p>

    <div class="form-row">
      <FormField title="GitHub username">
        <TextInput
          bind:value={gitHubUsername}
          placeholder="e.g. octocat"
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (!gitHubUsername.trim() || loadingLookup) return;
              handleLookup();
            }
          }}
        />
      </FormField>
      <Button disabled={!gitHubUsername.trim() || loadingLookup} onclick={handleLookup}>
        {loadingLookup ? 'Looking up…' : 'Look up grants'}
      </Button>
    </div>

    {#if lookupError}
      <AnnotationBox type="warning">{lookupError}</AnnotationBox>
    {/if}

    {#if lastIssued}
      <div class="issued-box">
        <AnnotationBox type="info">
          <div class="issued-content">
            <p class="typo-text-bold">Magic link issued — copy it now, you won't see it again.</p>
            <p class="typo-text-small">
              Expires {formatDate(lastIssued.expiresAt, 'dayAndYear')}.
            </p>
            <div class="url-row">
              <Copyable value={lastIssued.url}>
                <code class="url typo-text-mono">{lastIssued.url}</code>
              </Copyable>
            </div>
          </div>
        </AnnotationBox>
      </div>
    {/if}

    {#if lookupResult}
      <div class="user-header">
        {#if lookupResult.user.gitHubAvatarUrl}
          <img
            class="avatar"
            src={lookupResult.user.gitHubAvatarUrl}
            alt={lookupResult.user.gitHubUsername}
          />
        {/if}
        <div>
          <p class="typo-text-bold">{lookupResult.user.gitHubUsername}</p>
          {#if lookupResult.user.gitHubName}
            <p class="typo-text-small subtle">{lookupResult.user.gitHubName}</p>
          {/if}
        </div>
      </div>

      {#if lookupResult.grants.length === 0}
        <AnnotationBox type="info">
          This user has no eligible grants that are currently withdrawable.
        </AnnotationBox>
      {:else}
        <div class="grants-table">
          {#each lookupResult.grants as grant (grant.id)}
            <div class="grant-row">
              <div class="grant-meta">
                <div class="grant-line">
                  <span class="typo-text-bold">{grant.waveProgramName} Wave {grant.waveNumber}</span
                  >
                  <GrantStatusBadge status={grant.status} expired={false} size="small" />
                </div>
                <div class="grant-line subtle typo-text-small">
                  <span>{grant.type}</span>
                  <span class="tnum">${grant.currentAmountUSD.toLocaleString()} USD</span>
                  <span>expires {formatDate(grant.expiresAt, 'dayAndYear')}</span>
                  {#if grant.requiresRecipient}
                    <span
                      class="org-badge"
                      title="Issued to a GitHub organization. A link is issued to the member you looked up and withdraws on the organization's behalf."
                      >org grant{grant.orgLogin ? ` · ${grant.orgLogin}` : ''}{grant.orgMemberRole
                        ? ` (${grant.orgMemberRole})`
                        : ''}</span
                    >
                  {:else if grant.isOrgGrant}
                    <span
                      title="Issued to the GitHub App installation on this person's own account, so it resolves to the same user."
                      >account grant{grant.orgLogin ? ` · ${grant.orgLogin}` : ''}</span
                    >
                  {/if}
                </div>
                {#if grant.activeMagicLink}
                  {@const linkRecipient = grant.activeMagicLink.recipientGitHubUsername}
                  {@const otherRecipient =
                    linkRecipient !== null && linkRecipient !== lookupResult.user.gitHubUsername}
                  <div class="grant-line subtle typo-text-small">
                    <span>
                      Active magic link issued {formatDate(grant.activeMagicLink.createdAt)}
                      {#if grant.requiresRecipient && linkRecipient}
                        to <span class:other-recipient={otherRecipient}>{linkRecipient}</span>
                      {/if}
                      — expires {formatDate(grant.activeMagicLink.expiresAt, 'dayAndYear')}.
                    </span>
                  </div>
                {/if}
              </div>
              <div class="grant-actions">
                {#if grant.activeMagicLink}
                  <Button
                    variant="destructive"
                    size="small"
                    disabled={busyGrantId === grant.activeMagicLink.id}
                    onclick={() => handleRevoke(grant.activeMagicLink!.id)}
                  >
                    Revoke
                  </Button>
                {/if}
                <Button
                  variant="primary"
                  size="small"
                  disabled={busyGrantId === grant.id}
                  onclick={() => handleGenerate(grant)}
                >
                  {grant.activeMagicLink ? 'Re-issue link' : 'Generate link'}
                </Button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
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

  .issued-box {
    margin-bottom: 1rem;
  }

  .issued-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .url-row {
    margin-top: 0.25rem;
  }

  .url {
    word-break: break-all;
    font-size: 0.875rem;
    color: var(--color-foreground);
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

  .grants-table {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .grant-row {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid var(--color-foreground-level-2);
  }

  .grant-row:last-child {
    border-bottom: none;
  }

  .grant-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .grant-line {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .org-badge {
    color: var(--color-primary-level-6);
  }

  .other-recipient {
    color: var(--color-caution-level-6);
    font-weight: 600;
  }

  .grant-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }
</style>

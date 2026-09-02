<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import Checkbox from '$lib/components/checkbox/checkbox.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import modal from '$lib/stores/modal';
  import { lookUpUser, type AdminUserLookupResult } from '$lib/utils/wave/admin/user-lookup';
  import {
    banGitHubUser,
    getBanTargetDiscordAccount,
    type BanTargetDiscordAccount,
    type RestrictionCategory,
    type RestrictionType,
  } from '$lib/utils/wave/bans';

  interface Props {
    onCreated: () => void;
  }

  let { onCreated }: Props = $props();

  const typeOptions = [
    { value: 'ban', title: 'Ban — block login entirely, revoke existing sessions' },
    {
      value: 'restriction',
      title: 'Restriction — login allowed, blocks applying to issues / applying repos',
    },
  ];

  const categoryOptions = [
    { value: 'offense', title: 'Offense — T&C violation, evasion, sybil, harassment, …' },
    {
      value: 'account_migration',
      title: 'Account migration — retiring an old account the user has moved away from',
    },
  ];

  const discordActionOptions = [
    { value: 'ban', title: 'Ban from the Discord server' },
    {
      value: 'unlink',
      title: 'Unlink from this Wave account — lets them link it to their new account',
    },
    { value: 'none', title: 'Leave as is' },
  ];

  let query = $state('');
  let type = $state<string>('ban');
  let category = $state<string>('offense');
  let reason = $state('');
  let skipNotification = $state(false);

  let resolvedUser = $state<AdminUserLookupResult | null | undefined>(undefined);
  /** The query `resolvedUser` was resolved from, so we don't look it up twice. */
  let resolvedQuery = $state<string | null>(null);
  let lookupError = $state<string | null>(null);
  let lookingUp = $state(false);
  let lookupToken = 0;

  let discordAccount = $state<BanTargetDiscordAccount>(null);
  let discordAction = $state<string>('ban');

  let submitting = $state(false);
  let submitError = $state<string | null>(null);
  let discordBanWarning = $state<string | null>(null);

  const trimmedQuery = $derived(query.trim());
  const canSubmit = $derived(!!resolvedUser && !submitting && !lookingUp && reason.length <= 500);
  // Restrictions are always offenses; only bans can be account migrations.
  const effectiveCategory = $derived<RestrictionCategory>(
    type === 'ban' && category === 'account_migration' ? 'account_migration' : 'offense',
  );

  /**
   * The category decides what the rest of the form should default to: an
   * account migration is not punitive, so the user shouldn't get the "you've
   * been banned" email, and their Discord account should follow them to the
   * new Wave account rather than get banned from the server.
   */
  function applyCategoryDefaults(value: string) {
    const migration = value === 'account_migration';
    skipNotification = migration;
    discordAction = migration ? 'unlink' : 'ban';
  }

  function onTypeChange(value: string) {
    if (value === 'restriction' && category === 'account_migration') {
      category = 'offense';
      applyCategoryDefaults('offense');
    }
  }
  // Wave stores no avatar for accounts it only knows by ID, so fall back to
  // GitHub's ID-keyed avatar URL, which needs no API call.
  const avatarUrl = $derived(
    resolvedUser?.gitHubAvatarUrl ??
      `https://avatars.githubusercontent.com/u/${resolvedUser?.gitHubUserId}?s=64`,
  );

  async function lookup() {
    const value = trimmedQuery;
    if (value.length === 0) {
      resolvedUser = undefined;
      resolvedQuery = null;
      lookupError = null;
      return;
    }

    if (resolvedUser && resolvedQuery?.toLowerCase() === value.toLowerCase()) {
      return;
    }

    const token = ++lookupToken;
    lookingUp = true;
    lookupError = null;
    resolvedUser = undefined;
    resolvedQuery = null;

    try {
      const user = await lookUpUser(fetch, value);
      if (token !== lookupToken) return;
      if (!user) {
        lookupError = `No user found for "${value}".`;
        resolvedUser = null;
      } else {
        resolvedUser = user;
        resolvedQuery = value;
        await lookupDiscordAccount(user.gitHubUserId, token);
      }
    } catch (e) {
      if (token !== lookupToken) return;
      lookupError = e instanceof Error ? e.message : 'Lookup failed.';
      resolvedUser = null;
    } finally {
      if (token === lookupToken) lookingUp = false;
    }
  }

  async function lookupDiscordAccount(gitHubUserId: number, token: number) {
    try {
      const { discordAccount: account } = await getBanTargetDiscordAccount(fetch, gitHubUserId);
      if (token !== lookupToken) return;
      discordAccount = account;
      discordAction = effectiveCategory === 'account_migration' ? 'unlink' : 'ban';
    } catch {
      // Non-fatal — the admin just won't see the Discord ban option.
      if (token === lookupToken) discordAccount = null;
    }
  }

  function onQueryInput() {
    // Invalidate any previous resolution as the user edits.
    resolvedUser = undefined;
    resolvedQuery = null;
    lookupError = null;
    discordAccount = null;
  }

  async function handleSubmit() {
    if (!canSubmit || !resolvedUser) return;

    submitting = true;
    submitError = null;

    try {
      const result = await banGitHubUser(fetch, {
        gitHubUserId: resolvedUser.gitHubUserId,
        type: type as RestrictionType,
        category: effectiveCategory,
        reason: reason.trim() ? reason.trim() : undefined,
        skipNotification,
        banFromDiscord: discordAccount ? discordAction === 'ban' : undefined,
        unlinkDiscord: discordAccount ? discordAction === 'unlink' : undefined,
      });

      onCreated();

      if (result.discordBanResult === 'failed') {
        // The Wave restriction was applied, but the Discord ban didn't go
        // through — keep the modal open so the admin knows to ban manually.
        discordBanWarning = `${resolvedUser.gitHubUsername} was ${
          type === 'ban' ? 'banned' : 'restricted'
        }, but banning their Discord account failed. Please ban them from the Discord server manually.`;
        return;
      }

      modal.hide();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'An unexpected error occurred.';
      if (msg.includes('409')) {
        submitError = `${resolvedUser.gitHubUsername} is already banned or restricted.`;
      } else if (msg.includes('400')) {
        submitError = 'Bad request. The backend rejected this ban.';
      } else {
        submitError = msg;
      }
    } finally {
      submitting = false;
    }
  }
</script>

<div class="modal">
  <StandaloneFlowStepLayout
    headline="Ban or restrict a user"
    description="Bans block login entirely and revoke sessions immediately. Restrictions allow login but block actions like applying to issues or repos."
  >
    <div class="fields">
      <FormField
        title="User"
        description="A GitHub username, a numeric GitHub user ID, or a Wave user ID. Resolved against Wave's own records, falling back to GitHub for accounts that never signed up."
      >
        <TextInput
          bind:value={query}
          placeholder="e.g. octocat"
          oninput={onQueryInput}
          onblur={lookup}
        />
      </FormField>

      {#if lookingUp}
        <p class="hint typo-text-small">Looking up user…</p>
      {:else if resolvedUser}
        <div class="preview">
          <img class="avatar" src={avatarUrl} alt="" referrerpolicy="no-referrer" />
          <div class="info">
            <span class="login typo-text-bold">{resolvedUser.gitHubUsername}</span>
            {#if resolvedUser.gitHubName}
              <span class="name typo-text-small dim">{resolvedUser.gitHubName}</span>
            {/if}
            <span class="id typo-text-small dim">GitHub ID #{resolvedUser.gitHubUserId}</span>
          </div>
        </div>
        {#if resolvedUser.source === 'github'}
          <p class="hint typo-text-small">
            No Wave account yet — the restriction will apply if they sign up later.
          </p>
        {/if}
      {:else if lookupError}
        <AnnotationBox type="warning">{lookupError}</AnnotationBox>
      {/if}

      <FormField title="Type">
        <Dropdown options={typeOptions} bind:value={type} onchange={onTypeChange} />
      </FormField>

      {#if type === 'ban'}
        <FormField
          title="Category"
          description="Account migrations are administrative, not punitive: picking one defaults the notification and Discord options below accordingly."
        >
          <Dropdown
            options={categoryOptions}
            bind:value={category}
            onchange={applyCategoryDefaults}
          />
        </FormField>
      {/if}

      <FormField title="Reason" description="Optional. Up to 500 characters.">
        <TextArea bind:value={reason} placeholder="Why is this user being banned or restricted?" />
      </FormField>

      <FormField
        title="Notification"
        description="Use for non-punitive restrictions, e.g. locking down an old account during a support-led account migration."
      >
        <Checkbox bind:checked={skipNotification} label="Don't notify the user via email" />
      </FormField>

      {#if discordAccount}
        <FormField
          title="Discord"
          description="This user has a linked Discord account. You can ban it from the Discord server, or unlink it from this Wave account so they can link it to a new one once they no longer have access to this one."
        >
          <div class="discord-section">
            <div class="preview">
              {#if discordAccount.providerAvatarUrl}
                <img
                  class="avatar"
                  src={discordAccount.providerAvatarUrl}
                  alt=""
                  referrerpolicy="no-referrer"
                />
              {/if}
              <div class="info">
                <span class="login typo-text-bold">{discordAccount.providerUsername}</span>
                {#if discordAccount.providerDisplayName}
                  <span class="name typo-text-small dim">{discordAccount.providerDisplayName}</span>
                {/if}
              </div>
            </div>
            <Dropdown options={discordActionOptions} bind:value={discordAction} />
          </div>
        </FormField>
      {/if}
    </div>

    {#if submitError}
      <AnnotationBox type="error">{submitError}</AnnotationBox>
    {/if}

    {#if discordBanWarning}
      <AnnotationBox type="warning">{discordBanWarning}</AnnotationBox>
    {/if}

    {#snippet actions()}
      {#if discordBanWarning}
        <Button variant="primary" onclick={modal.hide}>Close</Button>
      {:else}
        <Button variant="normal" disabled={submitting} onclick={modal.hide}>Cancel</Button>
        {#if !resolvedUser && trimmedQuery.length > 0 && !lookingUp}
          <Button variant="primary" loading={lookingUp} onclick={lookup}>Look up</Button>
        {:else}
          <Button
            variant="primary"
            loading={submitting}
            disabled={!canSubmit}
            onclick={handleSubmit}
          >
            {type === 'ban' ? 'Ban user' : 'Restrict user'}
          </Button>
        {/if}
      {/if}
    {/snippet}
  </StandaloneFlowStepLayout>
</div>

<style>
  .modal {
    padding: 1rem;
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .hint {
    color: var(--color-foreground-level-5);
  }

  .preview {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 0.5rem;
    background: var(--color-foreground-level-1);
  }

  .avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .dim {
    color: var(--color-foreground-level-5);
  }

  .discord-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
</style>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import modal from '$lib/stores/modal';
  import { lookupGitHubUserByLogin, type GitHubUser } from '$lib/utils/github/lookup-user';
  import { banGitHubUser, type RestrictionType } from '$lib/utils/wave/bans';

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

  let username = $state('');
  let type = $state<string>('ban');
  let reason = $state('');

  let resolvedUser = $state<GitHubUser | null | undefined>(undefined);
  let lookupError = $state<string | null>(null);
  let lookingUp = $state(false);
  let lookupToken = 0;

  let submitting = $state(false);
  let submitError = $state<string | null>(null);

  const trimmedUsername = $derived(username.trim());
  const canSubmit = $derived(!!resolvedUser && !submitting && !lookingUp && reason.length <= 500);

  async function lookup() {
    const value = trimmedUsername;
    if (value.length === 0) {
      resolvedUser = undefined;
      lookupError = null;
      return;
    }

    if (resolvedUser && resolvedUser.login.toLowerCase() === value.toLowerCase()) {
      return;
    }

    const token = ++lookupToken;
    lookingUp = true;
    lookupError = null;
    resolvedUser = undefined;

    try {
      const user = await lookupGitHubUserByLogin(value);
      if (token !== lookupToken) return;
      if (!user) {
        lookupError = `No GitHub user found with username "${value}".`;
        resolvedUser = null;
      } else {
        resolvedUser = user;
      }
    } catch (e) {
      if (token !== lookupToken) return;
      lookupError = e instanceof Error ? e.message : 'Lookup failed.';
      resolvedUser = null;
    } finally {
      if (token === lookupToken) lookingUp = false;
    }
  }

  function onUsernameInput() {
    // Invalidate any previous resolution as the user edits.
    resolvedUser = undefined;
    lookupError = null;
  }

  async function handleSubmit() {
    if (!canSubmit || !resolvedUser) return;

    submitting = true;
    submitError = null;

    try {
      await banGitHubUser(fetch, {
        gitHubUserId: resolvedUser.id,
        type: type as RestrictionType,
        reason: reason.trim() ? reason.trim() : undefined,
      });
      onCreated();
      modal.hide();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'An unexpected error occurred.';
      if (msg.includes('409')) {
        submitError = `${resolvedUser.login} is already banned or restricted.`;
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
        title="GitHub Username"
        description="Looked up against the public GitHub API to resolve the numeric user ID."
      >
        <TextInput
          bind:value={username}
          placeholder="e.g. octocat"
          oninput={onUsernameInput}
          onblur={lookup}
        />
      </FormField>

      {#if lookingUp}
        <p class="hint typo-text-small">Looking up GitHub user…</p>
      {:else if resolvedUser}
        <div class="preview">
          <img class="avatar" src={resolvedUser.avatarUrl} alt="" referrerpolicy="no-referrer" />
          <div class="info">
            <span class="login typo-text-bold">{resolvedUser.login}</span>
            {#if resolvedUser.name}
              <span class="name typo-text-small dim">{resolvedUser.name}</span>
            {/if}
            <span class="id typo-text-small dim">GitHub ID #{resolvedUser.id}</span>
          </div>
        </div>
      {:else if lookupError}
        <AnnotationBox type="warning">{lookupError}</AnnotationBox>
      {/if}

      <FormField title="Type">
        <Dropdown options={typeOptions} bind:value={type} />
      </FormField>

      <FormField title="Reason" description="Optional. Up to 500 characters.">
        <TextArea bind:value={reason} placeholder="Why is this user being banned or restricted?" />
      </FormField>
    </div>

    {#if submitError}
      <AnnotationBox type="error">{submitError}</AnnotationBox>
    {/if}

    {#snippet actions()}
      <Button variant="normal" disabled={submitting} onclick={modal.hide}>Cancel</Button>
      {#if !resolvedUser && trimmedUsername.length > 0 && !lookingUp}
        <Button variant="primary" loading={lookingUp} onclick={lookup}>Look up</Button>
      {:else}
        <Button variant="primary" loading={submitting} disabled={!canSubmit} onclick={handleSubmit}>
          {type === 'ban' ? 'Ban user' : 'Restrict user'}
        </Button>
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
</style>

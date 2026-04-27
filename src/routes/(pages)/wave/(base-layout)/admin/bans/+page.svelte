<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import { page } from '$app/state';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Section from '$lib/components/section/section.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import Refresh from '$lib/components/icons/Refresh.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import modal from '$lib/stores/modal';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { unbanGitHubUser } from '$lib/utils/wave/bans';
  import CreateBanModal from './components/create-ban-modal.svelte';
  import GitHubUserById from './components/github-user-by-id.svelte';

  let { data } = $props();

  let bans = $derived(data.bans);
  let typeFilter = $state<string>(data.type ?? 'all');
  let refreshing = $state(false);

  const typeOptions = [
    { value: 'all', title: 'All' },
    { value: 'ban', title: 'Bans' },
    { value: 'restriction', title: 'Restrictions' },
  ];

  async function refresh() {
    refreshing = true;
    await invalidate('wave:admin:bans');
    refreshing = false;
  }

  async function applyFilter() {
    const url = new URL(page.url);
    if (typeFilter === 'all') {
      url.searchParams.delete('type');
    } else {
      url.searchParams.set('type', typeFilter);
    }
    await goto(url.pathname + url.search, { keepFocus: true, noScroll: true });
  }

  function openCreateModal() {
    modal.show(CreateBanModal, undefined, {
      onCreated: refresh,
    });
  }

  async function lift(gitHubUserId: number, type: 'ban' | 'restriction') {
    const noun = type === 'ban' ? 'ban' : 'restriction';
    const message = `Lift the ${noun} on GitHub user #${gitHubUserId}? They will regain ${type === 'ban' ? 'the ability to log in' : 'access to restricted actions'} immediately.`;

    await doWithConfirmationModal(message, async () => {
      await doWithErrorModal(() => unbanGitHubUser(fetch, gitHubUserId), undefined, {
        message: `${noun[0].toUpperCase() + noun.slice(1)} lifted.`,
        confetti: false,
      });
      await refresh();
    });
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
</script>

<HeadMeta title="Bans & Restrictions | Admin | Wave" />

<div class="page">
  <Breadcrumbs
    crumbs={[{ label: 'Admin', href: '/wave/admin' }, { label: 'Bans & Restrictions' }]}
  />
  <Section
    header={{
      label: 'Bans & Restrictions',
      actions: [
        {
          label: 'Refresh',
          icon: Refresh,
          disabled: refreshing,
          handler: refresh,
        },
        {
          label: 'Ban or restrict a user',
          icon: Plus,
          variant: 'primary',
          handler: openCreateModal,
        },
      ],
    }}
    skeleton={{
      loaded: true,
      empty: bans.pagination.total === 0,
      emptyStateEmoji: '🛡️',
      emptyStateHeadline:
        typeFilter === 'all'
          ? 'No active bans or restrictions'
          : typeFilter === 'ban'
            ? 'No active bans'
            : 'No active restrictions',
      emptyStateText: 'Use the button above to ban or restrict a GitHub user.',
    }}
  >
    <div class="filter">
      <FormField title="Type">
        <Dropdown options={typeOptions} bind:value={typeFilter} onchange={applyFilter} />
      </FormField>
    </div>

    {#if bans.pagination.total > 0}
      <div class="list">
        {#each bans.data as ban (ban.id)}
          <div class="row">
            <div class="left">
              <GitHubUserById gitHubUserId={ban.gitHubUserId} />
              <div class="meta typo-text-small">
                <span
                  class="badge"
                  class:ban={ban.type === 'ban'}
                  class:restriction={ban.type === 'restriction'}
                >
                  {ban.type}
                </span>
                <span class="dim">·</span>
                <span class="dim">{formatDate(ban.bannedAt)}</span>
                {#if ban.bannedBy}
                  <span class="dim">·</span>
                  <span class="dim">by {ban.bannedBy.gitHubUsername}</span>
                {/if}
              </div>
              {#if ban.reason}
                <p class="reason typo-text-small">{ban.reason}</p>
              {/if}
            </div>

            <div class="actions">
              <Button size="small" variant="ghost" onclick={() => lift(ban.gitHubUserId, ban.type)}>
                Lift
              </Button>
            </div>
          </div>
        {/each}
      </div>

      {#if bans.pagination.total > bans.data.length}
        <p class="footer typo-text-small">
          Showing {bans.data.length} of {bans.pagination.total}.
        </p>
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

  .filter {
    max-width: 16rem;
    margin-bottom: 1.5rem;
  }

  .list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .row {
    padding: 1rem;
    border-bottom: 1px solid var(--color-foreground-level-2);
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
  }

  .row:last-child {
    border-bottom: none;
  }

  .left {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
    flex: 1;
  }

  .meta {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .badge {
    text-transform: uppercase;
    font-size: 0.625rem;
    letter-spacing: 0.05em;
    padding: 0.125rem 0.5rem;
    border-radius: 0.5rem;
    font-family: var(--typeface-mono);
  }

  .badge.ban {
    background: var(--color-negative-level-1);
    color: var(--color-negative-level-6);
  }

  .badge.restriction {
    background: var(--color-caution-level-1);
    color: var(--color-caution-level-6);
  }

  .dim {
    color: var(--color-foreground-level-5);
  }

  .reason {
    color: var(--color-foreground-level-6);
    margin: 0;
    word-break: break-word;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .footer {
    color: var(--color-foreground-level-5);
    margin-top: 0.75rem;
    text-align: center;
  }
</style>

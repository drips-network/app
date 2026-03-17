<script lang="ts">
  import { invalidate } from '$app/navigation';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Section from '$lib/components/section/section.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Refresh from '$lib/components/icons/Refresh.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import Copy from '$lib/components/icons/Copy.svelte';
  import modal from '$lib/stores/modal';
  import { BASE_URL } from '$lib/utils/base-url';
  import CreateSignupSourceModal from './components/create-signup-source-modal.svelte';

  let { data } = $props();

  let signupSources = $derived(data.signupSources);
  let refreshing = $state(false);

  async function refresh() {
    refreshing = true;
    await invalidate('wave:admin:signup-sources');
    refreshing = false;
  }

  function openCreateModal() {
    modal.show(CreateSignupSourceModal, undefined, {
      onCreated: refresh,
    });
  }

  async function copySignupUrl(code: string) {
    const url = `${BASE_URL}/wave/login?ref=${code}`;
    await navigator.clipboard.writeText(url);
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
</script>

<HeadMeta title="Signup Sources | Admin | Wave" />

<div class="page">
  <Breadcrumbs crumbs={[{ label: 'Admin', href: '/wave/admin' }, { label: 'Signup Sources' }]} />
  <Section
    header={{
      label: 'Signup Sources',
      actions: [
        {
          label: 'Refresh',
          icon: Refresh,
          disabled: refreshing,
          handler: refresh,
        },
        {
          label: 'Create',
          icon: Plus,
          variant: 'primary',
          handler: openCreateModal,
        },
      ],
    }}
    skeleton={{
      loaded: true,
      empty: signupSources.pagination.total === 0,
      emptyStateEmoji: '🔗',
      emptyStateHeadline: 'No signup sources',
      emptyStateText: 'Create a signup source to start tracking signup attributions.',
    }}
  >
    <div class="list">
      {#each signupSources.data as source (source.id)}
        <div class="row">
          <div class="source-info">
            <div class="source-header">
              <span class="typo-text-bold code">{source.code}</span>
              <span class="typo-text name">{source.name}</span>
            </div>
            <div class="meta typo-text-small">
              <span class="dim">{source.signupCount} signups</span>
              <span class="dim">·</span>
              <span class="dim">Created by {source.createdBy.gitHubUsername}</span>
              <span class="dim">·</span>
              <span class="dim">{formatDate(source.createdAt)}</span>
            </div>
          </div>

          <div class="actions">
            <Button
              size="small"
              variant="ghost"
              icon={Copy}
              onclick={() => copySignupUrl(source.code)}>Copy URL</Button
            >
          </div>
        </div>
      {/each}
    </div>
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

  .source-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .source-header {
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
    flex-wrap: wrap;
  }

  .code {
    font-family: var(--typeface-mono);
  }

  .name {
    color: var(--color-foreground-level-5);
  }

  .meta {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .dim {
    color: var(--color-foreground-level-5);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }
</style>

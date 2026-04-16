<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Label from '$lib/components/icons/Label.svelte';
  import Folder from '$lib/components/icons/Folder.svelte';
  import ScrollableTabs from '$lib/components/scrollable-tabs/scrollable-tabs.svelte';
  import type { Snippet } from 'svelte';

  const { children, data }: { children: Snippet; data: { canManageTags: boolean } } = $props();

  const baseUrl = '/wave/admin/repos';
</script>

<HeadMeta title="Repos & Tags | Admin | Wave" />

<div class="page">
  <Breadcrumbs crumbs={[{ label: 'Admin', href: '/wave/admin' }, { label: 'Repos & Tags' }]} />

  <div class="tabs">
    <ScrollableTabs
      tabs={[
        { label: 'Repos', href: `${baseUrl}/repos`, icon: Folder },
        ...(data.canManageTags ? [{ label: 'Tags', href: `${baseUrl}/tags`, icon: Label }] : []),
      ]}
    />
  </div>

  <div class="content">
    {@render children()}
  </div>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 90rem;
    width: 100%;
    margin: 0 auto;
  }

  .tabs {
    position: sticky;
    top: 2.5rem;
    width: 100%;
    background-color: var(--color-background);
    z-index: 2;
  }

  .content {
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
</style>

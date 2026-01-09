<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Bell from '$lib/components/icons/Bell.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import Settings from '$lib/components/icons/Settings.svelte';
  import User from '$lib/components/icons/User.svelte';
  import ScrollableTabs from '$lib/components/scrollable-tabs/scrollable-tabs.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';

  import type { Snippet } from 'svelte';

  const { children }: { children: Snippet } = $props();

  const settingsBaseUrl = `/wave/settings`;
</script>

<HeadMeta title="Settings" />

<div class="page">
  <div style:view-transition-name="settings-header" style:view-transition-class="element-handover">
    <SectionHeader icon={Settings} label="Settings" />
  </div>

  <div class="tabs">
    <ScrollableTabs
      tabs={[
        {
          label: 'App experience',
          href: `${settingsBaseUrl}/app-experience`,
          icon: Pen,
        },
        {
          label: 'Identity & Payments',
          href: `${settingsBaseUrl}/identity-and-payments`,
          icon: User,
        },
        {
          label: 'Notifications',
          href: `${settingsBaseUrl}/notifications`,
          icon: Bell,
        },
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

  .content {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .tabs {
    position: sticky;
    top: 3.5rem;
    width: 100%;
    background-color: var(--color-background);
    z-index: 2;
  }
</style>

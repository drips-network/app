<script lang="ts">
  import { onMount } from 'svelte';
  import { forceCollapsed as forceMainSidebarCollapsed } from '$lib/components/sidenav/sidenav-store';
  import SidenavItem from '$lib/components/sidenav/components/sidenav-item.svelte';
  import { page } from '$app/stores';
  import Label from '$lib/components/icons/Label.svelte';
  import type { RoundDraft } from '$lib/utils/rpgf/schemas';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import Calendar from '$lib/components/icons/Calendar.svelte';
  import User from '$lib/components/icons/User.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';

  export let draftIdOrRoundSlug: string;

  export let isDraft: boolean;
  export let roundOrDraft: RoundDraft;

  onMount(() => {
    $forceMainSidebarCollapsed = true;

    return () => {
      $forceMainSidebarCollapsed = false;
    };
  });

  $: settingsBaseUrl = isDraft
    ? `/app/rpgf/drafts/${draftIdOrRoundSlug}/settings`
    : `/app/rpgf/rounds/${draftIdOrRoundSlug}/settings`;
</script>

<div class="rpgf-settings-layout">
  <div class="settings-sidenav">
    <a
      class="back"
      href={isDraft
        ? `/app/rpgf/drafts/${draftIdOrRoundSlug}`
        : `/app/rpgf/rounds/${draftIdOrRoundSlug}`}
    >
      <ArrowLeft style="fill: var(--color-foreground)" />
      <span class="typo-text-bold">{roundOrDraft.name ?? 'Unnamed round'}</span>
    </a>
    <SidenavItem
      label="Representation"
      href="{settingsBaseUrl}/representation"
      active={$page.url.pathname === `${settingsBaseUrl}/representation`}
      icon={Label}
      backgroundOnActive
    />
    <SidenavItem
      label="Schedule"
      href="{settingsBaseUrl}/schedule"
      active={$page.url.pathname === `${settingsBaseUrl}/schedule`}
      icon={Calendar}
      backgroundOnActive
    />
    <SidenavItem
      label="Admins"
      href="{settingsBaseUrl}/admins"
      active={$page.url.pathname === `${settingsBaseUrl}/admins`}
      icon={User}
      backgroundOnActive
    />
    <SidenavItem
      label="Voting"
      href="{settingsBaseUrl}/voting"
      active={$page.url.pathname === `${settingsBaseUrl}/voting`}
      icon={Proposals}
      backgroundOnActive
    />
    <SidenavItem
      label="Application form"
      href="{settingsBaseUrl}/application"
      active={$page.url.pathname === `${settingsBaseUrl}/application`}
      icon={Ledger}
      backgroundOnActive
    />
  </div>
  <div class="content">
    <slot />
  </div>
</div>

<style>
  .rpgf-settings-layout {
    display: grid;
    grid-template-columns: minmax(auto, 13rem) 3fr;
    grid-template-areas: 'sidenav content';
    gap: 3rem;
  }

  .back {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: var(--color-foreground);
    cursor: pointer;
    margin-bottom: 1rem;
  }

  .settings-sidenav {
    grid-area: sidenav;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    view-transition-name: rpgf-settings-sidenav;
  }

  .content {
    grid-area: content;
    max-width: 64rem;
    margin: 0 auto;
    width: 100%;
  }
</style>

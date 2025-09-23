<script lang="ts">
  import { onMount } from 'svelte';
  import { forceCollapsed as forceMainSidebarCollapsed } from '$lib/components/sidenav/sidenav-store';
  import SidenavItem from '$lib/components/sidenav/components/sidenav-item.svelte';
  import { page } from '$app/stores';
  import Label from '$lib/components/icons/Label.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import Calendar from '$lib/components/icons/Calendar.svelte';
  import User from '$lib/components/icons/User.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import RpgfDraftTodoCard from '$lib/components/rpgf-draft-todo-card/rpgf-draft-todo-card.svelte';
  import ScrollableTabs from '$lib/components/scrollable-tabs/scrollable-tabs.svelte';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import File from '$lib/components/icons/File.svelte';

  export let round: Round;
  export let amountOfVoters: number;

  onMount(() => {
    $forceMainSidebarCollapsed = true;

    return () => {
      $forceMainSidebarCollapsed = false;
    };
  });

  $: settingsBaseUrl = `/app/rpgf/rounds/${round.published ? round.urlSlug : round.id}/settings`;

  $: backLink = `/app/rpgf/rounds/${round.published ? round.urlSlug : round.id}`;

  $: name = round.name ?? 'Unnamed round';
</script>

<div class="rpgf-settings-layout">
  <div class="sidebar">
    <div class="mobile-only">
      <a class="back" href={backLink}>
        <ArrowLeft style="fill: var(--color-foreground)" />
        <span class="typo-text-bold">{name}</span>
      </a>
    </div>
    <div class="desktop-only">
      {#if !round.published}
        <RpgfDraftTodoCard {round} {amountOfVoters} />
      {/if}
    </div>
  </div>

  <div class="settings-sidenav">
    <a class="back" href={backLink}>
      <ArrowLeft style="fill: var(--color-foreground)" />
      <span class="typo-text-bold">{name}</span>
    </a>
    <SidenavItem
      label="Representation"
      href="{settingsBaseUrl}/representation"
      active={$page.url.pathname === `${settingsBaseUrl}/representation`}
      icon={Label}
      backgroundOnActive
    />
    {#if !round.published}
      <SidenavItem
        label="Schedule"
        href="{settingsBaseUrl}/schedule"
        active={$page.url.pathname === `${settingsBaseUrl}/schedule`}
        icon={Calendar}
        backgroundOnActive
      />
    {/if}
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
      label="Applications"
      href="{settingsBaseUrl}/application"
      active={$page.url.pathname === `${settingsBaseUrl}/application`}
      icon={Ledger}
      backgroundOnActive
    />
    <SidenavItem
      label="Audit log"
      href="{settingsBaseUrl}/audit-log"
      active={$page.url.pathname === `${settingsBaseUrl}/audit-log`}
      icon={File}
      backgroundOnActive
    />
  </div>

  <div class="tabs">
    <ScrollableTabs
      tabs={[
        {
          label: 'Representation',
          href: `${settingsBaseUrl}/representation`,
          icon: Label,
        },
        {
          label: 'Schedule',
          href: `${settingsBaseUrl}/schedule`,
          icon: Calendar,
        },
        {
          label: 'Admins',
          href: `${settingsBaseUrl}/admins`,
          icon: User,
        },
        {
          label: 'Voting',
          href: `${settingsBaseUrl}/voting`,
          icon: Proposals,
        },
        {
          label: 'Applications',
          href: `${settingsBaseUrl}/application`,
          icon: Ledger,
        },
        {
          label: 'Audit log',
          href: `${settingsBaseUrl}/audit-log`,
          icon: Ledger,
        },
      ]}
    />
  </div>

  <div class="content">
    <slot />
  </div>
</div>

<style>
  .rpgf-settings-layout {
    position: relative;
    display: grid;
    max-width: 112rem;
    margin: 0 auto;
    grid-template-columns: minmax(auto, 13rem) 3fr minmax(auto, 19rem);
    grid-template-areas: 'sidenav content sidebar';
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
    max-width: 48rem;
    padding-bottom: 2rem;
    margin: 0 auto;
    width: 100%;
  }

  .tabs {
    display: none;
  }

  .mobile-only {
    display: none;
  }

  .sidebar {
    view-transition-name: rpgf-settings-sidebar;
  }

  @media (max-width: 1251px) {
    .mobile-only {
      display: block;
    }

    .desktop-only {
      display: none;
    }

    .rpgf-settings-layout {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
      grid-template-areas:
        'sidebar'
        'tabs'
        'content';
      gap: 2rem;
      max-width: 100vw;
      padding-bottom: 7rem;
    }

    .settings-sidenav {
      display: none;
    }

    .tabs {
      display: block;
      position: sticky;
      top: 4rem;
      min-width: 0;
      grid-area: tabs;
      z-index: 1;
    }
  }
</style>

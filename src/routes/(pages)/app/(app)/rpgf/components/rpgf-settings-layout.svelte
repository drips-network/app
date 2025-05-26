<script lang="ts">
  import { onMount } from 'svelte';
  import { forceCollapsed as forceMainSidebarCollapsed } from '$lib/components/sidenav/sidenav-store';
  import SidenavItem from '$lib/components/sidenav/components/sidenav-item.svelte';
  import { page } from '$app/stores';
  import Label from '$lib/components/icons/Label.svelte';
  import type { RoundDraftWrapperDto } from '$lib/utils/rpgf/schemas';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import Calendar from '$lib/components/icons/Calendar.svelte';
  import User from '$lib/components/icons/User.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import RpgfDraftTodoCard from '$lib/components/rpgf-draft-todo-card/rpgf-draft-todo-card.svelte';
  import ScrollableTabs from '$lib/components/scrollable-tabs/scrollable-tabs.svelte';

  export let draftIdOrRoundSlug: string;

  export let isDraft: boolean;
  export let draftWrapper: RoundDraftWrapperDto;
  $: roundOrDraft = draftWrapper.draft;

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
  <div class="sidebar">
    <div class="mobile-only">
      <a
        class="back"
        href={isDraft
          ? `/app/rpgf/drafts/${draftIdOrRoundSlug}`
          : `/app/rpgf/rounds/${draftIdOrRoundSlug}`}
      >
        <ArrowLeft style="fill: var(--color-foreground)" />
        <span class="typo-text-bold">{roundOrDraft.name ?? 'Unnamed round'}</span>
      </a>
    </div>
    {#if isDraft}
      <RpgfDraftTodoCard {draftWrapper} />
    {/if}
  </div>

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
          label: 'Application form',
          href: `${settingsBaseUrl}/application`,
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
    max-width: 100rem;
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

  @media (max-width: 1251px) {
    .mobile-only {
      display: block;
    }

    .rpgf-settings-layout {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
      grid-template-areas:
        'todo'
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

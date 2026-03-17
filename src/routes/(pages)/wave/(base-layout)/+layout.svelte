<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import type { PageProps } from './$types';
  import Header from '$lib/components/wave/header/header.svelte';
  import ModalLayout from '$lib/components/modal-layout/modal-layout.svelte';
  import { page } from '$app/state';
  import Nav from '$lib/components/wave/nav/nav.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import Orgs from '$lib/components/icons/Orgs.svelte';
  import Settings from '$lib/components/icons/Settings.svelte';
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import breakpointsStore from '$lib/stores/breakpoints/breakpoints.store';
  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';
  import CupertinoPaneTarget from '$lib/stores/cupertino-pane/cupertino-pane-target.svelte';
  import Issue from '$lib/components/icons/Issue.svelte';
  import Wave from '$lib/components/icons/Wave.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import Shield from '$lib/components/icons/Shield.svelte';

  let {
    data,
    children,
  }: PageProps & {
    children: Snippet;
  } = $props();

  let sidenavExpanded = $state(false);

  onMount(() => {
    breakpointsStore.attach();
    return () => breakpointsStore.detach();
  });

  onMount(() => {
    cupertinoPaneStore.attach();
    return () => cupertinoPaneStore.detach();
  });

  const hasPermissions = $derived(Boolean(data.user?.permissions?.length));

  const NAV_ITEMS = $derived({
    top: [
      {
        type: 'collection' as const,
        items: [
          {
            type: 'target' as const,
            name: 'Explore Waves',
            href: '/wave',
            icon: Wave,
            allowBacktrack: true,
          },
          {
            type: 'target' as const,
            name: 'Explore Orgs',
            href: '/wave/orgs',
            icon: Orgs,
            allowBacktrack: true,
          },
        ],
      },
      {
        type: 'collection' as const,
        name: 'Contributor',
        items: [
          {
            type: 'target' as const,
            name: 'Issues',
            href: '/wave/contributors/issues',
            icon: Issue,
            count: data.counts.contributorIssuesCount,
          },
        ],
      },
      {
        type: 'collection' as const,
        name: 'Maintainer',
        items: [
          {
            type: 'target' as const,
            name: 'Issues',
            href: '/wave/maintainers/issues',
            icon: Issue,
          },
          {
            type: 'target' as const,
            name: 'Orgs & repos',
            href: '/wave/maintainers/repos',
            icon: Orgs,
          },
        ],
      },
    ],
    bottom: [
      {
        type: 'collection' as const,
        items: [
          ...(hasPermissions
            ? [
                {
                  type: 'target' as const,
                  name: 'Admin',
                  href: '/wave/admin',
                  icon: Shield,
                },
              ]
            : []),
          {
            type: 'target' as const,
            name: 'Reward Grants',
            href: '/wave/rewards',
            icon: Wallet,
          },
          {
            type: 'target' as const,
            name: 'Points history',
            href: '/wave/points',
            icon: Trophy,
          },
          {
            type: 'target' as const,
            name: 'Settings',
            href: '/wave/settings',
            icon: Settings,
          },
          {
            type: 'target' as const,
            name: 'Docs',
            href: 'https://docs.drips.network/wave',
            newTab: true,
            icon: InfoCircle,
          },
        ],
      },
    ],
  });
</script>

<ModalLayout />

<CupertinoPaneTarget />

<div class="header-container">
  <Header
    mobileNavItems={NAV_ITEMS}
    pointsBalance={data.pointsBalance?.totalPoints || null}
    user={data.user}
    noBackground={page.data.waveHeaderBackground === false}
  />
</div>

<div class="layout-container">
  <div class="content" class:sidenavExpanded>
    {@render children()}
  </div>

  <div class="nav-wrapper">
    <Nav
      bind:isCurrentlyExpanded={sidenavExpanded}
      items={NAV_ITEMS}
      invisibleRoutes={['/wave/users']}
    />
  </div>
</div>

<style>
  .header-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 5;
    max-width: 100vw;
  }

  .content {
    grid-area: content;
    max-width: 120rem;
    width: 100%;
    margin: 0 auto;
    padding: 0.5rem 1rem 1rem 0;
    min-height: calc(100dvh - 4rem);
    display: flex;
    height: fit-content;
    flex-direction: column;
    transition:
      transform 0.2s,
      opacity 0.2s;
    min-width: 0;
  }

  .content.sidenavExpanded {
    transform: translateX(6rem);
    filter: blur(2px);
    opacity: 0.5;
    pointer-events: none;
    user-select: none;
  }

  .layout-container {
    margin-top: 4rem;
    display: grid;
    max-width: 100vw;
    grid-template-columns: 3rem 1fr;
    grid-template-areas: 'nav content';
    gap: 2rem;
    padding: 0rem 1rem 0 0;
    min-height: calc(100dvh - 4rem);
  }

  .nav-wrapper {
    grid-area: nav;
    view-transition-name: sidenav;
    view-transition-class: element-handover;
    position: sticky;
    top: 4.5rem;
    height: 100%;
    max-height: calc(100vh - 4.5rem);
  }

  :root::view-transition-group(sidenav) {
    z-index: 10;
  }

  @media (max-width: 1024px) {
    .layout-container {
      gap: 0;
      padding: 0 1rem;
      grid-template-columns: 0rem 1fr;
    }

    .nav-wrapper {
      display: none;
    }

    .content {
      padding: 0;
      padding-bottom: 1rem;
    }
  }
</style>

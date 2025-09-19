<script lang="ts">
  import { navigating } from '$app/stores';
  import Header from '$lib/components/header/header.svelte';
  import Sidenav from '$lib/components/sidenav/sidenav.svelte';

  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import { quintIn, quintOut } from 'svelte/easing';
  import BottomNav from '$lib/components/bottom-nav/bottom-nav.svelte';
  import { fly } from 'svelte/transition';
  import User from '$lib/components/icons/User.svelte';
  import Box from '$lib/components/icons/Box.svelte';
  import TokenStreams from '$lib/components/icons/TokenStreams.svelte';
  import ExploreIcon from '$lib/components/icons/ExploreIcon.svelte';
  import EcosystemIcon from '$lib/components/icons/Ecosystem.svelte';
  import type { LayoutData } from './$types';
  import network from '$lib/stores/wallet/network';
  import Settings from '$lib/components/icons/Settings.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';

  export let data: LayoutData;

  let showLoadingSpinner = false;
  let loadingSpinnerTimeout: ReturnType<typeof setTimeout> | undefined;

  $: navItems = {
    top: [
      {
        label: 'Explore',
        href: '/app',
        icon: ExploreIcon,
        description: 'Discover projects and stats across Drips.',
      },
      {
        label: 'Funds',
        href: '/app/funds',
        icon: TokenStreams,
        description: 'Manage your balances and streams.',
      },
      {
        label: 'Projects',
        href: '/app/projects',
        icon: Box,
        description: 'Browse or claim a GitHub project.',
      },
      {
        label: 'Drip Lists',
        href: '/app/drip-lists',
        icon: DripListIcon,
        description: 'Discover or create fundable lists.',
      },
      ...(network.ecosystems
        ? [
            {
              label: 'Ecosystems',
              href: '/app/ecosystems',
              icon: EcosystemIcon,
              description: 'Fund huge numbers of projects in one place',
            },
          ]
        : []),
      {
        label: 'Profile',
        href: !$walletStore.address ? '/app/profile' : `/app/${$walletStore.address}`,
        description: 'Your stuff on Drips.',
        icon: User,
      },
    ],
    bottom: [
      {
        label: 'Settings',
        href: '/app/settings',
        icon: Settings,
        description: 'Configure your Drips experience.',
      },
      {
        label: 'Help',
        href: 'https://docs.drips.network/',
        icon: InfoCircle,
        external: true,
        description: 'Read the Drips documentation.',
      },
    ],
  };

  $: {
    if ($navigating) {
      clearTimeout(loadingSpinnerTimeout);
      loadingSpinnerTimeout = setTimeout(() => (showLoadingSpinner = true), 300);
    } else {
      showLoadingSpinner = false;
      clearTimeout(loadingSpinnerTimeout);
    }
  }
</script>

<div class="main" in:fly|global={{ duration: 300, y: 16 }}>
  <div class="page">
    <div class="page-content">
      <div class:loading={$navigating} class="page-content-inner"><slot /></div>
    </div>
  </div>

  <div
    class="sidenav"
    in:fly|global={{ duration: 300, x: -64, easing: quintOut }}
    out:fly|global={{ duration: 300, x: -64, easing: quintIn }}
    data-testid="sidenav"
  >
    <Sidenav items={navItems} />
  </div>
  <div class="bottom-nav" data-testid="bottom-nav">
    <BottomNav items={[...navItems.top, ...navItems.bottom]} />
  </div>

  <div class="header" in:fly|global={{ duration: 300, y: 16 }}>
    <Header user={data.user} showLoadingIndicator={showLoadingSpinner} />
  </div>
</div>

<style>
  .main {
    display: flex;
    flex-direction: row-reverse;
    width: 100vw;
  }

  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1;
  }

  .page {
    position: relative;
    min-height: 100vh;
    width: 100vw;
    padding: 6.5rem 2.5rem 4rem 2.5rem;
    margin: 0 auto 0 16rem;
  }

  .page-content {
    display: flex;
    justify-content: center;
  }

  .page-content-inner {
    max-width: 75rem;
    width: 100%;
  }

  div {
    transition: opacity 0.3s;
  }

  .loading {
    opacity: 0.2;
    pointer-events: none;
  }

  .sidenav {
    position: fixed;
    left: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 16rem;
    padding: 1rem;
    padding-top: 6rem;
  }

  .bottom-nav {
    display: none;
  }

  @media (max-width: 1252px) {
    .sidenav {
      width: 4.5rem;
    }

    .page {
      margin-left: 0;
      padding-left: 6.5rem;
    }
  }

  @media (max-width: 768px) {
    .main {
      overflow-x: hidden;
      gap: 0;
    }

    .sidenav {
      display: none;
    }

    .page {
      padding: 6rem 1rem 6rem 1rem;
      margin-left: 0;
    }

    .bottom-nav {
      display: initial;
    }
  }
</style>

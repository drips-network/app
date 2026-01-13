<script lang="ts">
  import { run } from 'svelte/legacy';

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
  import { forceCollapsed } from '$lib/components/sidenav/sidenav-store';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import ArrowCounterClockwiseHeart from '$lib/components/icons/ArrowCounterClockwiseHeart.svelte';
  import Wave from '$lib/components/icons/Wave.svelte';

  interface Props {
    data: LayoutData;
    children?: import('svelte').Snippet;
  }

  let { data, children }: Props = $props();

  let showLoadingSpinner = $state(false);
  let loadingSpinnerTimeout: ReturnType<typeof setTimeout> | undefined = $state();

  let navItems = $derived({
    top: mapFilterUndefined(
      [
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
        network.retroFunding.enabled
          ? {
              label: 'RetroPGF',
              href: '/app/rpgf',
              icon: ArrowCounterClockwiseHeart,
              description: 'Run or participate in a RetroPGF round.',
            }
          : undefined,
        network.ecosystems
          ? {
              label: 'Ecosystems',
              href: '/app/ecosystems',
              icon: EcosystemIcon,
              description: 'Fund huge numbers of projects in one place',
            }
          : undefined,
        {
          label: 'Profile',
          href: !$walletStore.address ? '/app/profile' : `/app/${$walletStore.address}`,
          description: 'Your stuff on Drips.',
          icon: User,
        },
        {
          label: 'Wave',
          href: 'https://www.drips.network/wave',
          description: 'Join FOSS sprints and earn rewards.',
          external: true,
          icon: Wave,
        },
      ],
      (v) => v,
    ),
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
  });

  run(() => {
    if ($navigating) {
      clearTimeout(loadingSpinnerTimeout);
      loadingSpinnerTimeout = setTimeout(() => (showLoadingSpinner = true), 300);
    } else {
      showLoadingSpinner = false;
      clearTimeout(loadingSpinnerTimeout);
    }
  });
</script>

<div
  class="main"
  class:sidenav-forced-collapsed={$forceCollapsed === true}
  in:fly|global={{ duration: 300, y: 16 }}
>
  <div class="page">
    <div class="page-content">
      <div class:loading={showLoadingSpinner} class="page-content-inner">
        {@render children?.()}
      </div>
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
    padding: 6rem 2.5rem 1rem 2.5rem;
    margin: 0 auto 0 16rem;
  }

  .page-content {
    display: flex;
    justify-content: center;
  }

  .page-content-inner {
    max-width: 80rem;
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
    z-index: 2;
  }

  .bottom-nav {
    display: none;
  }

  .sidenav-forced-collapsed .sidenav {
    width: 5rem;
  }

  .sidenav-forced-collapsed .page {
    margin-left: 4rem;
    padding-left: 2rem;
  }

  .sidenav-forced-collapsed .page-content-inner {
    max-width: 124rem;
  }

  @media (max-width: 1252px) {
    .sidenav {
      width: 4.5rem;
    }

    .page {
      margin-left: 4rem;
      padding-left: 2rem;
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

    .page,
    .sidenav-forced-collapsed .page {
      padding: 6rem 1rem 6rem 1rem;
      margin-left: 0;
    }

    .bottom-nav {
      display: initial;
    }
  }
</style>

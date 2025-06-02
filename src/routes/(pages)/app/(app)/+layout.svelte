<script lang="ts">
  import wallet from '$lib/stores/wallet/wallet.store';
  import { navigating } from '$app/stores';
  import Header from '$lib/components/header/header.svelte';
  import Sidenav from '$lib/components/sidenav/sidenav.svelte';

  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import { quintIn, quintOut } from 'svelte/easing';
  import BottomNav from '$lib/components/bottom-nav/bottom-nav.svelte';
  import { fly } from 'svelte/transition';
  import ens from '$lib/stores/ens';
  import User from '$lib/components/icons/User.svelte';
  import Box from '$lib/components/icons/Box.svelte';
  import TokenStreams from '$lib/components/icons/TokenStreams.svelte';
  import ExploreIcon from '$lib/components/icons/ExploreIcon.svelte';
  import type { LayoutData } from './$types';
  import { forceCollapsed } from '$lib/components/sidenav/sidenav-store';
  import HeartFace from '$lib/components/icons/HeartFace.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import network from '$lib/stores/wallet/network';

  export let data: LayoutData;

  let showLoadingSpinner = false;
  let loadingSpinnerTimeout: ReturnType<typeof setTimeout> | undefined;

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

<div
  class:sidenav-forced-collapsed={$forceCollapsed === true}
  class="main"
  class:disconnected={!$wallet.connected}
  in:fly|global={{ duration: 300, y: 16 }}
>
  <div class="page">
    <div class:loading={$navigating}><slot /></div>
  </div>

  {#if $wallet.connected}
    <div
      class="sidenav"
      in:fly|global={{ duration: 300, x: -64, easing: quintOut }}
      out:fly|global={{ duration: 300, x: -64, easing: quintIn }}
      data-testid="sidenav"
    >
      <Sidenav
        items={{
          top: mapFilterUndefined(
            [
              { label: 'Explore', href: '/app', icon: ExploreIcon },
              { label: 'Funds', href: '/app/funds', icon: TokenStreams },
              { label: 'Projects', href: '/app/projects', icon: Box },
              { label: 'Drip Lists', href: '/app/drip-lists', icon: DripListIcon },
              network.retroFunding.enabled
                ? { label: 'RetroPGF', href: '/app/rpgf', icon: HeartFace }
                : undefined,
              {
                label: 'Profile',
                href: `/app/${$ens[$wallet.address]?.name ?? $wallet.address}`,
                icon: User,
              },
            ],
            (v) => v,
          ),
          bottom: [
            {
              label: 'Help',
              href: 'https://docs.drips.network/',
              icon: InfoCircle,
              external: true,
            },
          ],
        }}
      />
    </div>
    <div class="bottom-nav" data-testid="bottom-nav">
      <BottomNav
        items={[
          { label: 'Explore', href: '/app', icon: ExploreIcon },
          { label: 'Funds', href: '/app/funds', icon: TokenStreams },
          { label: 'Projects', href: '/app/projects', icon: Box },
          { label: 'Drip Lists', href: '/app/drip-lists', icon: DripListIcon },
          {
            label: 'Profile',
            href: `/app/${$ens[$wallet.address]?.name ?? $wallet.address}`,
            icon: User,
          },
        ]}
      />
    </div>
  {/if}

  <div class="sidenav-placeholder" class:disconnected={!$wallet.connected} />

  <div class="header" in:fly|global={{ duration: 300, y: 16 }}>
    <Header user={data.user} showLoadingIndicator={showLoadingSpinner} />
  </div>
</div>

<style>
  .main {
    display: flex;
    flex-direction: row-reverse;
    width: 100vw;
    transition: gap 0.3s;
  }

  .main.disconnected {
    gap: 0;
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
    max-width: 75rem;
    width: 100vw;
    padding: 6.5rem 2.5rem 4rem 2.5rem;
    margin: 0 auto;
    min-width: 0;
  }

  .sidenav-forced-collapsed .page {
    max-width: unset;
    padding: 6.5rem 2.5rem 0rem 2.5rem;
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

  .sidenav-forced-collapsed .sidenav {
    width: 5rem;
  }

  .sidenav-placeholder {
    width: 16rem;
    height: 1px;
    flex-shrink: 0;
  }

  .sidenav-forced-collapsed .sidenav-placeholder {
    width: 5rem;
  }

  .sidenav-placeholder.disconnected {
    width: 0;
  }

  .bottom-nav {
    display: none;
  }

  @media (max-width: 1252px) {
    .sidenav,
    .sidenav-placeholder {
      width: 4.5rem;
    }
  }

  @media (max-width: 768px) {
    .main {
      gap: 0;
    }

    .sidenav,
    .sidenav-placeholder {
      display: none;
    }

    .sidenav-forced-collapsed .page {
      max-width: 100vw;
      padding: 6.5rem 1rem 0rem 1rem;
    }

    .page {
      padding: 6rem 1rem 6rem 1rem;
    }

    .bottom-nav {
      display: initial;
    }
  }
</style>

<script lang="ts">
  import wallet from '$lib/stores/wallet/wallet.store';
  import PageTransition from '$lib/components/page-transition/page-transition.svelte';
  import { navigating } from '$app/stores';
  import Header from '$lib/components/header/header.svelte';
  import Sidenav from '$lib/components/sidenav/sidenav.svelte';

  import Ledger from 'radicle-design-system/icons/Ledger.svelte';
  import Folder from 'radicle-design-system/icons/Folder.svelte';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import InfoCircle from 'radicle-design-system/icons/InfoCircle.svelte';
  import { quintIn, quintOut } from 'svelte/easing';
  import BottomNav from '$lib/components/bottom-nav/bottom-nav.svelte';
  import { fly } from 'svelte/transition';
  import ens from '$lib/stores/ens';
  import User from 'radicle-design-system/icons/User.svelte';

  export let data: { pathname: string };

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

<div class="main" in:fly={{ duration: 300, y: 16 }}>
  <div class="page">
    <PageTransition pathname={data.pathname}>
      <div class:loading={$navigating}><slot /></div>
    </PageTransition>
  </div>

  {#if $wallet.connected}
    <div
      class="sidenav"
      in:fly={{ duration: 300, x: -64, easing: quintOut }}
      out:fly={{ duration: 300, x: -64, easing: quintIn }}
      data-testid="sidenav"
    >
      <Sidenav
        items={{
          top: [
            { label: 'Streams', href: '/app/streams', icon: TokenStreams },
            { label: 'Projects', href: '/app/projects', icon: Folder },
            { label: 'Drip List', href: '/app/drip-lists', icon: Ledger },
            {
              label: 'Profile',
              href: `/app/${$ens[$wallet.address]?.name ?? $wallet.address}`,
              icon: User,
            },
          ],
          bottom: [
            {
              label: 'Help',
              href: 'https://docs.drips.network/docs/the-drips-app/getting-started',
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
          { label: 'Streams', href: '/app/streams', icon: TokenStreams },
          { label: 'Projects', href: '/app/projects', icon: Folder },
          { label: 'Drip List', href: '/app/drip-lists', icon: Ledger },
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

  <div class="header" in:fly={{ duration: 300, y: 16 }}>
    <Header showLoadingIndicator={showLoadingSpinner} />
  </div>
</div>

<style>
  .main {
    display: flex;
    flex-direction: row-reverse;
    gap: 2rem;
    width: 100vw;
  }

  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
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

  .sidenav-placeholder {
    width: 16rem;
    height: 1px;
    flex-shrink: 0;
    transition: width 0.3s;
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

    .page {
      padding: 6rem 1rem 8rem 1rem;
    }

    .bottom-nav {
      display: initial;
    }
  }
</style>

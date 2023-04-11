<script lang="ts">
  import { onMount } from 'svelte';
  import wallet from '$lib/stores/wallet/wallet.store';
  import Header from '$lib/components/header/header.svelte';

  import tokens from '$lib/stores/tokens';
  import ens from '$lib/stores/ens';
  import balances from '$lib/stores/balances/balances.store';
  import streams from '$lib/stores/streams/streams.store';
  import { derived } from 'svelte/store';
  import tickStore from '$lib/stores/tick/tick.store';
  import ModalLayout from '$lib/components/modal-layout/modal-layout.svelte';
  import PageTransition from '$lib/components/page-transition/page-transition.svelte';
  import { navigating } from '$app/stores';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import globalAdvisoryStore from '$lib/stores/global-advisory/global-advisory.store';
  import GlobalAdvisory from '$lib/components/global-advisory/global-advisory.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import { fly } from 'svelte/transition';
  import { isSafe } from '$lib/stores/wallet/safe/is-safe';
  import Sidenav from '$lib/components/sidenav/sidenav.svelte';

  import HeartIcon from 'radicle-design-system/icons/Heart.svelte';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import InfoCircle from 'radicle-design-system/icons/InfoCircle.svelte';
  import { quintIn, quintOut } from 'svelte/easing';
  import BottomNav from '$lib/components/bottom-nav/bottom-nav.svelte';
  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';

  export let data: { pathname: string };

  let walletConnected = false;
  let loaded = false;
  let initializing = false;

  async function initializeStores() {
    initializing = true;
    await wallet.initialize();
    loaded = true;

    const { connected, network, provider, address, safe } = $wallet;

    tokens.connect(network.chainId);
    ens.connect(provider);
    balances.initialize();

    walletConnected = connected;

    balances.setAccounts(derived([streams], ([streams]) => streams.accounts));

    if (connected) {
      const addressDriverClient = await getAddressDriverClient();
      ens.lookup(address);

      /*
      If the app is not running a safe app, check whether the current address is a Safe. This could be the case
      if the user is using the WalletConnect Safe App to connect to Drips, instead of using Drips as a Safe App
      directly. If this is the case, the function triggers a warning modal.
      */
      if (!safe) warnIfSafe(network.chainId, address);

      try {
        await streams.connect((await addressDriverClient.getUserIdByAddress(address)).toString());
      } catch (e) {
        if (e instanceof Error) {
          globalAdvisoryStore.add({
            fatal: true,
            headline: 'A fatal error occured',
            description: e.message,
          });
        } else {
          globalAdvisoryStore.add({
            fatal: true,
            headline: 'A fatal error occured',
          });
        }
      }
    } else {
      streams.disconnect();
    }

    initializing = false;
  }

  async function warnIfSafe(chainId: number, address: string) {
    const isASafe = await isSafe(chainId, address);

    if (isASafe) {
      globalAdvisoryStore.add((resolve) => ({
        headline: 'Using a Safe?',
        description:
          'Instead of connecting to the Safe with WalletConnect, we recommend running Drips as a Safe App directly.',
        emoji: '⚠️',
        button: {
          label: 'Disconnect',
          handler: () => {
            wallet.disconnect();
            resolve();
          },
        },
        secondaryButton: {
          label: 'Proceed anyway',
          handler: resolve,
        },
        learnMoreLink: {
          label: 'Learn more',
          url: 'https://docs.drips.network/docs/the-drips-app/advanced/safe',
        },
        fatal: false,
      }));
    }
  }

  onMount(async () => {
    await initializeStores();

    wallet.subscribe((s) => {
      if (initializing) return;

      if (s.connected !== walletConnected) {
        initializeStores();
      }
    });
  });

  onMount(() => {
    tickStore.start();
    return tickStore.stop;
  });

  onMount(() => {
    cupertinoPaneStore.attach();
    return cupertinoPaneStore.detach();
  });
</script>

<GlobalAdvisory />

<div id="cupertino-pane">
  <div class="inner">
    <div class="dragger" />
    {#if $cupertinoPaneStore.component}
      <div class="content">
        <svelte:component this={$cupertinoPaneStore.component} {...$cupertinoPaneStore.props} />
      </div>
    {/if}
  </div>
</div>

{#if loaded}
  <div class="main" in:fly={{ duration: 300, y: 16 }}>
    <ModalLayout />
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
              { label: 'Crowdfunding', href: '/app/crowdfunding', icon: HeartIcon },
              { label: 'Streams', href: '/app/streams', icon: TokenStreams },
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
            {
              label: 'Crowdfunding',
              href: '/app/crowdfunding',
              icon: HeartIcon,
            },
            {
              label: 'Streams',
              href: '/app/streams',
              icon: TokenStreams,
            },
          ]}
        />
      </div>
    {/if}
    <div class="sidenav-placeholder" class:disconnected={!$wallet.connected} />
    <div class="page" class:loading={$navigating}>
      <PageTransition pathname={data.pathname}>
        <slot />
      </PageTransition>
    </div>
  </div>
  <div class="header" in:fly={{ duration: 300, y: 16 }}>
    <Header />
  </div>
{:else}
  <div class="loading-state" out:fly={{ duration: 300, y: -16 }}>
    <Spinner />
  </div>
{/if}

<style>
  .main {
    display: flex;
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
    transition: opacity 0.3s;
    min-width: 0;
  }

  .loading {
    opacity: 0.5s;
  }

  .loading-state {
    display: fixed;
    height: 100vh;
    width: 100vw;
    background-color: var(--color-background);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .sidenav {
    position: fixed;
    left: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 16rem;
    background-color: var(--color-background);
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

  #cupertino-pane {
    display: none;
    background-color: var(--color-background);
    border-radius: 1rem 1rem 0 0;
  }

  #cupertino-pane > .inner {
    padding: 0 0.5rem;
    align-items: center;
    flex-direction: column;
    gap: 1rem;
  }

  :global(.cupertino-pane-wrapper .pane) {
    padding-bottom: 1rem;
    background-color: var(--color-background);
    box-shadow: var(--elevation-low);
  }

  :global(.cupertino-pane-wrapper) {
    z-index: 200;
  }

  .bottom-nav {
    display: none;
  }

  .dragger {
    width: 3rem;
    height: 0.25rem;
    background-color: var(--color-foreground-level-3);
    border-radius: 0.25rem;
    margin: 0 auto;
    margin-bottom: 0.75rem;
  }

  @media (max-width: 1252px) {
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

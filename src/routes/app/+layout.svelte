<script lang="ts">
  import { onMount } from 'svelte';
  import { registerSW } from 'virtual:pwa-register';
  import wallet from '$lib/stores/wallet/wallet.store';
  import Header from '$lib/components/header/header.svelte';
  import tokens from '$lib/stores/tokens';
  import ens from '$lib/stores/ens';
  import balances from '$lib/stores/balances/balances.store';
  import streams from '$lib/stores/streams/streams.store';
  import { derived } from 'svelte/store';
  import tick from '$lib/stores/tick/tick.store';
  import ModalLayout from '$lib/components/modal-layout/modal-layout.svelte';
  import PageTransition from '$lib/components/page-transition/page-transition.svelte';
  import { navigating } from '$app/stores';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import globalAdvisoryStore from '$lib/stores/global-advisory/global-advisory.store';
  import GlobalAdvisory from '$lib/components/global-advisory/global-advisory.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import { fly } from 'svelte/transition';
  import { browser } from '$app/environment';
  import SwUpdatePrompt from '$lib/components/sw-update-prompt/sw-update-prompt.svelte';

  export let data: { pathname: string };

  let walletConnected = false;
  let loaded = false;

  async function initializeStores() {
    await wallet.initialize();
    loaded = true;

    const { connected, network, provider, address } = $wallet;

    tokens.connect(network.chainId);
    ens.connect(provider);
    balances.initialize();

    walletConnected = connected;

    balances.setAccounts(derived([streams], ([streams]) => streams.accounts));

    if (connected) {
      const addressDriverClient = await getAddressDriverClient();
      ens.lookup(address);

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
  }

  $: {
    if (initialized && $wallet.connected !== walletConnected) {
      initializeStores();
    }
  }

  let initialized = false;
  onMount(async () => {
    if (window.navigator.onLine) {
      await initializeStores();
      initialized = true;
    } else {
      displayOfflineAdvisory();
    }
  });

  let offlineAdvisory: ReturnType<typeof globalAdvisoryStore.add> | undefined = undefined;

  function displayOfflineAdvisory() {
    offlineAdvisory = globalAdvisoryStore.add({
      fatal: false,
      headline: 'No internet connection',
      description: 'Please connect to the internet to use Drips.',
      emoji: '🔌',
    });
  }

  onMount(() => {
    window.addEventListener('online', async () => {
      offlineAdvisory?.();

      if (!initialized) {
        await initializeStores();
        initialized = true;
      }
    });

    window.addEventListener('offline', () => {
      displayOfflineAdvisory();
    });
  });

  onMount(() => {
    tick.start();
    return tick.stop;
  });

  onMount(() => {
    const SERVICE_WORKER_AUTO_UPDATE_INTERVAL = 60 * 60 * 1000;

    if (browser) {
      registerSW({
        onRegisteredSW(swUrl, r) {
          r &&
            setInterval(async () => {
              if (!(!r.installing && navigator)) return;

              if ('connection' in navigator && !navigator.onLine) return;

              const resp = await fetch(swUrl, {
                cache: 'no-store',
                headers: {
                  cache: 'no-store',
                  'cache-control': 'no-cache',
                },
              });

              if (resp?.status === 200) await r.update();
            }, SERVICE_WORKER_AUTO_UPDATE_INTERVAL);
        },
      });
    }
  });

  let showingToast: boolean | undefined;
</script>

<GlobalAdvisory />
<SwUpdatePrompt bind:showingToast />

{#if loaded}
  <div class="main" in:fly={{ duration: 300, y: 16 }}>
    <ModalLayout />
    <div class="page" class:loading={$navigating}>
      <PageTransition pathname={data.pathname}>
        <slot />
        {#if showingToast}
          <div class="toast-placeholder" />
        {/if}
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
    padding: 6rem 1rem 4rem 1rem;
    margin: 0 auto;
    transition: opacity 0.3s;
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

  .toast-placeholder {
    height: 8rem;
    width: 100%;
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import wallet from '$lib/stores/wallet/wallet.store';
  import Header from '$lib/components/header/header.svelte';

  import tokens from '$lib/stores/tokens';
  import ens from '$lib/stores/ens';
  import balances from '$lib/stores/balances/balances.store';
  import streams from '$lib/stores/streams/streams.store';
  import { derived } from 'svelte/store';
  import tick from '$lib/stores/tick/tick.store';
  import ModalLayout from '$lib/components/modal-layout/modal-layout.svelte';
  import themeStore from '$lib/stores/theme/theme.store';
  import PageTransition from '$lib/components/page-transition/page-transition.svelte';
  import { navigating } from '$app/stores';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import globalAdvisoryStore from '$lib/stores/global-advisory/global-advisory.store';
  import GlobalAdvisory from '$lib/components/global-advisory/global-advisory.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import { fly } from 'svelte/transition';

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
    await initializeStores();
    initialized = true;
  });

  onMount(() => {
    tick.start();
    return tick.stop;
  });
</script>

<GlobalAdvisory />

{#if loaded}
  <div class="main" data-theme={$themeStore.currentTheme} in:fly={{ duration: 300, y: 16 }}>
    <ModalLayout />
    <div class="page" class:loading={$navigating}>
      <PageTransition pathname={data.pathname}>
        <slot />
      </PageTransition>
    </div>
  </div>
  <div data-theme={$themeStore.currentTheme} class="header" in:fly={{ duration: 300, y: 16 }}>
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
    max-width: 64rem;
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
</style>

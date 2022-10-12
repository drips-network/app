<script lang="ts">
  import { onMount } from 'svelte';
  import wallet from '$lib/stores/wallet';
  import Header from '$lib/components/header/header.svelte';
  import scroll from '$lib/stores/scroll';

  // Global CSS imports
  import '../styles/app.css';
  import 'radicle-design-system/static/reset.css';
  import 'radicle-design-system/static/global.css';
  import 'radicle-design-system/static/colors.css';
  import 'radicle-design-system/static/elevation.css';
  import 'radicle-design-system/static/typography.css';

  import tokens from '$lib/stores/tokens';
  import ens from '$lib/stores/ens';
  import balances from '$lib/stores/balances/balances.store';
  import { AddressDriverClient } from 'radicle-drips';
  import streams from '$lib/stores/streams/streams.store';
  import { derived } from 'svelte/store';
  import tick from '$lib/stores/tick/tick.store';

  let prefersDarkMode = false;

  onMount(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDarkMode = darkModeQuery.matches;

    darkModeQuery.addEventListener('change', (event) => {
      prefersDarkMode = event.matches;
    });
  });

  let walletConnected = false;
  let loaded = false;

  async function initializeStores() {
    await wallet.initialize();
    loaded = true;

    const { connected, network, provider, address } = $wallet;

    tokens.connect(network.chainId);
    ens.connect(provider);

    walletConnected = connected;

    if (connected) {
      const addressDriverClient = await AddressDriverClient.create(provider);

      ens.lookup(address);
      balances.connect(addressDriverClient);

      streams.connect((await addressDriverClient.getUserIdByAddress(address)).toString());
      balances.setAccounts(derived([streams], ([streams]) => streams.accounts));
    } else {
      balances.disconnect();
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

  onMount(scroll.attach);
  onMount(tick.start);
</script>

{#if loaded}
  <div class="main" data-theme={prefersDarkMode ? 'dark' : 'light'}>
    <Header />
    <div class="page">
      <slot />
    </div>
  </div>
{/if}

<style>
  .main {
    min-height: 100vh;
    min-width: 100vw;
    background-color: var(--color-background);
    color: var(--color-foreground);
  }

  .page {
    max-width: 64rem;
    width: 100vw;
    padding: 6rem 1rem 4rem 1rem;
    margin: 0 auto;
  }
</style>

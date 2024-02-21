<script lang="ts" context="module">
  export const initializing = writable(false);
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import wallet from '$lib/stores/wallet/wallet.store';

  import tokens from '$lib/stores/tokens';
  import ens from '$lib/stores/ens';
  import balances from '$lib/stores/balances/balances.store';
  import streams from '$lib/stores/streams/streams.store';
  import { derived, writable } from 'svelte/store';
  import tickStore from '$lib/stores/tick/tick.store';

  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import globalAdvisoryStore from '$lib/stores/global-advisory/global-advisory.store';
  import GlobalAdvisory from '$lib/components/global-advisory/global-advisory.svelte';
  import { fade } from 'svelte/transition';
  import { isSafe } from '$lib/stores/wallet/safe/is-safe';
  import themeStore from '$lib/stores/theme/theme.store';
  import walletStore from '$lib/stores/wallet/wallet.store';

  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';
  import breakpointsStore from '$lib/stores/breakpoints/breakpoints.store';
  import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';
  import ModalLayout from '$lib/components/modal-layout/modal-layout.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import { page } from '$app/stores';
  import Highlight from '$lib/components/highlight/highlight.svelte';

  let walletConnected = false;
  let loaded = false;

  async function initializeStores() {
    initializing.set(true);
    await wallet.initialize();
    loaded = true;

    const { connected, network, provider, address, safe } = $wallet;

    tokens.connect(network.chainId);
    ens.connect(provider);
    balances.initialize();

    themeStore.subscribe((v) => {
      const onboardTheme = v.currentTheme === 'h4x0r' ? 'dark' : v.currentTheme;

      walletStore.setOnboardTheme(onboardTheme);
    });

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
        await streams.connect(
          (await addressDriverClient.getAccountIdByAddress(address)).toString(),
        );
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

    initializing.set(false);
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
          url: 'https://docs.drips.network/usage-with-a-safe',
        },
        fatal: false,
      }));
    }
  }

  onMount(async () => {
    await initializeStores();

    wallet.subscribe((s) => {
      if ($initializing) return;

      if (s.connected !== walletConnected) {
        initializeStores();
      }
    });
  });

  onMount(() => {
    tickStore.start();
  });

  onMount(() => {
    cupertinoPaneStore.attach();
    return cupertinoPaneStore.detach;
  });

  onMount(() => {
    breakpointsStore.attach();
    return breakpointsStore.detach;
  });

  onMount(async () => {
    await fiatEstimates.start();
  });
</script>

<Highlight />

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

<ModalLayout />

<div in:fade={{ duration: 300, delay: 300 }}>
  {#if $page.data.blockWhileInitializing !== false && (!loaded || $initializing)}
    <div out:fade|local={{ duration: 300 }} class="loading-spinner">
      <Spinner />
    </div>
  {/if}
  <slot />
</div>

<style>
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

  .loading-spinner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-background);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99;
  }

  .dragger {
    width: 3rem;
    height: 0.25rem;
    background-color: var(--color-foreground-level-3);
    border-radius: 0.25rem;
    margin: 0 auto;
    margin-bottom: 0.75rem;
  }
</style>

<script lang="ts" module>
  export const initializing = writable(false);
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import wallet from '$lib/stores/wallet/wallet.store';

  import ens from '$lib/stores/ens';
  import { writable } from 'svelte/store';
  import tickStore from '$lib/stores/tick/tick.store';

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
  import { page } from '$app/state';
  import Highlight from '$lib/components/highlight/highlight.svelte';
  import CupertinoPaneTarget from '$lib/stores/cupertino-pane/cupertino-pane-target.svelte';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  let walletConnected = false;
  let loaded = $state(false);

  async function initializeStores() {
    initializing.set(true);
    await wallet.initialize();
    loaded = true;

    const { connected, network, address, safe } = $wallet;

    themeStore.subscribe((v) => {
      const onboardTheme = v.currentTheme === 'h4x0r' ? 'dark' : v.currentTheme;

      walletStore.setOnboardTheme(onboardTheme);
    });

    walletConnected = connected;

    if (connected) {
      ens.lookup(address);

      /*
      If the app is not running a safe app, check whether the current address is a Safe. This could be the case
      if the user is using the WalletConnect Safe App to connect to Drips, instead of using Drips as a Safe App
      directly. If this is the case, the function triggers a warning modal.
      */
      if (!safe) warnIfSafe(network.chainId, address);
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
          url: 'https://docs.drips.network/advanced/usage-with-a-safe',
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

<CupertinoPaneTarget />

<ModalLayout />

<div in:fade|global={{ duration: 300, delay: 300 }}>
  {#if page.data.blockWhileInitializing !== false && (!loaded || $initializing)}
    <div out:fade={{ duration: 300 }} class="loading-spinner">
      <Spinner />
    </div>
  {/if}
  {@render children?.()}
</div>

<style>
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
</style>

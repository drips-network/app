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
  import ModalLayout from '$lib/components/modal-layout/modal-layout.svelte';
  import themeStore from '$lib/stores/theme/theme.store';

  let walletConnected = false;
  let loaded = false;

  /**
   * If a fatal error occurs during store initialization that may result in
   * incorrect estimation values or balances, this boolean will cause a global
   * error state to be rendered instead of app content.
   */
  let fatalError:
    | false
    | {
        error: unknown;
        message?: string;
      } = false;

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

      try {
        await streams.connect((await addressDriverClient.getUserIdByAddress(address)).toString());
        balances.setAccounts(derived([streams], ([streams]) => streams.accounts));
      } catch (e) {
        if (e instanceof Error) {
          fatalError = {
            error: e,
            message: e.message,
          };
        } else {
          fatalError = {
            error: e,
          };
        }
      }
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

  onMount(() => {
    const listener = () => {
      if (fatalError) window.location.reload();
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  });

  onMount(scroll.attach);
  onMount(tick.start);
</script>

{#if fatalError}
  <div class="bsod">
    <h1><span class="white-background">Fatal Error</span></h1>
    <div class="description">
      {#if fatalError.message}
        <p>A fatal exception has occurred.</p>
        <p><i>{fatalError.message}</i></p>
      {:else}
        <p>An unknown fatal exception has occured.</p>
      {/if}
      <ul>
        <li><p>*&#8195&#8195 Press any key to reload this application.</p></li>
        <li><p>*&#8195&#8195 Ensure your browser is up-to-date.</p></li>
        <li><p>*&#8195&#8195 Try turning it on & off again.</p></li>
        <li>
          *&#8195&#8195<a href="https://discord.gg/vhGXkazpNc" target="_blank"
            >Get help on our Discord</a
          >
        </li>
      </ul>
    </div>
  </div>
{/if}

{#if loaded && !fatalError}
  <div class="main" data-theme={$themeStore.currentTheme}>
    <ModalLayout />
    <div class="page">
      <slot />
    </div>
    <Header />
  </div>
{/if}

<style>
  .bsod {
    height: 100vh;
    width: 100vw;
    background-color: #0033bb;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 1rem;
  }

  .bsod h1,
  p,
  a {
    font-family: monospace;
    font-size: 1rem;
    max-width: 640px;
  }

  .bsod a {
    text-decoration: underline;
  }

  .bsod .white-background {
    background-color: #fff;
    color: #0033bb;
  }

  .bsod .description {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .main {
    min-height: 100vh;
    min-width: 100vw;
    background-color: var(--color-background);
    color: var(--color-foreground);
  }

  .page {
    position: relative;
    min-height: 100vh;
    max-width: 64rem;
    width: 100vw;
    padding: 6rem 1rem 4rem 1rem;
    margin: 0 auto;
  }
</style>

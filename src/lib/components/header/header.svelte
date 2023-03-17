<script lang="ts">
  import { page } from '$app/stores';
  import scroll from '$lib/stores/scroll';
  import wallet from '$lib/stores/wallet/wallet.store';
  import BetaBadge from '../beta-badge/beta-badge.svelte';
  import Button from '../button/button.svelte';
  import ConnectButton from '../connect-button/connect-button.svelte';
  import SearchBar from '../search-bar/search-bar.svelte';
  import DripsLogo from '././drips-logo.svelte';

  $: elevated = $scroll.pos > 16;

  $: appMode = $page.route.id?.includes('/app/');
</script>

<header class:elevated class:appMode>
  <a href={!$wallet.connected || $page.route.id === '/app/dashboard' ? '/' : '/app/dashboard'}>
    <DripsLogo />
    <div class="beta-badge">
      <BetaBadge />
    </div>
  </a>
  {#if appMode}
    <div class="search-bar">
      <SearchBar />
    </div>
    <div class="wallet">
      <ConnectButton />
    </div>
  {:else}
    <nav>
      <a href="https://github.com/radicle-dev?q=drips" target="_blank" rel="noreferrer"
        ><Button variant="ghost">Code</Button></a
      >
      <a
        href="https://v2.docs.drips.network/docs/whats-a-drip.html"
        target="_blank"
        rel="noreferrer"><Button variant="ghost">Docs</Button></a
      >
      <a class="cta" href="/app"><Button variant="primary">Open app</Button></a>
    </nav>
  {/if}
</header>

<style>
  header {
    position: fixed;
    top: 1rem;
    width: calc(78rem - 3px);
    left: 50%;
    transform: translateX(-50%);
    height: 4.25rem;
    border-radius: 3rem 0 3rem 3rem;
    background-color: var(--color-background);
    transition: box-shadow 0.3s, background-color 0.5s, border 0.3s, transform 0.3s, width 0.3s;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    z-index: 1000;
    border: 1px solid var(--color-foreground);
  }

  header.appMode {
    width: calc(100% - 3rem);
    border: 1px solid rgba(0, 0, 0, 0);
  }

  .search-bar {
    position: absolute;
    width: 100%;
    left: 50%;
    transform: translateX(-50%);
    max-width: 28rem;
  }

  a {
    display: flex;
    gap: 0.5rem;
  }

  header.elevated {
    box-shadow: var(--elevation-medium);
    border: 1px solid var(--color-foreground);
  }

  .wallet {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  nav {
    display: flex;
    gap: 0.5rem;
  }

  @media (max-width: 577px) {
    .beta-badge {
      display: none;
    }
  }
</style>

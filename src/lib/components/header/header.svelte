<script lang="ts">
  import scroll from '$lib/stores/scroll';
  import wallet from '$lib/stores/wallet/wallet.store';
  import BetaBadge from '../beta-badge/beta-badge.svelte';
  import ConnectButton from '../connect-button/connect-button.svelte';
  import SearchBar from '../search-bar/search-bar.svelte';
  import DripsLogo from '././drips-logo.svelte';

  $: elevated = $scroll.pos > 16;
</script>

<header class:elevated>
  <a href={$wallet.connected ? '/app/dashboard' : '/'}>
    <DripsLogo />
    <div class="beta-badge">
      <BetaBadge />
    </div>
  </a>
  <SearchBar />
  <div class="wallet">
    <ConnectButton />
  </div>
</header>

<style>
  header {
    height: 4rem;
    width: 100%;
    background-color: var(--color-background);
    transition: box-shadow 0.3s, background-color 0.5s;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
  }

  a {
    display: flex;
    gap: 0.5rem;
  }

  header.elevated {
    box-shadow: var(--elevation-low);
  }

  .wallet {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  @media (max-width: 577px) {
    .beta-badge {
      display: none;
    }
  }
</style>

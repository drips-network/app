<script lang="ts">
  import scroll from '$lib/stores/scroll';
  import wallet from '$lib/stores/wallet';
  import ConnectButton from '../connect-button/connect-button.svelte';
  import SearchBar from '../search-bar/search-bar.svelte';
  import DripsLogo from '././drips-logo.svelte';

  $: elevated = $scroll.pos > 16;
</script>

<header class:elevated>
  <a sveltekit:prefetch href={$wallet.connected ? '/app/dashboard' : '/'}>
    <DripsLogo />
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
    transition: box-shadow 0.3s;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
  }

  header.elevated {
    box-shadow: var(--elevation-medium);
  }

  .wallet {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>

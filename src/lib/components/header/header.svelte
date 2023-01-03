<script lang="ts">
  import scroll from '$lib/stores/scroll';
  import wallet from '$lib/stores/wallet';
  import ConnectButton from '../connect-button/connect-button.svelte';
  import SearchBar from '../search-bar/search-bar.svelte';
  import DripsLogo from '././drips-logo.svelte';
  import Dropdown from '../dropdown/dropdown.svelte';

  let networkPickerValue = '5';

  const supportedChains = wallet.getSupportedNetworks();

  const networkSwitcherOptions = Object.values(supportedChains).map((sc) => ({
    title: sc.name,
    iconUrl: sc.logoUrl,
    value: String(sc.chainId),
  }));

  $: elevated = $scroll.pos > 16;

  async function handleNetworkSwitch() {
    await wallet.switchNetwork(Number(networkPickerValue));
  }
  $: {
    networkPickerValue;
    handleNetworkSwitch();
  }
</script>

<header class:elevated>
  <a href={$wallet.connected ? '/app/dashboard' : '/'}>
    <DripsLogo />
  </a>
  <div class="right">
    <div class="search-bar">
      <SearchBar />
    </div>
    <div class="network-switch">
      <Dropdown
        dropdownWidth={{ pixels: 200, align: 'right' }}
        noBorder
        bind:value={networkPickerValue}
        options={networkSwitcherOptions}
      />
    </div>
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
    box-shadow: var(--elevation-low);
  }

  .right {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .network-switch {
    display: none;
  }

  @media (min-width: 1088px) {
    .search-bar {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 28rem;
      z-index: 100;
    }
    .network-switch {
      display: block;
    }
  }
</style>

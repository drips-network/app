<script lang="ts">
  import scroll from '$lib/stores/scroll';
  import wallet from '$lib/stores/wallet';
  import ConnectButton from '../connect-button/connect-button.svelte';
  import SearchBar from '../search-bar/search-bar.svelte';
  import DripsLogo from '././drips-logo.svelte';
  import Dropdown from '../dropdown/dropdown.svelte';

  let networkPickerValue = '5';

  $: elevated = $scroll.pos > 16;
</script>

<header class:elevated>
  <a href={$wallet.connected ? '/app/dashboard' : '/'}>
    <DripsLogo />
  </a>
  <SearchBar />
  <div class="wallet">
    <div class="network-switch">
      <Dropdown
        dropdownWidth={{ pixels: 200, align: 'right' }}
        noBorder
        bind:value={networkPickerValue}
        options={[
          {
            value: '5',
            title: 'Goerli',
            iconUrl:
              'https://blockworks.co/_next/image?url=https%3A%2F%2Fcms.blockworks.co%2Fwp-content%2Fuploads%2F2022%2F04%2FEthereum.jpg&w=1920&q=75',
          },
          {
            value: '6',
            title: 'Other Chain',
            iconUrl:
              'https://blockworks.co/_next/image?url=https%3A%2F%2Fcms.blockworks.co%2Fwp-content%2Fuploads%2F2022%2F04%2FEthereum.jpg&w=1920&q=75',
          },
        ]}
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

  .wallet {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
</style>

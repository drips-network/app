<script>
  import { getNetwork } from '$lib/stores/wallet/network';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import ChevronDown from '../icons/ChevronDown.svelte';
  import ChevronUp from '../icons/ChevronUp.svelte';
  import TestnetFrame from '../icons/networks/TestnetFrame.svelte';

  $: network = getNetwork($walletStore.network.chainId);

  const isDev = false;

  export let toggled = false;
</script>

<button class="wrapper" class:disabled={isDev} on:click>
  <div class="network-picker">
    <svelte:component this={network.icon} />
    {#if network.isTestnet}
      <div class="testnet-frame"><TestnetFrame /></div>
    {/if}
  </div>
  {#if toggled}
    <ChevronUp />
  {:else}
    <ChevronDown />
  {/if}
</button>

<style>
  .wrapper {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: center;
  }

  .wrapper.disabled {
    cursor: not-allowed;
  }

  .testnet-frame {
    position: absolute;
    top: 0;
    left: 0;
  }

  .network-picker {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
  }
</style>

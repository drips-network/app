<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  import { getNetwork } from '$lib/stores/wallet/network';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import ChevronDown from '../icons/ChevronDown.svelte';
  import TestnetFrame from '../icons/networks/TestnetFrame.svelte';

  let network = $derived(getNetwork($walletStore.network.chainId));

  const isDev = false;

  interface Props {
    toggled?: boolean;
  }

  let { toggled = false }: Props = $props();
</script>

<button class="wrapper" class:disabled={isDev} onclick={bubble('click')}>
  <div class="network-picker">
    <div class="icon-wrapper">
      <network.icon style="width: 2rem; height: 2rem;" />
    </div>
    {#if network.isTestnet}
      <div class="testnet-frame"><TestnetFrame style="width: 2rem; height: 2rem;" /></div>
    {/if}
  </div>
  <div class="chevron" class:upside-down={toggled}>
    <ChevronDown style="fill: var(--color-foreground)" />
  </div>
</button>

<style>
  .wrapper {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: center;
    margin: 0 0 0 0.25rem;
  }

  .wrapper.disabled {
    cursor: not-allowed;
  }

  .icon-wrapper {
    height: 2rem;
    width: 2rem;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-primary-level-1);
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

  .chevron {
    transition: transform 0.3s;
  }

  .chevron.upside-down {
    transform: rotate(-180deg);
  }
</style>

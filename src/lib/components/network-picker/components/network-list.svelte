<script lang="ts">
  import Check from '$lib/components/icons/Check.svelte';
  import TestnetFrame from '$lib/components/icons/networks/TestnetFrame.svelte';
  import currentNetwork, { NETWORK_CONFIG } from '$lib/stores/wallet/network';
  import hexToRgb from '$lib/utils/hex-to-rgb';
  import getChainDeploymentUrl from '../get-chain-deployment-url';

  const networks = Object.values(NETWORK_CONFIG);
  const networksToShow = networks.filter((n) => (currentNetwork.isTestnet ? true : !n.isTestnet));

  const selectedChainId = currentNetwork.chainId;
</script>

<div class="network-list">
  {#each networksToShow as { chainId, label, icon, color, isTestnet }}
    {@const colorRgb = hexToRgb(color)}
    <a href={getChainDeploymentUrl(chainId)} class="network-item">
      <div
        class="network-icon"
        class:selected={chainId === selectedChainId}
        style:background="rgba({colorRgb?.r}, {colorRgb?.g}, {colorRgb?.b}, 0.2)"
      >
        <div style:position="relative">
          <svelte:component this={icon} />
          {#if isTestnet}
            <div class="testnet-frame"><TestnetFrame /></div>
          {/if}
        </div>
      </div>
      <span class="network-label">{label}</span>
      {#if chainId === selectedChainId}
        <Check style="fill: var(--color-foreground);" />
      {/if}
    </a>
  {/each}
</div>

<style>
  .network-list {
    display: flex;
    flex-direction: column;
  }

  .network-icon {
    height: 3rem;
    flex-shrink: 0;
    width: 3rem;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border: 1px solid transparent;
  }

  .network-icon.selected {
    border-color: var(--color-foreground);
  }

  .network-label {
    flex-grow: 1;
    white-space: nowrap;
    text-align: left;
    overflow: hidden;
    color: var(--color-foreground);
    text-overflow: ellipsis;
  }

  .network-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    flex-shrink: 0;
    padding: 0.5rem;
    border-radius: 1rem 0 1rem 1rem;
    transition: background-color 0.3s;
  }

  .network-item:hover {
    background-color: var(--color-foreground-level-1);
  }

  .testnet-frame {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>

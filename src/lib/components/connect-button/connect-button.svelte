<script lang="ts">
  import Button from 'radicle-design-system/Button.svelte';
  import wallet from '$lib/stores/wallet';
  import ens from '$lib/stores/ens';

  async function connect() {
    await wallet.connect();
  }

  $: {
    if ($wallet?.connected) {
      const { provider, address } = $wallet ?? {};
      if (!provider || !address) throw new Error('No provider after connection');

      // Connect all stores to wallet
      ens.connect(provider);

      // Lookup own name
      ens.lookup(address);
    } else {
      // Disconnect all stores from wallet
      ens.disconnect();
    }
  }
</script>

{#if $wallet?.connected}
  <Button on:click={wallet.disconnect}>Disconnect wallet</Button>
{:else}
  <Button on:click={connect}>Connect wallet</Button>
{/if}

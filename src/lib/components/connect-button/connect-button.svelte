<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import WalletIcon from 'radicle-design-system/icons/Wallet.svelte';
  import wallet from '$lib/stores/wallet';
  import ens from '$lib/stores/ens';
  import drips from '$lib/stores/drips';

  $: {
    if ($wallet?.connected) {
      const { provider, address } = $wallet ?? {};
      if (!provider || !address) throw new Error('No provider after connection');

      // Connect all stores to wallet
      ens.connect(provider);
      drips.connect(provider);

      // Lookup own name
      ens.lookup(address);
    } else {
      // Disconnect all stores from wallet
      ens.disconnect();
      drips.disconnect();
    }
  }
</script>

<Button icon={WalletIcon} on:click={$wallet?.connected ? wallet.disconnect : wallet.connect}
  >{$wallet?.connected ? 'Disconnect wallet' : 'Connect wallet'}</Button
>

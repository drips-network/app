<script lang="ts">
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { signInWithEthereum } from '$lib/utils/rpgf/siwe';
  import type { Signer } from 'ethers';
  import Button from '../button/button.svelte';
  import Wallet from '../icons/Wallet.svelte';
  import { invalidateAll } from '$app/navigation';

  let pending = false;

  const handleClick = async () => {
    pending = true;

    try {
      let signer: Signer;

      if ($walletStore.connected) {
        signer = $walletStore.signer;

        await signInWithEthereum(signer);

        await invalidateAll();
      } else {
        const walletState = await walletStore.connect();

        if (!walletState?.connected) {
          return;
        }
        signer = walletState.signer;
      }
    } catch {
      // Handle error if needed
    } finally {
      pending = false;
    }
  };
</script>

<Button loading={pending} variant="primary" icon={Wallet} on:click={handleClick}
  >{$walletStore.connected ? 'S' : 'Connect wallet & s'}ign in</Button
>

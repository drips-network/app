<script lang="ts">
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { rpgfJwtStore, signInWithEthereum } from '$lib/utils/rpgf/siwe';
  import type { Signer } from 'ethers';
  import Button from '../button/button.svelte';
  import Wallet from '../icons/Wallet.svelte';
  import { createEventDispatcher } from 'svelte';
  import { invalidate, invalidateAll } from '$app/navigation';

  const dispatch = createEventDispatcher<{ signIn: void }>();

  let pending = false;

  const handleClick = async () => {
    pending = true;

    try {
      let signer: Signer;

      if ($walletStore.connected) {
        signer = $walletStore.signer;
      } else {
        const walletState = await walletStore.connect();

        if (!walletState?.connected) {
          return;
        }
        signer = walletState.signer;
      }

      await signInWithEthereum(signer);
      
      invalidateAll();
    } catch {
      // Handle error if needed
    } finally {
      pending = false;
    }
  };
</script>

<Button
  loading={pending}
  variant="primary"
  icon={Wallet}
  disabled={Boolean($rpgfJwtStore)}
  on:click={handleClick}>Connect wallet & Sign in</Button
>

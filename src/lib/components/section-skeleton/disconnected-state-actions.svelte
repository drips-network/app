<script lang="ts">
  import wallet from '$lib/stores/wallet/wallet.store';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import Button from '../button/button.svelte';
  import RpgfSiweButton from '../rpgf-siwe-button/rpgf-siwe-button.svelte';

  interface Props {
    requireRpgfSignIn?: boolean;
  }

  let { requireRpgfSignIn = false }: Props = $props();
</script>

{#if requireRpgfSignIn && $wallet.signer}
  <RpgfSiweButton />
{:else}
  <Button icon={Wallet} variant="primary" onclick={() => wallet.connect()}>Connect wallet</Button>
{/if}

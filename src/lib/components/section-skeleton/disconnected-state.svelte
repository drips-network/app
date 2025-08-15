<script lang="ts">
  import wallet from '$lib/stores/wallet/wallet.store';
  import ActionableEmptyState from './actionable-empty-state.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import Button from '../button/button.svelte';
  import RpgfSiweButton from '../rpgf-siwe-button/rpgf-siwe-button.svelte';

  export let emoji: string = '🫙';
  export let headline: string | undefined = 'You are disconnected';
  export let text: string | undefined = 'Please connect your wallet to see this section.';
  export let requireRpgfSignIn = false;
</script>

<ActionableEmptyState {emoji} {headline} description={text}>
  <svelte:fragment slot="actions">
    {#if requireRpgfSignIn && $wallet.signer}
      <RpgfSiweButton />
    {:else}
      <Button icon={Wallet} variant="primary" on:click={() => wallet.connect()}>
        Connect wallet
      </Button>
    {/if}
  </svelte:fragment>
</ActionableEmptyState>

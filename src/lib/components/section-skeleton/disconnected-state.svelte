<script lang="ts">
  import wallet from '$lib/stores/wallet/wallet.store';
  import ActionableEmptyState from './actionable-empty-state.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import Button from '../button/button.svelte';
  import RpgfSiweButton from '../rpgf-siwe-button/rpgf-siwe-button.svelte';

  interface Props {
    emoji?: string;
    headline?: string | undefined;
    text?: string | undefined;
    requireRpgfSignIn?: boolean;
  }

  let {
    emoji = '🫙',
    headline = 'You are disconnected',
    text = 'Please connect your wallet to see this section.',
    requireRpgfSignIn = false,
  }: Props = $props();
</script>

<ActionableEmptyState {emoji} {headline} description={text}>
  {#snippet actions()}
    {#if requireRpgfSignIn && $wallet.signer}
      <RpgfSiweButton />
    {:else}
      <Button icon={Wallet} variant="primary" onclick={() => wallet.connect()}>
        Connect wallet
      </Button>
    {/if}
  {/snippet}
</ActionableEmptyState>

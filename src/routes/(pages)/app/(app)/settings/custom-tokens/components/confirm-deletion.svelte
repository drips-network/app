<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import EmojiAndToken from '$lib/components/emoji-and-token/emoji-and-token.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import modal from '$lib/stores/modal';
  import tokens from '$lib/stores/tokens';
  import wallet from '$lib/stores/wallet/wallet.store';

  interface Props {
    tokenName: string;
    tokenAddress: string;
  }

  let { tokenName, tokenAddress }: Props = $props();

  function deleteToken() {
    tokens.removeCustomToken(tokenAddress, $wallet.network.chainId);

    modal.hide();
  }
</script>

<div class="confirm-modal">
  <StepLayout>
    <EmojiAndToken {tokenAddress} emoji="💀" />
    <StepHeader
      headline="Are you sure?"
      description={`"${tokenName}" will be removed from your custom tokens. Any streams streaming this token will show up as "Unknown token".`}
    />
    {#snippet actions()}
      <Button onclick={() => modal.hide()} variant="ghost">Cancel</Button>
      <Button variant="destructive" onclick={deleteToken}>Delete token</Button>
    {/snippet}
  </StepLayout>
</div>

<style>
  .confirm-modal {
    padding: 2.5rem;
  }

  @media only screen and (max-width: 54rem) {
    .confirm-modal {
      padding: 1rem;
    }
  }
</style>

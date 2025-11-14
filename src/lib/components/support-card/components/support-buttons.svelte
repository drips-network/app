<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import DripList from '$lib/components/icons/DripList.svelte';
  import Droplet from '$lib/components/icons/Droplet.svelte';
  import Heart from '$lib/components/icons/Heart.svelte';
  import TokenStreams from '$lib/components/icons/TokenStreams.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import { fade } from 'svelte/transition';




  interface Props {
    type: 'dripList' | 'project' | 'ecosystem';
    transitions?: boolean;
    onClickConnectWallet?: (() => void) | undefined;
    onClickNewStream?: (() => void) | undefined;
    onClickAddToDripList?: (() => void) | undefined;
    onClickNewDonation?: (() => void) | undefined;
    supportMenuOpen?: boolean;
  }

  let {
    type,
    transitions = true,
    onClickConnectWallet = undefined,
    onClickNewStream = undefined,
    onClickAddToDripList = undefined,
    onClickNewDonation = undefined,
    supportMenuOpen = $bindable(false)
  }: Props = $props();
</script>

{#if !$walletStore.connected}
  <div class="button-container">
    <Button onclick={onClickConnectWallet} size="large" icon={Wallet} variant="primary"
      >Connect your wallet</Button
    >
  </div>
{:else if !supportMenuOpen}
  <div out:fade={transitions ? { duration: 300 } : { duration: 0 }} class="button-container">
    <Button
      variant="primary"
      onclick={() => {
        supportMenuOpen = true;
      }}
      icon={Heart}
      size="large">Support</Button
    >
  </div>
{:else}
  <div
    in:fade={transitions ? { duration: 300, delay: 300 } : { duration: 0 }}
    class="button-container"
  >
    {#if type === 'dripList' || type === 'ecosystem'}
      <Button onclick={onClickNewStream} size="large" icon={TokenStreams}
        >Continuous donation</Button
      >
    {/if}
    <Button size="large" icon={Droplet} onclick={onClickNewDonation}>One-time donation</Button>
    {#if type !== 'ecosystem'}
      <Button onclick={onClickAddToDripList} size="large" icon={DripList}
        >Add to a Drip List</Button
      >
    {/if}
  </div>
{/if}

<style>
  .button-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.125rem 0;
  }
</style>

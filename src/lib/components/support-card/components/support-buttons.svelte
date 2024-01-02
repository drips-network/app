<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import DripList from 'radicle-design-system/icons/DripList.svelte';
  import Droplet from 'radicle-design-system/icons/Droplet.svelte';
  import Heart from 'radicle-design-system/icons/Heart.svelte';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import Wallet from 'radicle-design-system/icons/Wallet.svelte';
  import { fade } from 'svelte/transition';

  export let isOwner = false;
  export let type: 'dripList' | 'project';

  export let transitions = true;

  export let onClickConnectWallet: (() => void) | undefined = undefined;
  export let onClickNewStream: (() => void) | undefined = undefined;
  export let onClickAddToDripList: (() => void) | undefined = undefined;
  export let onClickNewDonation: (() => void) | undefined = undefined;

  export let supportMenuOpen = false;
</script>

{#if !$walletStore.connected}
  <div class="button-container">
    <Button on:click={onClickConnectWallet} size="large" icon={Wallet} variant="primary"
      >Connect your wallet</Button
    >
  </div>
{:else if !supportMenuOpen}
  <div out:fade={transitions ? { duration: 300 } : { duration: 0 }} class="button-container">
    <Button
      variant="primary"
      on:click={() => {
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
    {#if isOwner && type === 'dripList'}
      <Button on:click={onClickNewStream} size="large" icon={TokenStreams}
        >Continuous donation</Button
      >
    {/if}
    <Button size="large" icon={Droplet} on:click={onClickNewDonation}>One-time donation</Button>
    <Button on:click={onClickAddToDripList} size="large" icon={DripList}>Add to a Drip List</Button>
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

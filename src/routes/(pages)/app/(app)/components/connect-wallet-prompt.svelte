<script>
  import Button from '$lib/components/button/button.svelte';
  import EduCard from '$lib/components/edu-card/edu-card.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import OneContract from '$lib/components/illustrations/one-contract.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
</script>

<EduCard>
  {#snippet text()}
  
      <p>Connect your wallet to claim your open-source project, create a Drip List, and more.</p>
    
  {/snippet}
  {#snippet buttons()}
  
      <Button icon={Wallet} variant="primary" onclick={() => walletStore.connect()}
        >Connect wallet</Button
      >
      <Button href="https://docs.drips.network" target="_blank">Learn more</Button>
    
  {/snippet}
  {#snippet illustration()}
  
      <div class="edu-card-illustration-bg"></div>
      <div class="edu-card-illustration-wrapper">
        <div class="inner">
          <OneContract />
        </div>
      </div>
    
  {/snippet}
</EduCard>

<style>
  .edu-card-illustration-bg {
    display: none;
  }

  .edu-card-illustration-wrapper {
    position: absolute;
    max-width: 20rem;
    z-index: 1;
    right: -10%;
    top: -10%;
  }

  @media (max-width: 768px) {
    .edu-card-illustration-bg {
      position: absolute;
      top: 0;
      background-color: var(--color-primary-level-1);
      width: 100%;
      height: 25%;
      border-radius: 0;
      display: block;
    }

    .edu-card-illustration-wrapper {
      position: relative;
      max-width: 8rem;
      right: 0%;
      top: 0%;
    }
  }
</style>

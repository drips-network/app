<script lang="ts">
  import Coin from '$lib/components/icons/Coin.svelte';
  import Download from '$lib/components/icons/Download.svelte';
  import Recipients from '$lib/components/icons/Recipients.svelte';
  import Server from '$lib/components/icons/Server.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
</script>

<div class="card ecosystem-metadata">
  <div>
    <h4 class="typo-header-4"><Recipients style="fill: var(--color-primary)" />Recipients</h4>
    2,618
  </div>
  <div>
    <h4 class="typo-header-4"><Server style="fill: var(--color-primary)" />Model</h4>
    Drips Bot 9000
  </div>
  <div>
    <h4 class="typo-header-4"><Download style="fill: var(--color-primary)" />Download</h4>
    Download ecosystem as CSV
  </div>
  <div>
    <h4 class="typo-header-4"><Wallet style="fill: var(--color-primary)" />Owner</h4>
    brandonhaslegs.eth
  </div>
  <div>
    <!-- TODO: wrong icon -->
    <h4 class="typo-header-4"><Coin style="fill: var(--color-primary)" />Donations</h4>
    none
  </div>
</div>

<style>
  .card {
    background-color: var(--color-background);
    padding: 1.5rem;
    box-shadow: var(--elevation-low);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    display: flex;
    gap: 0.5rem;
    overflow-x: scroll;
    text-align: left;
  }

  .ecosystem-metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
  }

  .ecosystem-metadata > * {
    flex-basis: calc(33% - 2rem);
  }

  @media (max-width: 768px) {
    .ecosystem-metadata > * {
      flex-basis: calc(50% - 2rem);
    }
  }

  h4 {
    color: var(--color-primary);
    margin-bottom: 1rem;
    display: flex;
    gap: 0.5rem;
  }
</style>

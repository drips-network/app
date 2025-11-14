<script lang="ts" module>
  export const ECOSYSTEMS_LISTINGS_ITEM_FRAGMENT = gql`
    fragment EcosystemsListingsItem on EcosystemMainAccount {
      owner {
        accountId
        address
      }
      totalEarned {
        tokenAddress
        amount
      }
    }
  `;
</script>

<script lang="ts">
  import { run } from 'svelte/legacy';

  import walletStore from '$lib/stores/wallet/wallet.store';
  import guardConnected from '$lib/utils/guard-connected';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { gql } from 'graphql-request';
  import AllEcosystemsSection from './components/all-ecosystems-section.svelte';
  import EduCard from '$lib/components/edu-card/edu-card.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Ecosystem from '$lib/components/illustrations/ecosystem.svelte';
  import EduCardIllustration from '$lib/components/edu-card/edu-card-illustration.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';

  let { data } = $props();

  run(() => {
    $walletStore.connected;
    guardConnected();
  });
</script>

<HeadMeta title="Ecosystems" />

<div class="page">
  <EduCard dismissableId="ecosystems-page-intro" negativeMarginWhileCollapsed="-4rem">
    {#snippet text()}
      
        <h1 class="pixelated">Ecosystems</h1>
        <p>
          Ecosystems are large collections of claimed and unclaimed projects networked together using
          Drips AI. Sending funds to a single ecosystem is an efficient way to easily fund hundreds of
          projects at once, supporting a whole community in one go.
        </p>
      
      {/snippet}
    {#snippet buttons()}
      
        <Button icon={ArrowBoxUpRight}>Learn more</Button>
      
      {/snippet}
    {#snippet illustration()}
      
        <EduCardIllustration>
          <Ecosystem />
        </EduCardIllustration>
      
      {/snippet}
  </EduCard>

  <div class="section">
    {#if data.ecosystems}
      <AllEcosystemsSection ecosystems={data.ecosystems} />
    {/if}
  </div>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>

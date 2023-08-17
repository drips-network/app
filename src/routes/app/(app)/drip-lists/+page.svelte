<script lang="ts">
  import walletStore from '$lib/stores/wallet/wallet.store';
  import guardConnected from '$lib/utils/guard-connected';
  import DripListsSection from '$lib/components/drip-lists-section/drip-lists-section.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import DripList from '$lib/components/illustrations/drip-list.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowBoxUpRight from 'radicle-design-system/icons/ArrowBoxUpRight.svelte';
  import EduCard from '$lib/components/edu-card/edu-card.svelte';

  const walletInitialized = walletStore.initialized;

  $: {
    $walletStore.connected;
    $walletInitialized;

    guardConnected();
  }

  $: address = $walletStore.address;
</script>

<HeadMeta title="Drip List" />

<div class="page">
  <EduCard dimissableId="drip-lists-page-intro" negativeMarginWhileCollapsed="-4rem">
    <svelte:fragment slot="text">
      <h2 class="pixelated">Fund your dependencies by creating your Drip List</h2>
      <p>
        Your Drip List is a list of projects and individuals that you can flexibly support by
        streaming any ERC-20.
      </p>
      <a
        tabindex="-1"
        style:width="fit-content"
        href="https://docs.drips.network/docs/for-funders/fund-your-dependencies"
      >
        <Button icon={ArrowBoxUpRight}>Learn more</Button>
      </a>
    </svelte:fragment>
    <svelte:fragment slot="illustration">
      <div class="edu-card-illustration-bg" />
      <div class="edu-card-illustration-wrapper">
        <DripList />
      </div>
    </svelte:fragment>
  </EduCard>
  <DripListsSection showSupportersSection address={$walletStore.address} />
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .edu-card-illustration-bg {
    position: absolute;
    background-color: var(--color-primary-level-2);
    top: 0;
    width: 35%;
    height: 50%;
    border-radius: 0 0 1rem 1rem;
  }

  .edu-card-illustration-wrapper {
    max-width: 16rem;
    z-index: 1;
  }

  @media (max-width: 768px) {
    .edu-card-illustration-bg {
      width: 100%;
      height: 30%;
      border-radius: 0;
    }
  }
</style>

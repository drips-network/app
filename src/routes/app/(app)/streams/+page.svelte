<script lang="ts">
  import Balances from './sections/balances.section.svelte';
  import Streams from './sections/streams.section.svelte';

  import wallet from '$lib/stores/wallet/wallet.store';
  import guardConnected from '$lib/utils/guard-connected';
  import Carousel, { makeCarouselItem } from '$lib/components/carousel/carousel.svelte';
  import CarouselEduCard from '$lib/components/carousel/items/carousel-edu-card.svelte';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import ArrowUp from 'radicle-design-system/icons/ArrowBoxUpRight.svelte';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';
  import { fly } from 'svelte/transition';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import OneBalance from '$lib/components/illustrations/one-balance.svelte';
  import MultiChain from '$lib/components/illustrations/multi-chain.svelte';

  $: accountId = $wallet.dripsAccountId;

  const walletInitialized = wallet.initialized;

  $: {
    $wallet.connected;
    $walletInitialized;

    guardConnected();
  }

  $: eduCarouselItems = [
    makeCarouselItem({
      id: 'create-a-drip-list',
      component: CarouselEduCard,
      props: {
        id: 'create-a-drip-list',
        title: 'Support Open-Source Software',
        description: 'Create your Drip List now to start supporting open-source public goods.',
        illustration: OneBalance,
        actions: [
          {
            handler: () =>
              window.open('https://docs.drips.network/support-your-dependencies', '_blank')?.focus(),
            label: 'Learn more',
            primary: true,
            icon: ArrowUp,
          },
        ],
      },
    }),
    makeCarouselItem({
      id: 'claim-a-project',
      component: CarouselEduCard,
      props: {
        id: 'claim-a-project',
        title: 'Raise funds for your project',
        description: 'Claim your GitHub repository on Drips to start raising funds.',
        illustration: MultiChain,
        actions: [
          {
            handler: () =>
              window.open('https://docs.drips.network/claim-your-repository', '_blank')?.focus(),
            label: 'Learn more',
            primary: true,
            icon: ArrowUp,
          },
        ],
      },
    }),
  ].filter((ci) => !$dismissablesStore.includes(ci((i) => i).id));
</script>

<HeadMeta title="Streams" />

<div class="dashboard">
  <div class="edu-carousel">
    <TransitionedHeight negativeMarginWhileCollapsed="-64px">
      {#if eduCarouselItems.length > 0}
        <div out:fly|local={{ y: -10, duration: 300 }} class="edu-carousel-inner">
          <h4 class="typo-all-caps">Getting started</h4>
          <Carousel items={eduCarouselItems} />
        </div>
      {/if}
    </TransitionedHeight>
  </div>
  <div class="sections">
    <Balances {accountId} disableActions={false} />
    <Streams {accountId} disableActions={false} />
  </div>
</div>

<style>
  h4 {
    margin-bottom: 1.5rem;
  }

  .edu-carousel {
    margin: 0 -2.5rem;
  }

  .edu-carousel h4 {
    margin-left: 2.5rem;
  }

  .sections {
    margin-top: 4rem;
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }
</style>

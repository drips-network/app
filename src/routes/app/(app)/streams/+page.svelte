<script lang="ts">
  import Balances from './sections/balances.section.svelte';
  import Streams from './sections/streams.section.svelte';

  import wallet from '$lib/stores/wallet/wallet.store';
  import guardConnected from '$lib/utils/guard-connected';
  import Carousel, { makeCarouselItem } from '$lib/components/carousel/carousel.svelte';
  import EduCard from '$lib/components/carousel/items/carousel-edu-card.svelte';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import ArrowUp from 'radicle-design-system/icons/ArrowBoxUpRight.svelte';
  import OneContract from '$lib/components/illustrations/one-contract.svelte';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';
  import { fly } from 'svelte/transition';
  import MultiToken from '$lib/components/illustrations/multi-token.svelte';
  import NoWrappedTokens from '$lib/components/illustrations/no-wrapped-tokens.svelte';
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
      component: EduCard,
      props: {
        id: 'create-a-drip-list',
        title: 'Support Open-Source Software',
        description: 'Create your Drip List now to start supporting open-source public goods.',
        illustration: OneBalance,
        actions: [
          {
            handler: () =>
              window
                .open(
                  'https://docs.drips.network/docs/for-funders/fund-your-dependencies',
                  '_blank',
                )
                ?.focus(),
            label: 'Learn more',
            primary: true,
            icon: ArrowUp,
          },
        ],
      },
    }),
    makeCarouselItem({
      id: 'claim-a-project',
      component: EduCard,
      props: {
        id: 'claim-a-project',
        title: 'Raise funds for your project',
        description: 'Claim your GitHub repository on Drips to start raising funds.',
        illustration: MultiChain,
        actions: [
          {
            handler: () =>
              window
                .open(
                  'https://docs.drips.network/docs/for-fundraisers/how-to-claim-a-project',
                  '_blank',
                )
                ?.focus(),
            label: 'Learn more',
            primary: true,
            icon: ArrowUp,
          },
        ],
      },
    }),
    makeCarouselItem({
      id: 'set-up-first-stream',
      component: EduCard,
      props: {
        id: 'set-up-first-stream',
        title: 'Create your first stream',
        description: 'Stream any ERC-20 token to anyone. All you need is an Ethereum address.',
        illustration: MultiToken,
        actions: [
          {
            handler: () =>
              window
                .open(
                  'https://docs.drips.network/docs/streaming-and-splitting/streams/create-a-stream',
                  '_blank',
                )
                ?.focus(),
            label: 'Create a stream',
            primary: true,
            icon: ArrowUp,
          },
        ],
      },
    }),
    makeCarouselItem({
      id: 'collect-earnings',
      component: EduCard,
      props: {
        id: 'collect-earnings',
        title: 'Collect earnings',
        description: 'Learn how to collect funds youʼve earned from incoming streams or splits.',
        illustration: NoWrappedTokens,
        actions: [
          {
            handler: () =>
              window
                .open(
                  'https://docs.drips.network/docs/streaming-and-splitting/manage-funds/collect-earnings',
                  '_blank',
                )
                ?.focus(),
            label: 'Learn more',
            primary: true,
            icon: ArrowUp,
          },
        ],
      },
    }),
    makeCarouselItem({
      id: 'explore-the-network',
      component: EduCard,
      props: {
        id: 'explore-the-network',
        title: 'Explore the network',
        description: 'You can view other peopleʼs activity on Drips and share your profile.',
        illustration: OneContract,
        actions: [
          {
            handler: () =>
              window
                .open(
                  'https://docs.drips.network/docs/streaming-and-splitting/explore/drips-profiles',
                  '_blank',
                )
                ?.focus(),
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
    <TransitionedHeight>
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
    margin: 0 -4rem;
  }

  .edu-carousel h4 {
    margin-left: 4rem;
  }

  .sections {
    margin-top: 4rem;
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }
</style>

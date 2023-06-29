<script lang="ts">
  import Balances from './sections/balances.section.svelte';
  import Streams from './sections/streams.section.svelte';
  import Splits from './sections/splits.section.svelte';

  import wallet from '$lib/stores/wallet/wallet.store';
  import guardConnected from '$lib/utils/guard-connected';
  import Carousel, { makeCarouselItem } from '$lib/components/carousel/carousel.svelte';
  import EduCard from '$lib/components/carousel/items/edu-card.svelte';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import ArrowUp from 'radicle-design-system/icons/ArrowBoxUpRight.svelte';
  import GasOptimized from '$lib/components/illustrations/gas-optimized.svelte';
  import OneContract from '$lib/components/illustrations/one-contract.svelte';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';
  import { fly } from 'svelte/transition';
  import MultiToken from '$lib/components/illustrations/multi-token.svelte';
  import NoWrappedTokens from '$lib/components/illustrations/no-wrapped-tokens.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';

  $: userId = $wallet.dripsUserId;

  $: {
    $wallet.connected;
    guardConnected();
  }

  $: eduCarouselItems = [
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
                  'https://docs.drips.network/docs/the-drips-app/streams/create-a-stream',
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
      id: 'configure-splits',
      component: EduCard,
      props: {
        id: 'configure-splits',
        title: 'Split income automatically',
        description: 'Configure automatic distribution of incoming funds to your peers.',
        illustration: GasOptimized,
        actions: [
          {
            handler: () =>
              window
                .open(
                  'https://docs.drips.network/docs/the-drips-app/splits/set-up-splits',
                  '_blank',
                )
                ?.focus(),
            label: 'Set up your splits',
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
        description: "Learn how to collect funds you've earned from incoming streams or splits.",
        illustration: NoWrappedTokens,
        actions: [
          {
            handler: () =>
              window
                .open(
                  'https://docs.drips.network/docs/the-drips-app/manage-funds/collect-earnings',
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
        description: "You can view other people's activity on Drips and share your profile.",
        illustration: OneContract,
        actions: [
          {
            handler: () =>
              window
                .open(
                  'https://docs.drips.network/docs/the-drips-app/explore/drips-profiles',
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

<HeadMeta title="Streams | Drips" />

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
    <Balances {userId} disableActions={false} />
    <Streams {userId} disableActions={false} />
    <Splits {userId} disableActions={false} />
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

<script lang="ts">
  import { browser } from '$app/environment';
  import amtDeltaUnitStore, {
    FRIENDLY_NAMES,
    MULTIPLIERS,
  } from '$lib/stores/amt-delta-unit/amt-delta-unit.store';
  import { tweened } from 'svelte/motion';
  import DripsAnimation from '../drips-animation/drips-animation.svelte';
  import FormattedAmount from '../formatted-amount/formatted-amount.svelte';
  import IdentityCard from '../identity-card/identity-card.svelte';
  import DripListService from '$lib/utils/driplist/DripListService';

  interface AddressDriverUser {
    driver: 'address';
    address: string;
  }

  interface NFTDriverUser {
    driver: 'nft';
    userId: string;
  }

  export let from: AddressDriverUser | undefined = undefined;
  export let to: NFTDriverUser | AddressDriverUser | undefined = undefined;
  export let disableLinks = false;
  export let amountPerSecond: bigint | undefined = undefined;
  export let halted = false;

  export let tokenInfo: { decimals: number; symbol: string } | undefined = undefined;

  let animationSpeed = tweened(0, {
    duration: 500,
  });

  $: {
    animationSpeed.set(to && amountPerSecond && !halted ? 1 : 0);
  }

  let windowWidth = (browser && window.innerWidth) || 0;
  $: verticalAnimation = windowWidth <= 768;

  function getAmtPerSec() {
    const multiplier = MULTIPLIERS[$amtDeltaUnitStore];

    return (amountPerSecond ?? 0n) * BigInt(multiplier);
  }

  async function fetchDripList(userId: string) {
    const service = await DripListService.new();

    return service.getByTokenId(userId);
  }
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="stream-visual">
  <div class="no-shrink">
    <IdentityCard disableLink={disableLinks} address={from?.address} title="From" />
  </div>
  <div class="animation">
    <DripsAnimation vertical={verticalAnimation} speedMultiplier={$animationSpeed} />
  </div>
  <div class="no-shrink">
    {#if to && to.driver === 'address'}
      <IdentityCard disableLink={disableLinks} address={to.address} title="To" />
    {:else if to && to.driver === 'nft'}
      {#await fetchDripList(to.userId)}
        <IdentityCard loading />
      {:then result}
        {#if result}
          <IdentityCard dripList={result} title="To" />
        {/if}
      {/await}
    {:else}
      <IdentityCard disableLink={disableLinks} address={undefined} title="To" />
    {/if}
  </div>
  {#if tokenInfo}<div class="amt-per-sec typo-text-mono">
      <FormattedAmount decimals={tokenInfo.decimals} amount={getAmtPerSec()} />
      {tokenInfo.symbol} <span class="muted">/{FRIENDLY_NAMES[$amtDeltaUnitStore]}</span>
    </div>{/if}
</div>

<style>
  .stream-visual {
    position: relative;
    display: flex;
    justify-content: space-between;
    flex: 1;
  }

  .no-shrink {
    flex-shrink: 0;
  }

  .animation {
    flex: 1;
  }

  .amt-per-sec {
    height: 1.5rem;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--color-background);
    box-shadow: var(--elevation-medium);
    padding: 0 0.5rem;
    border-radius: 0.75rem;
    color: var(--color-foreground-level-6);
  }

  .muted {
    color: var(--color-foreground-level-5);
  }

  @media (max-width: 768px) {
    .stream-visual {
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 128rem;
    }

    .animation {
      height: 8rem;
      width: 12rem;
      flex: initial;
    }

    .amt-per-sec {
      left: unset;
      right: unset;
      transform: unset;
      transform: translateY(-50%);
    }
  }
</style>

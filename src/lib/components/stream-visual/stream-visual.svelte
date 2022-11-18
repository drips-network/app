<script lang="ts">
  import { tweened } from 'svelte/motion';
  import DripsAnimation from '../drips-animation/drips-animation.svelte';
  import FormattedAmount from '../formatted-amount/formatted-amount.svelte';
  import IdentityCard from '../identity-card/identity-card.svelte';

  export let fromAddress: string | undefined = undefined;
  export let toAddress: string | undefined = undefined;
  export let amountPerSecond: bigint | undefined = undefined;
  export let halted = false;

  export let tokenInfo: { decimals: number; symbol: string } | undefined = undefined;

  let animationSpeed = tweened(0, {
    duration: 500,
  });

  $: {
    animationSpeed.set(toAddress && amountPerSecond && !halted ? 1 : 0);
  }
</script>

<div class="stream-visual">
  <div class="no-shrink"><IdentityCard address={fromAddress} title="From" /></div>
  <div class="animation"><DripsAnimation speedMultiplier={$animationSpeed} /></div>
  <div class="no-shrink"><IdentityCard address={toAddress} title="To" /></div>
  {#if tokenInfo}<div class="amt-per-sec typo-text-mono-bold">
      <FormattedAmount decimals={tokenInfo.decimals} amount={amountPerSecond} />
      {tokenInfo.symbol} <span class="muted">/sec</span>
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
</style>

<script lang="ts">
  import { tweened } from 'svelte/motion';
  import DripsAnimation from '../drips-animation/drips-animation.svelte';
  import IdentityCard from '../identity-card/identity-card.svelte';

  export let fromAddress: string | undefined = undefined;
  export let toAddress: string | undefined = undefined;
  export let amountPerSecond: bigint | undefined = undefined;

  let animationSpeed = tweened(0, {
    duration: 500,
  });

  $: {
    animationSpeed.set(toAddress && amountPerSecond ? 1 : 0);
  }
</script>

<div class="stream-visual">
  <div class="no-shrink"><IdentityCard address={fromAddress} title="From" /></div>
  <div class="animation"><DripsAnimation speedMultiplier={$animationSpeed} /></div>
  <div class="no-shrink"><IdentityCard address={toAddress} title="To" /></div>
</div>

<style>
  .stream-visual {
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
</style>

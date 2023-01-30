<script lang="ts">
  import tokens from '$lib/stores/tokens';
  import { convertIpfsUri } from '$lib/utils/ipfs';
  import seededRandomElement from '$lib/utils/seeded-random-element';
  import ExclamationCircle from 'radicle-design-system/icons/ExclamationCircle.svelte';
  import QuestionIcon from 'radicle-design-system/icons/Question.svelte';
  import { onMount } from 'svelte';
  import { quintIn, quintOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import CoinAnimation from '../coin-animation/coin-animation.svelte';
  import FitText from '../fit-text/fit-text.svelte';

  export let address: string;
  export let show: 'name' | 'symbol' | 'none' = 'name';
  export let size: 'small' | 'normal' | 'huge' = 'normal';
  export let fontSize = 'typo-text-bold';
  export let animateOnMount = false;

  /** Manually set token information to display. Used on the landing page's mock dashboard. */
  export let overrideToDisplay:
    | {
        name: string;
        logoURI?: string;
        symbol: string;
      }
    | undefined = undefined;

  const sizes = {
    small: 24,
    normal: 32,
    huge: 48,
  };

  $: token = $tokens ? tokens.getByAddress(address) : undefined;
  $: tokenInfo = overrideToDisplay ?? ($tokens ? token?.info : undefined);
  $: src = tokenInfo?.logoURI ? convertIpfsUri(tokenInfo.logoURI) : undefined;

  let imageFailed = false;

  let tokenRotationDeg = tweened(0);
  let sparkle1Scale = tweened(0);
  let sparkle2Scale = tweened(0);

  async function animate() {
    tokenRotationDeg.set(0, { duration: 0 });
    tokenRotationDeg.set(720, { duration: 1500, easing: quintOut });

    sparkle1Scale.set(2, { duration: 200, easing: quintOut, delay: 100 });
    setTimeout(() => sparkle1Scale.set(0, { duration: 200, easing: quintIn }), 300);

    sparkle2Scale.set(2, { duration: 200, easing: quintOut, delay: 300 });
    setTimeout(() => sparkle2Scale.set(0, { duration: 200, easing: quintIn }), 500);
  }

  $: shouldAnimate = Boolean(tokenInfo);

  $: placeholderColor = tokenInfo
    ? seededRandomElement(['red', 'green', 'blue', 'purple'], address)
    : 'var(--color-foreground-level-2)';

  $: {
    if (animateOnMount && shouldAnimate) animate();
  }

  let loaded = false;

  let imgElem: HTMLImageElement;

  onMount(() => {
    if (imgElem && imgElem.complete) loaded = true;
  });
</script>

<div class="token size-{size}">
  <div class="logo" style={`height: ${sizes[size]}px; width: ${sizes[size]}px`}>
    <CoinAnimation enable={shouldAnimate} {animateOnMount}>
      {#if tokenInfo?.logoURI && !imageFailed}
        <div class="background" class:loaded />
        <img
          bind:this={imgElem}
          on:load={() => (loaded = true)}
          {src}
          class:loaded
          style={`transform: rotate3d(0, 1, 0, ${$tokenRotationDeg}deg)`}
          on:error={() => (imageFailed = true)}
          alt={`${tokenInfo.name} logo`}
        />
      {:else}
        <div
          style="transform: rotate3d(0, 1, 0, {$tokenRotationDeg}deg); background-color: {placeholderColor}"
          class="unknown-logo typo-text-mono-bold"
        >
          {#if tokenInfo?.symbol}
            <div class="symbol-wrapper px-1 w-full">
              <FitText text={tokenInfo.symbol} />
            </div>
          {:else}
            <QuestionIcon />
          {/if}
        </div>
      {/if}
    </CoinAnimation>
    {#if token?.source === 'custom'}
      <div class="custom-token-warning">
        <ExclamationCircle
          style="height: {sizes[size] / 1.5}px; width: {sizes[size] /
            1.5}px; fill: var(--color-caution); margin: -2px;"
        />
      </div>
    {/if}
  </div>
  {#if show !== 'none'}
    <div class="name {fontSize}" class:unknown={tokenInfo === undefined}>
      {(show === 'name' ? tokenInfo?.name : tokenInfo?.symbol) ?? 'Unknown token'}
    </div>
  {/if}
</div>

<style>
  .token {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    user-select: none;
  }

  .token.size-huge {
    gap: 1.2rem;
  }

  .custom-token-warning {
    position: absolute;
    right: -0.3rem;
    bottom: -0.3rem;
    background-color: var(--color-background);
    border-radius: 1rem;
  }

  .logo {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    animation-duration: 2s;
    animation-iteration-count: 1;
    position: relative;
    overflow: visible;
  }

  .unknown-logo {
    border-radius: calc(100% / 2);
    color: #fff;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .background {
    background-color: var(--color-foreground-level-2);
    height: 100%;
    width: 100%;
    position: absolute;
    border-radius: calc(100% / 2);
    transition: opacity 0.3s;
  }

  .background.loaded {
    opacity: 0;
  }

  img {
    border-radius: calc(100% / 2);
    height: 100%;
    width: 100%;
    opacity: 0;
    transition: opacity 0.3s;
  }

  img.loaded {
    opacity: 1;
  }

  .unknown {
    opacity: 0.5;
  }
</style>

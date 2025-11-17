<script lang="ts">
  import tokens from '$lib/stores/tokens';
  import { convertIpfsUri } from '$lib/utils/ipfs';
  import seededRandomElement from '$lib/utils/seeded-random-element';
  import ExclamationCircle from '$lib/components/icons/ExclamationCircle.svelte';
  import QuestionIcon from '$lib/components/icons/Question.svelte';
  import { onMount } from 'svelte';
  import CoinAnimation from '../coin-animation/coin-animation.svelte';
  import FitText from '../fit-text/fit-text.svelte';

  interface Props {
    address: string;
    show?: 'name' | 'symbol' | 'none';
    size?: 'small' | 'normal' | 'huge';
    fontSize?: string;
    animateOnMount?: boolean;
    /** Manually set token information to display. Used on the landing page's mock dashboard. */
    overrideToDisplay?:
      | {
          name: string;
          logoURI?: string;
          symbol: string;
        }
      | undefined;
  }

  let {
    address,
    show = 'name',
    size = 'normal',
    fontSize = 'typo-text',
    animateOnMount = false,
    overrideToDisplay = undefined,
  }: Props = $props();

  const sizes = {
    small: 24,
    normal: 32,
    huge: 48,
  };

  function adjustSrcSize(src: string) {
    // Most token URLs are Coingecko assets using the "thumb" quality, which is very low-res.
    if (size === 'small') {
      return src.replaceAll('/thumb/', '/small/');
    } else {
      return src.replaceAll('/thumb/', '/large/');
    }
  }

  let imageFailed = $state(false);

  let loaded = $state(false);

  let imgElem = $state<HTMLImageElement>();

  onMount(() => {
    if (imgElem && imgElem.complete) loaded = true;
  });
  let token = $derived($tokens ? tokens.getByAddress(address) : undefined);
  let tokenInfo = $derived(overrideToDisplay ?? ($tokens ? token?.info : undefined));
  let src = $derived(
    tokenInfo?.logoURI ? convertIpfsUri(adjustSrcSize(tokenInfo.logoURI)) : undefined,
  );
  let shouldAnimate = $derived(Boolean(tokenInfo));
  let placeholderColor = $derived(
    tokenInfo
      ? seededRandomElement(['red', 'green', 'blue', 'purple'], address)
      : 'var(--color-foreground-level-2)',
  );
</script>

<div class="token size-{size}">
  <div class="logo" style="height: {sizes[size]}px; width: {sizes[size]}px">
    <CoinAnimation enable={shouldAnimate} {animateOnMount}>
      {#if tokenInfo?.logoURI && !imageFailed}
        <div class="background" class:loaded></div>
        <img
          bind:this={imgElem}
          onload={() => (loaded = true)}
          {src}
          class:loaded
          onerror={() => (imageFailed = true)}
          alt={`${tokenInfo.name} logo`}
        />
      {:else}
        <div
          style="background-color: {placeholderColor}"
          class="unknown-logo typo-text tabular-nums"
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
    border: 1px solid var(--color-foreground-level-6);
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
    border: 1px solid var(--color-foreground-level-6);
    background-color: white;
    padding: 8%;
  }

  img.loaded {
    opacity: 1;
  }

  .unknown {
    opacity: 0.5;
  }
</style>

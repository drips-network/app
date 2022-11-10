<script lang="ts">
  import tokens from '$lib/stores/tokens';
  import { convertIpfsUri } from '$lib/utils/ipfs';
  import QuestionIcon from 'radicle-design-system/icons/Info.svelte';
  import { quintIn, quintOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';

  export let address: string;
  export let show: 'name' | 'symbol' | 'none' = 'name';
  export let size: 'small' | 'normal' | 'huge' = 'normal';
  export let animateOnMount = false;

  const sizes = {
    small: 24,
    normal: 32,
    huge: 48,
  };

  $: tokenInfo = $tokens ? tokens.getByAddress(address)?.info : undefined;
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

  $: {
    if (animateOnMount && loaded) animate();
  }

  let loaded = false;
</script>

<div class="token">
  <div
    class="logo"
    style={`height: ${sizes[size]}px; width: ${sizes[size]}px`}
    on:mouseenter={() => !imageFailed && tokenInfo && loaded && animate()}
    on:click={() => !imageFailed && tokenInfo && loaded && animate()}
  >
    {#if tokenInfo?.logoURI && !imageFailed}
      <div class="background" class:loaded />
      <img
        {src}
        class:loaded
        on:load={() => (loaded = true)}
        style={`transform: rotate3d(0, 1, 0, ${$tokenRotationDeg}deg)`}
        on:error={() => (imageFailed = true)}
        alt={`${tokenInfo.name} logo`}
      />
    {:else}
      <div class="unknown-logo">
        <QuestionIcon />
      </div>
    {/if}
    <div
      class="sparkle one"
      style={`transform: scale(${$sparkle1Scale}); font-size: ${sizes[size] / 3}`}
    >
      ✨
    </div>
    <div
      class="sparkle two"
      style={`transform: scale(${$sparkle2Scale}); font-size: ${sizes[size] / 3}`}
    >
      ✨
    </div>
  </div>
  {#if show !== 'none'}
    <div class="name typo-text-bold" class:unknown={tokenInfo === undefined}>
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
    background-color: var(--color-foreground-level-2);
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
  .sparkle {
    position: absolute;
    font-size: 10px;
    text-shadow: 0px 0px 5px yellow;
  }

  .sparkle.one {
    top: 0;
    left: 0;
  }

  .sparkle.two {
    bottom: 0;
    right: 0;
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';

  export let imageUrl: string;

  let imageEl: HTMLImageElement;
  let imageLoaded = false;

  onMount(() => {
    if (imageEl?.complete) {
      imageLoaded = true;
    }
  });
</script>

<div class="feature-card">
  <img
    bind:this={imageEl}
    class:loaded={imageLoaded}
    src={imageUrl}
    on:load={() => {
      imageLoaded = true;
    }}
    alt=""
  />

  <div class="content">
    <slot />

    <div class="actions">
      <slot name="actions" />
    </div>
  </div>
</div>

<style>
  .feature-card {
    position: relative;
    border-radius: 2rem 0 2rem 2rem;
    border: 1px solid var(--color-primary-level-2);
    overflow: hidden;
    background-color: var(--color-primary-level-1);
    container-type: inline-size;
  }

  .content {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 40%;
    min-width: 27rem;
    margin-top: 7rem;
    padding: 1rem;
    z-index: 2;
  }

  img {
    width: 70%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 1;
    /* Approximation of an eased gradient in lieau of a css feature for this */
    mask-image: linear-gradient(
      to left,
      hsl(0, 0%, 0%) 0%,
      hsla(0, 0%, 0%, 0.987) 14.9%,
      hsla(0, 0%, 0%, 0.951) 27.3%,
      hsla(0, 0%, 0%, 0.896) 37.5%,
      hsla(0, 0%, 0%, 0.825) 45.8%,
      hsla(0, 0%, 0%, 0.741) 52.6%,
      hsla(0, 0%, 0%, 0.648) 58.1%,
      hsla(0, 0%, 0%, 0.55) 62.6%,
      hsla(0, 0%, 0%, 0.45) 66.5%,
      hsla(0, 0%, 0%, 0.352) 70%,
      hsla(0, 0%, 0%, 0.259) 73.4%,
      hsla(0, 0%, 0%, 0.175) 77.1%,
      hsla(0, 0%, 0%, 0.104) 81.2%,
      hsla(0, 0%, 0%, 0.049) 86.3%,
      hsla(0, 0%, 0%, 0.013) 92.4%,
      hsla(0, 0%, 0%, 0) 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }
  img.loaded {
    opacity: 0.6;
  }

  .actions {
    display: flex;
    gap: 0.3rem;
    margin-top: auto;
    flex-wrap: wrap;
  }

  @media (max-width: 900px) {
    .content {
      max-width: 100%;
      min-width: auto;
      margin-top: -3rem;
    }

    img {
      width: 100%;
      height: auto;
      max-height: 16rem;
      position: relative;
      mask-image: linear-gradient(
        to bottom,
        hsl(0, 0%, 0%) 0%,
        hsla(0, 0%, 0%, 0.987) 14.9%,
        hsla(0, 0%, 0%, 0.951) 27.3%,
        hsla(0, 0%, 0%, 0.896) 37.5%,
        hsla(0, 0%, 0%, 0.825) 45.8%,
        hsla(0, 0%, 0%, 0.741) 52.6%,
        hsla(0, 0%, 0%, 0.648) 58.1%,
        hsla(0, 0%, 0%, 0.55) 62.6%,
        hsla(0, 0%, 0%, 0.45) 66.5%,
        hsla(0, 0%, 0%, 0.352) 70%,
        hsla(0, 0%, 0%, 0.259) 73.4%,
        hsla(0, 0%, 0%, 0.175) 77.1%,
        hsla(0, 0%, 0%, 0.104) 81.2%,
        hsla(0, 0%, 0%, 0.049) 86.3%,
        hsla(0, 0%, 0%, 0.013) 92.4%,
        hsla(0, 0%, 0%, 0) 100%
      );
    }

    img.loaded {
      opacity: 1;
    }
  }

  @container (width > 64rem) {
    img.loaded {
      opacity: 1;
    }
  }
</style>

<script lang="ts">
  import { browser } from '$app/environment';
  import { getImageTheme } from '$lib/stores/theme/theme.store';
  import themeStore from '$lib/stores/theme/theme.store';
  import { onMount } from 'svelte';

  export let srcLight: string;
  export let srcDark: string | undefined = undefined;
  export let alt: string = '';

  let loaded = false;

  let imageEl: HTMLImageElement | undefined = undefined;

  onMount(() => {
    // in case the image was cached and already loaded
    if (imageEl?.complete) {
      loaded = true;
    }
  });
</script>

<!-- on the server, don't render <img>, then fade it in once loaded client-side -->
{#if browser}
  <img
    bind:this={imageEl}
    src={getImageTheme($themeStore.currentTheme) === 'dark' && srcDark ? srcDark : srcLight}
    {alt}
    class="themed-raster-image"
    class:loaded
    on:load={() => {
      loaded = true;
    }}
  />
{/if}

<style>
  .themed-raster-image {
    height: 100%;
    width: 100%;
    object-fit: contain;
    display: block;
  }

  .themed-raster-image.loaded {
    opacity: 1;
    transition: opacity 0.5s ease-in;
  }
</style>

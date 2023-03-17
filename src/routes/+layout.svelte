<script lang="ts">
  // Global CSS imports
  import '../styles/tailwind.css';
  import 'radicle-design-system/static/reset.css';
  import 'radicle-design-system/static/global.css';
  import 'radicle-design-system/static/colors.css';
  import 'radicle-design-system/static/elevation.css';
  import 'radicle-design-system/static/typography.css';
  import '../styles/app.css';

  import themeStore from '$lib/stores/theme/theme.store';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import scroll from '$lib/stores/scroll';
  import Header from '$lib/components/header/header.svelte';

  onMount(() => {
    scroll.attach();
    return scroll.detach;
  });

  const { primaryColor } = themeStore;
</script>

<svelte:head>
  <meta property="og:title" content="Drips" />
  <meta property="og:image" content={`https://${$page.url.host}/assets/social-share.png`} />
  <meta
    property="og:description"
    content="An Ethereum protocol for streaming and splitting funds, built by Radicle."
  />
  <meta name="twitter:title" content="Drips" />
  <meta
    name="twitter:description"
    content="An Ethereum protocol for streaming and splitting funds, built by Radicle."
  />
  <meta name="twitter:image" content={`https://${$page.url.host}/assets/social-share.png`} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@dripsnetwork" />
</svelte:head>

<div class="main" data-uifont="inter" data-theme={$themeStore.currentTheme}>
  <div class="header">
    <Header />
  </div>
  <div class="page" data-primary-color={$primaryColor}>
    <slot />
  </div>
</div>

<style>
  .main {
    min-height: 100vh;
    min-width: 100vw;
    background-color: var(--color-background);
    color: var(--color-foreground);
    overflow: hidden;
    transition: background-color 0.5s;
  }
</style>

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

<div class="main" data-uifont="inter" data-theme={$themeStore.currentTheme} data-sveltekit-prefetch>
  <div class="page">
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
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import walletStore from '$lib/stores/wallet';
  import Header from '$lib/components/header/header.svelte';
  import scroll from '$lib/stores/scroll';

  // Global CSS imports
  import '../styles/app.css';
  import 'radicle-design-system/static/reset.css';
  import 'radicle-design-system/static/global.css';
  import 'radicle-design-system/static/colors.css';
  import 'radicle-design-system/static/elevation.css';
  import 'radicle-design-system/static/typography.css';

  let prefersDarkMode = false;

  onMount(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDarkMode = darkModeQuery.matches;

    darkModeQuery.addEventListener('change', (event) => {
      prefersDarkMode = event.matches;
    });
  });

  onMount(() => walletStore.initialize());

  onMount(() => scroll.attach());
</script>

<div class="main" data-theme={prefersDarkMode ? 'dark' : 'light'}>
  <Header />
  <div class="page">
    <slot />
  </div>
</div>

<style>
  .main {
    min-height: 100vh;
    min-width: 100vw;
    background-color: var(--color-background);
  }

  .page {
    max-width: 64rem;
    padding: 6rem 1rem 1rem 1rem;
    margin: 0 auto;
  }
</style>

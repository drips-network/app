<script>
  import { onMount } from 'svelte';

  import '../app.css';
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
</script>

<div class="main" data-theme={prefersDarkMode ? 'dark' : 'light'}>
  <slot />
</div>

<style>
  .main {
    min-height: 100vh;
    min-width: 100vw;
    background-color: var(--color-background);
  }
</style>

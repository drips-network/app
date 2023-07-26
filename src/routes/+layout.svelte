<script lang="ts">
  // Global CSS imports
  import '../styles/tailwind.css';
  import 'radicle-design-system/static/reset.css';
  import 'radicle-design-system/static/global.css';
  import 'radicle-design-system/static/colors.css';
  import 'radicle-design-system/static/elevation.css';
  import 'radicle-design-system/static/typography.css';
  import '../styles/app.css';

  import '$lib/stores/theme/theme.store';

  import { onMount } from 'svelte';
  import scroll from '$lib/stores/scroll';

  onMount(() => {
    scroll.attach();
    return scroll.detach;
  });
</script>

<div class="main" data-uifont="inter">
  <main class="page">
    <slot />
  </main>
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

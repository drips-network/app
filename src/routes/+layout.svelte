<script lang="ts">
  // Global CSS imports
  import 'radicle-design-system/static/reset.css';
  import 'radicle-design-system/static/global.css';
  import 'radicle-design-system/static/colors.css';
  import 'radicle-design-system/static/elevation.css';
  import 'radicle-design-system/static/typography.css';
  import '../styles/app.css';

  import themeStore from '$lib/stores/theme/theme.store';
</script>

<div class="main" data-theme={$themeStore.currentTheme}>
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
  }
</style>

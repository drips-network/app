<script>
  import Dot from './dot.svelte';
  import Star from './star.svelte';
  import AppScreenshot from './app-screenshot.svelte';
</script>

<section class="part dots-stars">
  <h1 class="headline">
    An <em>Ethereum</em> protocol for<br /><em>streaming</em> and <em>splitting</em> funds
  </h1>
  <AppScreenshot />
  <div class="top-left"><Dot /></div>
  <div class="bottom-left"><Star /></div>
  <div class="top-right"><Star /></div>
  <div class="bottom-right"><Dot /></div>
</section>

<style>
  *::selection {
    background: var(--color-primary);
    color: var(--color-foreground);
  }

  .headline {
    font-weight: normal;
    font-size: 100%;
  }

  .top-right {
    position: absolute;
    top: var(--spacing-m);
    right: var(--spacing-m);
  }
  .bottom-left {
    position: absolute;
    bottom: var(--spacing-m);
    left: var(--spacing-m);
  }
  .bottom-right {
    position: absolute;
    bottom: var(--spacing-m);
    right: var(--spacing-m);
  }
  .top-left {
    position: absolute;
    top: var(--spacing-m);
    left: var(--spacing-m);
  }
  .part {
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: var(--spacing-l) 0;
    gap: var(--spacing-m);
    margin-top: 0;
    font-size: var(--font-size-xl);
    font-family: var(--font-serif);
    border: var(--border-width) solid var(--color-foreground);
    padding: var(--spacing-xl);
    text-align: center;
    border-radius: var(--border-radius-pointy);
  }

  em {
    font-family: var(--font-serif);
  }

  h1 {
    cursor: default;
  }
</style>

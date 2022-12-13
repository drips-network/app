<script>
  import Dot from './dot.svelte';
  import MockDashboard from './mock-dashboard/mock-dashboard.svelte';
  import Star from './star.svelte';
</script>

<section class="part dots-stars">
  <h1 class="headline">
    An <span class="pixelated">Ethereum</span> protocol for<br /><span class="pixelated"
      >streaming</span
    >
    and <span class="pixelated">splitting</span> funds
  </h1>
  <div class="mock-dashboard-container">
    <div class="mock-dashboard">
      <MockDashboard />
    </div>
  </div>
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
    font-family: var(--typeface-regular);
    font-weight: normal;
    font-size: 100%;
    margin-bottom: 34rem;
  }

  .mock-dashboard-container {
    border-radius: 2rem 0 0 0;
    position: absolute;
    bottom: 0;
    padding-top: 4rem;
    height: 34rem;
    border: 1px solid var(--color-foreground);
    border-bottom: none;
    width: calc(100% - var(--spacing-xl) * 2);
    overflow: hidden;
    background-color: var(--color-background);
  }

  .mock-dashboard {
    display: flex;
    justify-content: center;
    align-items: center;
    transform: scale(0.7) translateX(calc((50% * 0.326) * -1));
    width: calc(100% * 1.3);
    transform-origin: 50% 0;
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
    overflow: hidden;
  }

  span.pixelated {
    font-family: var(--font-serif);
  }

  h1 {
    font-family: --var(--typeface-medium);
    font-style: normal;
  }

  h1.headline span.pixelated {
    font-size: 52px;
  }
</style>

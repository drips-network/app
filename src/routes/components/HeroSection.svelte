<script>
  import Dot from './dot.svelte';
  import Star from './star.svelte';
  import AppScreenshot from './AppScreenshot.svelte';
</script>

<section class="part dots-stars">
  <h1>An <em>Ethereum</em> protocol for<br /><em>streaming</em> and <em>splitting</em> funds</h1>
  <AppScreenshot />
  <div class="top-left"><Dot /></div>
  <div class="bottom-left"><Star /></div>
  <div class="top-right"><Star /></div>
  <div class="bottom-right"><Dot /></div>
</section>

<style>
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

  em:hover {
    animation-name: glitch;
    animation-duration: 1s;
    animation-iteration-count: infinite;
  }

  @keyframes glitch {
    0% {
      font-family: 'Redaction 10';
    }
    20% {
      font-family: 'Redaction 20';
    }
    40% {
      font-family: 'Redaction 35';
    }
    60% {
      font-family: 'Redaction 50';
    }
    80% {
      font-family: 'Redaction 70';
    }
    100% {
      font-family: 'Redaction 100';
    }
  }
</style>

<section class="part dots-stars">
  <h1>An <em>Ethereum</em> protocol for<br /><em>streaming</em> and <em>splitting</em> funds</h1>
</section>

<style>
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

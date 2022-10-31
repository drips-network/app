<div id="home">
  <div id="header">
    <a id="logo" href="/"><img src="/assets/logo.svg" alt="Logo" /></a>
    <ul>
      <li><a href="https://discord.gg/vhGXkazpNc">Support</a></li>
      <li><a href="https://github.com/radicle-dev">Github</a></li>
      <li><a href="https://docs.radicle.xyz">Docs</a></li>
      <li><a href="/app">App↗</a></li>
    </ul>
  </div>
  <!-- closes header -->
  <div class="three-drip" />

  <section class="hero dots-stars">
    <h1>An <em>Ethereum</em> protocol for<br /><em>streaming</em> and <em>splitting</em> funds</h1>
  </section>

  <section id="columns">
    <h1><em>How it works</em></h1>
    <div class="columns-row">
      <div class="columns-item">
        <img src="/assets/multi-token.svg" alt="Step 1" />
        <h2><em>Multi-Token</em></h2>
        <p>Stream or split any ERC-20 like ETH, DAI, or USDC</p>
      </div>
      <div class="columns-item">
        <img src="/assets/no-wrapped-tokens.svg" alt="Step 2" />
        <h2><em>No need to wrap tokens</em></h2>
        <p>No “wrapping” tokens or trust any third-party with your funds</p>
      </div>
      <div class="columns-item">
        <img src="/assets/multichain.svg" alt="Step 3" />
        <h2><em>Multi-Chain</em></h2>
        <p>Available on the most popular EVM networks: Ethereum, Mainnet, Polygon, Optimism</p>
      </div>
    </div>
    <!-- closes columns row -->
    <div class="columns-row">
      <div class="columns-item">
        <img src="/assets/gas-optimized.svg" alt="Step 4" />
        <h2><em>Gas-optimized for one or<br />thousands of senders</em></h2>
        <p>
          While many streaming protocols focus exclusively on 1:1 streaming, Drips is optimized for
          many-to-one as well, to support low gas costs for use cases where large numbers of
          followers are streaming funds to a developer or creator.
        </p>
      </div>
      <div class="columns-item">
        <img src="/assets/one-balance.svg" alt="Step 5" />
        <h2><em>One balance for all your streams</em></h2>
        <p>
          Fund and top-up multiple streams using a single account balance and a single transaction.
        </p>
      </div>
    </div>
    <!-- closes columns row -->
  </section>
  <!-- closes how it works columns section -->

  <section class="hero three-drips">
    <h1>Built for <em>developers</em></h1>
    <p>
      Integrating Drips into your app is extremely easy with the <a href="#">Javascript-SDK</a>.
    </p>
  </section>

  <section class="hero dots-stars">
    <h1>Drips <em>in use</em></h1>
    <p>Some cool projects built on the Drips protocol.</p>
  </section>
</div>

<!-- closes home -->
<style>
  #home {
    --spacing-s: 1rem;
    --spacing-m: 1.5rem;
    --spacing-l: 3rem;
    --spacing-xl: 6rem;

    --font-size-s: 1rem;
    --font-size-m: 1.5rem;
    --font-size-l: 2rem;
    --font-size-xl: 3rem;

    --font-serif: 'Redaction 35';

    --border-radius: 0.5rem;
    --border-radius-full: 100rem;
    --border-radius-pointy: 2rem 0 2rem 2rem;

    --border-width: 1px;
  }

  #home {
    padding: var(--spacing-s) var(--spacing-xl);
    display: flex;
    flex-direction: column;
  }

  #header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: var(--border-width) solid var(--color-foreground);
    padding: var(--spacing-s) var(--spacing-m);
    border-radius: var(--border-radius-full);
  }

  #header a#logo img {
    height: var(--spacing-m);
  }

  #header ul {
    display: flex;
    list-style: none;
    padding: 0;
    text-transform: uppercase;
  }

  #header li {
    margin-left: var(--spacing-s);
  }

  .three-drip {
    width: 80px;
    height: 32px;
    margin: var(--spacing-s);
    background: url('/assets/three-drip.svg');
    align-self: end;
  }

  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: var(--spacing-l) 0;
    font-size: var(--font-size-xl);
    font-family: var(--font-serif);
    border: var(--border-width) solid var(--color-foreground);
    padding: var(--spacing-xl);
    text-align: center;
    border-radius: var(--border-radius-pointy);
  }

  .three-drips {
    background: url('/assets/three-drip.svg');
    background-repeat: no-repeat;
    background-position: center 20%;
  }

  .dots-stars {
    background: url('/assets/dot.svg'), url('/assets/star.svg'), url('/assets/dot.svg'),
      url('/assets/star.svg');
    background-position: var(--spacing-m) var(--spacing-m),
      calc(100% - var(--spacing-m)) var(--spacing-m),
      calc(100% - var(--spacing-m)) calc(100% - var(--spacing-m)),
      var(--spacing-m) calc(100% - var(--spacing-m));
    background-repeat: no-repeat;
  }

  em {
    font-family: var(--font-serif);
  }

  em:hover {
    animation-name: glitch;
    animation-duration: 1s;
    animation-iteration-count: infinite;
  }

  h1 {
    font-size: var(--font-size-xl);
    text-align: center;
    margin: 0;
  }

  h2 {
    font-size: var(--font-size-m);
    margin: var(--spacing-m) 0 var(--spacing-s);
  }

  section#columns {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    gap: var(--spacing-l);
  }

  .columns-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-l);
  }

  .columns-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    flex-grow: 1;
    flex-basis: 0;
    border: var(--border-width) solid var(--color-foreground);
    height: 500px;
    border-radius: var(--border-radius-pointy);
    padding: var(--spacing-m);
  }

  .columns-item img {
    height: 200px;
    margin-bottom: var(--spacing-s);
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

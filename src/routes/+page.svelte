<script lang="ts">
  import RadicleLogo from './components/radicle-logo.svelte';
  import ThreeDrip from './components/ThreeDrip.svelte';
  import DripsLogo from './components/DripsLogo.svelte';
  import MultiToken from './components/multi-token.svelte';
  import NoWrappedTokens from './components/no-wrapped-tokens.svelte';
  import Multichain from './components/multichain.svelte';
  import GasOptimized from './components/gas-optimized.svelte';
  import OneBalance from './components/one-balance.svelte';
</script>

<div id="home">
  <div id="header">
    <a id="logo" href="/">
      <DripsLogo />
    </a>
    <ul>
      <li><a href="https://discord.gg/vhGXkazpNc">Support</a></li>
      <li><a href="https://github.com/radicle-dev">Code</a></li>
      <li><a href="https://docs.radicle.xyz">Docs</a></li>
      <li><a class="cta" href="/app">App↗</a></li>
    </ul>
  </div>
  <!-- closes header -->

  <div class="top-drips">
    <ThreeDrip />
  </div>

  <section class="part dots-stars">
    <h1>An <em>Ethereum</em> protocol for<br /><em>streaming</em> and <em>splitting</em> funds</h1>
  </section>

  <section class="columns">
    <h1><em>How it works</em></h1>
    <div class="columns-row">
      <div class="columns-item">
        <MultiToken />
        <h2><em>Multi-Token</em></h2>
        <p>Stream or split any ERC-20 like ETH, DAI, or USDC</p>
      </div>
      <div class="columns-item">
        <NoWrappedTokens />
        <h2><em>No need to wrap tokens</em></h2>
        <p>No “wrapping” tokens or trust any third-party with your funds</p>
      </div>
      <div class="columns-item">
        <Multichain />
        <h2><em>Multi-Chain</em></h2>
        <p>Available on the most popular EVM networks: Ethereum, Mainnet, Polygon, Optimism</p>
      </div>
    </div>
    <!-- closes columns row -->
    <div class="columns-row">
      <div class="columns-item">
        <GasOptimized />
        <h2><em>Gas-optimized for one or<br />thousands of senders</em></h2>
        <p>
          While many streaming protocols focus exclusively on 1:1 streaming, Drips is optimized for
          many-to-one as well, to support low gas costs for use cases where large numbers of
          followers are streaming funds to a developer or creator.
        </p>
      </div>
      <div class="columns-item">
        <OneBalance />
        <h2><em>One balance for all your streams</em></h2>
        <p>
          Fund and top-up multiple streams using a single account balance and a single transaction.
        </p>
      </div>
    </div>
    <!-- closes columns row -->
  </section>
  <!-- closes how it works columns section -->

  <section class="part">
    <ThreeDrip />
    <h1>Built for <em>developers</em></h1>
    <p>
      Integrating Drips into your app is extremely easy with the <a href="#">Javascript-SDK</a>.
    </p>
    <a class="cta" href="/app">Try the app↗</a>
  </section>

  <section class="part dots-stars">
    <h1>Drips <em>in use</em></h1>
    <p>Some cool projects built on the Drips protocol.</p>
  </section>

  <section class="columned-layout">
    <div class="columns-row">
      <div class="columns-item card">
        <img class="image" src="/assets/rad-radio.jpg" alt="Step 1" />
        <h2><em>Crowdfunding</em></h2>
        <p>
          <strong>rad.lol</strong> collected tips for DJs streaming on <strong>HÖR</strong> radio
        </p>
        <a href="http://rad.lol">rad.lol</a>
      </div>
      <div class="columns-item card">
        <img class="image" src="/assets/wonder.jpg" alt="Step 1" />
        <h2><em>DAO payments</em></h2>
        <p><strong>Wonder</strong> streams funds from DAOs using Drips</p>
        <a href="http://wonderverse.xyz">wonderverse.xyz</a>
      </div>
      <div class="columns-item card">
        <img class="image" src="/assets/gitcoin.jpg" alt="Step 1" />
        <h2><em>Grant Splitting</em></h2>
        <p>Stream or split any ERC-20 like ETH, DAI, or USDC</p>
        <a href="http://gitcoin.co">gitcoin.co</a>
      </div>
    </div>
  </section>

  <section class="part">
    <h1>Stay <em>up to date</em></h1>
    <ThreeDrip />
    <div class="links">
      <a href="#">Drips at ETHCC Paris</a>
      <a href="#">Twitter</a>
      <a href="#">New Profiles in Drips App</a>
      <a href="#">Twitch</a>
      <a href="#">Drips JS-SDK ready for use!</a>
      <a href="#">Version 0.2 released! View the Docs</a>
    </div>
    <div id="credit">
      made by
      <RadicleLogo />
    </div>
    <div id="sticker">
      <img src="/assets/drips-sticker.svg" alt="sticker" />
    </div>
  </section>
</div>

<!-- closes home -->
<style>
  #home {
    --spacing-xs: 0.5rem;
    --spacing-s: 1rem;
    --spacing-m: 1.5rem;
    --spacing-l: 3rem;
    --spacing-xl: 6rem;

    --font-size-s: 1rem;
    --font-size-m: 1.5rem;
    --font-size-l: 2rem;
    --font-size-xl: 3rem;

    --font-serif: 'Redaction 35';
    --font-regular: 'Inter';

    --border-radius: 0.5rem;
    --border-radius-full: 100rem;
    --border-radius-pointy: 2rem 0 2rem 2rem;

    --border-width: 1px;

    padding: var(--spacing-s) var(--spacing-xl);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-s);
    max-width: 1600px;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    #home {
      padding: var(--spacing-m) var(--spacing-l);
    }
  }

  #header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: var(--border-width) solid var(--color-foreground);
    padding: var(--spacing-s) 12px var(--spacing-s) var(--spacing-m);
    border-radius: var(--border-radius-pointy);
  }

  #header a#logo svg {
    height: var(--spacing-m);
    fill: var(--color-primary);
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

  a.cta {
    background-color: var(--color-primary);
    padding: var(--spacing-xs) var(--spacing-s);
    border-radius: var(--border-radius-pointy);
    font-family: var(--font-regular);
    font-size: var(--font-size-s);
  }

  a.cta:hover {
    background-color: var(--color-foreground);
    color: var(--color-primary);
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

  .part .links a {
    border: 1px solid var(--color-foreground);
    padding: var(--spacing-s) var(--spacing-l);
    font-family: var(--font-regular);
    font-size: var(--font-size-s);
    border-radius: var(--border-radius-pointy);
    white-space: nowrap;
  }

  .part .links a:hover {
    background-color: var(--color-primary);
  }

  .top-drips {
    display: flex;
    justify-content: flex-end;
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

  section.columns {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
  }

  section.columns h1 {
    margin-bottom: var(--font-size-l);
  }

  .columns-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-l);
    margin-bottom: var(--spacing-l);
  }

  @media (max-width: 900px) {
    .columns-row {
      flex-direction: column;
    }
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

  @media (max-width: 900px) {
    .columns-item {
      height: auto;
      width: 100%;
    }
  }

  .columns-item.card {
    height: auto;
  }

  .columns-item img.illustration {
    height: 200px;
    margin-bottom: var(--spacing-s);
  }

  @media (max-width: 768px) {
    .columns-item img.illustration {
      height: auto;
    }
  }

  .columns-item img.image {
    border-radius: 1rem 0 1rem 1rem;
  }

  #sticker {
    background: var(--color-primary);
    width: 240px;
    height: 240px;
    border-radius: 100%;
    transform: rotate(15deg);
    position: absolute;
    position: absolute;
    bottom: -16px;
    right: 80px;
    padding: var(--spacing-s);
  }

  @media (max-width: 768px) {
    #sticker {
      bottom: -35px;
      right: -22px;
    }
  }

  #sticker img {
    width: 100%;
    height: 100%;
  }

  #credit {
    font-family: var(--font-regular);
    font-size: var(--font-size-s);
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    gap: var(--spacing-s);
  }

  #credit svg {
    fill: green;
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

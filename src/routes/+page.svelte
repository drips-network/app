<script lang="ts">
  import RadicleLogo from './components/radicle-logo.svelte';
  import ThreeDrip from './components/three-drip.svelte';
  import MultiToken from './components/multi-token.svelte';
  import NoWrappedTokens from './components/no-wrapped-tokens.svelte';
  import Multichain from './components/multichain.svelte';
  import GasOptimized from './components/gas-optimized.svelte';
  import OneContract from './components/one-contract.svelte';
  import OneBalance from './components/one-balance.svelte';
  import DotsStarsLine from './components/dots-stars-line.svelte';
  import HeroSection from './components/hero-section.svelte';
  import DripsSticker from './components/drips-sticker.svelte';
  import DripsLogo from '$lib/components/header/drips-logo.svelte';
</script>

<svelte:head>
  <title>Drips • Stream and Split Funds on Ethereum</title>
  <meta
    name="description"
    value="An Ethereum protocol for streaming and splitting funds, built by Radicle."
  />
</svelte:head>

<div id="home">
  <div id="header">
    <a id="logo" href="/">
      <DripsLogo />
    </a>
    <ul>
      <li><a rel="noreferrer" href="https://github.com/radicle-dev" target="_blank">Code</a></li>
      <li>
        <a
          rel="noreferrer"
          href="https://v2.docs.drips.network/docs/whats-a-drip.html"
          target="_blank">Docs</a
        >
      </li>
      <li><a class="cta" href="/app">App↗</a></li>
    </ul>
  </div>
  <!-- closes header -->

  <div class="top-drips">
    <ThreeDrip />
  </div>

  <HeroSection />

  <section class="columns">
    <h1 class="headline"><span class="pixelated">How</span> it works</h1>
    <div class="columns-row">
      <div class="columns-item">
        <MultiToken />
        <h2 class="headline"><span class="pixelated">Multi-Token</span></h2>
        <p>Stream or split any ERC-20 like WETH, DAI or USDC.</p>
      </div>
      <div class="columns-item">
        <GasOptimized />
        <h2 class="headline">
          <span class="pixelated">Optimized for <br />1000s of senders</span>
        </h2>
        <p>
          Most protocols focus on 1:1 streaming. Drips optimizes for thousands of senders, like many
          followers → one creator.
        </p>
      </div>
      <div class="columns-item">
        <OneContract />
        <h2 class="headline">
          <span class="pixelated">One Contract.<br />One Payment Graph.</span>
        </h2>
        <p>
          Drips uses one smart contract for streaming and splitting, enabling effortless and
          flexible token routing.
        </p>
      </div>
    </div>
    <!-- closes columns row -->
    <div class="columns-row">
      <div class="columns-item">
        <NoWrappedTokens />
        <h2 class="headline"><span class="pixelated">No need to wrap tokens</span></h2>
        <p>
          Use ERC-20 tokens “as is”. No need to wrap them or trust a third party with your tokens.
        </p>
      </div>
      <div class="columns-item">
        <Multichain />
        <h2 class="headline"><span class="pixelated">Multi-Chain</span></h2>
        <p>Available on the most popular EVM networks: Ethereum, Mainnet, Polygon, Optimism.</p>
      </div>
      <div class="columns-item">
        <OneBalance />
        <h2 class="headline">
          <span class="pixelated">One balance for<br />all your streams</span>
        </h2>
        <p>Fund multiple streams using one account balance in a single transaction.</p>
      </div>
    </div>
    <!-- closes columns row -->
  </section>
  <!-- closes how it works columns section -->

  <section class="part developers">
    <div class="left">
      <ThreeDrip />
      <h1 class="headline">Built for <span class="pixelated">developers</span></h1>
      <p>Integrating Drips into your app is extremely easy with the JavaScript SDK.</p>
      <a
        rel="noreferrer"
        class="cta"
        href="https://github.com/radicle-dev/drips-js-sdk"
        target="_blank">Check out the SDK↗</a
      >
    </div>
    <div class="right">
      <img src="/assets/code-snippet.svg" alt="Code snippet" />
    </div>
  </section>

  <DotsStarsLine>
    <div class="in-use">
      <h1 class="headline">Drips <span class="pixelated">in use</span></h1>
      <p>Some cool projects built on the Drips protocol.</p>
    </div>
  </DotsStarsLine>

  <section class="columned-layout">
    <div class="columns-row">
      <div class="columns-item card">
        <img class="image" src="/assets/rad-radio.jpg" alt="Step 1" />
        <h2 class="headline"><span class="pixelated">Crowdfunding</span></h2>
        <p>
          <strong>rad.lol</strong> collected tips for DJs streaming on <strong>HÖR</strong> radio
        </p>
        <a rel="noreferrer" href="http://rad.lol" target="_blank">rad.lol</a>
      </div>
      <div class="columns-item card">
        <img class="image" src="/assets/wonder.jpg" alt="Step 1" />
        <h2 class="headline"><span class="pixelated">DAO payments</span></h2>
        <p><strong>Wonder</strong> streams funds from DAOs using Drips</p>
        <a rel="noreferrer" href="http://wonderverse.xyz" target="_blank">wonderverse.xyz</a>
      </div>
      <div class="columns-item card">
        <img class="image" src="/assets/gitcoin.jpg" alt="Step 1" />
        <h2 class="headline"><span class="pixelated">Grant Splitting</span></h2>
        <p>Stream or split any ERC-20 like ETH, DAI, or USDC</p>
        <a rel="noreferrer" href="http://gitcoin.co" target="_blank">gitcoin.co</a>
      </div>
    </div>
  </section>

  <section class="part">
    <h1 class="headline">What’s <span class="pixelated">new</span></h1>
    <ThreeDrip />
    <div class="links">
      <a href="/">The Drips team presented at DevCon 22</a>
      <a href="/">Drips JS-SDK ready for use!</a>
      <a href="/">Version 0.2 released</a>
      <a href="/">Drips get-together at EthCC</a>
      <a href="/">The alpha version of our SDK is released</a>
      <a href="/">Protocol v2 now on Goerli Testnet</a>
    </div>
    <div id="credit">
      <p>made by</p>
      <RadicleLogo />
    </div>
    <div id="sticker">
      <DripsSticker />
    </div>
  </section>

  <DotsStarsLine>
    <h1 class="headline">Stay <span class="pixelated">up to date</span></h1>
    <div class="links">
      <a href="https://twitter.com/dripsnetwork">Twitter</a>
      <a href="https://discord.gg/vhGXkazpNc">Discord</a>
    </div>
  </DotsStarsLine>
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

    --font-serif: 'Redaction 50';

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

  *::selection {
    background: var(--color-primary);
    color: var(--color-foreground);
  }

  .headline {
    font-weight: normal;
    font-family: var(--typeface-regular);
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
    font-family: var(--typeface-regular);
    font-size: var(--font-size-s);
    color: white;
  }

  a.cta:hover {
    background-color: var(--color-foreground);
    color: var(--color-background);
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
    padding: var(--spacing-xl) var(--spacing-s);
    text-align: center;
    border-radius: var(--border-radius-pointy);
  }

  .part .left {
    /* width: 100%; */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-m);
  }

  .part .right {
    width: 100%;
    padding: var(--spacing-l);
    border-radius: var(--border-radius-pointy);
    background-color: var(--color-foreground-level-1);
  }

  .in-use {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-s);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--spacing-s);
  }

  .links a {
    border: 1px solid var(--color-foreground);
    padding: var(--spacing-s) var(--spacing-l);
    font-family: var(--typeface-regular);
    font-size: var(--font-size-s);
    border-radius: var(--border-radius-pointy);
    white-space: nowrap;
  }

  .links a:hover {
    background-color: var(--color-primary);
    color: white;
  }

  .top-drips {
    display: flex;
    justify-content: flex-end;
  }

  span.pixelated {
    font-family: var(--font-serif);
  }

  h1 {
    font-size: var(--font-size-xl);
    text-align: center;
    margin: 0;
  }

  h1 span.pixelated {
    font-size: 52px;
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
    align-items: stretch;
    gap: var(--spacing-l);
    margin-bottom: var(--spacing-l);
  }

  @media (max-width: 900px) {
    .columns-row {
      flex-direction: column;
    }
  }

  .columns-item {
    width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    flex-grow: 1;
    flex-basis: 0;
    border: var(--border-width) solid var(--color-foreground);
    height: 400px;
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

  .columns-item.card a:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }

  .columns-item a {
    border-bottom: 1px solid var(--color-foreground);
    padding-top: var(--spacing-s);
  }

  .columns-item img.image {
    border-radius: 1rem 0 1rem 1rem;
  }

  #credit {
    font-family: var(--typeface-regular);
    font-size: var(--font-size-s);
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    gap: var(--spacing-s);
    margin-top: var(--spacing-m);
  }

  h1 {
    font-family: --var(--typeface-medium);
    font-style: normal;
  }
</style>

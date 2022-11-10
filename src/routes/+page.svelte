<script lang="ts">
  import RadicleLogo from './components/radicle-logo.svelte';
  import ThreeDrip from './components/three-drip.svelte';
  import MultiToken from './components/multi-token.svelte';
  import NoWrappedTokens from './components/no-wrapped-tokens.svelte';
  import Multichain from './components/multichain.svelte';
  import GasOptimized from './components/gas-optimized.svelte';
  import OneBalance from './components/one-balance.svelte';
  import DotsStarsLine from './components/dots-stars-line.svelte';
  import HeroSection from './components/hero-section.svelte';
  import DripsSticker from './components/drips-sticker.svelte';
  import DripsLogo from '$lib/components/header/drips-logo.svelte';
</script>

<div id="home">
  <div id="header">
    <a id="logo" href="/">
      <DripsLogo />
    </a>
    <ul>
      <li><a href="https://github.com/radicle-dev">Code</a></li>
      <li><a href="https://docs.radicle.xyz">Docs</a></li>
      <li><a class="cta" href="/app">App↗</a></li>
    </ul>
  </div>
  <!-- closes header -->

  <div class="top-drips">
    <ThreeDrip />
  </div>

  <HeroSection />

  <section class="columns">
    <h1 class="headline"><em>How</em> it works</h1>
    <div class="columns-row">
      <div class="columns-item">
        <MultiToken />
        <h2 class="headline"><em>Multi-Token</em></h2>
        <p>Stream or split any ERC-20 like ETH, DAI, or USDC</p>
      </div>
      <div class="columns-item">
        <GasOptimized />
        <h2 class="headline"><em>Gas-optimized for thousands of senders</em></h2>
        <p>
          Most streaming protocols focus on 1:1 streaming. Drips is instead optimized for thousands
          of senders, like many followers streaming to one creator.
        </p>
      </div>
      <div class="columns-item">
        <GasOptimized />
        <h2 class="headline"><em>One Contract. One Payment Graph.</em></h2>
        <p>
          Drips utilizes only one smart contract behind the scenes, for both streaming and splitting
          funds. This allows users to effortlessly route funds between accounts in a very flexible
          way.
        </p>
      </div>
    </div>
    <!-- closes columns row -->
    <div class="columns-row">
      <div class="columns-item">
        <NoWrappedTokens />
        <h2 class="headline"><em>No need to wrap tokens</em></h2>
        <p>
          Use ERC-20 tokens “as is”. No need to wrap them or trust a third party with your tokens.
        </p>
      </div>
      <div class="columns-item">
        <Multichain />
        <h2 class="headline"><em>Multi-Chain</em></h2>
        <p>Available on the most popular EVM networks: Ethereum, Mainnet, Polygon, Optimism</p>
      </div>
      <div class="columns-item">
        <OneBalance />
        <h2 class="headline"><em>One balance for all your streams</em></h2>
        <p>
          Fund and top-up multiple streams using a single account balance and a single transaction.
        </p>
      </div>
    </div>
    <!-- closes columns row -->
  </section>
  <!-- closes how it works columns section -->

  <section class="part developers">
    <div class="left">
      <ThreeDrip />
      <h1 class="headline">Built for <em>developers</em></h1>
      <p>Integrating Drips into your app is extremely easy with the JavaScript SDK.</p>
      <a class="cta" href="/app">Check out the SDK↗</a>
    </div>
    <div class="right">
      <img src="/assets/code-snippet.svg" alt="Code snippet" />
    </div>
  </section>

  <DotsStarsLine>
    <div class="in-use">
      <h1 class="headline">Drips <em>in use</em></h1>
      <p>Some cool projects built on the Drips protocol.</p>
    </div>
  </DotsStarsLine>

  <section class="columned-layout">
    <div class="columns-row">
      <div class="columns-item card">
        <img class="image" src="/assets/rad-radio.jpg" alt="Step 1" />
        <h2 class="headline"><em>Crowdfunding</em></h2>
        <p>
          <strong>rad.lol</strong> collected tips for DJs streaming on <strong>HÖR</strong> radio
        </p>
        <a href="http://rad.lol">rad.lol</a>
      </div>
      <div class="columns-item card">
        <img class="image" src="/assets/wonder.jpg" alt="Step 1" />
        <h2 class="headline"><em>DAO payments</em></h2>
        <p><strong>Wonder</strong> streams funds from DAOs using Drips</p>
        <a href="http://wonderverse.xyz">wonderverse.xyz</a>
      </div>
      <div class="columns-item card">
        <img class="image" src="/assets/gitcoin.jpg" alt="Step 1" />
        <h2 class="headline"><em>Grant Splitting</em></h2>
        <p>Stream or split any ERC-20 like ETH, DAI, or USDC</p>
        <a href="http://gitcoin.co">gitcoin.co</a>
      </div>
    </div>
  </section>

  <section class="part">
    <h1 class="headline">What’s <em>new</em></h1>
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
    <h1 class="headline">Stay <em>up to date</em></h1>
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
  }

  .top-drips {
    display: flex;
    justify-content: flex-end;
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

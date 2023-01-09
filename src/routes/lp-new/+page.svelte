<script>
  import MultiToken from './illustrations/multi-token.svelte';
  import ImageAndCaption from './components/image-and-caption.svelte';
  import LpCard from './components/lp-card/lp-card.svelte';
  import LpHeader from './components/lp-header.svelte';

  import ThreeDrips from './illustrations/three-drips.svelte';
  import GasOptimized from './illustrations/gas-optimized.svelte';
  import OneContract from './illustrations/one-contract.svelte';
  import NoWrappedTokens from './illustrations/no-wrapped-tokens.svelte';
  import MultiChain from './illustrations/multi-chain.svelte';
  import OneBalance from './illustrations/one-balance.svelte';
  import MockDashboard from './components/mock-dashboard/mock-dashboard.svelte';
  import Button from '$lib/components/button/button.svelte';
  import CodeExample from './components/code-example.svelte';
  import LpSectionHeader from './components/lp-section-header.svelte';
  import RadicleLogo from '../components/radicle-logo.svelte';
  import DripsSticker from './illustrations/drips-sticker.svelte';
  import themeStore from '$lib/stores/theme/theme.store';

  $: codeSectionTheme = $themeStore.currentTheme === 'h4x0r' ? 'h4x0r' : 'dark';
</script>

<svelte:head>
  <title>Drips • Stream and Split Funds on Ethereum</title>
  <meta
    name="description"
    content="An Ethereum protocol for streaming and splitting funds, built by Radicle."
  />
</svelte:head>

<div id="lp">
  <div id="wrapper">
    <div><LpHeader /></div>
    <div class="align-right hide-mobile">
      <ThreeDrips />
    </div>
    <section>
      <LpCard stars>
        <div id="hero">
          <h1>
            <span class="standard-font">An</span> Ethereum
            <span class="standard-font">protocol for</span>
            streaming <span class="standard-font">and</span> splitting
            <span class="standard-font">funds.</span>
          </h1>
          <div id="beta-notice">
            <p class="typo-text">
              Drips V2 is currently in Beta and available on testnets only. <a
                href="https://drips.network"
                class="typo-link"
                target="_blank">Check out Drips V1</a
              >
            </p>
          </div>
          <div id="mock-dashboard">
            <MockDashboard />
          </div>
        </div>
      </LpCard>
    </section>
    <section class="grid">
      <LpCard
        ><ImageAndCaption background>
          <MultiToken slot="image" />
          <div slot="caption" class="text-container">
            <h3>Multi-token</h3>
            <p>Stream or split any ERC-20 like WETH, DAI or USDC.</p>
          </div>
        </ImageAndCaption></LpCard
      >
      <LpCard
        ><ImageAndCaption background>
          <GasOptimized slot="image" />
          <div slot="caption" class="text-container">
            <h3>Optimized for 1000s of senders</h3>
            <p>
              Most protocols focus on 1:1 streaming. Drips optimizes for thousands of senders, like
              many followers → one creator.
            </p>
          </div>
        </ImageAndCaption></LpCard
      >
      <LpCard
        ><ImageAndCaption background>
          <OneContract slot="image" />
          <div slot="caption" class="text-container">
            <h3>One Contract. One Payment Graph.</h3>
            <p>
              Drips uses one smart contract for streaming and splitting, enabling effortless and
              flexible token routing.
            </p>
          </div>
        </ImageAndCaption></LpCard
      >
      <LpCard
        ><ImageAndCaption background>
          <NoWrappedTokens slot="image" />
          <div slot="caption" class="text-container">
            <h3>No need to wrap tokens</h3>
            <p>
              Use ERC-20 tokens “as is”. No need to wrap them or trust a third party with your
              tokens.
            </p>
          </div>
        </ImageAndCaption></LpCard
      >
      <LpCard
        ><ImageAndCaption background>
          <MultiChain slot="image" />
          <div slot="caption" class="text-container">
            <h3>Multi-Chain</h3>
            <p>Available on the most popular EVM networks: Ethereum, Mainnet, Polygon, Optimism.</p>
          </div>
        </ImageAndCaption></LpCard
      >
      <LpCard
        ><ImageAndCaption background>
          <OneBalance slot="image" />
          <div slot="caption" class="text-container">
            <h3>One balance for all your streams</h3>
            <p>Fund multiple streams using one account balance in a single transaction.</p>
          </div>
        </ImageAndCaption></LpCard
      >
    </section>
    <section data-theme={codeSectionTheme}>
      <LpCard>
        <div class="card-standard-padding centered text-container background-color">
          <ThreeDrips />
          <h2>Build on Drips</h2>
          <p class="text-foreground">
            Integrating Drips into your app is easy with the JavaScript SDK.
          </p>
          <a href="https://v2.docs.drips.network/docs/whats-a-drip.html" target="_blank"
            ><Button variant="primary">Check out the SDK</Button></a
          >
        </div>
        <div id="code-example-wrapper">
          <div id="code-example">
            <div class="inner">
              <CodeExample />
            </div>
          </div>
        </div>
      </LpCard>
    </section>
    <section>
      <LpSectionHeader>
        <div class="text-container centered">
          <h2>Drips in use</h2>
          <p>Some cool projects built on the Drips protocol.</p>
        </div>
      </LpSectionHeader>
      <div class="grid">
        <LpCard
          ><ImageAndCaption>
            <img slot="image" src="/assets/rad-radio.jpg" alt="Rad Radio Logo" />
            <div slot="caption" class="text-container">
              <h3>Crowdfunding</h3>
              <p>rad.lol collected tips for DJs streaming on HÖR radio.</p>
              <a class="typo-link" href="https://rad.lol" target="_blank">rad.lol</a>
            </div>
          </ImageAndCaption></LpCard
        >
        <LpCard
          ><ImageAndCaption>
            <img slot="image" src="/assets/wonder.jpg" alt="Wonder Logo" />
            <div slot="caption" class="text-container">
              <h3>DAO payments</h3>
              <p>Wonder streams funds from DAOs using Drips</p>
              <a class="typo-link" href="https://wonderverse.xyz" target="_blank">wonderverse.xyz</a
              >
            </div>
          </ImageAndCaption></LpCard
        >
        <LpCard
          ><ImageAndCaption>
            <img slot="image" src="/assets/gitcoin.jpg" alt="Gitcoin Logo" />
            <div slot="caption" class="text-container">
              <h3>Grant splitting</h3>
              <p>Stream or split any ERC-20 like ETH, DAI, or USDC</p>
              <a class="typo-link" href="https://gitcoin.co" target="_blank">gitcoin.co</a>
            </div>
          </ImageAndCaption></LpCard
        >
      </div>
    </section>
    <section>
      <LpSectionHeader>
        <div class="text-container centered">
          <h2>Stay up to date</h2>
          <div class="flex gap-4">
            <a href="https://twitter.com/dripsnetwork" target="_blank"
              ><Button variant="primary">Twitter</Button></a
            >
            <a href="https://discord.gg/vhGXkazpNc" target="_blank"
              ><Button variant="primary">Discord</Button></a
            >
          </div>
        </div>
      </LpSectionHeader>
    </section>
    <section class="mt-8 mb-64">
      <div class="flex flex-col gap-4 items-center">
        <p class="text-foreground-level-5">Made by</p>
        <RadicleLogo />
      </div>
      <div id="drips-sticker">
        <div class="illustration">
          <DripsSticker />
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  #lp {
    --spacing-xs: 0.5rem;
    --spacing-s: 1rem;
    --spacing-m: 1.5rem;
    --spacing-l: 3rem;
    --spacing-xl: 6rem;

    --border-radius-pointy: 2rem 0 2rem 2rem;
    --border-radius-pointy-inner: 1rem 0 1rem 1rem;

    --font-serif: 'Redaction 50';

    --font-size-s: 1rem;
    --font-size-m: 1.5rem;
    --font-size-l: 2.5rem;
    --font-size-xl: 3rem;
  }

  h1,
  h2,
  h3 {
    color: var(--color-foreground);
    font-weight: normal;
  }

  h1 {
    font-size: var(--font-size-xl);
    font-family: var(--font-serif);
  }

  h2 {
    font-size: var(--font-size-l);
    font-family: var(--font-serif);
    line-height: 2.5rem;
  }

  h3 {
    font-size: var(--font-size-m);
    font-family: var(--font-serif);
  }

  .standard-font {
    font-family: var(--typeface-regular);
  }

  section {
    position: relative;
  }

  .card-standard-padding {
    padding: var(--spacing-l);
  }

  .centered {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .text-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  #wrapper {
    max-width: 80rem;
    width: 100vw;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-m);
    align-items: center;
  }

  #wrapper > * {
    width: 100%;
  }

  #hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rem;
    text-align: center;
    padding-top: 4rem;
    padding-left: var(--spacing-s);
    padding-right: var(--spacing-s);
  }

  #hero > h1 {
    max-width: 40rem;
  }

  #hero > #beta-notice {
    background-color: var(--color-caution-level-1);
    color: var(--color-caution-level-6);
    padding: 0.75rem 1.25rem;
    border-radius: 2rem 0 2rem 2rem;
  }

  #hero > #mock-dashboard {
    border: 1px solid var(--color-foreground);
    border-radius: var(--border-radius-pointy);
    width: 100%;
    display: flex;
    justify-content: center;
    padding-top: var(--spacing-l);
    height: 48rem;
    margin-bottom: calc(var(--spacing-xl) * -1 * 2);
    transform: scale(0.85);
    transform-origin: 50% 0;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--spacing-m);
  }

  .align-right {
    display: flex;
    justify-content: flex-end;
    padding-right: var(--spacing-m);
  }

  #code-example-wrapper {
    width: 100%;
    background-color: var(--color-foreground-level-1);
    padding: var(--spacing-m) 0 var(--spacing-s) 0;
  }

  #code-example {
    text-align: left;
    overflow: scroll;
    max-width: 985px;
    margin: var(--spacing-m) auto var(--spacing-l) auto;
  }

  #code-example > .inner {
    padding: 0 var(--spacing-l);
    width: fit-content;
  }

  #drips-sticker {
    position: absolute;
    width: 16rem;
    height: 16rem;
    border-radius: 8rem;
    overflow: hidden;
    right: 0;
    top: 0;
    transform: rotate(10deg);
  }

  #drips-sticker > .illustration {
    animation: rotate 20s linear infinite;
  }

  @media (max-width: 768px) {
    .grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 577px) {
    .hide-mobile {
      display: none;
    }

    .grid {
      grid-template-columns: 1fr;
    }

    .centered {
      align-items: flex-start;
      text-align: left;
    }

    .card-standard-padding {
      padding: var(--spacing-m);
    }

    #hero > #mock-dashboard {
      width: calc(100% * 1.1);
    }

    #code-example-wrapper {
      width: 100%;
      background-color: var(--color-foreground-level-1);
      padding: var(--spacing-s) 0 var(--spacing-s) 0;
    }

    #code-example {
      text-align: left;
      overflow: scroll;
      max-width: 985px;
      margin: var(--spacing-m) auto var(--spacing-m) auto;
    }

    #code-example > .inner {
      padding: 0 var(--spacing-m);
      width: fit-content;
    }

    #drips-sticker {
      height: 12rem;
      width: 12rem;
      top: 8rem;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>

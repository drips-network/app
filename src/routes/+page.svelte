<script>
  import MultiToken from '../lib/components/illustrations/multi-token.svelte';
  import ImageAndCaption from './components/image-and-caption.svelte';
  import LpCard from './components/lp-card/lp-card.svelte';
  import LpHeader from './components/lp-header.svelte';

  import ThreeDrips from '../lib/components/illustrations/three-drips.svelte';
  import GasOptimized from '../lib/components/illustrations/gas-optimized.svelte';
  import OneContract from '../lib/components/illustrations/one-contract.svelte';
  import NoWrappedTokens from '../lib/components/illustrations/no-wrapped-tokens.svelte';
  import MultiChain from '../lib/components/illustrations/multi-chain.svelte';
  import OneBalance from '../lib/components/illustrations/one-balance.svelte';
  import MockDashboard from './components/mock-dashboard/mock-dashboard.svelte';
  import Button from '$lib/components/button/button.svelte';
  import CodeExample from './components/code-example.svelte';
  import LpSectionHeader from './components/lp-section-header.svelte';
  import RadicleLogo from '../lib/components/illustrations/radicle-logo.svelte';
  import DripsSticker from '../lib/components/illustrations/drips-sticker.svelte';
  import themeStore from '$lib/stores/theme/theme.store';
  import BigDripsLogo from '$lib/components/illustrations/big-drips-logo.svelte';
  import ComingSoonBadge from './components/coming-soon-badge.svelte';

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
    <LpHeader />
    <section id="hero">
      <BigDripsLogo />
      <div id="title">
        <h1>Crowdfunding for the Open Web</h1>
      </div>
      <div class="beta-notice">
        Drips is currently in Beta, with Token Streaming features ready for you to try.<br />
        <a href="https://twitter.com/dripsnetwork">Follow us on Twitter</a> for updates on upcoming crowdfunding
        functionality!
      </div>
    </section>
    <section id="main-features">
      <LpCard
        ><div id="streaming" class="full-width-card illustration-right">
          <div class="card-description">
            <h2>Send & receive funds by the second</h2>
            <p>
              Drips enables token streams of any ERC-20 to any Ethereum address with per-second
              settlement.
            </p>
          </div>
          <div class="card-illustration grey-background">
            <div id="mock-dashboard">
              <MockDashboard />
            </div>
          </div>
        </div></LpCard
      >
      <LpCard
        ><div id="streaming" class="full-width-card illustration-left text-nudged">
          <div class="card-illustration">
            <div class="blue-background" />
            <div class="relative h-full"><OneContract /></div>
          </div>
          <div class="card-description">
            <h2>Share funds with the projects & individuals you care for</h2>
            <p>
              Automatically split any ERC-20 token you receive with a list of up to 200 projects &
              individuals. Anytime you get paid, they get paid.
            </p>
          </div>
        </div></LpCard
      >
      <LpCard
        ><div id="discover-support" class="full-width-card illustration-right text-nudged">
          <div class="card-description">
            <ComingSoonBadge />
            <h2>Discover & support exciting projects & individuals</h2>
            <p>
              Support projects with flexible streams – and pause, top-up or cancel at your own
              discretion.
            </p>
          </div>
          <div class="card-illustration">
            <div class="blue-background" />
            <div class="relative h-full"><NoWrappedTokens /></div>
          </div>
        </div></LpCard
      >
      <div id="raise-funds" class="full-width-card illustration-left text-nudged">
        <div class="card-illustration">
          <img
            class="elevated only-light-theme"
            src="/assets/funding-profile.png"
            alt="Drips Funding Profile"
          />
          <img
            class="elevated only-dark-theme"
            src="/assets/funding-profile-dark.png"
            alt="Drips Funding Profile"
          />
          <img
            class="elevated only-h4x0r-theme"
            src="/assets/funding-profile-h4x0r.png"
            alt="Drips Funding Profile"
          />
        </div>
        <div class="card-description" id="raise-funds-description">
          <ComingSoonBadge />
          <h2>Raise funds for your projects or yourself</h2>
          <p>
            Drips is a complete toolkit for raising funds, by the second — without any platform
            fees.
          </p>
        </div>
      </div>
    </section>
    <section>
      <section />
      <section class="grid">
        <LpCard
          ><ImageAndCaption background>
            <MultiToken slot="image" />
            <div slot="caption" class="text-container">
              <h3>No platform fees</h3>
              <p>
                Drips is entirely open-source, and doesn't charge anything extra on top of network
                gas fees.
              </p>
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
        <LpCard
          ><ImageAndCaption background>
            <GasOptimized slot="image" />
            <div slot="caption" class="text-container">
              <h3>You're in control</h3>
              <p>
                Your data and funds are yours forever. Drips runs fully on sovereign user-controlled
                infrastructure.
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
              <p>
                Available on the most popular EVM networks: Ethereum, Mainnet, Polygon, Optimism.
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
      </section>
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
        <p class="text-foreground-level-5">Supported by</p>
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
    color: var(--color-primary);
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
    padding-top: 6rem;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-m);
    align-items: center;
  }

  #wrapper > * {
    width: 100%;
  }

  img.elevated {
    box-shadow: 0.5rem 0.5rem 0px var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    border: 1px solid var(--color-foreground);
  }

  #hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2rem 0.5rem 2rem 0.5rem;
    z-index: 10;
  }

  #hero .beta-notice {
    background-color: var(--color-caution-level-1);
    color: var(--color-caution-level-6);
    padding: 0.5rem 1.5rem;
    border-radius: 2rem 0 2rem 2rem;
    border: 1px solid var(--color-caution-level-6);
    max-width: 48rem;
    text-align: left;
    margin-top: 3rem;
  }

  #hero .beta-notice a {
    text-decoration: underline;
  }

  .full-width-card {
    display: grid;
    column-gap: 1rem;
  }

  .full-width-card.illustration-left {
    grid-template-columns: 1fr 1fr;
  }

  .full-width-card.illustration-right {
    grid-template-columns: 1fr 1fr;
  }

  .full-width-card > .card-description {
    padding: 3rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
  }

  .full-width-card > .card-illustration {
    padding: 3rem;
    position: relative;
    max-height: 31rem;
  }

  .full-width-card > .card-illustration > .blue-background {
    background-color: var(--color-primary-level-1);
    position: absolute;
    height: calc(100% - 4rem);
    width: 100%;
    top: 2rem;
  }

  .full-width-card.illustration-left.text-nudged > .card-description {
    transform: translateX(-3rem);
  }

  .full-width-card.illustration-right.text-nudged > .card-description {
    transform: translateX(3rem);
  }

  .full-width-card.illustration-right > .card-illustration > .blue-background {
    left: 50%;
    border-radius: 2rem 0 0rem 2rem;
  }

  .full-width-card.illustration-left > .card-illustration > .blue-background {
    right: 50%;
    border-radius: 0 0 2rem 0;
  }

  .grey-background {
    background-color: var(--color-foreground-level-1);
  }

  #main-features {
    display: flex;
    flex-direction: column-reverse;
    gap: 2rem;
  }

  #main-features > #raise-funds {
    margin-bottom: -7rem;
  }

  #main-features > #raise-funds > #raise-funds-description {
    transform: translateY(-2.5rem);
  }

  #main-features #streaming > .card-illustration {
    padding: 2rem 0 2rem 1rem;
    overflow: hidden;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--spacing-m);
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

  @media (max-width: 768px) {
    h1 {
      font-size: var(--font-size-l);
    }

    h2 {
      font-size: var(--font-size-m);
      line-height: 1.5rem;
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

    .full-width-card.illustration-left {
      grid-template-columns: 1fr;
    }

    .full-width-card.illustration-right {
      grid-template-columns: 1fr;
    }

    .full-width-card.illustration-left.text-nudged > .card-description {
      transform: translateX(0);
    }

    .full-width-card.illustration-right.text-nudged > .card-description {
      transform: translateX(0);
    }

    #main-features > #raise-funds {
      margin-bottom: 0;
    }

    .full-width-card > .card-description {
      padding: 1rem;
    }

    .full-width-card > .card-illustration {
      padding: 1rem 0 1rem 0;
    }

    #main-features #streaming > .card-illustration {
      padding: 2rem 0 2rem 0;
    }

    #main-features > #raise-funds > #raise-funds-description {
      transform: none;
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

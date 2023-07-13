<script lang="ts">
  import LpHeader from './components/lp-header.svelte';

  import isRunningInSafe from '$lib/utils/is-running-in-safe';
  import { goto } from '$app/navigation';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { onMount } from 'svelte';
  import LpHero from '$lib/components/illustrations/lp-hero.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Globe from 'radicle-design-system/icons/Globe.svelte';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import OneBalance from '$lib/components/illustrations/one-balance.svelte';
  import LpInterstitialIllustration1 from '$lib/components/illustrations/lp-interstitial-illustration-1.svelte';
  import LpDripListIllustration from '$lib/components/illustrations/lp-drip-list-illustration.svelte';
  import MultiChain from '$lib/components/illustrations/multi-chain.svelte';
  import LpCard from './components/lp-card/lp-card.svelte';
  import ImageAndCaption from './components/image-and-caption.svelte';
  import MultiToken from '$lib/components/illustrations/multi-token.svelte';
  import GasOptimized from '$lib/components/illustrations/gas-optimized.svelte';
  import NoWrappedTokens from '$lib/components/illustrations/no-wrapped-tokens.svelte';
  import OneContract from '$lib/components/illustrations/one-contract.svelte';
  import LpSectionHeader from './components/lp-section-header.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import { isSupportedGitUrl } from '$lib/utils/is-valid-git-url';
  import buildUrl from '$lib/utils/build-url';

  onMount(() => {
    // When launching within a Safe, we don't want to display the landing page.
    if (isRunningInSafe()) goto('/app', { replaceState: true });
  });

  let millis = 0;

  setInterval(() => {
    millis += 10;
  }, 10);

  function getTokenStreamsVisualAmount(amtPerSec: number, startValue: number) {
    const secondsSinceStart = millis / 1000;

    return (startValue + amtPerSec * secondsSinceStart).toFixed(6);
  }

  let claimProjectInput = '';
  $: canSubmitProjectClaim = isSupportedGitUrl(claimProjectInput);
</script>

<HeadMeta />

<LpHeader />
<div class="wrapper">
  <div class="hero">
    <div class="text">
      <h1>Funding that flows</h1>
      <p>A decentralized toolkit for receiving ongoing support without platform fees.</p>
      <div class="actions">
        <a href="#get-funding"><Button icon={Globe}>Get your project funded</Button></a>
        <a href="#fund-projects"><Button icon={TokenStreams}>Fund your dependencies</Button></a>
      </div>
    </div>
    <div class="illustration">
      <LpHero />
    </div>
  </div>

  <section class="card two-column">
    <div class="anchor" id="get-funding" />
    <div class="section-inner">
      <div class="text">
        <h2>Get the funding you need for your project</h2>
        <p>
          On Drips, your open-source projects earn funds from direct supporters, as well as other
          projects that depend on yours.
        </p>
      </div>
      <div class="illustration padded">
        <OneBalance />
      </div>
      <div class="illustration-background" />
    </div>
  </section>

  <div class="section-spacer" />

  <section class="two-column" style:z-index={2}>
    <div class="section-inner">
      <div class="card">
        <div class="illustration-background top" />
        <div class="illustration">
          <MultiChain />
        </div>
        <div class="text">
          <h3>Claim your GitHub project</h3>
          <p>Enter the URL of your public GitHub repository to get started.</p>
          <div class="claim-input">
            <TextInput bind:value={claimProjectInput} placeholder="GitHub repository URL" />
            <a
              href={buildUrl('/app/claim-project', { projectToAdd: claimProjectInput })}
              target="_blank"
              ><Button variant="primary" size="large" disabled={!canSubmitProjectClaim}
                >Claim project</Button
              ></a
            >
          </div>
        </div>
      </div>
      <div class="text centered">
        <h3>How to raise funds on Drips</h3>
        <div class="how-it-works">
          <div class="item">
            <div class="count">1</div>
            <h5>Enter your GitHub URL</h5>
            <p class="typo-text-small">Select any public GitHub repository.</p>
          </div>
          <div class="item">
            <div class="count">2</div>
            <h5>Verify ownerhsip</h5>
            <p class="typo-text-small">
              Create a FUNDING.json file to link your repository to Drips.
            </p>
          </div>
          <div class="item">
            <div class="count">3</div>
            <h5>Configure Splits</h5>
            <p class="typo-text-small">
              Decide the distribution of funds to maintainers and dependencies.
            </p>
          </div>
          <div class="item">
            <div class="count">4</div>
            <h5>Get funding</h5>
            <p class="typo-text-small">
              Earn income from direct supporters and projects that depend on yours.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="one-column">
    <div class="section-inner">
      <div class="text">
        <h3>Stream funds by the second</h3>
        <p>Drips enables token streams of any ERC-20 to any Ethereum address by the second.</p>
        <div class="token-streams-visuals">
          <div class="token-streams-visual">
            <div class="token">
              <img class="token-image" src="/assets/usdc-coin.webp" alt="USDC" />
              <p>USD Coin</p>
            </div>
            <p>
              <span class="green tabular-nums">+1.037574 USDC</span><span class="muted">/sec</span>
            </p>
            <p>
              <span class="fat tabular-nums"
                >{millis && getTokenStreamsVisualAmount(1.037574, 4968.3241)} USDC</span
              >
            </p>
          </div>
          <div class="token-streams-visual">
            <div class="token">
              <img class="token-image" src="/assets/wbtc-coin.png" alt="WBTC" />
              <p>Wrapped Bitcoin</p>
            </div>
            <p>
              <span class="green tabular-nums">+0.00181397 WBTC</span><span class="muted">/sec</span
              >
            </p>
            <p>
              <span class="fat tabular-nums"
                >{millis && getTokenStreamsVisualAmount(0.00181397, 2.81065)} WBTC</span
              >
            </p>
          </div>
        </div>
      </div>
      <div class="background-illustration">
        <LpInterstitialIllustration1 />
      </div>
    </div>
  </section>

  <section class="card two-column">
    <div class="anchor" id="fund-projects" />
    <div class="section-inner">
      <div class="illustration framed">
        <LpDripListIllustration />
      </div>
      <div class="text">
        <h2>Pass it on: support your dependencies in a Drip List</h2>
        <p>
          Fund the projects you depend on to ensure the sustainable development and maintenance of
          your software, promote network stability, security and continuous improvement.
        </p>
      </div>
    </div>
  </section>

  <div class="section-spacer" />

  <section class="two-column">
    <div class="section-inner">
      <div class="text centered">
        <h3>How Drip Lists work</h3>
        <div class="how-it-works">
          <div class="item">
            <div class="count">1</div>
            <h5>Make a list</h5>
            <p class="typo-text-small">Find and fund any GitHub project or Ethereum address.</p>
          </div>
          <div class="item">
            <div class="count">2</div>
            <h5>Set your splits</h5>
            <p class="typo-text-small">
              Decide on what projects receive what percentage of your budget.
            </p>
          </div>
          <div class="item">
            <div class="count">3</div>
            <h5>Fund it</h5>
            <p class="typo-text-small">
              Support your Drip List with a continuous stream of any ERC-20 token.
            </p>
          </div>
          <div class="item">
            <div class="count">4</div>
            <h5>Show it off</h5>
            <p class="typo-text-small">Drip Lists are public on your profile. Be proud!</p>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="illustration-background top" />
        <div class="illustration">
          <MultiChain />
        </div>
        <div class="text">
          <h3>Start your Drip List</h3>
          <p>Give to a personalized list of GitHub projects or Ethereum addresses.</p>
          <a href="/app/funder-onboarding" target="_blank">
            <Button variant="primary" size="large">Create a Drip List</Button>
          </a>
        </div>
      </div>
    </div>
  </section>

  <div class="section-spacer" />

  <section class="grid">
    <LpCard
      ><ImageAndCaption background>
        <MultiToken slot="image" />
        <div slot="caption" class="text-container">
          <h4>No platform fees</h4>
          <p>
            Drips is entirely open-source, and doesn't charge anything extra on top of network gas
            fees.
          </p>
        </div>
      </ImageAndCaption></LpCard
    >
    <LpCard
      ><ImageAndCaption background>
        <OneBalance slot="image" />
        <div slot="caption" class="text-container">
          <h4>One balance for all your streams</h4>
          <p>Fund multiple streams using one account balance in a single transaction.</p>
        </div>
      </ImageAndCaption></LpCard
    >
    <LpCard
      ><ImageAndCaption background>
        <GasOptimized slot="image" />
        <div slot="caption" class="text-container">
          <h4>You're in control</h4>
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
          <h4>No need to wrap tokens</h4>
          <p>
            Use ERC-20 tokens “as is”. No need to wrap them or trust a third party with your tokens.
          </p>
        </div>
      </ImageAndCaption></LpCard
    >
    <LpCard
      ><ImageAndCaption background>
        <OneContract slot="image" />
        <div slot="caption" class="text-container">
          <h4>One contract. One payment graph.</h4>
          <p>
            Drips uses one smart contract for streaming and splitting, enabling effortless and
            flexible token routing.
          </p>
        </div>
      </ImageAndCaption></LpCard
    >
    <LpCard
      ><ImageAndCaption background>
        <div slot="image" class="illustration-container">
          <div class="illustration"><MultiChain /></div>
        </div>
        <div slot="caption" class="text-container">
          <h4>Coming soon: Multi-Chain</h4>
          <p>Available on the most popular EVM networks: Ethereum, Mainnet, Polygon, Optimism.</p>
        </div>
      </ImageAndCaption></LpCard
    >
  </section>

  <div class="section-spacer" />
  <div class="section-spacer" />

  <section>
    <LpSectionHeader>
      <div class="socials">
        <h2>Stay up to date</h2>
        <div class="flex gap-4">
          <a href="https://twitter.com/dripsnetwork" target="_blank" rel="noreferrer"
            ><Button variant="primary">Twitter</Button></a
          >
          <a href="https://discord.gg/BakDKKDpHF" target="_blank" rel="noreferrer"
            ><Button variant="primary">Discord</Button></a
          >
        </div>
      </div>
    </LpSectionHeader>
  </section>

  <div class="section-spacer" />

  <section class="">
    <div class="flex flex-col gap-4 items-center">
      <div class="legal-links typo-text-small">
        <a href="https://v1.drips.network/" class="highlight">Back to Drips V1</a> •
        <a href="/legal/privacy">Privacy Policy</a> •
        <a href="/legal/disclaimer">Disclaimer</a> •
        <a href="/legal/access">Access</a>
      </div>
    </div>
  </section>

  <div class="section-spacer" />
</div>

<style>
  .wrapper {
    max-width: 90rem;
    width: 100vw;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .anchor {
    position: absolute;
    top: -98px;
  }

  /* TYPOGRAPHY */

  h1 {
    font-size: 80px;
    line-height: 80px;
  }

  h2 {
    font-family: 'Redaction 50', Times, serif;
    line-height: min(60px, 5vw);
    font-size: min(60px, 5vw);
  }

  h3 {
    font-family: 'Redaction 50', Times, serif;
    font-size: 36px;
    line-height: 36px;
  }

  h4 {
    font-family: 'Redaction 50', Times, serif;
    font-size: 24px;
    line-height: 24px;
  }

  span.green {
    color: var(--color-positive);
  }

  span.muted {
    color: var(--color-foreground-level-4);
  }

  span.fat {
    font-weight: 900;
  }

  @media (max-width: 819px) {
    h2 {
      font-size: 36px;
      line-height: 36px;
    }
  }

  /* HERO */

  .hero {
    position: relative;
    display: flex;
    align-items: center;
  }

  .hero .illustration {
    pointer-events: none;
    width: 100%;
    margin-top: -4rem;
    margin-left: -14rem;
  }

  .hero .text {
    padding-left: 6rem;
    max-width: 32rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .hero .text .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  @media (max-width: 1155px) {
    .hero {
      flex-direction: column-reverse;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .hero .illustration {
      width: 125%;
      margin: -20% 0 0 -30%;
    }

    .hero .text {
      max-width: 64rem;
      padding-left: 1.5rem;
    }
  }

  /* SECTIONS */

  .section-spacer {
    height: 3rem;
  }

  section {
    width: 100%;
    z-index: 1;
    max-width: 80rem;
    padding: 0 1rem;
    margin: 0 auto;
    position: relative;
  }

  section .section-inner {
    position: relative;
  }

  section.card .section-inner {
    border: 1px solid var(--color-foreground);
    border-radius: 2rem 0 2rem 2rem;
    background-color: var(--color-background);
    overflow: hidden;
  }

  section.two-column .section-inner {
    display: flex;
    gap: min(2rem, 2vw);
    justify-content: space-between;
    align-items: center;
  }

  section .section-inner > .text {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: min(3rem, 3vw);
    padding-right: 0;
  }

  section .section-inner > .text:last-child {
    padding-left: 0;
    padding-right: min(3rem, 3vw);
  }

  section .section-inner .card .text {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: min(3rem, 3vw);
  }

  section .section-inner .text.centered {
    align-items: center;
    text-align: center;
  }

  section.two-column .section-inner .text > * {
    max-width: 36rem;
  }

  section.two-column .section-inner .illustration.padded {
    height: 32rem;
    width: 32rem;
    padding: min(4rem, 5vw);
    z-index: 1;
  }

  section.two-column .section-inner .illustration.framed {
    height: fit-content;
    width: 100%;
    max-width: 28rem;
    z-index: 1;
    margin: 4rem 0;
    margin-right: 1rem;
    padding: 2rem;
    padding-left: 4rem;
    border-radius: 0 0 1rem 0;
    box-shadow: var(--elevation-medium);
  }

  section.two-column .section-inner > .illustration-background {
    position: absolute;
    right: 0;
    background-color: var(--color-primary-level-1);
    top: 2rem;
    bottom: 2rem;
    right: 0;
    width: 22rem;
    border-radius: 2rem 0 0 2rem;
  }

  section.one-column .section-inner {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 7rem 0;
    text-align: center;
  }

  section.one-column .section-inner .text {
    align-items: center;
  }

  section .section-inner .background-illustration {
    position: absolute;
    padding-left: 2rem;
    top: 0;
    bottom: 0;
    width: 100%;
    pointer-events: none;
  }

  section .section-inner .card {
    border-radius: 2rem 0 2rem 2rem;
    border: 1px solid var(--color-foreground);
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 5;
    background-color: var(--color-background);
  }

  section .section-inner .card .illustration {
    max-width: 20rem;
    z-index: 1;
  }

  section .section-inner .card .illustration-background {
    position: absolute;
    top: 0;
    left: 2rem;
    right: 2rem;
    height: 12rem;
    border-radius: 0 0 1.5rem 1.5rem;
    background-color: var(--color-primary-level-1);
  }

  section.grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 1024px) {
    section.two-column:not(.card) .section-inner {
      flex-direction: column;
    }
  }

  @media (max-width: 819px) {
    section.two-column .section-inner {
      flex-direction: column-reverse;
    }

    section.two-column.card .section-inner {
      gap: 0rem;
    }

    section.two-column .section-inner > .illustration-background {
      top: 0;
      max-width: 36rem;
      left: initial;
      right: initial;
      width: calc(100% - 2rem);
      height: 47%;
      border-radius: 0 0 0 2rem;
    }

    section.two-column .section-inner .illustration.padded {
      padding: 1rem;
      max-width: 24rem;
      max-height: 24rem;
    }

    section .section-inner > .text {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1rem;
    }

    section .section-inner > .text:last-child {
      padding-left: 1rem;
    }

    section .section-inner .card .text {
      padding: 1rem;
    }

    section.two-column .section-inner .illustration.framed {
      padding-left: 30%;
      max-width: 100%;
      margin: 0 3rem 2rem 0;
    }

    section.grid {
      grid-template-columns: 1fr;
    }

    section.one-column .section-inner {
      padding: 4rem 0;
    }
  }

  /* TOKEN STREAMS VISUALS */

  .token-streams-visuals {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .token-streams-visuals .token-streams-visual {
    display: flex;
    gap: min(2vw, 1rem);
    align-items: center;
    white-space: nowrap;
  }

  .token-streams-visual p {
    font-size: min(1.5rem, 2.5vw);
  }

  .token-streams-visuals .token-streams-visual .token {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .token-streams-visuals .token-streams-visual .token .token-image {
    height: clamp(0.5rem, 6vw, 2rem);
    width: clamp(0.5rem, 6vw, 2rem);
    border-radius: 1rem;
  }

  /* FOOTER */

  .socials {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    padding: 0 2rem;
  }

  /* HOW IT WORKS */

  .how-it-works {
    display: flex;
    gap: 3rem;
    flex-wrap: wrap;
    padding: 2rem 0;
    width: 36rem;
  }

  .how-it-works .item {
    max-width: 16rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
  }

  .how-it-works .item .count {
    font-family: 'Redaction 50', Times, serif;
    font-size: 36px;
    background-color: var(--color-primary-level-1);
    height: 3rem;
    width: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 1rem 0 1rem 1rem;
    color: var(--color-primary);
  }

  @media (max-width: 819px) {
    .how-it-works {
      padding-top: 1rem;
      width: 100%;
      gap: 2rem;
    }

    .how-it-works .item {
      width: 100%;
      max-width: 100%;
    }
  }

  .text-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .illustration-container {
    height: 100%;
  }

  .illustration-container .illustration {
    height: 100%;
  }

  /* TWEAKS */

  .claim-input {
    display: flex;
    gap: 0.5rem;
  }

  @media (max-width: 1024px) {
    .background-illustration {
      transform: translateX(-124px);
    }
  }

  @media (max-width: 819px) {
    .hide-on-mobile {
      display: none;
    }

    .claim-input {
      flex-direction: column;
      align-items: flex-end;
    }
  }
</style>

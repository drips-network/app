<script lang="ts">
  import LpHeader from './components/lp-header.svelte';
  import isRunningInSafe from '$lib/utils/is-running-in-safe';
  import { goto } from '$app/navigation';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { onMount } from 'svelte';
  import Button from '$lib/components/button/button.svelte';
  import OneBalance from '$lib/components/illustrations/one-balance.svelte';
  import MultiChain from '$lib/components/illustrations/multi-chain.svelte';
  import LpSectionHeader from './components/lp-section-header.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import { isSupportedGitUrl } from '$lib/utils/is-valid-git-url';
  import buildUrl from '$lib/utils/build-url';
  import LpFooter from './components/lp-footer.svelte';
  import LpTotalDrippedBadge from './components/lp-total-dripped-badge.svelte';
  import type { PageData } from './$types';
  import LpHeroBigGraph from '$lib/components/illustrations/lp-hero-big-graph.svelte';
  import DripListIcon from '$lib/components/icons/DripList.svelte';
  import Registered from '$lib/components/icons/Registered.svelte';
  import LpQuadsparkle from '$lib/components/illustrations/lp-quadsparkle.svelte';
  import LpDripListsHowItWorksMultiplayer from '$lib/components/lp-drip-lists-how-it-works/lp-drip-lists-how-it-works-multiplayer.svelte';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';
  import LpIllustrationFlyingCoins from '$lib/components/illustrations/lp-illustration-flying-coins.svelte';
  import AnimateTypeWords from '$lib/components/animate-type-words/animate-type-words.svelte';
  import DripListsBgLeft from './components/svgs/drip-lists-bg-left.svelte';
  import Github from '$lib/components/icons/Github.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import Splits from '$lib/components/icons/Splits.svelte';
  import CaseStudyCard from './components/case-study-card.svelte';
  import DripListsBgRight from './components/svgs/drip-lists-bg-right.svelte';

  export let data: PageData;

  onMount(() => {
    // When launching within a Safe, we donʼt want to display the landing page.
    // There's a real redirect in the load function for this page too, but we're keeping
    // this client-side thing here just in case the Sec-Fetch-Dest header isn't set for
    // some reason.
    if (isRunningInSafe()) goto('/app', { replaceState: true });
  });

  let claimProjectInput = '';
  $: canSubmitProjectClaim = isSupportedGitUrl(claimProjectInput);

  const heroTexts = [
    'Continuously support your dependencies',
    'Retroactively reward open-source projects',
    'Incentivize developers within your ecosystem',
  ];
  let heroTextsIndex = 0;
</script>

<HeadMeta title="Drips | Funding that flows" />

<LpHeader />
<div class="page">
  <div class="wrapper">
    <!-- hero graph -->
    <div style:position="relative">
      <div
        style:display="flex"
        style:justify-content="center"
        style:overflow="hidden"
        style:width="100%"
      >
        <div class="big-hero-graph">
          <LpHeroBigGraph />
        </div>
      </div>
      <div
        style:transform="translateY(-2rem)"
        class="absolute overlay flex items-center justify-center"
      >
        <div class="flex flex-col gap-4 mlg:gap-7">
          <div class="flex w-full justify-center">
            <LpTotalDrippedBadge prices={data.prices} />
          </div>
          <h1 class="w-full relative font-pixelated text-center leading-[1.15] px-2">
            <div class="invisible">
              {heroTexts.slice(0).sort((a, b) => b.length - a.length)[0]}|
            </div>
            <div class="absolute overlay flex items-center justify-center">
              <div class="w-full text-center">
                {#key heroTextsIndex}<AnimateTypeWords
                    text={heroTexts[heroTextsIndex]}
                    wordClasses="bg-background"
                    on:done={() => {
                      setTimeout(() => {
                        heroTextsIndex = (heroTextsIndex + 1) % heroTexts.length;
                      }, 2500);
                    }}
                  />{/key}
              </div>
            </div>
          </h1>
          <div class="flex flex-wrap gap-2 justify-center w-full">
            <Button href="#drip-list-hiw" icon={DripListIcon} variant="primary"
              >Start funding</Button
            >
            <Button href="#get-funding" icon={Registered} variant="primary"
              >Claim your project</Button
            >
          </div>
        </div>
      </div>
    </div>

    <h4 class="opener">
      Drips is a decentralized toolkit for rewarding open source projects within your ecosystem.
    </h4>

    <section class="usps">
      <div class="usp">
        <div class="icon">
          <Github style="fill: var(--color-primary); width: 2rem; height: 2rem;" />
        </div>
        <div>
          <h4>The easiest way to fund any GitHub repo</h4>
          <p>
            Instantly support any repo on GitHub, even if you don't know their Ethereum address.
          </p>
        </div>
      </div>
      <div class="usp">
        <div class="icon">
          <DripList style="fill: var(--color-primary); width: 2rem; height: 2rem;" />
        </div>
        <div>
          <h4>The most flexible way to distribute funds</h4>
          <p>
            Distribute any ERC-20, continuously or as a one-time donation, without platform fees.
          </p>
        </div>
      </div>
      <div class="usp">
        <div class="icon">
          <Proposals style="fill: var(--color-primary); width: 2rem; height: 2rem;" />
        </div>
        <div>
          <h4>The simplest way for communities to allocate funds</h4>
          <p>Collectively decide on which projects and people receive what percentage of funds.</p>
        </div>
      </div>
      <div class="usp">
        <div class="icon">
          <Splits style="fill: var(--color-primary); width: 2rem; height: 2rem;" />
        </div>
        <div>
          <h4>The widest impact, by default</h4>
          <p>
            Funds sent to projects are also split with their dependencies, amplifying your impact
            within the open-source community.
          </p>
        </div>
      </div>
    </section>

    <div class="section-spacer" />

    <div class="relative pt-24 mlg:pt-12 pb-18">
      <section>
        <div class="flex flex-col items-center gap-10">
          <header class="flex gap-8 justify-between items-center max-w-full w-[740px] mx-auto">
            <LpQuadsparkle />
            <h2 class="typo-header-1">Drips in Use</h2>
            <LpQuadsparkle />
          </header>

          <div class="case-studies">
            <div class="case-study">
              <CaseStudyCard
                maxSplitRows={5}
                dripList={data.featuredLists[
                  '31017209032870028068280040871339261037749177808773684797297972107972'
                ]}
                orgName="ENS"
                logoSrc="/assets/lp/ens-avatar.png"
                logoAlt="ENS logo"
                description="ENS streamed $50,000 USDC over six months to seven essential projects through its Drip List."
                blogPost={data.blogPosts.find(
                  (p) => p.slug === 'ens-funds-its-critical-open-source-dependencies',
                )}
              />
            </div>
            <div class="case-study">
              <CaseStudyCard
                dripList={data.featuredLists[
                  '41971962915943119138973997144514496143454239023249281594792952267407'
                ]}
                orgName="Scroll"
                logoSrc="/assets/lp/scroll-avatar.png"
                logoAlt="Scroll logo"
                description="Scroll used a Collaborative Drip List to vote on and fund their Level Up hackathon in Argentina."
                blogPost={data.blogPosts.find((p) => p.slug === 'scroll-argentinia-hackathon')}
              />
            </div>
            <div class="case-study">
              <CaseStudyCard
                dripList={data.featuredLists[
                  '30178668158349445547603108732480118476541651095408979232800331391215'
                ]}
                orgName="Octant"
                logoSrc="/assets/lp/octant-avatar.png"
                logoAlt="Octant logo"
                description="Octant committed a total of 23.2 ETH from its first two public goods funding rounds to fund its dependencies."
                blogPost={data.blogPosts.find(
                  (p) => p.slug === 'octant-teams-up-with-drips-to-fund-its-dependencies',
                )}
              />
            </div>
          </div>
        </div>
      </section>

      <!-- flying coins foreground -->
      <div
        class="absolute z-10 top-1.5 left-0 w-full flex justify-center overflow-visible pointer-events-none"
      >
        <div style="flex:0 0 1750px; perspective:1px; transform: translateZ(-1px); ">
          <LpIllustrationFlyingCoins />
        </div>
      </div>
    </div>

    <div class="relative">
      <div id="drip-list-hiw" class="anchor" />

      <section>
        <div class="drip-list-hiw-bg-left">
          <DripListsBgLeft />
        </div>
        <div class="drip-list-hiw-bg-right">
          <DripListsBgRight />
        </div>

        <div class="flex flex-col items-center gap-10 pt-9">
          <header class="flex gap-8 justify-between items-center max-w-full w-[740px] mx-auto">
            <LpQuadsparkle />
            <h2 class="typo-header-1">How Drip Lists work</h2>
            <LpQuadsparkle />
          </header>

          <div class="flex flex-col gap-6 text-center mx-auto" style="max-width:calc(600/16 * 1em)">
            <p>
              Work with your community, or build a list by yourself to fund any project, developer,
              or purpose you can think of.
            </p>
          </div>

          <TransitionedHeight transitionHeightChanges>
            <!-- mobile: no fade, height transitions -->
            <!-- laptop (lg): cross-fade -->
            <section class="relative">
              <div class="transition duration-200">
                <LpDripListsHowItWorksMultiplayer />
              </div>
            </section>
          </TransitionedHeight>
        </div>
      </section>
    </div>

    <div class="section-spacer" />

    <section>
      <div class="flex flex-col gap-10">
        <header class="flex gap-8 justify-between items-center max-w-full w-[740px] mx-auto">
          <LpQuadsparkle />
          <h2 class="typo-header-1 text-center" style="max-width: calc(454/36 * 1em)">
            An ecosystem for supporting any repo on GitHub
          </h2>
          <LpQuadsparkle />
        </header>

        <div class="flex flex-col gap-6 text-center mx-auto" style="max-width:calc(600/16 * 1em)">
          <p class="text-typo-header-3">Effortlessly supporting open source</p>
          <p>
            Empower your contributions by supporting any GitHub repository with Drips, effortlessly
            directing funds to projects you believe in.
          </p>
        </div>
      </div>
    </section>

    <div class="section-spacer" />

    <section class="card two-column">
      <div class="anchor" id="get-funding" />
      <div class="section-inner">
        <div class="text">
          <h2 class="section-header-huge">Get the funds you need for your project</h2>
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
              <Button
                href={buildUrl('/app/claim-project', { projectToAdd: claimProjectInput })}
                target="_blank"
                variant="primary"
                size="large"
                disabled={!canSubmitProjectClaim}>Claim project</Button
              >
            </div>
          </div>
        </div>
        <div class="text centered">
          <h3>How to receive funds on Drips</h3>
          <div class="how-it-works">
            <div class="item">
              <div class="count">1</div>
              <h5>Enter your GitHub URL</h5>
              <p class="typo-text-small">Select any public GitHub repository.</p>
            </div>
            <div class="item">
              <div class="count">2</div>
              <h5>Verify ownership</h5>
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
              <h5>Get funds</h5>
              <p class="typo-text-small">
                … from direct supporters and projects that depend on yours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="section-spacer" />
    <div class="section-spacer" />

    <section>
      <LpSectionHeader>
        <div class="socials">
          <h2 class="section-header-huge">Stay up to date</h2>
          <div class="flex gap-4">
            <Button
              variant="primary"
              href="https://drips.network/blog"
              target="_blank"
              rel="noreferrer">Blog</Button
            >
            <Button
              variant="primary"
              href="https://twitter.com/dripsnetwork"
              target="_blank"
              rel="noreferrer">Twitter</Button
            >
            <Button
              variant="primary"
              href="https://discord.gg/BakDKKDpHF"
              target="_blank"
              rel="noreferrer">Discord</Button
            >
          </div>
        </div>
      </LpSectionHeader>
    </section>

    <div class="section-spacer" />

    <LpFooter />

    <div class="section-spacer" />
  </div>
</div>

<style>
  .page {
    width: 100vw;
    overflow: hidden;
  }

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
    font-size: 2.25rem;
  }
  @media (min-width: 726px) {
    h1 {
      font-size: 5.2vw;
    }
  }
  @media (min-width: 896px) {
    h1 {
      font-size: 3.88vw;
    }
  }
  @media (min-width: 1440px) {
    h1 {
      font-size: 3.5rem;
    }
  }

  .section-header-huge {
    font-family: 'Redaction 50', Times, serif;
    line-height: min(60px, 5vw);
    font-size: min(60px, 5vw);
  }

  h3 {
    font-family: 'Redaction 50', Times, serif;
    font-size: 36px;
    line-height: 36px;
  }

  @media (max-width: 819px) {
    .section-header-huge {
      font-size: 36px;
      line-height: 36px;
    }
  }

  /* HERO */
  .big-hero-graph {
    width: 100vw;
    min-width: 900px;
    height: 100%;
  }

  .opener {
    text-align: center;
    max-width: 48rem;
    margin: 2rem auto 4rem auto;
    padding: 1rem;
  }

  /* USPs */
  .usps {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 1rem;
    justify-content: center;
  }

  .usps .usp {
    background-color: var(--color-background);
    text-align: left;
    padding: 1.5rem;
    gap: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
  }

  .usps .usp h4 {
    margin-bottom: 0.5rem;
  }

  @media (max-width: 1130px) {
    .usps {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 819px) {
    .usps {
      grid-template-columns: 1fr;
    }
  }

  /* CASE STUDIES */

  .case-studies {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    width: 100%;
  }

  .case-studies .case-study {
    width: 80%;
  }

  .case-studies .case-study:nth-child(2n) {
    align-self: flex-end;
  }

  @media (max-width: 882px) {
    .case-studies .case-study {
      width: 100%;
    }
  }

  /* SECTIONS */

  .section-spacer {
    height: 4.5rem;
  }

  section {
    width: 100%;
    z-index: 1;
    max-width: 80rem;
    padding: 0 1rem;
    margin: 0 auto;
    position: relative;
    text-align: center;
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
    text-align: left;
  }

  section .section-inner > .text:last-child {
    padding-left: 0;
    padding-right: min(3rem, 3vw);
  }

  section .section-inner .card .text {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: start;
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

  section.one-column .section-inner .text {
    align-items: center;
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

  @media (max-width: 1023px) {
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
    justify-content: center;
    flex-wrap: wrap;
    padding: 2rem 0;
    width: 36rem;
  }

  .how-it-works .item {
    max-width: 14rem;
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
    color: var(--color-primary-level-6);
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

  /* TWEAKS */
  .drip-list-hiw-bg-left {
    position: absolute;
    top: -1rem;
    left: calc(-330px + 15%);
    width: 330px;
    overflow: hidden;
  }

  .drip-list-hiw-bg-right {
    position: absolute;
    top: -20rem;
    right: calc(-177px + 15%);
    width: 177px;
    overflow: hidden;
  }

  .claim-input {
    display: flex;
    gap: 0.5rem;
    width: 100%;
  }

  @media (max-width: 819px) {
    .claim-input {
      flex-direction: column;
      align-items: flex-end;
    }
  }

  @media (max-width: 1117px) {
    .drip-list-hiw-bg-left,
    .drip-list-hiw-bg-right {
      display: none;
    }
  }
</style>

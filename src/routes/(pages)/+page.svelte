<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import LpHeroBigGraph from '$lib/components/illustrations/lp-hero-big-graph.svelte';
  import type { PageData } from './$types';
  import CaseStudyCard from './components/case-study-card.svelte';
  import LpContactCard from './components/lp-contact-card.svelte';
  import LpFooter from './components/lp-footer.svelte';
  import LpHeader, { type AnnouncementBannerConfig } from '$lib/components/lp-header/lp-header.svelte';
  import LpHiwEntrypoint from './components/lp-hiw-entrypoint.svelte';
  import LpSectionHeader from './components/lp-section-header.svelte';
  import UsecaseSection from './components/usecase-section.svelte';
  import TrustedBy from './components/trusted-by.svelte';
  import LpIllustrationFlyingCoins from '$lib/components/illustrations/lp-illustration-flying-coins.svelte';
  import BgGraph1 from './components/svgs/background-graph-1.svelte';

  export let data: PageData;

  let announcementBannerConfig: AnnouncementBannerConfig | undefined;
  $: {
    const sortedPosts = data.blogPosts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const latestPostWithAnnouncementConfig = sortedPosts.find((p) => p.announcementBannerCopy);

    announcementBannerConfig = latestPostWithAnnouncementConfig?.announcementBannerCopy
      ? {
          title: latestPostWithAnnouncementConfig.announcementBannerCopy,
          link: `/blog/posts/${latestPostWithAnnouncementConfig.slug}`,
        }
      : undefined;
  }
</script>

<div class="wrapper">
  <LpHeader announcementBanner={announcementBannerConfig} />

  <section class="hero">
    <div class="bg">
      <LpHeroBigGraph />
    </div>
    <div class="text">
      <h1>The easiest way to fund open-source in your ecosystem.</h1>
      <p style:color="var(--color-foreground-level-5)">Have a funding experiment to talk about?</p>
      <Button variant="primary">Get in touch</Button>
      <div class="trusted-by">
        <TrustedBy />
      </div>
    </div>
  </section>

  <section>
    <UsecaseSection />
  </section>

  <section class="case-studies">
    <LpSectionHeader>How orgs use Drips</LpSectionHeader>
    <div class="case-studies-wrapper">
      <div class="case-study">
        <CaseStudyCard
          maxSplitRows={5}
          dripList={data.featuredLists[
            '52616587671615462427509444020197501845441172922070932614265487278307'
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
            '52616587671615462427509444020197501845441172922070932614265487278307'
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
            '52616587671615462427509444020197501845441172922070932614265487278307'
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
      
    <div class="bg-graph-1">
      <BgGraph1 />
    </div>

    <div class="flying-coins">
      <LpIllustrationFlyingCoins />
    </div>
  </section>

  <section class="two-column" style:margin-top="4rem">
    <div>
      <LpHiwEntrypoint />
    </div>
    <div>
      <LpContactCard />
    </div>
  </section>

  <section>
    <LpFooter />
  </section>
</div>

<style>
  .wrapper {
    background-color: var(--color-foreground-level-1);
    padding-bottom: 2rem;
    width: 100vw;
    overflow: hidden;
  }

  .hero .bg {
    max-height: 85svh;
    width: 100%;
    filter: blur(1.5px);
    opacity: 0.3;
    transform: scale(1.3) translateY(5svh);
  }

  .hero .text {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1.5rem;
    align-items: center;
    text-align: center;
    transform: translateY(7svh);
  }

  .hero .trusted-by {
    margin-top: 3rem;
  }

  .hero .text h1 {
    max-width: 900px;
    font-size: clamp(2rem, 4vw, 3.5rem);
    line-height: clamp(2rem, 4vw, 3.5rem);
  }

  section {
    position: relative;
    max-width: calc(1373px + 1rem);
    margin: 0 auto;
    padding: 1rem;
  }

  .case-studies-wrapper {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    width: 100%;
  }

  .case-studies-wrapper .case-study {
    width: 80%;
  }

  .case-studies-wrapper .case-study:nth-child(2n) {
    align-self: flex-end;
  }

  .case-studies .flying-coins {
    pointer-events: none;
    position: absolute;
    top: 1rem;
    left: -13rem;
    width: calc(100% + 20rem);
  }

  .case-studies .bg-graph-1 {
    position: absolute;
    right: 0;
    transform: translate(-0.5rem, -25rem);
    filter: blur(1px);
  }

  section.two-column {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    align-items: stretch;
    gap: 2rem;
  }

  section.two-column > div {
    flex: 1 1 0;
    min-width: 500px;
  }

  @media (max-width: 882px) {
    .bg {
      display: none;
    }

    .hero  {
      height: 85svh;
    }

    .case-studies .case-study {
      width: 100%;
    }

    .case-studies .flying-coins {
      display: none;
    }

    .case-studies .bg-graph-1 {
      display: none;
    }
  }
</style>

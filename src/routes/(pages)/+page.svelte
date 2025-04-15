<script lang="ts">
  import LpHeroBigGraph from "$lib/components/illustrations/lp-hero-big-graph.svelte";
  import type { PageData } from "./$types";
  import CaseStudyCard from "./components/case-study-card.svelte";
  import type { AnnouncementBannerConfig } from "./components/lp-header.svelte";
  import LpHeader from "./components/lp-header.svelte";
  import UsecaseSection from "./components/usecase-section.svelte";

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
  <LpHeroBigGraph />
  <section>
    <UsecaseSection />
  </section>
  
  
  <section class="case-studies">
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
  </section>
</div>

<style>
  .wrapper {
    background-color: var(--color-foreground-level-1);
    padding-bottom: 2rem;
    overflow: hidden;
  }

  section {
    max-width: calc(1373px + 1rem);
    margin: 0 auto;
    padding: 1rem;
  }

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
</style>

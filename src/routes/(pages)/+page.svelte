<script lang="ts">
  import LpHeroBigGraph from "$lib/components/illustrations/lp-hero-big-graph.svelte";
  import type { PageData } from "./$types";
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
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
  <h1>Content</h1>
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
</style>

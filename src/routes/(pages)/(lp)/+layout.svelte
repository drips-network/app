<script lang="ts">
  import { run } from 'svelte/legacy';

  import { page } from '$app/stores';

  import type { AnnouncementBannerConfig } from '$lib/components/lp-header/lp-header.svelte';
  import LpHeader from '$lib/components/lp-header/lp-header.svelte';
  import type { PageData } from './$types';
  import NavProgressBar from '$lib/components/nav-progress-bar/nav-progress-bar.svelte';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  // Doing something rather wonky here. `data` is the PageData of the current page, which
  // may be any of the pages this layout applies for.
  // If we can tell that the current page data is that of the homepage (by checking for blogPosts),
  // we snag up the announcement banner config and display it, otherwise we ignore it.

  let announcementBannerConfig: AnnouncementBannerConfig | undefined = $state();
  run(() => {
    if ('blogPosts' in $page.data) {
      const homepageData = $page.data as PageData;

      const sortedPosts = homepageData.blogPosts.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      const latestPostWithAnnouncementConfig = sortedPosts.find((p) => p.announcementBannerCopy);

      announcementBannerConfig = latestPostWithAnnouncementConfig?.announcementBannerCopy
        ? {
            title: latestPostWithAnnouncementConfig.announcementBannerCopy,
            link: `/blog/posts/${latestPostWithAnnouncementConfig.slug}`,
          }
        : undefined;
    } else {
      announcementBannerConfig = undefined;
    }
  });
</script>

<NavProgressBar color="var(--color-primary)" />

<LpHeader announcementBanner={announcementBannerConfig} />
{@render children?.()}

<script lang="ts">
  import { page } from '$app/stores';

  // import { page } from '$app/state';
  import type { AnnouncementBannerConfig } from '$lib/components/lp-header/lp-header.svelte';
  import LpHeader from '$lib/components/lp-header/lp-header.svelte';
  import type { PageData } from './$types';

  // Doing something rather wonky here. `data` is the PageData of the current page, which
  // may be any of the pages this layout applies for.
  // If we can tell that the current page data is that of the homepage (by checking for blogPosts),
  // we snag up the announcement banner config and display it, otherwise we ignore it.

  let announcementBannerConfig: AnnouncementBannerConfig | undefined;
  $: {
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
  }
</script>

<LpHeader announcementBanner={announcementBannerConfig} />
<slot></slot>

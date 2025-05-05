<script lang="ts">
  import { page } from '$app/stores';
  import type { AnnouncementBannerConfig } from '$lib/components/lp-header/lp-header.svelte';
  import LpHeader from '$lib/components/lp-header/lp-header.svelte';

  export let data;

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

  $: isRoot = $page.route.id === '/(pages)/(lp)';
</script>

<LpHeader announcementBanner={isRoot ? announcementBannerConfig : undefined} />
<slot></slot>

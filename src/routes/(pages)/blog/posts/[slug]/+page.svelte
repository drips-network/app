<script lang="ts">
  import PostCard from '$lib/components/blog/post-card/post-card.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import type { PageData } from './$types';
  import ModalLayout from '$lib/components/modal-layout/modal-layout.svelte';
  import sanitize from 'sanitize-html';
  import { BASE_URL } from '$lib/utils/base-url';

  export let data: PageData;

  let imageUrl = `/api/share-images/blog-post/og/${encodeURIComponent(data.meta.slug)}.png`;

  // Structured meta for SEO
  const ldJsonMetadata = `{
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "${sanitize(data.meta.title)}",
    "image": [
      "${BASE_URL}${sanitize(data.meta.coverImage)}"
      ],
    "datePublished": "${new Date(data.meta.date).toISOString()}",
    "author": [{
        "@type": "Person",
        "name": "${sanitize(data.meta.author?.name ?? 'Drips Team')}"
      }]
  }`;
</script>

<HeadMeta
  title="{data.meta.title} | Drips Blog"
  image={imageUrl}
  twitterImage="/api/share-images/blog-post/twitter/{encodeURIComponent(data.meta.slug)}.png"
  description={data.meta.excerpt}
  twitterCardType="summary"
/>

<svelte:head>
  {@html '<script type="application/ld+json">' + ldJsonMetadata + '</script>'}
</svelte:head>

<ModalLayout />

<article>
  <PostCard shareButton {imageUrl} {...data.meta} first={true} link={false} />
  <div class="content">
    <svelte:component this={data.PostContent} />
  </div>
</article>

<style>
  article {
    width: 78rem;
    max-width: calc(100vw - 2rem);
    padding-top: 1rem;
    display: flex;
    gap: 4rem;
    flex-direction: column;
  }

  .content {
    margin-top: 4rem;
    max-width: 44rem;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>

<script lang="ts">
  import PostCard from '$lib/components/blog/post-card/post-card.svelte';
  import BlogCategoryNav from '$lib/components/blog/blog-category-nav/blog-category-nav.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { BLOG_CATEGORY_LABELS } from '../../../../api/blog/posts/schema';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<HeadMeta
  title="Drips Blog — {BLOG_CATEGORY_LABELS[data.category]}"
  description="Read the latest {BLOG_CATEGORY_LABELS[
    data.category
  ].toLowerCase()} posts from the Drips team."
/>

<div class="category-picker">
  <BlogCategoryNav active={data.category} />
</div>

<div class="posts-grid">
  {#each data.posts as post, index (post.slug)}
    <PostCard {...post} first={index === 0} />
  {/each}
</div>

<style>
  .category-picker {
    margin-bottom: 1.5rem;
  }

  .posts-grid {
    display: grid;
    grid-template-columns: auto auto;
    gap: 1rem;
    padding: 4px 2px;
  }

  @media (max-width: 767px) {
    .posts-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

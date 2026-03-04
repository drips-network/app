<script lang="ts">
  import PostCard from '$lib/components/blog/post-card/post-card.svelte';
  import BlogCategoryNav from '$lib/components/blog/blog-category-nav/blog-category-nav.svelte';
  import BlogPagination from '$lib/components/blog/blog-pagination/blog-pagination.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import {
    BLOG_CATEGORY_LABELS,
    type BLOG_CATEGORIES,
  } from '../../../../routes/api/blog/posts/schema';
  import type { fetchBlogPosts } from '$lib/utils/blog-posts';

  interface Props {
    posts: Awaited<ReturnType<typeof fetchBlogPosts>>;
    category: 'all' | (typeof BLOG_CATEGORIES)[number];
    currentPage: number;
    totalPages: number;
  }

  let { posts, category, currentPage, totalPages }: Props = $props();

  let title = $derived(
    category === 'all' ? 'Drips Blog' : `Drips Blog — ${BLOG_CATEGORY_LABELS[category]}`,
  );

  let description = $derived(
    category === 'all'
      ? 'Read the latest on FOSS & Dependency Funding from the Drips team.'
      : `Read the latest ${BLOG_CATEGORY_LABELS[category].toLowerCase()} posts from the Drips team.`,
  );

  let basePath = $derived(category === 'all' ? '/blog' : `/blog/${category}`);
</script>

<HeadMeta {title} {description} />

<div class="category-picker">
  <BlogCategoryNav active={category} />
</div>

<div class="posts-grid">
  {#each posts as post, index (post.slug)}
    <PostCard {...post} first={index === 0 && currentPage === 1} />
  {/each}
</div>

<BlogPagination {currentPage} {totalPages} {basePath} />

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

<script lang="ts">
  import type { z } from 'zod';
  import type { postsListingSchema } from '../../../../api/blog/posts/schema';
  import Section from '$lib/components/section/section.svelte';
  import PenIcon from '$lib/components/icons/Pen.svelte';
  import EyeOpenIcon from '$lib/components/icons/EyeOpen.svelte';
  import PostCard from '$lib/components/blog/post-card/post-card.svelte';

  interface Props {
    blogPosts: z.infer<typeof postsListingSchema>;
    title?: string;
    compact?: boolean;
    maxPosts?: number;
    hideCategory?: boolean;
    actionLabel?: string;
    actionHref?: string;
    actionNewTab?: boolean;
    cardsNewTab?: boolean;
  }

  let {
    blogPosts,
    title = 'Latest news',
    compact = false,
    maxPosts = 2,
    hideCategory = false,
    actionLabel = 'Read the blog',
    actionHref = '/blog',
    actionNewTab = true,
    cardsNewTab = true,
  }: Props = $props();

  let sortedPosts = $derived(
    blogPosts
      .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, maxPosts),
  );
</script>

<Section
  header={{
    icon: PenIcon,
    label: title,
    actions: [
      {
        label: actionLabel,
        href: actionHref,
        target: actionNewTab ? '_blank' : undefined,
        icon: EyeOpenIcon,
      },
    ],
  }}
  skeleton={{ loaded: true, horizontalScroll: false }}
>
  <div class="posts-grid" class:compact>
    {#each sortedPosts as post (post.slug)}
      <PostCard newTab={cardsNewTab} {compact} {hideCategory} {...post} />
    {/each}
  </div>
</Section>

<style>
  .posts-grid {
    display: grid;
    grid-template-columns: auto auto;
    gap: 1rem;
    padding: 4px 2px;
  }

  .posts-grid.compact {
    grid-template-columns: repeat(auto-fill, minmax(24rem, 1fr));
  }

  @media (max-width: 767px) {
    .posts-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

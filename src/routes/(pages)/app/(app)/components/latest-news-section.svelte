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
  }

  let { blogPosts, title = 'Latest news' }: Props = $props();

  // 2 latest posts. Sort by date
  let sortedPosts = $derived(blogPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2));
</script>

<Section
  header={{
    icon: PenIcon,
    label: title,
    actions: [
      {
        label: 'Read the blog',
        href: '/blog',
        target: '_blank',
        icon: EyeOpenIcon,
      },
    ],
  }}
  skeleton={{ loaded: true, horizontalScroll: false }}
>
  <div class="posts-grid">
    {#each sortedPosts as post}
      <PostCard newTab {...post} />
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

  @media (max-width: 767px) {
    .posts-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

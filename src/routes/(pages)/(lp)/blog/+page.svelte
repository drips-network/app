<script lang="ts">
  import PostCard from '$lib/components/blog/post-card/post-card.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  const posts = data.posts;
</script>

<HeadMeta
  title="Drips Blog"
  description="Read the latest on FOSS & Dependency Funding from the Drips team."
/>

<div class="posts-grid">
  {#each posts as post, index}
    <PostCard {...post} first={index === 0} />
  {/each}
</div>

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

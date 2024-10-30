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

<div class="post-list">
  {#each posts as post, index}
    <PostCard {...post} first={index === 0} />
  {/each}
</div>

<style>
  .post-list {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    padding-top: 1rem;
  }
</style>

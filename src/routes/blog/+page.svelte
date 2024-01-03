<script lang="ts">
  import PostCard from '$lib/components/blog/post-card/post-card.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  const posts = data.posts;
</script>

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

<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="post-list">
  {#each data.posts as post}
    <a href="/blog/posts/{post.slug}">{post.title}</a>
  {/each}
</div>

<style>
  .post-list {
    display: flex;
    flex-direction: column;
  }
</style>

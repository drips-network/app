<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  const posts = data.posts;
</script>

<div class="post-list">
  {#each posts as post, index}
    <a class="post" class:first={index === 0} href="/blog/posts/{post.slug}">
      <img src={post.coverImage} alt={post.coverImageAlt} />
      <div class="content">
        {#if index === 0}
          <h1>{post.title}</h1>
        {:else}
          <h2 class="pixelated">{post.title}</h2>
        {/if}
        <p>{post.excerpt}</p>
      </div>
    </a>
  {/each}
</div>

<style>
  .post-list {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    padding-top: 1rem;
  }

  .post {
    border: 1px solid var(--color-foreground);
    display: flex;
    flex-direction: column;
    border-radius: 2rem 0 2rem 2rem;
    overflow: hidden;
    width: calc(50% - 1rem);
  }

  .post .content {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .post img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .post.first {
    width: 100%;
    flex-direction: row-reverse;
  }

  .post.first > * {
    width: 50%;
  }

  .post.first .content {
    justify-content: center;
  }
</style>

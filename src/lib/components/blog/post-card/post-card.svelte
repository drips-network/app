<script lang="ts">
  export let title: string;
  export let excerpt: string;
  export let date: string;
  export let slug: string;
  export let coverImage: string;
  export let coverImageAlt: string;

  export let first = false;

  export let link = true;

  $: formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
</script>

<svelte:element this={link ? 'a' : 'div'} class="post" class:first href="/blog/posts/{slug}">
  <img src={coverImage} alt={coverImageAlt} />
  <div class="content">
    {#if first}
      <h1>{title}</h1>
    {:else}
      <h2 class="pixelated">{title}</h2>
    {/if}
    <p class="typo-text-small">{formattedDate}</p>
    <p>{excerpt}</p>
  </div>
</svelte:element>

<style>
  .post {
    border: 1px solid var(--color-foreground);
    display: flex;
    flex-direction: column;
    border-radius: 2rem 0 2rem 2rem;
    overflow: hidden;
    width: 100%;
  }

  .post .content {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .post img {
    width: 100%;
    object-fit: cover;
  }

  .post.first {
    width: 100%;
  }

  .post.first .content {
    justify-content: center;
  }

  @media (min-width: 650px) {
    .post {
      width: calc(50% - 1rem);
    }

    .post.first {
      flex-direction: row-reverse;
    }

    .post.first > * {
      width: 50%;
    }
  }
</style>

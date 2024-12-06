<script lang="ts">
  import { page } from '$app/stores';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import type { z } from 'zod';
  import type { authorSchema } from '../../../../routes/api/blog/posts/schema';

  export let title: string;
  export let excerpt: string;
  export let date: string;
  export let slug: string;
  export let coverImage: string;
  export let coverImageAlt: string;
  export let imageUrl: string | undefined = undefined;
  export let author: z.infer<typeof authorSchema> | undefined = undefined;

  export let compact = false;
  export let newTab = false;

  export let first = false;

  export let link = true;
  export let shareButton = false;

  $: formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
</script>

<svelte:element
  this={link ? 'a' : 'div'}
  class:link
  class:share-button={shareButton}
  class="post"
  class:compact
  class:first
  href="/blog/posts/{slug}"
  target={newTab ? '_blank' : undefined}
>
  <img class="cover-image" src={coverImage} alt={coverImageAlt} />
  <div class="content">
    <div>
      {#if first}
        <h1>{title}</h1>
      {:else}
        <h2 class="pixelated">{title}</h2>
      {/if}
      <p class="metadata typo-text-small" style:color="var(--color-foreground-level-5)">
        {#if author}
          <img
            class="author-avatar"
            src={author.avatarUrl}
            alt={author.name}
            style="width: 1.5rem; height: 1.5rem; border-radius: 50%"
          />
          <span>{author.name}</span>
          <span>•</span>
        {/if}
        <span>{formattedDate}</span>
      </p>
      <p>{excerpt}</p>
    </div>
    {#if shareButton}
      <div style:width="fit-content">
        <ShareButton
          buttonVariant="normal"
          url={$page.url.toString()}
          downloadableImageUrl={imageUrl}
        />
      </div>
    {/if}
  </div>
</svelte:element>

<style>
  .post {
    display: flex;
    box-shadow: var(--elevation-low);
    flex-direction: column;
    border-radius: 2rem 0 2rem 2rem;
    overflow: hidden;
    width: 100%;
    min-width: 0;
    transition:
      background-color 0.3s,
      color 0.3s,
      transform 0.2s,
      box-shadow 0.2s,
      opacity 0.3s;
  }

  .post .metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    align-items: center;
  }

  .post .metadata .author-avatar {
    height: 1.5rem;
    width: 1.5rem;
    border-radius: 50%;
    display: inline-block;
    border: 1px solid var(--color-foreground);
  }

  .post.link:hover,
  .post.link:focus-visible {
    box-shadow:
      0px 0px 0px 1px var(--color-foreground),
      0 4px 0px 1px var(--color-foreground),
      inset 0 0px 0px 0px var(--color-foreground);
    transform: translateY(-4px);
  }

  .post.link:active {
    transform: translateY(0px);
    box-shadow:
      0px 0px 0px 1px var(--color-foreground),
      0 0px 0px 0px var(--color-foreground);
  }

  .post .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 1rem;
    gap: 1.5rem;
  }

  .post.share-button .content {
    justify-content: space-between;
  }

  .post .content div {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .post .cover-image {
    width: 100%;
    height: 40vw;
    object-fit: cover;
  }

  .post.first .cover-image {
    height: auto;
  }

  .post.compact .cover-image {
    height: 20vw;
  }

  .post.first {
    width: 100%;
  }

  .post.first .content div {
    justify-content: center;
  }

  @media (min-width: 1024px) {
    .post:not(.compact):not(.first) {
      width: calc(50% - 1rem);
    }

    .post .content {
      padding: 2rem;
    }

    .post .cover-image {
      height: 20rem;
    }

    .post.compact .cover-image {
      min-height: 10rem;
      max-height: 11rem;
    }

    .post.first {
      flex-direction: row-reverse;
    }

    .post.first > * {
      width: 50%;
    }
  }
</style>

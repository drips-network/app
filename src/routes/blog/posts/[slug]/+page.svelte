<script lang="ts">
  import ArticleContent from '$lib/components/blog/article-content/article-content.svelte';
  import PostCard from '$lib/components/blog/post-card/post-card.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<article>
  <PostCard {...data.meta} first={true} link={false} />
  <div class="content">
    <ArticleContent contentComponent={data.PostContent} />
  </div>
</article>

<style>
  article {
    width: 78rem;
    max-width: calc(100vw - 2rem);
    padding-top: 1rem;
    display: flex;
    gap: 4rem;
    flex-direction: column;
  }

  .content {
    margin-top: 4rem;
    max-width: 44rem;
    width: 100%;
    margin: 0 auto;
  }
</style>

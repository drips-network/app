<script lang="ts">
  interface Props {
    currentPage: number;
    totalPages: number;
    basePath: string;
  }

  let { currentPage, totalPages, basePath }: Props = $props();

  function pageHref(page: number) {
    if (page === 1) return basePath;
    return `${basePath}/page/${page}`;
  }

  let pages = $derived(Array.from({ length: totalPages }, (_, i) => i + 1));
</script>

{#if totalPages > 1}
  <nav class="blog-pagination" aria-label="Blog pagination">
    {#if currentPage > 1}
      <a class="typo-text nav-link" href={pageHref(currentPage - 1)}>← Previous</a>
    {:else}
      <span class="typo-text nav-link disabled">← Previous</span>
    {/if}

    <div class="page-numbers">
      {#each pages as page (page)}
        {#if page === currentPage}
          <span class="typo-text page-number current" aria-current="page">{page}</span>
        {:else}
          <a class="typo-text page-number" href={pageHref(page)}>{page}</a>
        {/if}
      {/each}
    </div>

    {#if currentPage < totalPages}
      <a class="typo-text nav-link" href={pageHref(currentPage + 1)}>Next →</a>
    {:else}
      <span class="typo-text nav-link disabled">Next →</span>
    {/if}
  </nav>
{/if}

<style>
  .blog-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 1rem 0;
  }

  .nav-link {
    text-decoration: none;
    color: var(--color-foreground);
    font-weight: 600;
  }

  .nav-link:hover,
  .nav-link:focus-visible {
    text-decoration: underline;
  }

  .nav-link.disabled {
    color: var(--color-foreground-level-4);
    pointer-events: none;
  }

  .page-numbers {
    display: flex;
    gap: 0.5rem;
  }

  .page-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    text-decoration: none;
    color: var(--color-foreground);
  }

  .page-number:hover,
  .page-number:focus-visible {
    background: var(--color-foreground-level-2);
  }

  .page-number.current {
    background: var(--color-foreground);
    color: var(--color-background);
    font-weight: 700;
  }
</style>

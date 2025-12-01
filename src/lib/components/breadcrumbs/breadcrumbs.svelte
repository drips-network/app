<script lang="ts">
  let {
    crumbs,
  }: {
    crumbs: { href?: string; label: string }[];
  } = $props();

  function isLast(index: number) {
    return index === crumbs.length - 1;
  }
</script>

<nav
  aria-label="Breadcrumbs"
  style:view-transition-name="breadcrumbs-{crumbs.map((c) => c.label).join('-')}"
>
  <ul class="breadcrumbs">
    {#each crumbs as crumb, index}
      <li class="breadcrumb">
        {#if isLast(index)}
          <span
            aria-current="page"
            class="typo-text-small-bold"
            style:color="var(--color-foreground)">{crumb.label}</span
          >
        {:else}
          <svelte:element
            this={crumb.href ? 'a' : 'span'}
            href={crumb.href}
            class="typo-text-small"
            style:color="var(--color-foreground-level-6)">{crumb.label}</svelte:element
          >
          <span class="separator" aria-hidden="true">/</span>
        {/if}
      </li>
    {/each}
  </ul>
</nav>

<style>
  .breadcrumbs {
    list-style: none;
    display: flex;
    gap: 0.5rem;
    padding: 0;
    margin: 0;
    user-select: none;
    view-transition-class: element-handover;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .separator {
    color: var(--color-foreground-level-4);
  }
</style>

<script lang="ts">
  import { BLOG_CATEGORIES, BLOG_CATEGORY_LABELS } from '../../../../routes/api/blog/posts/schema';

  interface Props {
    active: 'all' | (typeof BLOG_CATEGORIES)[number];
  }

  let { active }: Props = $props();

  const items: { label: string; value: string; href: string }[] = [
    { label: 'All', value: 'all', href: '/blog' },
    ...BLOG_CATEGORIES.map((c) => ({
      label: BLOG_CATEGORY_LABELS[c],
      value: c,
      href: `/blog/${c}`,
    })),
  ];
</script>

<nav class="blog-category-nav" aria-label="Blog categories">
  {#each items as item (item.href)}
    <a
      class="typo-text"
      class:active={active === item.value}
      href={item.href}
      style:view-transition-name="blog-category-{item.value}"
      style:view-transition-class="element-handover"
    >
      {item.label}
    </a>
  {/each}
</nav>

<style>
  .blog-category-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
    margin-top: 1rem;
    padding-left: 1rem;
  }

  a {
    text-decoration: none;
    color: var(--color-foreground-level-5);
    transition: color 0.2s;
  }

  a:hover,
  a:focus-visible {
    color: var(--color-foreground);
  }

  a.active {
    color: var(--color-foreground);
    font-weight: 700;
  }
</style>

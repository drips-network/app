<script lang="ts">
  import BlogPageLayout from '$lib/components/blog/blog-page-layout/blog-page-layout.svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<BlogPageLayout
  posts={data.posts}
  category="all"
  currentPage={data.currentPage}
  totalPages={data.totalPages}
/>

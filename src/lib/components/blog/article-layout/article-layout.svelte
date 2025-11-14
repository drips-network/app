<script lang="ts">
  import './article-content.css';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<div id="blog-article-content">
  {@render children?.()}
</div>

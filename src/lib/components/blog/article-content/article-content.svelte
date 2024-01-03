<script lang="ts">
  import './article-content.css';
  import type { SvelteComponent } from 'svelte';

  export let contentComponent: typeof SvelteComponent;
</script>

<div id="blog-article-content">
  <svelte:component this={contentComponent} />
</div>

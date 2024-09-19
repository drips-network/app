<script context="module">
  import BlogVideoPlayer from './components/blog-video-player.svelte';

  export { BlogVideoPlayer };
</script>

<script>
  import './article-content.css';
</script>

<div id="blog-article-content">
  <slot />
</div>

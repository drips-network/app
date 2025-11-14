<script lang="ts">
  import LpFooter from '../components/lp-footer.svelte';
  import './longform-text.css';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="wrapper legal-page">
  <div class="content">
    {@render children?.()}
  </div>

  <LpFooter />
</div>

<style>
  .wrapper {
    max-width: 80rem;
    width: 100vw;
    margin: 0 auto;
    padding: 1rem;
    padding-top: 6rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .content {
    max-width: 44rem;
    padding-top: 2rem;
  }
</style>

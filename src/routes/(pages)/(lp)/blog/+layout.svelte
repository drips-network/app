<script lang="ts">
  import LpFooter from '../components/lp-footer.svelte';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="wrapper">
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
    max-width: 80rem;
  }

  @media (max-width: 577px) {
    .wrapper {
      padding-top: 5rem;
    }
  }
</style>

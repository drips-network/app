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
    padding-top: calc(6rem + var(--incident-banner-offset, 0px));
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .content {
    max-width: 80rem;
    width: 100%;
    min-width: 0;
  }

  @media (max-width: 577px) {
    .wrapper {
      padding-top: calc(5rem + var(--incident-banner-offset, 0px));
    }
  }
</style>

<script>
  import LpHeader from '$lib/components/lp-header/lp-header.svelte';
  import LpFooter from '../components/lp-footer.svelte';
</script>

<div class="wrapper">
  <LpHeader />
  <div class="content">
    <slot />
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
      padding-top: 4rem;
    }
  }
</style>

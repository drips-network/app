<script>
  import PageTransition from '$lib/components/page-transition/page-transition.svelte';
  import LpFooter from '../components/lp-footer.svelte';
  import LpHeader from '../components/lp-header.svelte';

  export let data;
</script>

<div class="wrapper">
  <LpHeader />
  <PageTransition pathname={data.pathname}>
    <div class="content">
      <slot />
    </div>
    <LpFooter />
  </PageTransition>
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

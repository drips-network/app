<script>
  import LpHeader from '../components/lp-header.svelte';
</script>

<div class="wrapper">
  <LpHeader />
  <div class="content">
    <slot />
  </div>
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
    width: 44rem;
    padding-top: 2rem;
    padding-left: 1rem;
  }
</style>

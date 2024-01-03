<script>
  import Drip from '$lib/components/illustrations/drip.svelte';
  import RadworksLogo from '$lib/components/illustrations/radworks-logo.svelte';
  import PageTransition from '$lib/components/page-transition/page-transition.svelte';
  import LpHeader from '../components/lp-header.svelte';

  export let data;
</script>

<div class="wrapper">
  <LpHeader />
  <PageTransition pathname={data.pathname}>
    <div class="content">
      <slot />
    </div>
    <div class="blog-footer">
      <div>
        Built by the <span class="typo-text-bold" style:color="var(--color-foreground)"
          >Public Goods Association</span
        >
      </div>
      <div class="drip"><Drip fill="var(--color-foreground-level-5)" /></div>
      <div class="supported-by">
        Supported by <div class="radworks-logo"><RadworksLogo /></div>
      </div>
    </div>
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

  .blog-footer {
    display: flex;
    gap: 0.75rem;
    color: var(--color-foreground-level-5);
    align-items: center;
    justify-content: center;
    margin-top: 3rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .blog-footer > .supported-by {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .blog-footer > .drip {
    width: 0.6rem;
  }

  .blog-footer * {
    white-space: nowrap;
  }

  .blog-footer > .supported-by > .radworks-logo {
    height: 1.4rem;
    transform: translateY(0.1rem);
  }

  @media (max-width: 577px) {
    .wrapper {
      padding-top: 4rem;
    }
  }
</style>

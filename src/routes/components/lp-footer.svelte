<script>
  import Drip from '$lib/components/illustrations/drip.svelte';
  import RadworksLogo from '$lib/components/illustrations/radworks-logo.svelte';
</script>

<div class="lp-footer">
  <div>
    Built by the <span class="typo-text-bold" style:color="var(--color-foreground)"
      >Public Goods Association</span
    >
  </div>
  <div class="drip"><Drip fill="var(--color-foreground-level-5)" /></div>
  <a class="supported-by" href="https://radworks.org/" target="_blank" rel="noreferrer">
    Supported by <div class="radworks-logo"><RadworksLogo /></div>
  </a>
</div>

<style>
  .lp-footer {
    display: flex;
    gap: 0.75rem;
    color: var(--color-foreground-level-5);
    align-items: center;
    justify-content: center;
    margin-top: 3rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .lp-footer > .supported-by {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .lp-footer > .drip {
    width: 0.6rem;
  }

  .lp-footer * {
    white-space: nowrap;
  }

  .lp-footer > .supported-by > .radworks-logo {
    height: 1.4rem;
    transform: translateY(0.1rem);
  }
</style>

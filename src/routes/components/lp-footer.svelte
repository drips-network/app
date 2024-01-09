<script>
  import RadworksLogo from '$lib/components/illustrations/radworks-logo.svelte';
</script>

<div class="lp-footer">
  <div class="credits">
    <a class="supported-by" href="https://radworks.org/" target="_blank" rel="noreferrer">
      Supported by <div class="radworks-logo"><RadworksLogo /></div>
    </a>
  </div>

  <div class="legal">
    <div class="legal-links typo-text-small">
      <a href="/legal/privacy">Privacy Policy</a> •
      <a href="/legal/disclaimer">Disclaimer</a> •
      <a href="/legal/access">Access</a>
    </div>
  </div>
</div>

<style>
  .lp-footer .credits {
    display: flex;
    gap: 0.75rem;
    color: var(--color-foreground-level-5);
    align-items: center;
    justify-content: center;
    margin-top: 3rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .lp-footer > .credits > .supported-by {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .lp-footer * {
    white-space: nowrap;
  }

  .lp-footer > .credits > .supported-by > .radworks-logo {
    height: 1.4rem;
    transform: translateY(0.1rem);
  }

  .lp-footer > .legal {
    display: flex;
    justify-content: center;
    color: var(--color-foreground-level-5);
    margin-bottom: 2rem;
  }
</style>

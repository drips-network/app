<script>
  import DripsLogo from '$lib/components/header/drips-logo.svelte';
  import LegalLinks from '$lib/components/legal-links/legal-links.svelte';
</script>

<div class="flow-base-layout">
  <a href="/" class="logo">
    <DripsLogo />
  </a>
  <div class="content">
    <slot />
  </div>
  <LegalLinks />
</div>

<style>
  .flow-base-layout {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
    gap: 2rem;
    min-height: 100vh;
    padding: 1rem 0.5rem;
  }

  .content {
    width: 100%;
    max-width: 48rem;
    background-color: var(--color-background);
    box-shadow: var(--elevation-low);
    border-radius: 2rem 0 2rem 2rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .logo {
    width: 7rem;
    display: block;
  }
</style>

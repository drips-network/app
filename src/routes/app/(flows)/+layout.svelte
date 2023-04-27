<script>
  import DripsLogo from '$lib/components/header/drips-logo.svelte';
  import LegalLinks from '$lib/components/legal-links/legal-links.svelte';
  import { fly } from 'svelte/transition';
</script>

<div class="flow-base-layout" in:fly={{ duration: 300, y: 16 }}>
  <DripsLogo />
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
    min-height: 48rem;
    overflow: hidden;
  }
</style>

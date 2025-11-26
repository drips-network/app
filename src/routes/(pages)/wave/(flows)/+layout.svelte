<script lang="ts">
  import LegalLinks from '$lib/components/legal-links/legal-links.svelte';

  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="flow-base-layout">
  <a href="/" class="logo">
    <!-- todo logo -->
    Drips Wave
  </a>
  <div class="content" style:view-transition-name="flow-content">
    {@render children?.()}
  </div>
  <div style:view-transition-name="legal-links">
    <LegalLinks />
  </div>
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
    min-height: 20rem;
    background-color: var(--color-background);
    box-shadow: var(--elevation-low);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    padding: 1rem;
    gap: 1rem;
  }

  .logo {
    width: 7rem;
    display: block;
    view-transition-name: logo;
  }
</style>

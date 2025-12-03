<script lang="ts">
  import LegalLinks from '$lib/components/legal-links/legal-links.svelte';
  import ModalLayout from '$lib/components/modal-layout/modal-layout.svelte';
  import Header from '$lib/components/wave/header/header.svelte';
  import type { PageData } from '../(base-layout)/$types';

  interface Props {
    children?: import('svelte').Snippet;
    data: PageData;
  }

  let { children, data }: Props = $props();
</script>

<ModalLayout />

<div class="flow-base-layout">
  <div class="header-container">
    <Header
      pointsBalance={data.pointsBalance?.totalPoints || null}
      user={data.user}
      noBackground={false}
    />
  </div>

  <div class="content" style:view-transition-name="flow-content">
    {@render children?.()}
  </div>

  <div style:view-transition-name="legal-links">
    <LegalLinks />
  </div>
</div>

<style>
  .header-container {
    width: 100%;
    z-index: 5;
  }

  .flow-base-layout {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
    gap: 2rem;
    min-height: 100vh;
    max-width: 100vw;
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
</style>

<script lang="ts">
  import { page } from '$app/state';
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

<div class="flow-base-layout" class:fullscreen={page.data.waveFullscreenFlow}>
  <div class="header-container">
    <Header
      mobileNavItems={null}
      pointsBalance={data.pointsBalance?.totalPoints || null}
      user={data.user}
      noBackground={false}
      hidePoints
    />
  </div>

  <div
    class="content"
    class:fullscreen={page.data.waveFullscreenFlow}
    style:view-transition-name="flow-content"
  >
    {@render children?.()}
  </div>

  <div style:view-transition-name="legal-links">
    <ul class="links typo-text-small">
      <li>
        <a href="https://docs.drips.network/wave" target="_blank" rel="noreferrer">Docs</a>
      </li>
      <li>
        <a href="https://docs.drips.network/wave/terms-and-rules" target="_blank" rel="noreferrer"
          >Terms</a
        >
      </li>
      <li>
        <a href="/legal/privacy" target="_blank" rel="noreferrer">Privacy</a>
      </li>
      <li>
        <a href="/legal/disclaimer" target="_blank" rel="noreferrer">Disclaimer</a>
      </li>
    </ul>
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

  .flow-base-layout.fullscreen {
    gap: 0.5rem;
  }

  .content {
    width: calc(100% - 1rem);
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

  .content.fullscreen {
    width: 100%;
    max-width: min(calc(100vw - 2rem), 100rem);
    height: 100%;
    min-height: auto;
    padding: 0;
    flex: 1;
  }

  .links {
    padding: 0.5rem;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .links > li {
    color: var(--color-foreground-level-6);
  }

  .links > li:not(:last-child)::after {
    margin-left: 0.5rem;
    content: '•';
  }

  .links a {
    text-decoration: underline;
  }
</style>

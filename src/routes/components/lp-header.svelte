<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import DripsLogo from '$lib/components/illustrations/logo.svelte';
  import ThreeDrips from '$lib/components/illustrations/three-drips.svelte';
  import scrollStore from '$lib/stores/scroll/scroll.store';
  import mapRange from '$lib/utils/map-range';

  $: scrollPos = Math.max(
    Math.min($scrollStore.pos, ILLUSTRATION_SCROLL_POS_END) - ILLUSTRATION_SCROLL_POS_START,
    0,
  );

  const ILLUSTRATION_SCROLL_POS_START = 100;
  const ILLUSTRATION_SCROLL_POS_END = 400;

  $: logoOffset = mapRange(scrollPos, 0, ILLUSTRATION_SCROLL_POS_END, 0, 78);
</script>

<header class:raised={scrollPos > 10}>
  <div class="logo">
    <div class="inner" style:transform="translateY(-{logoOffset}px)">
      <ThreeDrips />
      <DripsLogo />
    </div>
  </div>
  <nav>
    <a href="https://github.com/radicle-dev" target="_blank"
      ><Button variant="ghost">Code</Button></a
    >
    <a href="https://v2.docs.drips.network/docs/whats-a-drip.html" target="_blank"
      ><Button variant="ghost">Docs</Button></a
    >
    <a class="cta" href="/app"><Button variant="primary">Open app</Button></a>
  </nav>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--color-foreground);
    padding: var(--spacing-s);
    border-radius: var(--border-radius-pointy);
    position: fixed;
    width: calc(78rem - 3px);
    max-width: calc(100vw - 2rem);
    z-index: 50;
    background-color: var(--color-background);
    transition: box-shadow 0.3s;
    overflow: hidden;
    top: 1rem;
  }

  header.raised {
    box-shadow: var(--elevation-medium);
  }

  .logo {
    margin-left: var(--spacing-xs);
    height: 28px;
  }

  .logo > .inner {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  nav {
    display: flex;
    gap: 0.5rem;
  }

  @media (max-width: 577px) {
    header {
      border: none;
      padding: 0;
      gap: 0.75rem;
      top: 0;
      left: 0;
      right: 0;
      max-width: 100vw;
      padding: 0.5rem;
      transform: none;
      border-radius: 0;
    }
    .logo {
      max-width: 100%;
    }

    nav {
      gap: 0;
    }
  }
</style>

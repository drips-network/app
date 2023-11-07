<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import DripsLogo from '$lib/components/illustrations/logo.svelte';
  import ThreeDrips from '$lib/components/illustrations/three-drips.svelte';
  import scrollStore from '$lib/stores/scroll/scroll.store';

  $: scrolledDown = $scrollStore.pos > 10;
  $: showLogo = true;
</script>

<header class:raised={scrolledDown}>
  <div class="left">
    <a aria-label="Go to homepage" class="logo" href="/">
      <div class="inner" class:logoOffset={showLogo}>
        <ThreeDrips />
        <DripsLogo />
      </div>
    </a>
  </div>
  <nav>
    <a href="https://github.com/drips-network" target="_blank" rel="noreferrer"
      ><Button variant="ghost">Code</Button></a
    >
    <a href="https://docs.drips.network" target="_blank" rel="noreferrer"
      ><Button variant="ghost">Docs</Button></a
    >
    <a class="cta" href="/app" data-sveltekit-preload-code="eager"
      ><Button variant="primary">Open app</Button></a
    >
  </nav>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--color-foreground);
    padding: 1rem;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 2.5rem 0 2.5rem 2.5rem;
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

  .left {
    display: flex;
    gap: 0.75rem;
  }

  .logo {
    margin-left: 0.5rem;
    height: 28px;
  }

  .logo .inner {
    transition: transform 0.3s;
  }

  .logo .inner.logoOffset {
    transform: translateY(-58px);
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
      border-bottom: 1px solid var(--color-foreground);
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
      max-width: 128px;
    }

    nav {
      gap: 0;
    }
  }
</style>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import DripsLogo from '$lib/components/illustrations/logo.svelte';
  import ThreeDrips from '$lib/components/illustrations/three-drips.svelte';
  import scrollStore from '$lib/stores/scroll/scroll.store';

  $: scrolledDown = $scrollStore.pos > 10;
  $: showLogo = $scrollStore.pos > 200;
</script>

<header class:raised={scrolledDown}>
  <div class="left">
    <a class="logo" href="/">
      <div class="inner" class:logoOffset={showLogo}>
        <ThreeDrips />
        <DripsLogo />
      </div>
    </a>
    <h5 class="beta-notice" class:logoOffset={showLogo}>Beta</h5>
  </div>
  <nav>
    <a href="https://github.com/radicle-dev" target="_blank" rel="noreferrer"
      ><Button variant="ghost">Code</Button></a
    >
    <a href="https://v2.docs.drips.network/docs/whats-a-drip.html" target="_blank" rel="noreferrer"
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
    padding: 1rem;
    border-radius: 2rem 0 2rem 2rem;
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

  .beta-notice {
    background-color: var(--color-caution-level-2);
    padding: 0.125rem 0.625rem 0.125rem 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2rem 0 2rem 2rem;
    transform: translateX(-40px);
    transition: transform 0.3s;
    user-select: none;
  }

  .beta-notice.logoOffset {
    transform: translateX(0);
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

    .beta-notice {
      display: none;
    }
  }
</style>

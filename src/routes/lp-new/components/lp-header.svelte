<script>
  import Button from '$lib/components/button/button.svelte';
  import DripsLogo from '../illustrations/logo.svelte';
</script>

<header>
  <div class="logo">
    <DripsLogo />
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
  }

  .logo {
    margin-left: var(--spacing-xs);
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
    }
    .logo {
      max-width: 100%;
    }

    nav {
      gap: 0;
    }
  }
</style>

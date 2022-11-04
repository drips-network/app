<script lang="ts">
  import scroll from '$lib/stores/scroll';
  import DripsLogo from 'src/routes/components/DripsLogo.svelte';

  $: elevated = $scroll.pos > 16;
</script>

<header class:elevated>
  <a sveltekit:prefetch href="/">
    <DripsLogo />
  </a>
  <div class="wallet">
    <ConnectButton />
  </div>
</header>

<style>
  header {
    height: 4rem;
    width: 100%;
    background-color: var(--color-background);
    position: fixed;
    top: 0;
    transition: box-shadow 0.3s;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
  }

  header.elevated {
    box-shadow: var(--elevation-medium);
  }

  .wallet {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>

<script lang="ts">
  import scroll from '$lib/stores/scroll';
  import BetaBadge from '../beta-badge/beta-badge.svelte';
  import ConnectButton from '../connect-button/connect-button.svelte';
  import SearchBar from '../search-bar/search-bar.svelte';
  import DripsLogo from '././drips-logo.svelte';
  import SettingsIcon from 'radicle-design-system/icons/Settings.svelte';
  import SearchIcon from 'radicle-design-system/icons/MagnifyingGlass.svelte';
  import { fade, fly } from 'svelte/transition';
  import { quadInOut, sineInOut } from 'svelte/easing';

  $: elevated = $scroll.pos > 16;

  let searchMode = false;
</script>

<header class:elevated class:search-mode={searchMode}>
  <a href={'/'}>
    <div class="logo">
      <DripsLogo />
    </div>
    <div class="beta-badge">
      <BetaBadge />
    </div>
  </a>
  {#if searchMode}
    <div class="search-bar" transition:fly|local={{ duration: 300, x: 64, easing: sineInOut }}>
      <SearchBar on:dismiss={() => (searchMode = false)} />
    </div>
  {/if}
  <div class="right">
    <div class="header-buttons">
      {#if !searchMode}
        <button
          class="header-button"
          on:click={() => (searchMode = true)}
          transition:fly|local={{ duration: 300, x: -64, easing: quadInOut }}
          data-testid="search-button"
        >
          <SearchIcon style="fill: var(--color-foreground)" />
        </button>
      {/if}
      <a class="header-button" href="/app/settings">
        <SettingsIcon style="fill: var(--color-foreground)" />
      </a>
    </div>
    <div class="connect">
      <ConnectButton />
    </div>
  </div>
</header>

{#if searchMode}
  <div class="search-background" transition:fade={{ duration: 300 }} />
{/if}

<style>
  header {
    height: 4rem;
    width: 100%;
    background-color: var(--color-background);
    transition: box-shadow 0.3s, background-color 0.5s;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
  }

  .logo {
    height: 1.5rem;
  }

  a {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  header.elevated {
    box-shadow: var(--elevation-low);
  }

  .right {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .header-buttons {
    display: flex;
    gap: 0.25rem;
  }

  .header-buttons > .header-button {
    border-radius: 1.5rem;
    height: 2.5rem;
    width: 2.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.3s, box-shadow 0.3s;
    cursor: pointer;
  }

  .header-buttons > .header-button:hover {
    background-color: var(--color-foreground-level-1);
  }

  .header-buttons > .header-button:focus-visible {
    background-color: var(--color-foreground-level-1);
    box-shadow: var(--elevation-low);
    outline: none;
  }

  .search-bar {
    position: fixed;
    top: 0.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 32rem;
    z-index: 100;
  }

  .search-background {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-background);
    opacity: 0.75;
    z-index: 50;
  }

  @media (max-width: 577px) {
    .beta-badge {
      display: none;
    }

    header {
      padding: 1rem;
    }
  }
</style>

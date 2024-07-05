<script lang="ts" context="module">
  import { gql } from 'graphql-request';
  import { COLLECT_BUTTON_WITHDRAWABLE_BALANCE_FRAGMENT } from '../collect-button/collect-button.svelte';

  export const HEADER_USER_FRAGMENT = gql`
    ${COLLECT_BUTTON_WITHDRAWABLE_BALANCE_FRAGMENT}
    fragment HeaderUser on User {
      withdrawableBalances {
        ...CollectButtonWithdrawableBalance
      }
    }
  `;
</script>

<script lang="ts">
  import scroll from '$lib/stores/scroll';
  import ConnectButton from '../connect-button/connect-button.svelte';
  import SearchBar from '../search-bar/search-bar.svelte';
  import DripsLogo from '$lib/components/illustrations/logo.svelte';
  import SettingsIcon from '$lib/components/icons/Settings.svelte';
  import SearchIcon from '$lib/components/icons/MagnifyingGlass.svelte';
  import { fade, fly } from 'svelte/transition';
  import { quadInOut, sineInOut } from 'svelte/easing';
  import Spinner from '../spinner/spinner.svelte';
  import CollectButton from '../collect-button/collect-button.svelte';
  import breakpointsStore from '$lib/stores/breakpoints/breakpoints.store';
  import type { HeaderUserFragment } from './__generated__/gql.generated';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import Flyout from '../flyout/flyout.svelte';
  import NetworkPicker from '../network-picker/network-picker.svelte';
  import NetworkList from '../network-picker/components/network-list.svelte';
  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';

  export let user: HeaderUserFragment | null;

  $: elevated = $scroll.pos > 16;

  export let showLoadingIndicator = true;

  let searchMode = false;

  let collectButtonPeeking: boolean;

  let networkPickerExpanded = false;
</script>

<header class:elevated class:search-mode={searchMode}>
  {#if !user || $breakpointsStore?.breakpoint === 'desktop' || $breakpointsStore?.breakpoint === 'desktopWide'}
    <a aria-label="Go to explore page" href={'/app'}>
      <div class="logo flex items-center pb-px">
        <DripsLogo />
      </div>
      {#if showLoadingIndicator}
        <div
          in:fly|global={{ duration: 300, y: -16 }}
          out:fly|global={{ duration: 300, y: 16 }}
          class="loading-indicator"
        >
          <Spinner />
        </div>
      {/if}
    </a>
  {/if}
  {#if $walletStore.connected && ($breakpointsStore?.breakpoint === 'mobile' || $breakpointsStore?.breakpoint === 'tablet')}
    <div data-highlightid="global-collect" class="collect mobile">
      <CollectButton
        withdrawableBalances={user?.withdrawableBalances}
        peekAmount={true}
        bind:isPeeking={collectButtonPeeking}
      />
    </div>
    <div />
  {:else}
    <!-- ensure nav items are right-aligned on mobile still even though nothing's on the left -->
    <div />
  {/if}
  {#if searchMode}
    <div class="search-bar" transition:fly={{ duration: 300, x: 64, easing: sineInOut }}>
      <SearchBar on:dismiss={() => (searchMode = false)} />
    </div>
  {/if}
  <div class="right" class:collect-button-peeking={collectButtonPeeking}>
    <div class="header-buttons">
      {#if !searchMode}
        <button
          class="header-button"
          on:click={() => (searchMode = true)}
          transition:fly={{ duration: 300, x: -64, easing: quadInOut }}
          data-testid="search-button"
          data-highlightid="search"
        >
          <SearchIcon style="fill: var(--color-foreground)" />
        </button>
      {/if}
      {#if !user}
        <a class="header-button" href="/app/settings">
          <SettingsIcon style="fill: var(--color-foreground)" />
        </a>

        <div class="network-picker">
          <div class="desktop-only">
            <div class="network-picker-flyout">
              <Flyout width="16rem" bind:visible={networkPickerExpanded}>
                <div slot="trigger">
                  <NetworkPicker
                    toggled={networkPickerExpanded}
                    on:click={() => (networkPickerExpanded = !networkPickerExpanded)}
                  />
                </div>
                <div slot="content">
                  <NetworkList />
                </div>
              </Flyout>
            </div>
          </div>
          <div
            class="mobile-only"
            role="button"
            tabindex="0"
            on:click={() => cupertinoPaneStore.openSheet(NetworkList, undefined)}
            on:keydown={() => cupertinoPaneStore.openSheet(NetworkList, undefined)}
          >
            <NetworkPicker />
          </div>
        </div>
      {/if}
    </div>
    <div class="connect">
      <ConnectButton />
    </div>
    {#if $walletStore.connected && ($breakpointsStore?.breakpoint === 'desktop' || $breakpointsStore?.breakpoint === 'desktopWide')}
      <div data-highlightid="global-collect" class="collect">
        <CollectButton withdrawableBalances={user?.withdrawableBalances} />
      </div>
    {/if}
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
    transition:
      box-shadow 0.3s,
      background-color 0.5s;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    gap: 0.5rem;
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
    gap: 0.5rem;
    align-items: center;
    transition: opacity 0.3s;
  }

  .right.collect-button-peeking {
    opacity: 0.5;
  }

  .header-buttons {
    display: flex;
  }

  .header-buttons > .header-button {
    border-radius: 1.5rem;
    height: 2.5rem;
    width: 2.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    transition:
      background-color 0.3s,
      box-shadow 0.3s;
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
    header {
      padding: 1rem;
    }

    .collect.mobile {
      position: absolute;
      z-index: 10;
    }
  }

  .network-picker-flyout {
    display: flex;
    align-items: center;
    margin-left: 0.5rem;
  }

  .network-picker {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .mobile-only {
    display: none;
  }

  @media (max-width: 768px) {
    .desktop-only {
      display: none;
    }

    .mobile-only {
      display: initial;
    }
  }
</style>

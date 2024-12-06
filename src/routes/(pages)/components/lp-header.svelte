<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Cross from '$lib/components/icons/Cross.svelte';
  import DripsLogo from '$lib/components/illustrations/logo.svelte';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import scrollStore from '$lib/stores/scroll/scroll.store';
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import NewAnimation from './new-animation.svelte';
  import twemoji from '$lib/utils/twemoji';

  $: scrolledDown = $scrollStore.pos > 10;

  export let announcementBanner:
    | {
        title: string;
        link: string;
      }
    | undefined = undefined;

  let firstRender = true;
  onMount(() => {
    firstRender = false;
  });

  $: dismissableKey = `announcementBanner-${announcementBanner?.title}`;

  function dismissAnnouncement() {
    dismissablesStore.dismiss(dismissableKey);
  }
  $: announcementBannerVisible =
    announcementBanner &&
    !$dismissablesStore.includes(dismissableKey) &&
    !firstRender &&
    !scrolledDown;
</script>

<header class:raised={scrolledDown} class:has-announcement-banner={announcementBannerVisible}>
  <div class="top">
    <div class="left">
      <a aria-label="Go to homepage" class="logo" href="/">
        <DripsLogo />
      </a>
    </div>
    <nav>
      <Button variant="ghost" href="/blog">Blog</Button>
      <Button variant="ghost" href="https://docs.drips.network" target="_blank" rel="noreferrer"
        >Docs</Button
      >
      <div data-sveltekit-preload-code="eager">
        <Button variant="primary" href="/app">Open app</Button>
      </div>
    </nav>
  </div>
  {#if announcementBannerVisible && announcementBanner}
    <div transition:slide|global={{ duration: 300 }} class="announcement-banner typo-text-bold">
      <div style:display="flex" style:gap="0.5rem" style:align-items="center">
        <NewAnimation />
        <a
          href={announcementBanner.link}
          target="_blank"
          class="typo-text-bold"
          style:display="flex"
          style:gap="0.5rem"
        >
          <span class="twemoji-text">{@html twemoji(announcementBanner.title)}</span>
        </a>
      </div>
      <div style:display="flex" style:gap="1rem">
        <a
          href={announcementBanner.link}
          target="_blank"
          class="typo-text"
          style:text-decoration="underline"
          style:white-space="nowrap">Learn more</a
        >
        <Cross on:click={dismissAnnouncement} style="fill: white; cursor: pointer;" />
      </div>
    </div>
  {/if}
</header>

<style>
  .announcement-banner {
    background-color: var(--color-primary);
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    color: white;
    align-items: center;
    width: 100%;
    padding: 0.75rem 1.5rem;
  }

  header {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--color-foreground);
    left: 50%;
    transform: translateX(-50%);
    border-radius: 2rem 0 2rem 2rem;
    position: fixed;
    width: calc(86rem - 3px);
    max-width: calc(100vw - 2rem);
    z-index: 50;
    background-color: var(--color-background);
    transition:
      box-shadow 0.3s,
      border-radius 0.3s;
    overflow: hidden;
    top: 1rem;
  }

  header.has-announcement-banner {
    border-radius: 2rem 0 2rem 2rem;
  }

  header .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 1rem;
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

  nav {
    display: flex;
    gap: 0.5rem;
  }

  @media (max-width: 1024px) {
    .announcement-banner {
      display: none;
    }
  }

  @media (max-width: 577px) {
    header {
      border: none;
      border-bottom: 1px solid var(--color-foreground);
      gap: 0.75rem;
      top: 0;
      left: 0;
      right: 0;
      max-width: 100vw;
      padding: 0.5rem;
      transform: none;
      border-radius: 0;
    }

    header.has-announcement-banner {
      border-radius: 0;
    }

    header .top {
      padding: 0;
      gap: 0.75rem;
    }

    .logo {
      max-width: 128px;
    }

    nav {
      gap: 0;
    }
  }
</style>

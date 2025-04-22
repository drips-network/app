<script lang="ts" context="module">
  export type AnnouncementBannerConfig = {
    title: string;
    link: string;
  };
</script>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Cross from '$lib/components/icons/Cross.svelte';
  import DripsLogo from '$lib/components/illustrations/logo.svelte';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import scrollStore from '$lib/stores/scroll/scroll.store';
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import NewAnimation from './new-animation.svelte';
  import twemoji from '$lib/utils/twemoji';
  import HeaderNavItem from './header-nav-item.svelte';

  $: scrolledDown = $scrollStore.pos > 10;

  export let announcementBanner: AnnouncementBannerConfig | undefined = undefined;

  let wrapper: Element;

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

  let openMenu: keyof typeof menus | null = null;
  let menuXOffset: number | null = null;

  const menus = {
    solutions: [
      { title: "Dependency Funding", href: "/solutions/dependency-funding" },
      { title: "RetroPGF Voting & Distribution", href: "/solutions/retro-pgf" },

    ],
    developers: [
      { title: "Protocol documentation", href: "/developers/sdk" },
      { title: "Code on GitHub", href: "/developers/api" },
      { title: "Development & Contributions Guide", href: "/developers/api" },
    ]
  }

  function handleMenuHover(slug: keyof typeof menus, e: Element) {
    openMenu = slug;
    menuXOffset = e.getBoundingClientRect().x - wrapper.getBoundingClientRect().x;
  }
</script>

{#if openMenu}
  <div transition:fade={{ duration: 100 }} class="bg" />
{/if}

<!-- svelte-ignore a11y-no-static-element-interactions -->
<header on:mouseleave={() => openMenu = null} bind:this={wrapper} class:raised={scrolledDown || openMenu} class:has-announcement-banner={announcementBannerVisible}>
  <div class="top">
    <div class="left">
      <a aria-label="Go to homepage" class="logo" href="/" on:mouseenter={() => openMenu = null} on:focus={() => openMenu = null} >
        <DripsLogo />
      </a>
      <nav>
        <HeaderNavItem tonedDown={Boolean(openMenu) && openMenu !== 'solutions'} dropdownActive={openMenu === 'solutions'} on:activate={(e) => handleMenuHover('solutions', e.detail)} dropdown href="wikipedia.com">
          Solutions
        </HeaderNavItem>
        <HeaderNavItem tonedDown={Boolean(openMenu)} on:activate={() => openMenu = null} href="wikipedia.com">How it works</HeaderNavItem>
        <HeaderNavItem tonedDown={Boolean(openMenu)} on:activate={() => openMenu = null} href="wikipedia.com">Blog</HeaderNavItem>
        <HeaderNavItem tonedDown={Boolean(openMenu) && openMenu !== 'developers'} dropdownActive={openMenu === 'developers'} on:activate={(e) => handleMenuHover('developers', e.detail)} dropdown href="wikipedia.com">For developers</HeaderNavItem>
      </nav>
    </div>
    <div data-sveltekit-preload-code="eager">
      <Button variant="primary" href="/app" on:mouseenter={() => openMenu = null}>Open app</Button>
    </div>
  </div>
  {#if openMenu}
    <div style:transform="translateX({menuXOffset}px)" transition:slide|global={{ duration: 300 }} class="menu">
      <div class="menu-content" style:padding-bottom="1.75rem">
        {#each menus[openMenu] as item}
          <HeaderNavItem href={item.href}>
            {item.title}
          </HeaderNavItem>
        {/each}
      </div>
    </div>
  {/if}
  {#if announcementBannerVisible && announcementBanner && !openMenu}
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
  .bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    backdrop-filter: blur(4px);
  }

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

  .menu {
    width: 100%;
  }

  .menu-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  nav {
    display: flex;
    gap: 1.25rem;
    align-items: center;
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
    gap: 2rem;
  }

  .logo {
    margin-left: 0.5rem;
    height: 28px;
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

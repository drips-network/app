<script lang="ts" context="module">
  export type AnnouncementBannerConfig = {
    title: string;
    link: string;
  };
</script>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Cross from '$lib/components/icons/Cross.svelte';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import scrollStore from '$lib/stores/scroll/scroll.store';
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import NewAnimation from './new-animation.svelte';
  import twemoji from '$lib/utils/twemoji';
  import HeaderNavItem from './header-nav-item.svelte';
  import Hamburger from '../icons/Hamburger.svelte';
  import DripsLogo from '../header/drips-logo.svelte';

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

  let openMenu: string | 'all' | null = null;
  let menuXOffset: number | null = null;

  // Define the types for the menu structure explicitly
  type MenuLink = { title: string; type: 'link'; href: string };
  type MenuDropdown = {
    title: string;
    type: 'dropdown';
    entries: { title: string; href: string }[];
  };
  type MenuItem = MenuLink | MenuDropdown;

  const menus: MenuItem[] = [
    // Add index signature for stricter typing
    {
      title: 'Solutions',
      type: 'dropdown',
      entries: [
        { title: 'Dependency Funding', href: '/solutions/dependency-funding' },
        { title: 'RetroPGF Voting & Distribution', href: '/solutions/retro-pgf' },
      ],
    },
    {
      title: 'How it works',
      type: 'link',
      href: '/how-it-works',
    },
    {
      title: 'Blog',
      type: 'link',
      href: '/blog',
    },
    {
      title: 'For developers',
      type: 'dropdown',
      entries: [
        {
          title: 'Protocol documentation',
          href: 'https://docs.drips.network/the-protocol/overview',
        },
        { title: 'Code on GitHub', href: 'https://github.com/drips-network' },
        {
          title: 'Development & Contributions Guide',
          href: 'https://github.com/drips-network/app/blob/main/docs/DEVELOPMENT.md',
        },
      ],
    },
  ];

  function handleMenuHover(slug: string | 'all', e?: Element) {
    openMenu = slug;
    if (slug === 'all') {
      menuXOffset = null;
    } else if (e && e instanceof HTMLElement) {
      menuXOffset = e.getBoundingClientRect().x - wrapper.getBoundingClientRect().x;
    }
  }

  $: allMenusSorted = [
    ...menus.filter((menu) => menu.type === 'link'),
    ...menus.filter((menu) => menu.type === 'dropdown'),
  ];
</script>

{#if openMenu}
  <div transition:fade={{ duration: 100 }} class="bg" />
{/if}

<!-- svelte-ignore a11y-no-static-element-interactions -->
<header
  on:mouseleave={() => (openMenu = null)}
  bind:this={wrapper}
  class:raised={scrolledDown || openMenu}
  class:has-announcement-banner={announcementBannerVisible}
  on:keydown={() => (openMenu = null)}
  on:focus={() => (openMenu = null)}
>
  <div class="top">
    <div class="left">
      <button
        class="hamburger"
        on:click={() => handleMenuHover('all')}
        on:mouseenter={() => (openMenu = null)}
        on:focus={() => (openMenu = null)}
      >
        <Hamburger />
      </button>
      <a
        aria-label="Go to homepage"
        class="logo"
        href="/"
        on:mouseenter={() => (openMenu = null)}
        on:focus={() => (openMenu = null)}
      >
        <DripsLogo />
      </a>
      <nav class="desktop-nav">
        {#each menus as menu}
          {#if menu.type === 'link'}
            <HeaderNavItem
              tonedDown={Boolean(openMenu)}
              on:activate={() => (openMenu = null)}
              on:navigate={() => (openMenu = null)}
              href={menu.href}
            >
              {menu.title}
            </HeaderNavItem>
          {:else if menu.type === 'dropdown'}
            <HeaderNavItem
              tonedDown={Boolean(openMenu) && openMenu !== menu.title}
              dropdownActive={openMenu === menu.title}
              on:activate={(e) => handleMenuHover(menu.title, e.detail)}
              dropdown
            >
              {menu.title}
            </HeaderNavItem>
          {/if}
        {/each}
      </nav>
    </div>
    <div data-sveltekit-preload-code="eager">
      <Button variant="primary" href="/app" on:mouseenter={() => (openMenu = null)}>Open app</Button
      >
    </div>
  </div>
  {#if openMenu}
    <div
      style:transform="translateX({menuXOffset}px)"
      transition:slide|global={{ duration: 300 }}
      class="menu"
    >
      {#if openMenu === 'all'}
        <div class="menu-content mobile-menu-content">
          {#each allMenusSorted as menu}
            {#if menu.type === 'link'}
              <HeaderNavItem href={menu.href} on:navigate={() => (openMenu = null)}
                >{menu.title}</HeaderNavItem
              >
            {/if}
            {#if menu.type === 'dropdown'}
              <h5>{menu.title}</h5>
              {#each menu.entries ?? [] as entry}
                <HeaderNavItem href={entry.href} on:navigate={() => (openMenu = null)}
                  >{entry.title}</HeaderNavItem
                >
              {/each}
            {/if}
          {/each}
        </div>
      {:else if openMenu && openMenu !== 'all'}
        {@const currentMenu = menus.find((menu) => menu.title === openMenu)}
        {#if currentMenu?.type === 'dropdown'}
          <div class="menu-content" style:padding-bottom="1.75rem">
            {#each currentMenu.entries as entry}
              <HeaderNavItem href={entry.href} on:navigate={() => (openMenu = null)}>
                {entry.title}
              </HeaderNavItem>
            {/each}
          </div>
        {/if}
      {/if}
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
    view-transition-name: header;
  }

  .menu {
    width: 100%;
  }

  .menu-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .mobile-menu-content {
    padding: 1rem 1.5rem 1.75rem; /* Add padding for mobile */
  }

  .mobile-menu-content h5 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: var(--color-foreground-secondary); /* Optional: Style title */
    font-weight: bold;
  }

  .mobile-menu-content h5:first-child {
    margin-top: 0;
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

  .hamburger {
    display: none;
  }

  @media (max-width: 1024px) {
    .announcement-banner {
      display: none;
    }
  }

  @media (max-width: 804px) {
    header,
    header.has-announcement-banner {
      border-radius: 1.5rem 0 1.5rem 1.5rem;
    }

    header .top {
      padding: 0.5rem 0.5rem;
    }

    header .left {
      padding-left: 0.5rem;
      gap: 0.5rem;
    }

    .logo {
      margin-left: 0.5rem;
      height: 24px;
    }

    .hamburger {
      display: flex;
      background: none;
      border: none;
      cursor: pointer;
    }

    .desktop-nav {
      display: none;
    }
  }
</style>

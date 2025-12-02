<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { PageProps } from './$types';
  import Header from '$lib/components/wave/header/header.svelte';
  import ModalLayout from '$lib/components/modal-layout/modal-layout.svelte';
  import { page } from '$app/state';
  import Nav from '$lib/components/wave/nav/nav.svelte';
  import Explore from '$lib/components/icons/Explore.svelte';
  import ExclamationCircle from '$lib/components/icons/ExclamationCircle.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import Orgs from '$lib/components/icons/Orgs.svelte';
  import Patch from '$lib/components/icons/Patch.svelte';
  import Settings from '$lib/components/icons/Settings.svelte';

  let {
    data,
    children,
  }: PageProps & {
    children: Snippet;
  } = $props();

  let sidenavExpanded = $state(false);
</script>

<ModalLayout />

<div class="header-container">
  <Header user={data.user} noBackground={page.data.waveHeaderBackground === false} />
</div>

<div class="layout-container">
  <div class="content" class:sidenavExpanded>
    {@render children()}
  </div>

  <div class="nav-wrapper">
    <Nav
      bind:isCurrentlyExpanded={sidenavExpanded}
      items={{
        top: [
          { type: 'target', name: 'Explore Waves', href: '/wave', icon: Explore },
          {
            type: 'collection',
            name: 'Contributors',
            items: [
              {
                type: 'target',
                name: 'Issues',
                href: '/wave/contributors/issues',
                icon: ExclamationCircle,
              },
            ],
          },
          {
            type: 'collection',
            name: 'Maintainers',
            items: [
              {
                type: 'target',
                name: 'Issues',
                href: '/wave/maintainers/issues',
                icon: ExclamationCircle,
              },
              {
                type: 'target',
                name: 'Orgs & repos',
                href: '/wave/maintainers/repos',
                icon: Orgs,
              },
              {
                type: 'target',
                name: 'Review queue',
                href: '/wave/maintainers/review-queue',
                icon: Patch,
              },
            ],
          },
        ],
        bottom: [
          {
            type: 'target',
            name: 'Settings',
            href: '/wave/settings',
            icon: Settings,
          },
          {
            type: 'target',
            name: 'Help',
            href: 'https://docs.drips.network/wave',
            newTab: true,
            icon: InfoCircle,
          },
        ],
      }}
    />
  </div>
</div>

<style>
  .header-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 5;
  }

  .content {
    grid-area: content;
    max-width: 120rem;
    width: 100%;
    margin: 0 auto;
    padding: 1rem 1rem 1rem 0;
    min-height: calc(100vh - 4rem);
    display: flex;
    height: fit-content;
    flex-direction: column;
    transition:
      transform 0.2s,
      opacity 0.2s;
  }

  .content.sidenavExpanded {
    transform: translateX(6rem);
    filter: blur(2px);
    opacity: 0.5;
    pointer-events: none;
  }

  .layout-container {
    margin-top: 4rem;
    display: grid;
    max-width: 100vw;
    grid-template-columns: 3rem 1fr;
    grid-template-areas: 'nav content';
    gap: 2rem;
    padding: 0rem 1rem 0 0;
    min-height: calc(100vh - 4rem);
  }

  .nav-wrapper {
    grid-area: nav;
    view-transition-name: sidenav;
    view-transition-class: element-handover;
    position: sticky;
    top: 4.5rem;
    height: 100%;
    max-height: calc(100vh - 4.5rem);
  }

  :root::view-transition-group(sidenav) {
    z-index: 10;
  }
</style>

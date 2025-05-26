<script lang="ts">
  import '../../styles/app.css';

  import '$lib/stores/theme/theme.store';

  import { onMount } from 'svelte';
  import scroll from '$lib/stores/scroll';
  import { afterNavigate, beforeNavigate, onNavigate } from '$app/navigation';
  import NavProgressBar from '$lib/components/nav-progress-bar/nav-progress-bar.svelte';

  onMount(() => {
    scroll.attach();
    return scroll.detach;
  });

  /*
  Smoothscroll class adds global smooth scrolling, but we donʼt want it
  while navigating, because that's nauseating.
  */

  beforeNavigate(() => {
    document.documentElement.classList.remove('smoothscroll');
  });

  afterNavigate(() => {
    document.documentElement.classList.add('smoothscroll');
  });

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<NavProgressBar color="var(--color-primary)" />

<div class="main" data-uifont="inter">
  <main class="page">
    <slot />
  </main>
</div>

<style>
  .main {
    min-height: 100vh;
    min-width: 100vw;
    background-color: var(--color-background);
    color: var(--color-foreground);
    transition: background-color 0.5s;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }

  @keyframes fade-out {
    to {
      opacity: 0;
    }
  }

  @keyframes slide-from-bottom {
    from {
      transform: translateY(30px);
    }
  }

  @keyframes slide-to-top {
    to {
      transform: translateY(-30px);
    }
  }

  :root::view-transition-old(root) {
    animation:
      110ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-top;
    transform-origin: 50% 50%;
  }

  :root::view-transition-new(root) {
    animation:
      210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-bottom;
  }

  @media (prefers-reduced-motion: reduce) {
    :root::view-transition-old(root),
    :root::view-transition-new(root) {
      animation: none;
    }
  }
</style>

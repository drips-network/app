<script lang="ts">
  import NavProgressBar from '$lib/components/nav-progress-bar/nav-progress-bar.svelte';
  import CookieConsentBanner from '$lib/components/wave/cookie-consent-banner/cookie-consent-banner.svelte';
  import FaroInitializer from '$lib/utils/faro/faro-initializer.svelte';
  import { PUBLIC_WAVE_API_URL } from '$lib/utils/wave/call';
  import breakpointsStore from '$lib/stores/breakpoints/breakpoints.store';
  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';
  import CupertinoPaneTarget from '$lib/stores/cupertino-pane/cupertino-pane-target.svelte';
  import { onMount, type Snippet } from 'svelte';

  let { children }: { children?: Snippet } = $props();

  onMount(() => {
    breakpointsStore.attach();
    return () => breakpointsStore.detach();
  });

  onMount(() => {
    cupertinoPaneStore.attach();
    return () => cupertinoPaneStore.detach();
  });
</script>

<svelte:head>
  {#if PUBLIC_WAVE_API_URL}
    <!-- No `crossorigin`: Wave API requests are credentialed, and browsers only
         reuse a preconnected socket for them if the hint omits `crossorigin`. -->
    <link rel="preconnect" href={PUBLIC_WAVE_API_URL} />
  {/if}
</svelte:head>

<div class="nav-progress-bar">
  <NavProgressBar color="var(--color-primary)" />
</div>

<FaroInitializer />

<CookieConsentBanner />

<CupertinoPaneTarget />

{@render children?.()}

<style>
  .nav-progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    view-transition-name: nav-progress-bar-wrapper;
  }
</style>

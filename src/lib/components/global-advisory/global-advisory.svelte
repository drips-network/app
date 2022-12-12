<script lang="ts">
  import { browser } from '$app/environment';
  import type {
    FatalGlobalAdvisory,
    NonFatalGlobalAdvisory,
  } from '$lib/stores/global-advisory/global-advisory.store';
  import globalErrorStore from '$lib/stores/global-advisory/global-advisory.store';
  import scroll from '$lib/stores/scroll';
  import { fly } from 'svelte/transition';
  import LargeEmptyState from '../large-empty-state/large-empty-state.svelte';

  let fatalAdvisory: FatalGlobalAdvisory | undefined;
  let nonFatalAdvisories: NonFatalGlobalAdvisory[] = [];

  $: {
    $globalErrorStore;
    fatalAdvisory = globalErrorStore.getAdvisories('fatal');
    nonFatalAdvisories = globalErrorStore.getAdvisories('non-fatal');
  }

  $: {
    if (browser && (fatalAdvisory || nonFatalAdvisories[0])) {
      scroll.lock();
    } else if (browser) {
      scroll.unlock();
    }
  }
</script>

{#if fatalAdvisory}
  <div class="bsod">
    <h1><span class="white-background">{fatalAdvisory.headline}</span></h1>
    <div class="description">
      {#if fatalAdvisory.description}
        <p>A fatal exception has occurred.</p>
        <p><i>{fatalAdvisory.description}</i></p>
      {:else}
        <p>An unknown fatal exception has occured.</p>
      {/if}
      <ul>
        <li><p>*&#8195&#8195 Press any key to reload this application.</p></li>
        <li><p>*&#8195&#8195 Ensure your browser is up-to-date.</p></li>
        <li><p>*&#8195&#8195 Try turning it on & off again.</p></li>
        <li>
          *&#8195&#8195<a href="https://discord.gg/vhGXkazpNc" target="_blank"
            >Get help on our Discord</a
          >
        </li>
      </ul>
    </div>
  </div>
{:else if nonFatalAdvisories[0]}
  <div
    class="non-fatal-error"
    in:fly|local={{ duration: 300, y: 16 }}
    out:fly|local={{ duration: 300, y: 16 }}
  >
    <LargeEmptyState
      headline={nonFatalAdvisories[0].headline}
      description={nonFatalAdvisories[0].description}
      emoji={nonFatalAdvisories[0].emoji}
      button={nonFatalAdvisories[0].button}
    />
  </div>
{/if}

<style>
  .bsod {
    position: fixed;
    z-index: 100;
    height: 100vh;
    width: 100vw;
    background-color: #0033bb;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 1rem;
  }

  .bsod h1,
  p,
  a {
    font-family: monospace;
    font-size: 1rem;
    max-width: 640px;
  }

  .bsod a {
    text-decoration: underline;
  }

  .bsod .white-background {
    background-color: #fff;
    color: #0033bb;
  }

  .bsod .description {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .non-fatal-error {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    background-color: var(--color-background);
    z-index: 100;
  }
</style>

<script lang="ts">
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Download from '$lib/components/icons/Download.svelte';
  import downloadUrl from '$lib/utils/download-url';
  import Link from '$lib/components/icons/Link.svelte';
  import X from '$lib/components/icons/X.svelte';
  import Facebook from '$lib/components/icons/Facebook.svelte';
  import Threads from '$lib/components/icons/Threads.svelte';
  import Telegram from '$lib/components/icons/Telegram.svelte';
  import WhatsApp from '$lib/components/icons/WhatsApp.svelte';
  import Signal from '$lib/components/icons/Signal.svelte';
  import Ellipsis from '$lib/components/icons/Ellipsis.svelte';

  export let url = '';
  export let downloadableImageUrl = '';
  export let text = '';

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: Link,
      onClick: () => {
        navigator.clipboard.writeText(url);
      },
    },
    {
      name: 'X (Twitter)',
      icon: X,
      onClick: () => {},
    },
    {
      name: 'Facebook',
      icon: Facebook,
      onClick: () => {},
    },
    {
      name: 'Threads',
      icon: Threads,
      onClick: () => {},
    },
    {
      name: 'Telegram',
      icon: Telegram,
      onClick: () => {},
    },
    {
      name: 'WhatsApp',
      icon: WhatsApp,
      onClick: () => {},
    },
    {
      name: 'Signal',
      icon: Signal,
      onClick: () => {},
    },
    {
      name: 'More',
      icon: Ellipsis,
      onClick: () => {},
    },
  ];

  function downloadImage() {
    const segments = new URL(window.location.origin + downloadableImageUrl + text).pathname.split(
      '/',
    );
    const last = segments.pop() || segments.pop(); // Handle potential trailing slash
    downloadUrl(downloadableImageUrl, last);
  }
</script>

<StepLayout>
  <div class="share-url">
    <div class="downloadable-image">
      <div class="downloadable-image__card">
        <img src={downloadableImageUrl || url} alt="downloadable header" />
      </div>
      <Button on:click={downloadImage} variant="normal" icon={Download}>Download</Button>
    </div>
    <div class="share-options pixelated">
      <h2 class="pixelated">Share</h2>
      <p>Share this project on a network of your choice below.</p>
      <div class="share-options__options">
        {#each shareOptions as option}
          <Button on:click={option.onClick} variant="normal" icon={option.icon}
            >{option.name}</Button
          >
        {/each}
      </div>
    </div>
  </div>
</StepLayout>

<style>
  .downloadable-image {
    position: relative;
    margin-bottom: 2rem;
  }

  .downloadable-image__card {
    border-radius: 1rem 0 1rem 1rem;
    box-shadow: var(--elevation-medium);
    background-color: var(--color-background);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    overflow: hidden;
  }

  .downloadable-image :global(button) {
    position: absolute;
    right: 1rem;
    bottom: -1rem;
  }

  .share-options {
    text-align: left;
  }

  .share-options__options {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 2rem;
  }

  .share-options__options :global(button) {
    width: calc(50% - 1rem);
  }

  .share-options__options :global(button .inner) {
    /* yoiks */
    justify-content: start !important;
  }
</style>

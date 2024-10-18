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
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import { browser } from '$app/environment';
  // TODO: why no SvelteComponent?
  import { type ComponentType } from 'svelte';

  export let url = '';
  export let downloadableImageUrl = '';
  export let text = '';

  const shareSupported = browser && navigator.share;

  type ShareOption = {
    name: string;
    icon: ComponentType;
    href?: string;
    onClick?: (this: ShareOption) => undefined;
  };

  function doAnchorClick(url: string) {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.target = '_blank';
    a.href = url;
    a.click();
    a.remove();
  }

  function copyShareLink() {
    navigator.clipboard.writeText(url);
    shareOptions[0].icon = CheckCircle;
    setTimeout(() => {
      shareOptions[0].icon = Link;
    }, 1000);
  }

  const shareOptions: Array<ShareOption> = [
    {
      name: 'Copy Link',
      icon: Link,
      onClick() {
        copyShareLink();
      },
    },
    {
      name: 'X (Twitter)',
      icon: X,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `http://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
    },
    {
      name: 'Threads',
      icon: Threads,
      href: `https://threads.net/intent/post?text=${encodeURIComponent(text)}${encodeURIComponent(url)}`,
    },
    {
      name: 'Telegram',
      icon: Telegram,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    },
    {
      name: 'WhatsApp',
      icon: WhatsApp,
      href: `https://wa.me/?text=${encodeURIComponent(text)}${encodeURIComponent(url)}`,
    },
    {
      name: 'Signal',
      icon: Signal,
      onClick() {
        copyShareLink();
        doAnchorClick('sgnl://signal.me');
        // Signal.me/something.
        // just opens the app really, could copy to clipboard beforehand
        // sgnl://signal.me
      },
    },
    {
      name: 'More',
      icon: Ellipsis,
      onClick() {
        if (shareSupported) {
          navigator.share({
            text,
            url,
          });
        } else {
          // copy the link
          copyShareLink();
        }
      },
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
        {#each shareOptions as option (option.icon)}
          <Button
            target="_blank"
            href={option.href}
            on:click={option?.onClick?.bind(option)}
            variant="normal"
            icon={option.icon}>{option.name}</Button
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

  .share-options__options :global(button),
  .share-options__options :global(a) {
    width: calc(50% - 1rem);
  }

  .share-options__options :global(button .inner),
  .share-options__options :global(a .inner) {
    /* yoiks */
    justify-content: start !important;
  }
</style>

<script lang="ts">
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import Button from '$lib/components/button/button.svelte';
  import DownloadIcon from '$lib/components/icons/Download.svelte';
  import downloadUrl from '$lib/utils/download-url';
  import LinkIcon from '$lib/components/icons/Link.svelte';
  import XIcon from '$lib/components/icons/X.svelte';
  import FacebookIcon from '$lib/components/icons/Facebook.svelte';
  import ThreadsIcon from '$lib/components/icons/Threads.svelte';
  import TelegramIcon from '$lib/components/icons/Telegram.svelte';
  import WhatsAppIcon from '$lib/components/icons/WhatsApp.svelte';
  import EllipsisIcon from '$lib/components/icons/Ellipsis.svelte';
  import CheckCircleIcon from '$lib/components/icons/CheckCircle.svelte';
  import CopyIcon from '$lib/components/icons/Copy.svelte';
  import EmailIcon from '$lib/components/icons/Email.svelte';
  import { fade } from 'svelte/transition';
  import { browser } from '$app/environment';
  import { type ShareOption } from '../share-steps';

  export let url: string = '';
  export let downloadableImageUrl: string = '';
  export let text: string = '';
  export let shareModalText: string = 'Share this on a network of your choice below.';

  const shareSupported = browser && navigator.share;

  let hovering = false;
  let copySuccess = false;

  function copyShareLink() {
    navigator.clipboard.writeText(url);
    copySuccess = true;
    setTimeout(() => (copySuccess = false), 1000);
  }

  const shareOptions: Array<ShareOption> = [
    {
      name: 'X (Twitter)',
      icon: XIcon,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Facebook',
      icon: FacebookIcon,
      href: `http://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: 'Threads',
      icon: ThreadsIcon,
      href: `https://threads.net/intent/post?text=${encodeURIComponent(text)}${encodeURIComponent(url)}`,
    },
    {
      name: 'Telegram',
      icon: TelegramIcon,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    },
    {
      name: 'WhatsApp',
      icon: WhatsAppIcon,
      href: `https://wa.me/?text=${encodeURIComponent(text)}${encodeURIComponent(url)}`,
    },
    {
      name: 'Email',
      icon: EmailIcon,
      href: `mailto:?body=${encodeURIComponent(url)}`,
    },
    {
      name: 'More',
      icon: EllipsisIcon,
      onClick() {
        if (shareSupported) {
          navigator.share({
            text,
            url,
          });
        } else {
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
    {#if downloadableImageUrl}
      <div class="downloadable-image">
        <div class="downloadable-image__card">
          <img src={downloadableImageUrl} alt="downloadable header" />
        </div>
        <Button on:click={downloadImage} variant="normal" icon={DownloadIcon}>Download</Button>
      </div>
    {/if}
    <div class="share-options pixelated">
      <h2 class="pixelated">Share</h2>
      <p>{shareModalText}</p>
      <div class="share-options__options">
        <Button
          on:mouseenter={() => (hovering = true)}
          on:focus={() => (hovering = true)}
          on:mouseleave={() => (hovering = false)}
          on:blur={() => (hovering = false)}
          on:click={copyShareLink}
        >
          <div class="button-inner">
            <div class="icon">
              {#if copySuccess}
                <span transition:fade={{ duration: 200 }}>
                  <CheckCircleIcon style="fill: var(--color-positive)" />
                </span>
              {:else if hovering}
                <span transition:fade={{ duration: 200 }}>
                  <CopyIcon style="fill: currentColor" />
                </span>
              {:else}
                <span transition:fade={{ duration: 200 }}
                  ><LinkIcon style="fill: currentColor" /></span
                >
              {/if}
            </div>
            Copy link
          </div>
        </Button>

        {#each shareOptions as option}
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
    aspect-ratio: 16/9;
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

  .button-inner {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    margin-left: -0.25rem;
  }

  .button-inner .icon {
    height: 2rem;
    width: 2rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border-radius: 1rem;
  }

  .button-inner .icon > * {
    position: absolute;
  }
</style>

<script lang="ts">
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import Button from '$lib/components/button/button.svelte';
  import DownloadIcon from '$lib/components/icons/Download.svelte';
  import downloadUrl from '$lib/utils/download-url';
  import XIcon from '$lib/components/icons/X.svelte';
  import FacebookIcon from '$lib/components/icons/Facebook.svelte';
  import ThreadsIcon from '$lib/components/icons/Threads.svelte';
  import TelegramIcon from '$lib/components/icons/Telegram.svelte';
  import WhatsAppIcon from '$lib/components/icons/WhatsApp.svelte';
  import EllipsisIcon from '$lib/components/icons/Ellipsis.svelte';
  import EmailIcon from '$lib/components/icons/Email.svelte';
  import { browser } from '$app/environment';
  import { type ShareOption } from '../share-steps';
  import CopyLinkButton from '$lib/components/copy-link-button/copy-link-button.svelte';

  export let url: string = '';
  export let downloadableImageUrl: string | undefined = undefined;
  export let text: string | undefined = undefined;
  export let shareModalText: string = 'Share this on a network of your choice below.';

  $: shareText = text || '';

  const shareSupported = browser && navigator.share;

  const shareOptions: ShareOption[] = [
    {
      name: 'X (Twitter)',
      icon: XIcon,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Facebook',
      icon: FacebookIcon,
      href: `http://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: 'Threads',
      icon: ThreadsIcon,
      href: `https://threads.net/intent/post?text=${encodeURIComponent(shareText)}${encodeURIComponent(url)}`,
    },
    {
      name: 'Telegram',
      icon: TelegramIcon,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'WhatsApp',
      icon: WhatsAppIcon,
      href: `https://wa.me/?text=${encodeURIComponent(shareText)}${encodeURIComponent(url)}`,
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
        if (!shareSupported) {
          return;
        }

        navigator.share({
          text,
          url,
        });
      },
    },
  ];

  function downloadImage() {
    if (!downloadableImageUrl) {
      return;
    }

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
        <span class="downloadable-image__button">
          <Button on:click={downloadImage} variant="normal" icon={DownloadIcon}>Download</Button>
        </span>
      </div>
    {/if}
    <div class="share-options pixelated">
      <h2 class="pixelated">Share</h2>
      <p>{shareModalText}</p>
      <div class="share-options__options">
        <CopyLinkButton {url} />

        {#each shareOptions as option}
          <Button
            target="_blank"
            href={option.href}
            on:click={option?.onClick?.bind(option)}
            variant="normal"
            icon={option.icon}
            justify="left">{option.name}</Button
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

  .downloadable-image .downloadable-image__button {
    position: absolute;
    right: 1rem;
    bottom: -1rem;
  }

  .share-options {
    text-align: left;
  }

  .share-options__options {
    display: grid;
    grid-template-columns: auto auto;
    gap: 1rem;
    margin-top: 2rem;
  }
</style>

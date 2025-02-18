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
  import configureProjectSupportButtonSteps from '$lib/flows/configure-project-support-button/configure-project-support-button-steps';
  import Settings from '$lib/components/icons/Settings.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let url: string;
  export let downloadableImageUrl: string | undefined = undefined;
  export let text: string | undefined = undefined;
  export let shareModalText: string = 'Share this on a network of your choice below.';
  export let supportButtonOptions:
    | Parameters<typeof configureProjectSupportButtonSteps>[0]
    | undefined = undefined;

  const shareText = text || '';

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

  function getUrlExtension(urlStr: string): string {
    const url = new URL(urlStr);
    const filename = url.pathname.split('/').at(-1);
    if (!filename) {
      return '';
    }

    return filename.split('.').at(-1) || '';
  }

  function downloadImage() {
    if (!downloadableImageUrl) {
      return;
    }

    const title = document.title.split(/\s?\|\s?/)[0].replace('/', '-');
    const extension = getUrlExtension(window.location.origin + downloadableImageUrl);
    downloadUrl(downloadableImageUrl, `${title}.${extension}`);
  }

  function handleEmbedButtonConfigureClick() {
    if (!supportButtonOptions) return;

    dispatch('sidestep', configureProjectSupportButtonSteps(supportButtonOptions));
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
    <div class="share-options">
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
    {#if supportButtonOptions}
      <div class="embed-options">
        <div>
          <h2 class="pixelated">Embed</h2>
          <p>Embed a support button on your website or README.</p>
        </div>
        <div
          style:display="flex"
          style:justify-content="space-around"
          style:flex-direction="column"
        >
          <Button icon={Settings} justify="left" on:click={handleEmbedButtonConfigureClick}
            >Configure</Button
          >
        </div>
      </div>
    {/if}
  </div>
</StepLayout>

<style>
  .share-url {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .downloadable-image {
    position: relative;
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

  .share-options,
  .embed-options {
    text-align: left;
  }

  .embed-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .share-options__options {
    display: grid;
    grid-template-columns: auto auto;
    gap: 1rem;
    margin-top: 2rem;
  }

  @media (max-width: 600px) {
    .embed-options {
      grid-template-columns: 1fr;
    }
  }
</style>

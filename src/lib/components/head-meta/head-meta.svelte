<script lang="ts">
  import { page } from '$app/stores';


  interface Props {
    title?: string;
    image?: string;
    twitterImage?: string;
    description?: string;
    twitterCardType?: 'summary' | 'summary_large_image';
  }

  let {
    title = 'Drips',
    image = '/assets/share/og-generic.png',
    twitterImage = '/assets/share/twitter-summary.png',
    description = 'Drips is the easiest way to fund Open Source in your ecosystem. Fund your dependencies with built-in dependency splitting, run RetroPGF rounds, and achieve any funding mechanism you can dream of.',
    twitterCardType = twitterImage === '/assets/share/twitter-summary.png' ? 'summary' : 'summary_large_image'
  }: Props = $props();

  let fullTitle = $derived(`${title}${title?.startsWith('Drips') ? '' : ' | Drips'}`);
</script>

<svelte:head>
  {#if fullTitle}
    <title>{fullTitle}</title>
    <meta property="og:title" content={fullTitle} />
    <meta name="twitter:title" content={fullTitle} />
  {/if}
  <meta name="description" content={description?.substring(0, 160)} />
  <meta property="og:image" content="https://{$page.url.host}{image}" />
  <meta property="og:description" content={description?.substring(0, 160)} />
  <meta name="twitter:description" content={description?.substring(0, 160)} />
  <meta name="twitter:image" content="https://{$page.url.host}{twitterImage}" />
  <meta name="twitter:card" content={twitterCardType} />
  <meta name="twitter:site" content="@dripsnetwork" />
</svelte:head>

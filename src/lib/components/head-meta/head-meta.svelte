<script lang="ts">
  import { page } from '$app/stores';

  export let title = 'Drips';
  export let image = '/assets/share/og-generic.png';
  export let twitterImage = '/assets/share/twitter-summary.png';
  export let description =
    'Drips is a decentralized toolkit for funding your critical software dependencies.';

  export let twitterCardType: 'summary' | 'summary_large_image' =
    twitterImage === '/assets/share/twitter-summary.png' ? 'summary' : 'summary_large_image';

  $: fullTitle = `${title}${title.startsWith('Drips') ? '' : ' | Drips'}`;
</script>

<svelte:head>
  {#if fullTitle}
    <title>{fullTitle}</title>
    <meta property="og:title" content={fullTitle} />
    <meta name="twitter:title" content={fullTitle} />
  {/if}
  <meta name="description" content={description} />
  <meta property="og:image" content="https://{$page.url.host}{image}" />
  <meta property="og:description" content={description} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content="https://{$page.url.host}{twitterImage}" />
  <meta name="twitter:card" content={twitterCardType} />
  <meta name="twitter:site" content="@dripsnetwork" />
</svelte:head>

<script lang="ts">
  import { page } from '$app/stores';

  export let title = 'Drips';
  export let image = '/assets/social-share.png';
  export let twitterImage = '/assets/social-share-twitter.png';
  export let description =
    'A Web3 toolkit that enables FOSS developers to raise funds, without any platform fees.';
</script>

<svelte:head>
  {#if title}
    <title>{title}{title.startsWith('Drips') ? '' : ' | Drips'}</title>
    <meta property="og:title" content="{title}{title.startsWith('Drips') ? '' : ' | Drips'}" />
  {/if}
  <meta name="description" content={description} />
  <meta property="og:image" content="https://{$page.url.host}{image}" />
  <meta property="og:description" content={description} />
  <meta name="twitter:title" content="Drips" />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content="https://{$page.url.host}{twitterImage}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@dripsnetwork" />
</svelte:head>

<script lang="ts">
  import { page } from '$app/stores';
  import { env } from '$env/dynamic/private';

  export let title = 'Drips';
  export let image = '/assets/share/og-generic.png';
  export let twitterImage = '/assets/share/twitter-summary.png';
  export let description =
    'A Web3 toolkit that enables FOSS developers to raise funds, without any platform fees.';

  export let twitterCardType: 'summary' | 'summary_large_image' =
    twitterImage === '/assets/share/twitter-summary.png' ? 'summary' : 'summary_large_image';

  $: fullTitle = `${title}${title.startsWith('Drips') ? '' : ' | Drips'}`;

  const pageUrl = env.DEPLOY_URL ?? `https://${$page.url.host}`;
</script>

<svelte:head>
  {#if fullTitle}
    <title>{fullTitle}</title>
    <meta property="og:title" content={fullTitle} />
    <meta name="twitter:title" content={fullTitle} />
  {/if}
  <meta name="description" content={description} />
  <meta property="og:image" content="{pageUrl}{image}" />
  <meta property="og:description" content={description} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content="{pageUrl}{twitterImage}" />
  <meta name="twitter:card" content={twitterCardType} />
  <meta name="twitter:site" content="@dripsnetwork" />
</svelte:head>

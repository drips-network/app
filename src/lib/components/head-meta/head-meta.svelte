<script lang="ts">
  import { page } from '$app/stores';

  export let title = 'Drips';
  export let image = '/assets/social-share.png';
  export let description =
    'A Web3 toolkit that enables FOSS developers to raise and manage funds by the second, without any platform fees.';
</script>

<svelte:head>
  <title>{title} | Drips</title>
  <meta property="og:title" content="{title} | Drips" />
  <meta property="og:image" content="https://{$page.url.host}{image}" />
  <meta property="og:description" content={description} />
  <meta name="twitter:title" content="Drips" />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content="https://{$page.url.host}{image}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@dripsnetwork" />
</svelte:head>

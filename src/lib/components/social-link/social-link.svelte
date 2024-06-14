<script lang="ts" context="module">
  type SocialNetwork = 'com.twitter' | 'com.github' | 'url' | 'ethereum';

  export function isNetwork(value: string): value is SocialNetwork {
    return ['com.twitter', 'com.github', 'url', 'ethereum'].includes(value);
  }
</script>

<script lang="ts">
  import X from '$lib/components/icons/X.svelte';
  import Web from '$lib/components/icons/Globe.svelte';
  import Ethereum from '$lib/components/icons/Ethereum.svelte';
  import Github from '$lib/components/icons/Github.svelte';
  import type { ComponentType } from 'svelte';
  import Copyable from '../copyable/copyable.svelte';
  import formatAddress from '$lib/utils/format-address';
  import buildExternalUrl from '$lib/utils/build-external-url';

  export let network: SocialNetwork;
  export let value: string;

  const icons: { [key in SocialNetwork]: ComponentType } = {
    ethereum: Ethereum,
    'com.twitter': X,
    'com.github': Github,
    url: Web,
  };

  $: icon = icons[network];

  // Undefined = No link. Empty string = link without prefix.
  const supportedOrigins: { [key in SocialNetwork]: string | undefined } = {
    ethereum: undefined,
    'com.twitter': 'https://twitter.com/',
    'com.github': 'https://github.com/',
    url: '',
  };

  $: origin = supportedOrigins[network];

  // handle people putting full URLs in their 'com.twitter' ENS records
  function getURLFromENSRecordValue(url: string) {
    try {
      const validURL = new URL(url);
      return validURL.href;
    } catch {
      // assume they just put their handle and add origin
      return `${origin}${value}`;
    }
  }

  function formatValue(input: string) {
    try {
      const url = new URL(input);
      return url.host + (url.pathname !== '/' ? url.pathname : '');
    } catch {
      return input.replaceAll('http://', '').replaceAll('https://', '');
    }
  }
</script>

<div class="social-link flex gap-[0.375rem] text-foreground">
  <svelte:component this={icon} style="fill: currentColor" />
  {#if origin !== undefined}
    <a
      target="_blank"
      rel="noreferrer"
      class="typo-text mouse:hover:underline"
      href={buildExternalUrl(getURLFromENSRecordValue(value))}>{formatValue(value)}</a
    >
  {:else if network === 'ethereum'}
    <div class="typo-text tabular-nums"><Copyable {value}>{formatAddress(value)}</Copyable></div>
  {/if}
</div>

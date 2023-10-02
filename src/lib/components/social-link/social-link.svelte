<script lang="ts">
  import X from 'radicle-design-system/icons/X.svelte';
  import Web from 'radicle-design-system/icons/Globe.svelte';
  import Ethereum from 'radicle-design-system/icons/Ethereum.svelte';
  import Github from 'radicle-design-system/icons/Github.svelte';
  import type { ComponentType } from 'svelte';
  import Copyable from '../copyable/copyable.svelte';
  import formatAddress from '$lib/utils/format-address';

  type SocialNetwork = 'com.twitter' | 'com.github' | 'url' | 'ethereum';

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
  const prefixes: { [key in SocialNetwork]: string | undefined } = {
    ethereum: undefined,
    'com.twitter': 'https://twitter.com/',
    'com.github': 'https://github.com/',
    url: '',
  };

  $: prefix = prefixes[network];

  // handle people putting full URLs in their 'com.twitter' ENS records
  function parseURL(url: string) {
    try {
      const validURL = new URL(url);
      return validURL.href;
    } catch {
      // assume they just put their handle
      return `${prefix}${value}`;
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
  {#if prefix !== undefined}
    <a
      target="_blank"
      rel="noreferrer"
      class="typo-text mouse:hover:underline"
      href={parseURL(value)}>{formatValue(value)}</a
    >
  {:else if network === 'ethereum'}
    <div class="typo-text tabular-nums"><Copyable {value}>{formatAddress(value)}</Copyable></div>
  {/if}
</div>

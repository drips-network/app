<script lang="ts">
  import Twitter from 'radicle-design-system/icons/Twitter.svelte';
  import Web from 'radicle-design-system/icons/Globe.svelte';
  import Ethereum from 'radicle-design-system/icons/Ethereum.svelte';
  import Github from 'radicle-design-system/icons/Github.svelte';
  import type { SvelteComponent } from 'svelte';
  import Copyable from '../copyable/copyable.svelte';
  import formatAddress from '$lib/utils/format-address';

  type SocialNetwork = 'com.twitter' | 'com.github' | 'url' | 'ethereum';

  export let network: SocialNetwork;
  export let value: string;

  const icons: { [key in SocialNetwork]: typeof SvelteComponent } = {
    ethereum: Ethereum,
    'com.twitter': Twitter,
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
  $: url = `${prefix}${value}`;
</script>

<div class="social-link">
  <svelte:component this={icon} />
  {#if prefix !== undefined}
    <a target="_blank" rel="noreferrer" class="typo-text-bold" href={url}>{value}</a>
  {:else if network === 'ethereum'}
    <p class="typo-text-bold"><Copyable {value}>{formatAddress(value)}</Copyable></p>
  {/if}
</div>

<style>
  .social-link {
    display: flex;
    gap: 0.25rem;
  }

  a,
  p {
    color: var(--color-foreground);
  }

  a:hover {
    text-decoration: underline;
  }
</style>

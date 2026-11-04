<script lang="ts" module>
  export type SocialNetwork =
    | 'com.twitter'
    | 'com.github'
    | 'url'
    | 'ethereum'
    | 'org.telegram'
    | 'com.discord'
    | 'com.instagram'
    | 'email';

  export function isNetwork(value: string): value is SocialNetwork {
    return [
      'com.twitter',
      'com.github',
      'url',
      'ethereum',
      'org.telegram',
      'com.discord',
      'com.instagram',
      'email',
    ].includes(value);
  }
</script>

<script lang="ts">
  import X from '$lib/components/icons/X.svelte';
  import Web from '$lib/components/icons/Globe.svelte';
  import Ethereum from '$lib/components/icons/Ethereum.svelte';
  import Github from '$lib/components/icons/Github.svelte';
  import Telegram from '$lib/components/icons/Telegram.svelte';
  import Discord from '$lib/components/icons/Discord.svelte';
  import Instagram from '$lib/components/icons/Instagram.svelte';
  import Email from '$lib/components/icons/Email.svelte';
  import type { Component } from 'svelte';
  import Tooltip from '../tooltip/tooltip.svelte';
  import formatAddress from '$lib/utils/format-address';
  import buildExternalUrl from '$lib/utils/build-external-url';

  interface Props {
    network: SocialNetwork;
    value: string;
  }

  let { network, value }: Props = $props();

  const icons: { [key in SocialNetwork]: Component } = {
    ethereum: Ethereum,
    'com.twitter': X,
    'com.github': Github,
    url: Web,
    'org.telegram': Telegram,
    'com.discord': Discord,
    'com.instagram': Instagram,
    email: Email,
  };

  let icon = $derived(icons[network]);

  // Undefined = No link. Empty string = link without prefix.
  const supportedOrigins: { [key in SocialNetwork]: string | undefined } = {
    ethereum: undefined,
    'com.twitter': 'https://twitter.com/',
    'com.github': 'https://github.com/',
    url: '',
    'org.telegram': 'https://t.me/',
    'com.discord': 'https://discord.com/users/',
    'com.instagram': 'https://instagram.com/',
    email: 'mailto:',
  };

  let origin = $derived(supportedOrigins[network]);

  // handle people putting full URLs in their ENS records
  function getURLFromENSRecordValue(url: string) {
    if (network === 'email') {
      return url.startsWith('mailto:') ? url : `mailto:${url}`;
    }
    try {
      const validURL = new URL(url);
      return validURL.href;
    } catch {
      // Strip leading @ for handle-based social networks
      const cleanedValue =
        network === 'org.telegram' || network === 'com.instagram' || network === 'com.twitter'
          ? url.replace(/^@/, '')
          : url;
      return `${origin}${cleanedValue}`;
    }
  }

  function formatValue(input: string) {
    if (network === 'email') {
      return input.replace(/^mailto:/i, '');
    }
    try {
      const url = new URL(input);
      return url.host + (url.pathname !== '/' ? url.pathname : '');
    } catch {
      return input.replaceAll('http://', '').replaceAll('https://', '');
    }
  }

  const SvelteComponent = $derived(icon);
</script>

<div class="social-link flex gap-[0.375rem] text-foreground">
  <SvelteComponent style="fill: currentColor" />
  {#if network === 'email'}
    <a class="typo-text mouse:hover:underline" href={getURLFromENSRecordValue(value)}
      >{formatValue(value)}</a
    >
  {:else if origin !== undefined}
    <a
      target="_blank"
      rel="noreferrer"
      class="typo-text mouse:hover:underline"
      href={buildExternalUrl(getURLFromENSRecordValue(value))}>{formatValue(value)}</a
    >
  {:else if network === 'ethereum'}
    <Tooltip text={value} copyable>
      <div class="typo-text tabular-nums">{formatAddress(value)}</div>
      {#snippet tooltip_content()}
        {value}
      {/snippet}
    </Tooltip>
  {/if}
</div>

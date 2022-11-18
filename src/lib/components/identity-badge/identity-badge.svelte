<script lang="ts">
  import { fade } from 'svelte/transition';

  import ensStore from '$lib/stores/ens';
  import { createIcon } from 'radicle-design-system/lib/blockies';
  import Avatar from '$lib/components/avatar/avatar.svelte';
  import { browser } from '$app/environment';
  import wallet from '$lib/stores/wallet';
  import formatAddress from '$lib/utils/format-address';

  export let address: string;
  export let showIdentity = true;
  export let showAvatar = true;
  export let hideAvatarOnMobile = false;
  export let disableLink = false;
  export let size: 'small' | 'normal' | 'medium' | 'big' | 'huge' | 'gigantic' = 'normal';

  export let avatarImgElem: HTMLImageElement | undefined = undefined;

  $: ensStore.lookup(address);
  $: ens = $ensStore[address];

  $: blockyUrl =
    (browser &&
      createIcon({
        seed: address.toLowerCase(),
        size: 8,
        scale: 16,
      }).toDataURL()) ||
    undefined;

  function getLink() {
    if (disableLink) return undefined;
    if (address === $wallet.address) return '/app/dashboard';

    return `/app/${ens?.name ?? address}`;
  }

  $: toDisplay = ens?.name ?? formatAddress(address);

  const sizes = {
    small: 16,
    normal: 24,
    medium: 32,
    big: 48,
    huge: 64,
    gigantic: 128,
  };
  $: currentSize = sizes[size];

  const fontClasses = {
    small: 'typo-text-small',
    normal: 'typo-text-bold',
    medium: 'typo-text-bold',
    big: 'typo-header-4',
    huge: 'typo-header-3',
    gigantic: 'typo-header-1',
  };
  $: currentFontClass = fontClasses[size];
</script>

<a href={getLink()} class="identity-badge" style:height={showAvatar ? `${currentSize}px` : ''}>
  {#if showAvatar}
    <Avatar
      size={currentSize}
      bind:imgElem={avatarImgElem}
      src={ens?.avatarUrl}
      placeholderSrc={blockyUrl}
    />
  {/if}
  {#if showIdentity}
    {#key toDisplay}
      <p
        transition:fade|local={{ duration: 300 }}
        class:mono={!ens?.name}
        class:foreground={size === 'gigantic'}
        class={`${currentFontClass} identity`}
        style:left={showAvatar ? `${currentSize + currentSize / 3}px` : '0'}
        class:hideOnMobile={hideAvatarOnMobile}
      >
        {toDisplay}
      </p>
    {/key}
    <p
      class:typo-text-mono-bold={!ens?.name}
      class={`${currentFontClass} identity-placeholder`}
      style:margin-left={`${currentSize / 3}px`}
      class:hideOnMobile={hideAvatarOnMobile}
    >
      {toDisplay}
    </p>
  {/if}
</a>

<style>
  .identity-badge {
    display: flex;
    align-items: center;
    color: var(--color-foreground-level-6);
    position: relative;
    text-align: left;
  }

  .mono {
    font-family: var(--typeface-mono-bold);
    white-space: nowrap;
  }

  .foreground {
    color: var(--color-foreground);
  }

  .identity {
    position: absolute;
    width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .identity-placeholder {
    opacity: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    .hideOnMobile {
      display: none;
    }
  }
</style>

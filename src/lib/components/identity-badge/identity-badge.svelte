<script lang="ts">
  import { fade } from 'svelte/transition';

  import ensStore from '$lib/stores/ens';
  import { createIcon } from 'radicle-design-system/lib/blockies';
  import Avatar from '$lib/components/user-avatar/user-avatar.svelte';
  import { browser } from '$app/environment';
  import wallet from '$lib/stores/wallet/wallet.store';
  import formatAddress from '$lib/utils/format-address';
  import Tooltip from '../tooltip/tooltip.svelte';

  export let address: string;
  export let showIdentity = true;
  export let showAvatar = true;
  export let hideAvatarOnMobile = false;
  export let disableLink = false;
  export let disableSelection = false;
  export let size: 'small' | 'normal' | 'medium' | 'big' | 'huge' | 'gigantic' = 'normal';
  export let disableTooltip = false;

  export let avatarImgElem: HTMLImageElement | undefined = undefined;
  export let isReverse = false;

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

  const fontClassesEns = {
    small: 'typo-text-small',
    normal: 'typo-text',
    medium: 'typo-text',
    big: 'typo-header-4',
    huge: 'typo-header-3',
    gigantic: 'typo-header-1',
  };
  $: currentFontClassEns = fontClassesEns[size];

  const fontClassesAddress = {
    tiny: 'typo-text-mono-small',
    small: 'typo-text-mono-small',
    normal: 'typo-text-mono',
    medium: 'typo-text-mono',
    big: 'typo-header-4 mono',
    huge: 'typo-header-3 mono',
    gigantic: 'typo-header-1 mono',
  };
  $: currentFontClassAddress = fontClassesAddress[size];

  $: currentFontClass = ens?.name ? currentFontClassEns : currentFontClassAddress;
</script>

<Tooltip text={address} copyable disabled={disableTooltip}>
  <svelte:element
    this={getLink() ? 'a' : 'span'}
    href={getLink()}
    class="identity-badge flex items-center relative text-left text-foreground"
    class:flex-row-reverse={isReverse}
    class:select-none={disableSelection}
    style:height={showAvatar ? `${currentSize}px` : ''}
    style:gap={showAvatar && showIdentity ? `${currentSize / 4}px` : ''}
  >
    {#if showAvatar}
      <Avatar
        size={currentSize}
        bind:imgElem={avatarImgElem}
        src={ens?.avatarUrl}
        placeholderSrc={blockyUrl}
      />
    {/if}
    {#if showIdentity}
      <div class="identity relative flex-1 max-w-full">
        <div
          class={`${currentFontClass} identity-ellipsis opacity-0 pointer-events-none`}
          class:hideOnMobile={hideAvatarOnMobile}
        >
          {toDisplay}
        </div>
        {#key toDisplay}
          <div
            transition:fade|local={{ duration: 300 }}
            class:foreground={size === 'gigantic'}
            class={`${currentFontClass} identity-ellipsis absolute overlay`}
            data-style:left={showAvatar ? `${currentSize + currentSize / 3}px` : '0'}
            class:hideOnMobile={hideAvatarOnMobile}
          >
            {toDisplay}
          </div>
        {/key}
      </div>
    {/if}
  </svelte:element>
  <svelte:fragment slot="tooltip-content">
    {address}
  </svelte:fragment>
</Tooltip>

<style>
  .identity-badge:focus {
    outline: none;
  }

  .identity-badge > .identity {
    transition: background-color 0.3s;
  }

  .identity-badge:focus > .identity {
    background-color: var(--color-primary-level-1);
    border-radius: 0.25rem;
  }

  .mono {
    font-family: var(--typeface-mono-regular);
    white-space: nowrap;
    font-style: normal;
  }

  .foreground {
    color: var(--color-foreground);
  }

  .identity-ellipsis {
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

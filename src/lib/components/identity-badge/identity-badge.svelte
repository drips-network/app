<script lang="ts">
  import { run } from 'svelte/legacy';

  import { fade } from 'svelte/transition';

  import ensStore from '$lib/stores/ens';
  import Avatar from '$lib/components/user-avatar/user-avatar.svelte';
  import formatAddress from '$lib/utils/format-address';
  import Tooltip from '../tooltip/tooltip.svelte';

  interface Props {
    address: string;
    showIdentity?: boolean;
    showAvatar?: boolean;
    hideAvatarOnMobile?: boolean;
    disableLink?: boolean;
    disableSelection?: boolean;
    size?: 'small' | 'normal' | 'medium' | 'big' | 'huge' | 'gigantic';
    disableTooltip?: boolean;
    linkToNewTab?: boolean;
    showFullAddress?: boolean;
    muted?: boolean;
    avatarImgElem?: HTMLImageElement | undefined;
    isReverse?: boolean;
    tag?: string | undefined;
    /**
     * If provided, this URL will be used for the avatar instead of the one fetched from the ENS store.
     * This is useful for contexts entirely rendered on the server (like share images) or to prevent flash of content on initial load.
     */
    avatarSrc?: string | undefined;
  }

  let {
    address,
    showIdentity = true,
    showAvatar = true,
    hideAvatarOnMobile = false,
    disableLink = false,
    disableSelection = false,
    size = 'normal',
    disableTooltip = false,
    linkToNewTab = false,
    showFullAddress = false,
    muted = false,
    avatarImgElem = $bindable(),
    isReverse = false,
    tag = undefined,
    avatarSrc = undefined,
  }: Props = $props();

  run(() => {
    ensStore.lookup(address);
  });
  let ens = $derived($ensStore[address]);

  let blockyUrl = $derived(`/api/blockies/${address}`);

  let link = $derived(disableLink ? undefined : `/app/${ens?.name ?? address}`);

  let toDisplay = $derived(ens?.name ?? (showFullAddress ? address : formatAddress(address)));

  const sizes = {
    small: 16,
    normal: 24,
    medium: 32,
    big: 48,
    huge: 64,
    gigantic: 128,
  };
  let currentSize = $derived(sizes[size]);

  const fontClassesEns = {
    small: 'typo-text-small',
    normal: 'typo-text',
    medium: 'typo-text',
    big: 'typo-header-4',
    huge: 'typo-header-3',
    gigantic: 'typo-header-1',
  };
  let currentFontClassEns = $derived(fontClassesEns[size]);

  const fontClassesAddress = {
    tiny: 'typo-text-small',
    small: 'typo-text-small',
    normal: 'typo-text',
    medium: 'typo-text',
    big: 'typo-header-4',
    huge: 'typo-header-3',
    gigantic: 'typo-header-1',
  };
  let currentFontClassAddress = $derived(fontClassesAddress[size]);

  let currentFontClass = $derived(ens?.name ? currentFontClassEns : currentFontClassAddress);
</script>

<Tooltip text={address} copyable disabled={disableTooltip}>
  <svelte:element
    this={link ? 'a' : 'span'}
    href={link}
    target={linkToNewTab ? '_blank' : undefined}
    class="identity-badge flex items-center relative text-left text-foreground tabular-nums {link &&
    showAvatar &&
    !showIdentity
      ? 'focus-visible:ring-8 focus-visible:ring-primary-level-1 rounded-full mouse:hover:ring-4 mouse:hover:ring-primary-level-1'
      : ''}"
    class:flex-row-reverse={isReverse}
    class:select-none={disableSelection}
    style:height={showAvatar ? `${currentSize}px` : ''}
    style:gap={showAvatar && showIdentity ? `${currentSize / 4}px` : ''}
    class:muted
  >
    {#if showAvatar}
      {#key ens?.avatarUrl + blockyUrl}
        <Avatar
          size={currentSize}
          bind:imgElem={avatarImgElem}
          src={avatarSrc ?? ens?.avatarUrl}
          placeholderSrc={blockyUrl}
        />
      {/key}
    {/if}
    {#if showIdentity}
      <div class="identity relative flex-1 min-w-0">
        <div
          class={`${currentFontClass} identity opacity-0 pointer-events-none flex items-center`}
          class:hideOnMobile={hideAvatarOnMobile}
        >
          {toDisplay}
          {#if ens?.name && showFullAddress}
            <div class="leading-none truncate">{address}</div>
          {/if}
        </div>
        {#key toDisplay}
          <div
            transition:fade={{ duration: 300 }}
            class:text-foreground={size === 'gigantic'}
            class={`${currentFontClass} identity absolute overlay flex items-center`}
            class:hideOnMobile={hideAvatarOnMobile}
          >
            <div class="flex-1 min-w-0">
              <div class="truncate">{toDisplay}</div>
              {#if ens?.name && showFullAddress}
                <div class="leading-none truncate text-foreground-level-5">
                  {address}
                </div>
              {/if}
            </div>
          </div>
        {/key}
      </div>
      {#if tag}
        <div class="tag typo-text-small">
          {tag}
        </div>
      {/if}
    {/if}
  </svelte:element>
  {#snippet tooltip_content()}
    {address}
  {/snippet}
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
    font-family: var(--typeface-regular);
    white-space: nowrap;
    font-style: normal;
  }

  .muted {
    color: var(--color-foreground-level-6);
  }

  .tag {
    background-color: var(--color-primary-level-1);
    color: var(--color-primary-level-6);
    border-radius: 1rem 0 1rem 1rem;
    padding: 0.125rem 0.5rem;
  }

  @media (max-width: 768px) {
    .hideOnMobile {
      display: none;
    }
  }
</style>

<script lang="ts">
  import { fade } from 'svelte/transition';

  import ensStore from '$lib/stores/ens';
  import { createIcon } from 'radicle-design-system/lib/blockies';
  import Avatar from '$lib/components/avatar/avatar.svelte';
  import { browser } from '$app/environment';

  export let address: string;
  export let showIdentity = true;
  export let showAvatar = true;
  export let size: 'normal' | 'big' | 'huge' | 'gigantic' = 'normal';

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

  function formatAddress(address: string) {
    const unpadded = address.replace('0x', '');
    return `${unpadded.substring(0, 4)}—${unpadded.slice(-4)}`;
  }

  $: toDisplay = ens?.name ?? formatAddress(address);

  const sizes = {
    normal: 24,
    big: 48,
    huge: 64,
    gigantic: 128,
  };
  $: currentSize = sizes[size];

  const fontClasses = {
    normal: 'typo-text-bold',
    big: 'typo-header-4',
    huge: 'typo-header-3',
    gigantic: 'typo-header-1',
  };
  $: currentFontClass = fontClasses[size];
</script>

<div class="identity-badge" style:height={showAvatar ? `${currentSize}px` : ''}>
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
      >
        {toDisplay}
      </p>
    {/key}
    <p class="typo-text-bold identity-placeholder" class:typo-text-mono-bold={!ens?.name}>
      {toDisplay}
    </p>
  {/if}
</div>

<style>
  .identity-badge {
    display: flex;
    gap: 0.5rem;
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
</style>

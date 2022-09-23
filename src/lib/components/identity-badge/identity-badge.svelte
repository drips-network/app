<script lang="ts">
  import { fade } from 'svelte/transition';

  import ensStore from '$lib/stores/ens';
  import { createIcon } from 'radicle-design-system/lib/blockies';
  import Avatar from '$lib/components/avatar/avatar.svelte';

  export let address: string;
  export let showIdentity = true;

  $: ensStore.lookup(address);
  $: ens = $ensStore[address];

  $: blockyUrl = createIcon({
    seed: address.toLowerCase(),
    size: 8,
    scale: 16,
  }).toDataURL();

  function formatAddress(address: string) {
    const unpadded = address.replace('0x', '');
    return `${unpadded.substring(0, 4)}—${unpadded.slice(-4)}`;
  }

  $: toDisplay = ens?.name ?? formatAddress(address);
</script>

<div class="identity-badge">
  <Avatar src={ens?.avatarUrl} placeholderSrc={blockyUrl} />
  {#if showIdentity}
    {#key toDisplay}
      <p
        transition:fade|local={{ duration: 300 }}
        class:typo-text-mono-bold={!ens?.name}
        class="typo-text-bold identity"
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
    color: var(--color-foreground-level-6);
    position: relative;
  }

  .identity {
    position: absolute;
    left: 2rem;
    width: 100%;
  }

  .identity-placeholder {
    opacity: 0;
  }
</style>

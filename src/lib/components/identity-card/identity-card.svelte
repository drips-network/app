<script lang="ts">
  import wallet from '$lib/stores/wallet';
  import { fade } from 'svelte/transition';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';

  export let address: string | undefined = undefined;
  export let title: string | undefined = undefined;
  export let disableLink = false;

  let avatarImgElem: HTMLImageElement | undefined;

  function getLink() {
    if (address === $wallet.address) return '/app/dashboard';

    return `/app/${address}`;
  }
</script>

<a href={disableLink ? undefined : getLink()} class="identity-card">
  {#if title}<p class="title typo-all-caps">{title}</p>{/if}
  {#if address}
    <div in:fade>
      <IdentityBadge size="huge" bind:avatarImgElem {address} showIdentity={false} />
    </div>
    <div in:fade><IdentityBadge size="huge" {address} showAvatar={false} /></div>
  {:else}
    <div class="avatar-placeholder" />
    <h3 class="name-placeholder">TBD</h3>
  {/if}
</a>

<style>
  .identity-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
    border: 1px solid var(--color-foreground-level-2);
    padding: 0.5rem;
    border-radius: 0.5rem;
    background-color: var(--color-foreground-level-1);
    user-select: none;
    width: 12rem;
  }

  .identity-card > * {
    width: 100%;
    text-align: left;
  }

  .title {
    margin-bottom: 0.5rem;
    line-height: 16px;
    color: var(--color-foreground-level-5);
  }

  .avatar-placeholder {
    height: 64px;
    width: 64px;
    background-color: var(--color-foreground-level-2);
    border-radius: 32px;
  }

  .name-placeholder {
    color: var(--color-foreground-level-5);
  }
</style>

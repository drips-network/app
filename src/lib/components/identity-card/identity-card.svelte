<script lang="ts">
  import { fade } from 'svelte/transition';
  import IdentityBadge from '../identity-badge/identity-badge.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import type { DripList } from '$lib/utils/metadata/types';
  import Ledger from 'radicle-design-system/icons/Ledger.svelte';

  // Either pass address or dripList. If neither, it'll say "TBD" as a placeholder.
  export let address: string | undefined = undefined;
  export let dripList: DripList | undefined = undefined;
  export let loading = false;
  export let title: string | undefined = undefined;
  export let disableLink = false;

  let avatarImgElem: HTMLImageElement | undefined;

  function getLink() {
    return dripList ? `/app/drip-lists/${dripList.account.accountId}` : `/app/${address}`;
  }
</script>

<a href={disableLink || loading ? undefined : getLink()} class="identity-card">
  {#if title}<p class="title typo-all-caps">{title}</p>{/if}
  {#if address}
    <div class="content-container" in:fade>
      <IdentityBadge
        {disableLink}
        size="huge"
        bind:avatarImgElem
        {address}
        showIdentity={false}
        disableTooltip
      />
      <IdentityBadge {disableLink} size="huge" {address} showAvatar={false} disableTooltip />
    </div>
  {:else if dripList}
    <div class="content-container" in:fade>
      <div class="icon">
        <Ledger style="fill: var(--color-background); height: 3rem; width: 3rem;" />
      </div>
      <span class="typo-header-3">{dripList.name}</span>
    </div>
  {:else if loading}
    <div class="spinner"><Spinner /></div>
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
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.75rem;
    border-radius: 1rem 0 1rem 1rem;
    user-select: none;
    width: 12rem;
    box-shadow: var(--elevation-medium);
    min-height: 11rem;
    position: relative;
  }

  .content-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .identity-card > * {
    width: 100%;
    text-align: left;
  }

  .title {
    margin-bottom: 0.5rem;
    line-height: 16px;
    color: var(--color-foreground);
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

  .spinner {
    flex: 1;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .icon {
    height: 4rem;
    width: 4rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-foreground);
    border-radius: 50%;
  }
</style>

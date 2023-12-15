<script lang="ts">
  import TokensIcon from 'radicle-design-system/icons/Coin.svelte';
  import UserIcon from 'radicle-design-system/icons/User.svelte';
  import sanitize from 'sanitize-html';

  import AccountMenuItem from '$lib/components/account-menu/components/account-menu-item.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import Token from '$lib/components/token/token.svelte';
  import StreamIcon from 'radicle-design-system/icons/TokenStreams.svelte';
  import { type Item, SearchItemType } from '../search';
  import wallet from '$lib/stores/wallet/wallet.store';
  import unreachable from '$lib/utils/unreachable';
  import Folder from 'radicle-design-system/icons/Folder.svelte';

  export let item: Item;
  export let highlighted: string;

  $: highlightPlainText = highlighted.replace(/<\/?[^>]+(>|$)/g, '');
</script>

{#if item.type === SearchItemType.STREAM}
  <AccountMenuItem
    on:click
    icon={StreamIcon}
    href={`/app/${item.item.sender.address}/tokens/${item.item.streamConfig.amountPerSecond.tokenAddress}/streams/${item.item.streamConfig.dripId}`}
  >
    <div class="icon" slot="title">
      <div class="highlighted">
        <span style="color: var(--color-foreground)">
          {#if highlightPlainText !== item.item.name}
            Stream ID:
          {/if}
        </span>{@html sanitize(highlighted, {
          allowedTags: [],
          allowedAttributes: {},
        })}
      </div>
      {#if highlightPlainText !== item.item.name && item.item.name}<div class="typo-text-small">
          {item.item.name}
        </div>{/if}
    </div>
  </AccountMenuItem>
{:else if item.type === SearchItemType.TOKEN}
  <AccountMenuItem
    on:click
    href={`/app/${$wallet.address ?? unreachable()}/tokens/${item.item.info.address}`}
  >
    <div class="icon" slot="left">
      <Token show="none" size="huge" address={item.item.info.address} />
      <div class="badge"><TokensIcon style="height: 1rem; fill: var(--color-foreground)" /></div>
    </div>
    <svelte:fragment slot="title">
      <div class="highlighted">
        {@html sanitize(highlighted, {
          allowedTags: [],
          allowedAttributes: {},
        })}
      </div>
      {#if highlightPlainText !== item.item.info.name}<div class="typo-text-small">
          {item.item.info.name}
        </div>{/if}
    </svelte:fragment>
  </AccountMenuItem>
{:else if item.type === SearchItemType.PROFILE}
  <AccountMenuItem
    icon={item.item.address ? undefined : UserIcon}
    on:click
    href={`/app/${item.item.name ?? item.item.address ?? item.item.dripsAccountId}`}
  >
    <div class="icon" slot="left">
      {#if item.item.address}<IdentityBadge
          disableLink={true}
          size="big"
          address={item.item.address}
          showIdentity={false}
          disableTooltip
        />{/if}
      <div class="badge"><UserIcon style="height: 1rem; fill: var(--color-foreground)" /></div>
    </div>
    <svelte:fragment slot="title">
      <div class="highlighted">
        <span style="color: var(--color-foreground)">
          {#if !item.item.name && !item.item.address && item.item.dripsAccountId}
            Jump to account ID:
          {/if}
        </span>
        {@html sanitize(highlighted, {
          allowedTags: [],
          allowedAttributes: {},
        })}
      </div>
      {#if highlightPlainText !== item.item.name && item.item.name}<div class="typo-text-small">
          {item.item.name}
        </div>{/if}
    </svelte:fragment>
  </AccountMenuItem>
{:else if item.type === SearchItemType.REPO}
  <AccountMenuItem
    on:click
    href={`/app/projects/${item.item.forge}/${item.item.username}/${item.item.repoName}`}
    icon={Folder}
  >
    <svelte:fragment slot="title">
      <div class="highlighted">
        <span style="color: var(--color-foreground)"> Jump to GitHub repo on Drips: </span>
        {@html sanitize(highlighted, {
          allowedTags: [],
          allowedAttributes: {},
        })}
      </div>
    </svelte:fragment>
  </AccountMenuItem>
{/if}

<style>
  .highlighted {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .badge {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    height: 1.5rem;
    width: 1.5rem;
    background-color: var(--color-background);
    box-shadow: var(--elevation-low);
    border-radius: 0.75rem;
    bottom: -0.25rem;
    right: -0.25rem;
  }

  .icon {
    position: relative;
  }
</style>

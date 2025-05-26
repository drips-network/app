<script lang="ts">
  import { page } from '$app/stores';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import type { WrappedRoundDraft } from '$lib/utils/rpgf/schemas';
  import Button from '../button/button.svelte';
  import EmojiAvatar from '../emoji-avatar/emoji-avatar.svelte';
  import Settings from '../icons/Settings.svelte';
  import ShareButton from '../share-button/share-button.svelte';

  export let isDraft = false;
  export let roundSlugOrDraftId: string | undefined = undefined;
  export let roundOrDraft: Pick<
    Partial<WrappedRoundDraft['draft']>,
    'name' | 'emoji' | 'color' | 'adminWalletAddresses'
  >;

  export let interactive = true;

  $: isAdmin = $walletStore.address
    ? roundOrDraft.adminWalletAddresses?.includes($walletStore.address.toLowerCase())
    : false;
</script>

<div class="rpgf-header-card">
  <div><EmojiAvatar emoji={roundOrDraft.emoji} color={roundOrDraft.color} size="huge" /></div>
  <div class="content">
    <h1 class:unnamed={!roundOrDraft.name}>
      {roundOrDraft.name ?? 'Unnamed round'}
      {#if isDraft}
        <span class="draft-badge typo-header-5">Draft</span>
      {/if}
    </h1>
    {#if interactive}
      <div class="actions">
        <ShareButton
          shareModalText={isDraft
            ? 'Note that this round draft can only be viewed by the configured round admins.'
            : ''}
          url={$page.url.toString()}
          buttonVariant="normal"
        />
        {#if isAdmin && roundSlugOrDraftId}
          <Button
            icon={Settings}
            href={isDraft
              ? `/app/rpgf/drafts/${roundSlugOrDraftId}/settings/representation`
              : `/app/rpgf/rounds/${roundSlugOrDraftId}/settings/representation`}>Settings</Button
          >
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .rpgf-header-card {
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    padding: 1rem;
    display: flex;
    gap: 2rem;
    align-items: center;
    view-transition-name: rpgf-header-card;
  }

  .draft-badge {
    display: inline-flex;
    vertical-align: middle;
    background-color: var(--color-caution-level-1);
    color: var(--color-caution-level-6);
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    margin-left: 0.2rem;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h1 {
    view-transition-name: rpgf-header-card-title;
  }

  .unnamed {
    color: var(--color-foreground-level-5);
  }

  :root::view-transition-old(rpgf-header-card):only-child,
  :root::view-transition-old(rpgf-header-card-title):only-child {
    animation:
      110ms cubic-bezier(0.4, 0, 1, 1) both default-transition-fade-out,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both default-transition-slide-to-top;
    transform-origin: 50% 50%;
  }

  :root::view-transition-new(rpgf-header-card):only-child,
  :root::view-transition-new(rpgf-header-card-title):only-child {
    animation:
      210ms cubic-bezier(0, 0, 0.2, 1) 90ms both default-transition-fade-in,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both default-transition-slide-from-bottom;
  }

  @media (max-width: 1024px) {
    .rpgf-header-card {
      flex-direction: column;
      align-items: flex-start;
    }

    h1 {
      font-size: 1.75rem;
      line-height: 2.25rem;
    }

    .actions {
      align-self: flex-end;
    }
  }
</style>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { deleteDraft } from '$lib/utils/rpgf/rpgf';
  import type { WrappedRoundDraft } from '$lib/utils/rpgf/schemas';
  import Button from '../button/button.svelte';
  import EmojiOrIpfsAvatar from '../emoji-or-ipfs-avatar/EmojiOrIpfsAvatar.svelte';
  import Settings from '../icons/Settings.svelte';
  import Trash from '../icons/Trash.svelte';
  import ShareButton from '../share-button/share-button.svelte';

  export let isDraft = false;
  export let roundSlugOrDraftId: string | undefined = undefined;
  export let roundOrDraft: Pick<
    Partial<WrappedRoundDraft['draft']>,
    'name' | 'emoji' | 'color' | 'adminWalletAddresses' | 'customAvatarCid'
  >;

  export let interactive = true;

  $: isAdmin = $walletStore.address
    ? roundOrDraft.adminWalletAddresses?.includes($walletStore.address.toLowerCase())
    : false;

  function handleDeleteDraft() {
    doWithConfirmationModal('Are you sure you want to delete this draft?', async () => {
      if (!roundSlugOrDraftId) {
        return;
      }

      await doWithErrorModal(() => deleteDraft(undefined, roundSlugOrDraftId));

      await goto('/app/rpgf');
    });
  }
</script>

<div class="rpgf-header-card">
  <div
    style:view-transition-name="rpgf-header-card-avatar-{roundSlugOrDraftId}"
    style:view-transition-class="element-handover"
  >
    <EmojiOrIpfsAvatar
      emoji={roundOrDraft.emoji}
      ipfsCid={roundOrDraft.customAvatarCid ?? undefined}
      size="huge"
    />
  </div>
  <div class="content">
    <h1 class:unnamed={!roundOrDraft.name}>
      {roundOrDraft.name || 'Unnamed round'}
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
        {#if isAdmin && isDraft}
          <Button variant="ghost" icon={Trash} on:click={handleDeleteDraft}>Delete draft</Button>
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

  .unnamed {
    color: var(--color-foreground-level-5);
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

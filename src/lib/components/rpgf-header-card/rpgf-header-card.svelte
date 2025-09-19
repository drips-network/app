<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { deleteRound } from '$lib/utils/rpgf/rpgf';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import Button from '../button/button.svelte';
  import EmojiOrIpfsAvatar from '../emoji-or-ipfs-avatar/EmojiOrIpfsAvatar.svelte';
  import Settings from '../icons/Settings.svelte';
  import Trash from '../icons/Trash.svelte';
  import ShareButton from '../share-button/share-button.svelte';

  export let round: Round;

  export let interactive = true;

  function handleDeleteDraft() {
    doWithConfirmationModal('Are you sure you want to delete this round?', async () => {
      await doWithErrorModal(() => deleteRound(undefined, round.id));

      await goto('/app/rpgf');
    });
  }
</script>

<div class="rpgf-header-card">
  <div
    style:view-transition-name="rpgf-header-card-avatar-{round.id}"
    style:view-transition-class="element-handover"
  >
    <EmojiOrIpfsAvatar
      emoji={round.emoji}
      ipfsCid={round.customAvatarCid ?? undefined}
      size="huge"
    />
  </div>
  <div class="content">
    <h1 class:unnamed={!round.name}>
      {round.name || 'Unnamed round'}
      {#if !round.published}
        <span class="draft-badge typo-header-5">Draft</span>
      {/if}
    </h1>
    {#if interactive}
      <div class="actions">
        <ShareButton
          shareModalText={!round.published
            ? 'Note that this round draft can only be viewed by the configured round admins.'
            : ''}
          url={$page.url.toString()}
          buttonVariant="normal"
          downloadableImageUrl={round.published
            ? `/api/share-images/rpgf-round/${encodeURIComponent(round.id)}.png?target=og`
            : undefined}
        />
        {#if round.isAdmin}
          <Button
            icon={Settings}
            dataTestId="rpgf-round-settings-button"
            href={`/app/rpgf/rounds/${round.urlSlug ?? round.id}/settings/representation`}
            >Settings</Button
          >
        {/if}
        {#if round.isAdmin && !round.published}
          <Button variant="destructive" icon={Trash} on:click={handleDeleteDraft}
            >Delete draft</Button
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
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-self: flex-end;
    }
  }
</style>

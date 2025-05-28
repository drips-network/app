<script context="module" lang="ts">
  export function intitialSettingsState(
    wrappedDraftOrRound: WrappedRoundDraft | WrappedRoundAdmin,
  ) {
    return wrappedDraftOrRound.type === 'round-draft'
      ? { ...wrappedDraftOrRound.draft }
      : { ...wrappedDraftOrRound.round };
  }
</script>

<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { patchRound, updateDraft } from '$lib/utils/rpgf/rpgf';
  import type {
    PatchRoundDraftDto,
    PatchRoundDto,
    WrappedRoundAdmin,
    WrappedRoundDraft,
  } from '$lib/utils/rpgf/schemas';
  import { onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';

  // TODO(rpgf): Proper existing round editing

  export let wrappedDraftOrRound: WrappedRoundDraft | WrappedRoundAdmin;
  $: draftOrRound =
    wrappedDraftOrRound.type === 'round-draft'
      ? wrappedDraftOrRound.draft
      : wrappedDraftOrRound.round;

  export let invalid = false;

  export let updatedRoundOrDraft: PatchRoundDraftDto | PatchRoundDto;

  $: haveFieldsChanged = false;
  $: {
    updatedRoundOrDraft;
    haveFieldsChanged = JSON.stringify(updatedRoundOrDraft) !== JSON.stringify(draftOrRound);
  }

  let saving = false;
  let success = false;

  let successTimeout: ReturnType<typeof setTimeout> | undefined;
  function resetSuccess() {
    if (successTimeout) {
      clearTimeout(successTimeout);
      successTimeout = undefined;
    }
    success = false;
  }
  function triggerSuccess() {
    resetSuccess();

    success = true;

    successTimeout = setTimeout(() => {
      success = false;
      successTimeout = undefined;
    }, 2000);
  }

  async function handleSave() {
    saving = true;
    resetSuccess();

    try {
      if (wrappedDraftOrRound.type === 'round-draft') {
        await doWithErrorModal(() =>
          updateDraft(undefined, wrappedDraftOrRound.id, updatedRoundOrDraft),
        );
      } else {
        await doWithErrorModal(() =>
          patchRound(undefined, wrappedDraftOrRound.round.urlSlug, updatedRoundOrDraft),
        );
      }

      await invalidateAll();

      triggerSuccess();
    } catch {
      // TODO(rpgf): Handle error with an error modal
      // eslint-disable-next-line no-console
      console.error('Error saving round or draft', updatedRoundOrDraft);
    } finally {
      saving = false;
    }
  }

  $: {
    // TODO(rpgf): Trigger confirmation dialog also when clicking a link on the page
    if (haveFieldsChanged) {
      // Trigger browser confirmation dialog
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = null;
    }
  }

  onDestroy(() => {
    window.onbeforeunload = null;
  });
</script>

<div class="rpgf-settings-form">
  <slot {updatedRoundOrDraft} />

  <div class="actions">
    {#if success}
      <div in:fly={{ y: 8, duration: 300 }} out:fly={{ y: -8, duration: 300 }}>
        <CheckCircle style="fill: var(--color-positive)" />
      </div>
    {/if}
    <Button
      variant="primary"
      loading={saving}
      on:click={handleSave}
      disabled={!haveFieldsChanged || invalid}>Save changes</Button
    >
  </div>
</div>

<style>
  .rpgf-settings-form {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    align-items: flex-end;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
</style>

<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import { updateDraft } from '$lib/utils/rpgf/rpgf';
  import type { RoundDraft } from '$lib/utils/rpgf/schemas';
  import { onDestroy } from 'svelte';

  export let roundOrDraft: RoundDraft;
  export let id: string;
  export let isDraft: boolean;
  export let invalid = false;

  export let updatedRoundOrDraft: typeof roundOrDraft;

  $: haveFieldsChanged = false;
  $: {
    updatedRoundOrDraft;
    haveFieldsChanged = JSON.stringify(updatedRoundOrDraft) !== JSON.stringify(roundOrDraft);
  }

  let saving = false;

  async function handleSave() {
    saving = true;

    try {
      if (isDraft) {
        await updateDraft(undefined, id, updatedRoundOrDraft);
      } else {
        // TODO(rpgf): update round
      }

      await invalidateAll();
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

  <div>
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
    gap: 2rem;
    align-items: flex-end;
  }
</style>

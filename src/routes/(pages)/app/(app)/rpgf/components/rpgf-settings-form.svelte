<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import { onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';

  // TODO(rpgf): Proper existing round editing

  export let round: Round;
  export let saveHandler: (() => Promise<void>) | undefined = undefined;

  export let saveEnabled = true;
  export let invalid = false;

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

    if (saveHandler) {
      await doWithErrorModal(saveHandler, () => {
        saving = false;
      });
    }

    await invalidateAll();

    triggerSuccess();
    saving = false;
  }

  $: {
    // TODO(rpgf): Trigger confirmation dialog also when clicking a link on the page
    if (saveEnabled) {
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

<PrimaryColorThemer colorHex={round.color}>
  <div class="rpgf-settings-form">
    <slot />

    {#if saveHandler}
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
          disabled={!saveEnabled || invalid}>Save changes</Button
        >
      </div>
    {/if}
  </div>
</PrimaryColorThemer>

<style>
  .rpgf-settings-form {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    align-items: flex-end;
  }

  .actions {
    padding: 1rem;
    margin: 0 -1rem;
    background: var(--color-background);
    display: flex;
    position: sticky;
    bottom: 0;
    width: calc(100% + 2rem);
    border-top: 1px solid var(--color-foreground-level-3);
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
  }

  @media (max-width: 768px) {
    .actions {
      bottom: 5rem;
    }
  }
</style>

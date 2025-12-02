<script lang="ts">
  import { run } from 'svelte/legacy';

  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';

  interface Props {
    saveHandler?: (() => Promise<void>) | undefined;
    saveEnabled?: boolean;
    invalid?: boolean;
    children?: import('svelte').Snippet;
    onSaveError?: (error: unknown) => void;
  }

  let {
    saveHandler = undefined,
    saveEnabled = true,
    invalid = false,
    children,
    onSaveError,
  }: Props = $props();

  let saving = $state(false);
  let success = $state(false);

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
    }, 1000);
  }

  async function handleSave() {
    saving = true;
    resetSuccess();

    if (saveHandler) {
      await doWithErrorModal(saveHandler, (e) => {
        saving = false;
        onSaveError?.(e);
      });
    }

    await invalidate('rpgf:round');

    triggerSuccess();
    saving = false;
  }

  run(() => {
    // TODO(rpgf): Trigger confirmation dialog also when clicking a link on the page
    if (saveEnabled) {
      // Trigger browser confirmation dialog
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = null;
    }
  });

  onDestroy(() => {
    window.onbeforeunload = null;
  });
</script>

<div class="rpgf-settings-form">
  {@render children?.()}

  {#if saveHandler}
    <div class="actions">
      {#if success}
        <div
          data-testid="success-indicator"
          in:fly={{ y: 8, duration: 300 }}
          out:fly={{ y: -8, duration: 300 }}
        >
          <CheckCircle style="fill: var(--color-positive)" />
        </div>
      {/if}
      <Button
        variant="primary"
        loading={saving}
        onclick={handleSave}
        disabled={!saveEnabled || invalid}>Save changes</Button
      >
    </div>
  {/if}
</div>

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

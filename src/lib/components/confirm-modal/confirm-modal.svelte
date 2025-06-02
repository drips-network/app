<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import modal from '$lib/stores/modal';
  import { onMount } from 'svelte';
  import Emoji from '../emoji/emoji.svelte';

  export let message: string;

  export let onConfirm: () => unknown | Promise<unknown>;

  let working = false;

  onMount(() => {
    modal.setHideable(false);
  });

  async function handleConfirm() {
    working = true;

    await onConfirm();

    working = false;
    modal.setHideable(true);
    modal.hide();
  }
</script>

<div class="confirmation-modal">
  <Emoji emoji="⚠️" size="huge" />
  <h1>Are you sure?</h1>
  <p>{message}</p>

  <div class="actions">
    <Button
      disabled={working}
      variant="normal"
      on:click={() => {
        modal.setHideable(true);
        modal.hide();
      }}>No, cancel</Button
    >
    <Button loading={working} variant="primary" on:click={handleConfirm}>Yes, continue</Button>
  </div>
</div>

<style>
  .confirmation-modal {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 1rem 0;
  }

  .actions {
    display: flex;
    gap: 1rem;
  }
</style>

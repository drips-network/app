<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import modal from '$lib/stores/modal';
  import { onMount } from 'svelte';
  import Emoji from '../emoji/emoji.svelte';

  interface Props {
    message: string;
    onConfirm: () => unknown | Promise<unknown>;
  }

  let { message, onConfirm }: Props = $props();

  let working = $state(false);

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
      onclick={() => {
        modal.setHideable(true);
        modal.hide();
      }}>No, cancel</Button
    >
    <Button loading={working} variant="destructive" onclick={handleConfirm}>Yes, continue</Button>
  </div>
</div>

<style>
  .confirmation-modal {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 2rem 1rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
  }
</style>

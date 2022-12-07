<script lang="ts">
  import modal from '$lib/stores/modal/index';
  import Cross from 'radicle-design-system/icons/Cross.svelte';
  import { fade, scale } from 'svelte/transition';
  import Modal from './components/modal.svelte';

  const modalStore = modal.store;

  $: store = $modalStore;

  const clickOutside = () => {
    modal.hide();
  };

  const pressEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      modal.hide();
    }
  };
</script>

<svelte:window on:keydown={pressEscapeKey} />

{#if store.overlay !== null}
  <div class="modal-layout" data-cy="modal-layout">
    <div class="overlay" transition:fade|local={{ duration: 300 }} on:click={clickOutside} />
    <div class="content">
      <div class="modal-wrapper" transition:scale={{ start: 0.97, duration: 300 }}>
        <Modal>
          {#if store.hideable}
            <div class="close-button" on:click={modal.hide}>
              <Cross style="fill: var(--color-foreground)" />
            </div>
          {/if}
          <svelte:component
            this={store.overlay.modalComponent}
            {...store.overlay.modalComponentProps}
          />
        </Modal>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-layout {
    height: 100%;
    width: 100%;
    position: fixed;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: scroll;
  }

  .overlay {
    background-color: var(--color-background);
    opacity: 0.75;
    height: 100%;
    width: 100%;
    position: fixed;
  }

  .modal-wrapper {
    position: relative;
  }

  .close-button {
    position: absolute;
    right: 0;
    top: 0;
    height: 2.25rem;
    width: 2.25rem;
    border-radius: 0 0 0 1.25rem;
    z-index: 10;
    padding-left: 0.4rem;
    padding-top: 0.3rem;
    cursor: pointer;
    border: 1px solid var(--color-foreground);
    border-right: none;
    border-top: none;
  }

  .close-button:hover {
    background-color: var(--color-foreground-level-1);
  }

  .content {
    z-index: 200;
    margin: auto;
  }
</style>

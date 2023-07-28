<script lang="ts">
  import modal from '$lib/stores/modal/index';
  import Cross from 'radicle-design-system/icons/Cross.svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import FocusTrap from '../focus-trap/focus-trap.svelte';
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

  let modalContainer: HTMLDivElement;
</script>

<svelte:window on:keydown={pressEscapeKey} />

{#if store.overlay !== null}
  <FocusTrap enabled={store.focusTrapped} containers={new Set([modalContainer])} />
  <div bind:this={modalContainer} class="modal-layout" data-cy="modal-layout">
    <div
      class="overlay"
      transition:fade={{ duration: 200 }}
      on:click={clickOutside}
      on:keydown={clickOutside}
    />
    <div class="content">
      <div
        class="modal-wrapper"
        in:scale={{ start: 0.97, duration: 300, delay: 150 }}
        out:scale={{ start: 0.97, duration: 200 }}
      >
        <Modal>
          <svelte:component
            this={store.overlay.modalComponent}
            {...store.overlay.modalComponentProps}
          />
          {#if store.hideable}
            <div class="close-button-wrapper">
              <button
                transition:fly={{ duration: 200, y: -4, x: 4 }}
                class="close-button"
                on:click={modal.hide}
              >
                <Cross style="fill: var(--color-foreground)" />
              </button>
            </div>
          {/if}
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
    opacity: 0.85;
    height: 100%;
    width: 100%;
    position: fixed;
  }

  .modal-wrapper {
    position: relative;
  }

  .close-button-wrapper {
    overflow: hidden;
    position: absolute;
    right: 0;
    top: 0;
  }

  .close-button {
    height: 2.25rem;
    width: 2.25rem;
    border-radius: 0 0 0 1.25rem;
    z-index: 10;
    cursor: pointer;
    border: 1px solid var(--color-foreground);
    background-color: var(--color-background);
    border-right: none;
    border-top: none;
    transition: border 0.3s, box-shadow 0.3s;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .close-button:hover {
    background-color: var(--color-foreground-level-1);
  }

  .close-button:focus {
    background-color: var(--color-foreground-level-1);
    box-shadow: inset 0px 0px 0px 1px var(--color-foreground);
  }

  .content {
    z-index: 200;
    margin: auto;
  }
</style>

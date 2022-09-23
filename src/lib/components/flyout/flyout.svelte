<script lang="ts">
  import { fly } from 'svelte/transition';

  export let direction: 'left' | 'right' = 'left';

  let visible = false;

  function handleHover(hovering: boolean) {
    visible = hovering;
  }
</script>

<div class="flyout">
  <div
    class="trigger"
    tabindex="0"
    on:mouseenter={() => handleHover(true)}
    on:focus={() => handleHover(true)}
    on:mouseleave={() => handleHover(false)}
    on:blur={() => handleHover(false)}
  >
    <div class="trigger-content">
      <slot name="trigger" />
    </div>
    {#if visible}
      <div transition:fly|local={{ y: 8 }} class="content" class:left={direction === 'left'}>
        <div class="margin" />
        <div class="container">
          <slot name="content" />
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .trigger {
    position: relative;
  }

  .trigger:focus {
    outline: none;
  }

  .trigger-content {
    cursor: pointer;
  }

  .content {
    position: absolute;
    left: 0;
    width: 256px;
  }

  .content.left {
    left: initial;
    right: 0;
  }

  .container {
    background-color: var(--color-background);
    box-shadow: var(--elevation-medium);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-top: 0.5rem;
  }

  .margin {
    position: absolute;
    height: 0.5rem;
    width: 100%;
  }
</style>

<script lang="ts">
  import { onMount, tick } from 'svelte';
  import assert from '$lib/utils/assert';

  const MAX_SIZE = 16;

  export let text: string;

  let containerElem: HTMLDivElement;
  let contentElem: HTMLSpanElement;
  let fontSize: number = MAX_SIZE;
  let contentWidth: number | undefined;
  let containerWidth: number | undefined;

  async function updateContentWidth() {
    await tick();
    const contentBox = contentElem.getBoundingClientRect();
    contentWidth = contentBox.width;
  }

  let firstLetterOnly = false;

  async function fit() {
    fontSize = MAX_SIZE;

    await updateContentWidth();

    const containerBox = containerElem.getBoundingClientRect();
    containerWidth = containerBox.width;

    assert(contentWidth);
    while (contentWidth > containerWidth) {
      fontSize = fontSize - 1;

      if (fontSize < 0) throw new Error('Wat?');
      if (fontSize < 1 && !firstLetterOnly) {
        firstLetterOnly = true;
        fit();
        break;
      }

      await updateContentWidth();
    }
  }

  onMount(fit);
</script>

<div class="wrapper" bind:this={containerElem}>
  <span bind:this={contentElem} class="content" style="font-size: {fontSize}px;"
    >{firstLetterOnly ? text.substring(0, 1) : text}</span
  >
</div>

<style>
  .wrapper {
    display: inline-block;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content {
    display: inline-block;
    white-space: nowrap;
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import Knob from './components/knob.svelte';
  import PercentageEditor from '../percentage-editor/percentage-editor.svelte';

  const MIN_ITEM_WIDTH_PX = 32;

  export let items: { id: string; label: string }[];

  /** The last item provided always takes the remainder of all previous percentages. */
  $: remainderItem = items[items.length - 1];

  export let percentages: { [id: string]: number } = Object.fromEntries(
    items.map((item, index) => [item.id, index === 0 ? 1 : 0]),
  );

  let blocksElem: HTMLDivElement;
  let blocksElemWidth: number;

  onMount(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;

      blocksElemWidth = width;
    });

    resizeObserver.observe(blocksElem);

    return () => resizeObserver.disconnect();
  });

  $: percentageElems = blocksElemWidth
    ? Object.fromEntries(
        Object.entries(percentages).map(([item, percentage], _, array) => {
          const totalCount = array.length;

          const maxWidth = blocksElemWidth - totalCount * MIN_ITEM_WIDTH_PX;

          return [
            item,
            MIN_ITEM_WIDTH_PX + (maxWidth - Math.max(totalCount - 1, 0) * 8) * (percentage / 100),
          ];
        }),
      )
    : undefined;

  let dragging = false;
  let draggingIndex: number | undefined;
  let startDraggingAtXPos: number | undefined;

  function startDragging(itemIndex: number, e: MouseEvent) {
    dragging = true;
    draggingIndex = itemIndex;
    startDraggingAtXPos = e.clientX;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
  }

  let lastXPos: number | undefined;
  function drag(e: MouseEvent) {
    if (
      !percentageElems ||
      !dragging ||
      draggingIndex === undefined ||
      startDraggingAtXPos === undefined
    ) {
      return;
    }

    if (lastXPos === undefined) lastXPos = startDraggingAtXPos;

    const deltaX = e.clientX - lastXPos;

    const draggingItemId = Object.keys(percentageElems)[draggingIndex];
    const nextItemId = Object.keys(percentageElems)[draggingIndex + 1];

    const draggingItemWidth = percentageElems[draggingItemId];
    const nextItemWidth = percentageElems[nextItemId];

    const newDraggingItemWidth = Math.max(draggingItemWidth + deltaX, MIN_ITEM_WIDTH_PX);
    const newNextItemWidth = Math.max(nextItemWidth - deltaX, MIN_ITEM_WIDTH_PX);

    const itemThatHitMin = [
      [draggingItemId, newDraggingItemWidth],
      [nextItemId, newNextItemWidth],
    ].find(([, width]) => width === MIN_ITEM_WIDTH_PX);

    const updatedItems = itemThatHitMin
      ? {
          [itemThatHitMin[0]]: MIN_ITEM_WIDTH_PX,
          [itemThatHitMin[0] === draggingItemId ? nextItemId : draggingItemId]:
            draggingItemWidth + nextItemWidth - MIN_ITEM_WIDTH_PX,
        }
      : {
          [draggingItemId]: newDraggingItemWidth,
          [nextItemId]: newNextItemWidth,
        };

    const totalCount = Object.keys(percentageElems).length;

    percentages = {
      ...percentages,
      ...Object.fromEntries(
        Object.entries(updatedItems).map(([item, width]) => {
          const maxWidth = blocksElemWidth - totalCount * MIN_ITEM_WIDTH_PX;

          return [
            item,
            ((width - MIN_ITEM_WIDTH_PX) / (maxWidth - Math.max(totalCount - 1, 0) * 8)) * 100,
          ];
        }),
      ),
    };

    if (!itemThatHitMin) lastXPos = e.clientX;
  }

  function stopDragging() {
    dragging = false;
    draggingIndex = undefined;
    startDraggingAtXPos = undefined;
    lastXPos = undefined;

    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDragging);
  }

  let percentageInputValues: { [id: string]: number } = {};

  let prevPercentages: { [id: string]: number } = {};
  function updatePercentageInputs(percentages: { [id: string]: number }) {
    if (percentages !== prevPercentages) percentageInputValues = { ...percentages };

    prevPercentages = { ...percentages };
  }

  $: updatePercentageInputs(percentages);

  function handleConfirmPercentageInput(id: string) {
    const percentagesWithoutRemainder = Object.fromEntries(
      Object.entries(percentages)
        .filter(([itemId]) => itemId !== remainderItem.id)
        .map(([itemId]) =>
          itemId === id ? [itemId, percentageInputValues[id]] : [itemId, percentages[itemId]],
        ),
    );
    const totalWithoutRemainder = Object.values(percentagesWithoutRemainder).reduce(
      (acc, curr) => acc + curr,
      0,
    );

    if (totalWithoutRemainder <= 100) {
      percentages = {
        ...percentagesWithoutRemainder,
        [remainderItem.id]: 100 - totalWithoutRemainder,
      };
    } else {
      const maxPossibleValue = percentages[id] + percentages[remainderItem.id];

      percentages = {
        ...percentagesWithoutRemainder,
        [remainderItem.id]: 0,
        [id]: maxPossibleValue,
      };
    }
  }
</script>

<div class="visual-percentage-editor">
  <div class="blocks" bind:this={blocksElem}>
    {#if percentageElems}
      {#each Object.entries(percentageElems) as [id, width], index}
        <div class="block-wrapper" style="width: {width}px">
          <div class="block" class:zero-percent={percentages[id] === 0}>
            <h4 class="typo-text label">{items[index].label}</h4>
            <div class="overflow-gradient" />
          </div>
          {#if index !== Object.keys(percentageElems).length - 1}
            <div class="knob" on:mousedown={(e) => startDragging(index, e)}>
              <Knob />
            </div>
            <div class="percentage-input">
              <PercentageEditor
                bind:percentage={percentageInputValues[id]}
                on:confirm={() => handleConfirmPercentageInput(id)}
              />
            </div>
          {:else}
            <div class="percentage-input">
              <PercentageEditor
                disabled
                bind:percentage={percentageInputValues[id]}
                on:confirm={() => handleConfirmPercentageInput(id)}
              />
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .visual-percentage-editor {
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    user-select: none;
  }

  .blocks {
    width: 100%;
    display: flex;
    gap: 8px;
    height: 4rem;
    position: relative;
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    padding: 8px;
    box-shadow: var(--elevation-low);
  }

  .too-much-error {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--color-negative);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .block-wrapper {
    flex-shrink: 0;
    position: relative;
  }

  .block {
    position: relative;
    height: 100%;
    width: 100%;
    background-color: var(--color-primary-level-1);
    transition: background-color 0.3s;
    display: flex;
    align-items: center;
    padding: 8px;
    overflow: hidden;
    border-radius: 0.25rem;
  }

  .block-wrapper:first-child .block {
    border-radius: 1rem 0.25rem 0.25rem 1rem;
  }

  .block-wrapper:last-child .block {
    border-radius: 0.25rem 0 1rem 0.25rem;
  }

  .block.zero-percent {
    background-color: var(--color-foreground-level-2);
  }

  .knob {
    position: absolute;
    top: -16px;
    right: -13.5px;
    z-index: 5;
  }

  .label {
    white-space: nowrap;
    width: fit-content;
    color: var(--color-primary-level-4);
    transition: opacity 0.3s;
  }

  .zero-percent .label {
    opacity: 0;
  }
</style>

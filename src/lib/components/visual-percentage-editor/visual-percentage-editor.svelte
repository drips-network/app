<script lang="ts">
  import { onMount, type ComponentType } from 'svelte';
  import Knob from './components/knob.svelte';
  import PercentageEditor from '../percentage-editor/percentage-editor.svelte';
  import { fade } from 'svelte/transition';

  export let items: { id: string; label: string; overflowIcon: ComponentType }[];

  /** The last item provided always takes the remainder of all previous percentages. */
  $: remainderItem = items[items.length - 1];

  export let percentages: { [id: string]: number };
  export let highlightId: string | undefined = undefined;
  export let showPercentages = true;

  export let editable = true;

  let blocksElem: HTMLDivElement;
  let blocksElemWidth: number;

  let percentageElems: { [id: string]: number } | undefined = undefined;

  $: minItemWidthPx = editable ? 48 : 0;

  function updatePercentageElemsBasedOnPercentages() {
    percentageElems = Object.fromEntries(
      Object.entries(percentages).map(([item, percentage], _, array) => {
        const totalCount = array.length;
        const maxWidth = blocksElemWidth - totalCount * minItemWidthPx - (totalCount - 1) * 8;

        return [item, Math.round(minItemWidthPx + maxWidth * (percentage / 100))];
      }),
    );
  }
  $: percentages && updatePercentageElemsBasedOnPercentages();

  onMount(() => {
    const resizeObserver = new ResizeObserver(() => {
      blocksElemWidth = blocksElem.offsetWidth - 16;

      updatePercentageElemsBasedOnPercentages();
    });

    resizeObserver.observe(blocksElem);

    return () => resizeObserver.disconnect();
  });

  let blockDivs: { [id: string]: HTMLDivElement } = {};

  $: overflownBlockDivs =
    percentageElems &&
    Object.fromEntries(
      Object.entries(blockDivs).filter(([, div]) => div.scrollWidth > div.clientWidth),
    );

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

    const newDraggingItemWidth = Math.round(
      Math.max(draggingItemWidth + deltaX, minItemWidthPx),
    );
    const newNextItemWidth = Math.round(Math.max(nextItemWidth - deltaX, minItemWidthPx));

    const itemThatHitMin = [
      [draggingItemId, newDraggingItemWidth],
      [nextItemId, newNextItemWidth],
    ].find(([, width]) => width === minItemWidthPx);

    const updatedItems = itemThatHitMin
      ? {
          [itemThatHitMin[0]]: minItemWidthPx,
          [itemThatHitMin[0] === draggingItemId ? nextItemId : draggingItemId]:
            draggingItemWidth + nextItemWidth - minItemWidthPx,
        }
      : {
          [draggingItemId]: newDraggingItemWidth,
          [nextItemId]: newNextItemWidth,
        };

    percentageElems = {
      ...percentageElems,
      ...Object.fromEntries(
        Object.entries(updatedItems).map(([item, width]) => {
          return [item, width];
        }),
      ),
    };

    const totalCount = items.length;
    const maxWidth = blocksElemWidth - totalCount * minItemWidthPx - (totalCount - 1) * 8;

    percentages[draggingItemId] = Math.round(
      ((percentageElems[draggingItemId] - minItemWidthPx) / maxWidth) * 100,
    );

    if (nextItemId !== remainderItem.id) {
      percentages[nextItemId] = Math.round(
        ((percentageElems[nextItemId] - minItemWidthPx) / maxWidth) * 100,
      );

      percentages[remainderItem.id] = 100 - percentages[draggingItemId] - percentages[nextItemId];
    } else {
      const totalPercentage = Object.values(percentages).reduce(
        (acc, curr, i, arr) => acc + (i === arr.length - 1 ? 0 : curr),
        0,
      );

      percentages[remainderItem.id] = 100 - totalPercentage;
    }

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

    updatePercentageElemsBasedOnPercentages();
}

function getIconFillColor(percentage: number, highlit: boolean) {
  if (percentage === 0) return 'var(--color-foreground-level-5)';
  if (highlit) return 'white';
  return 'var(--color-foreground-level-5)';
}
</script>

<div class="visual-percentage-editor">
  <div class="blocks" bind:this={blocksElem}>
    {#if percentageElems}
      {#each Object.entries(percentageElems) as [id, width], index}
        {@const highlit = highlightId === id}
        <div class="block-wrapper" class:highlit={highlit} class:other-item-highlit={highlightId && !highlit} style="width: {width}px">
          <div class="block" bind:this={blockDivs[id]} class:zero-percent={percentages[id] === 0}>
            <h4
              class="typo-text label"
              class:overflown={overflownBlockDivs && id in overflownBlockDivs}
            >
              {items[index].label}
            </h4>
            {#if overflownBlockDivs && id in overflownBlockDivs}
              <div class="overflown-icon">
                <svelte:component
                  this={items[index].overflowIcon}
                  style="fill: {getIconFillColor(percentages[id], highlit)}; transition: fill 0.3s;"
                />
              </div>
            {/if}
          </div>
          {#if showPercentages}
            {#if index !== Object.keys(percentageElems).length - 1}
              {#if editable}
                <div class="knob" on:mousedown={(e) => startDragging(index, e)}>
                  <Knob dragging={draggingIndex === index} />
                </div>
              {/if}
              <div class="percentage-input" in:fade>
                <PercentageEditor
                  {editable}
                  bind:percentage={percentageInputValues[id]}
                  on:confirm={() => handleConfirmPercentageInput(id)}
                />
              </div>
            {:else}
              <div class="percentage-input" in:fade>
                <PercentageEditor
                  editable={false}
                  bind:percentage={percentageInputValues[id]}
                  on:confirm={() => handleConfirmPercentageInput(id)}
                />
              </div>
            {/if}
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .visual-percentage-editor {
    width: 100%;
    height: 6.5rem;
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

  .block-wrapper.other-item-highlit .block {
    background-color: var(--color-foreground-level-2);
  }

  .block-wrapper.highlit .block {
    background-color: var(--color-primary);
  }

  .block-wrapper:first-child .block {
    border-radius: 1rem 0.25rem 0.25rem 1rem;
  }

  .block-wrapper:last-child .block {
    border-radius: 0.25rem 0 1rem 0.25rem;
    opacity: 0.75;
  }

  .block.zero-percent {
    background-color: var(--color-foreground-level-2);
  }

  .knob {
    position: absolute;
    top: -16px;
    right: -16px;
    z-index: 5;
  }

  .label {
    white-space: nowrap;
    width: fit-content;
    color: var(--color-primary-level-4);
    transition: opacity 0.2s, color 0.3s;
  }

  .block-wrapper.other-item-highlit .label {
    color: var(--color-foreground-level-5);
  }

  .overflown-icon {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }

  .label.overflown {
    opacity: 0;
  }

  .zero-percent .label {
    opacity: 0;
  }

  .percentage-input {
    position: absolute;
    bottom: -3rem;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s;
  }

  .block-wrapper.other-item-highlit .percentage-input {
    opacity: 0.5;
  }
</style>

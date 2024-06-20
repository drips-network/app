<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import type { ListEditorItem } from '../types';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import DripListBadge from '$lib/components/drip-list-badge/drip-list-badge.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Trash from '$lib/components/icons/Trash.svelte';

  const dispatch = createEventDispatcher<{
    editPercentage: number;
    deleteItem: never;
  }>();

  export let item: ListEditorItem;
  export let key: string;
  export let weight: number;

  export let weightsMode: boolean;
  export let isEditable: boolean;

  export let highlight: boolean;
  $: {
    if (highlight) setTimeout(() => (highlight = false), 500);
  }

  let inputElem: HTMLInputElement;
  let inputValue: number | undefined;
  let editingPercentage = false;

  async function startEditing() {
    if (!isEditable) return;

    editingPercentage = true;
    await tick();

    inputValue = Number(formatPercentage(percentage));
    inputElem.focus();
    inputElem.select();
  }

  function stopEditing() {
    if (!editingPercentage) return;

    dispatch('editPercentage', Number(inputValue));

    inputValue = undefined;

    editingPercentage = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      stopEditing();
    }
  }

  function handleDelete() {
    dispatch('deleteItem');
  }

  $: percentage = weight / 10000;

  function formatPercentage(percentage: number) {
    return Number(percentage % 1 === 0 ? percentage.toFixed(0) : percentage.toFixed(8)).toString();
  }

  let inputWidth: string;
  $: {
    const amountOfNumbersInInputValue = String(inputValue)
      .replaceAll(',', '')
      .replaceAll('.', '').length;

    const hasDecimalPoint = String(inputValue).includes('.') || String(inputValue).includes(',');

    const NUMBER_WIDTH = 9.77;
    const DECIMAL_POINT_WIDTH = 4.44;
    const INPUT_PADDING = 2;
    const PERCENT_SIGN_WIDTH = 14.5;

    inputWidth = `${
      INPUT_PADDING * 2 +
      PERCENT_SIGN_WIDTH +
      amountOfNumbersInInputValue * NUMBER_WIDTH +
      (hasDecimalPoint ? DECIMAL_POINT_WIDTH : 0)
    }px`;
  }
</script>

<div class="item typo-text tabular-nums" class:highlight data-testid={`item-${key}`}>
  <div class="left">
    <div class="inner">
      {#if item.type === 'project'}
        <ProjectBadge project={item.project} />
      {:else if item.type === 'address'}
        <IdentityBadge size="medium" showFullAddress address={item.address} />
      {:else if item.type === 'drip-list'}
        <DripListBadge dripList={item.dripList} />
      {/if}
    </div>
  </div>

  <div class="right">
    {#if weightsMode}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="percentage-editor tabular-nums"
        class:editable={isEditable}
        style:width={editingPercentage ? inputWidth : 'auto'}
        on:click={startEditing}
        class:editing-percentage={editingPercentage}
        class:error={(weight === 0) !== weight > 1000000}
      >
        <span class="percentage">
          {formatPercentage(percentage)}
        </span>
        <span class="percent-sign"> % </span>
        <input
          style:width={inputWidth}
          bind:this={inputElem}
          bind:value={inputValue}
          type="number"
          on:focus={startEditing}
          on:blur={stopEditing}
          on:keydown={handleKeydown}
        />
      </div>
    {/if}

    {#if item.rightComponent}
      <svelte:component this={item.rightComponent.component} {...item.rightComponent.props} />
    {/if}

    {#if isEditable}
      <Button
        dataTestId={`remove-${key}`}
        icon={Trash}
        size="small"
        variant="ghost"
        on:click={handleDelete}
      />
    {/if}
  </div>
</div>

<style>
  .item {
    padding: 0.75rem;
    container-type: inline-size;
    background-color: var(--color-background);
    transition: background-color 1s;
  }

  .item.highlight {
    background-color: var(--color-primary-level-1);
  }

  .item:not(:last-child) {
    border-bottom: 1px solid var(--color-foreground);
  }

  .left {
    flex: 1;
    width: 100%;
  }

  .left .inner {
    width: fit-content;
    max-width: 100%;
  }

  .item,
  .right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .percentage-editor {
    display: flex;
    padding: 0 2px;
    align-items: center;
    justify-content: flex-end;
    position: relative;
    cursor: pointer;
    border-radius: 4px;
    box-shadow: 0 0 0 0 var(--color-primary);
    transition:
      box-shadow 0.2s,
      color 0.2s;
  }

  .percentage-editor.editable {
    box-shadow: 0 0 0 1px var(--color-foreground);
  }

  .percentage-editor.error {
    box-shadow: 0 0 0 1px var(--color-negative);
    color: var(--color-negative);
  }

  .percentage-editor.editing-percentage {
    box-shadow: 0 0 0 2px var(--color-primary);
    color: var(--color-foreground);
  }

  .percentage-editor .percentage {
    text-align: right;
  }

  .percentage-editor input {
    position: absolute;
    right: 0;
    padding-right: 16.5px;
    text-align: right;
    box-sizing: border-box;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 0 0 0px var(--color-primary);
    transition: box-shadow 0.2s;
  }

  .percentage-editor input:focus {
    outline: none;
  }

  .percentage-editor.editing-percentage .percentage {
    display: none;
  }

  .percentage-editor:not(.editing-percentage) input {
    opacity: 0;
    pointer-events: none;
  }
</style>

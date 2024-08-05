<script lang="ts">
  import type { AccountId, Items, ListEditorItem, Weights } from './types';
  import ListEditorInput from './components/list-editor-input.svelte';
  import ListEditorItemComponent from './components/list-editor-item.svelte';
  import ListEditorPie from './components/list-editor-pie.svelte';
  import Button from '../button/button.svelte';
  import type {
    ListEditorDripListFragment,
    ListEditorProjectFragment,
  } from './__generated__/gql.generated';
  import { onMount, tick } from 'svelte';
  import type { AddItemError } from './errors';

  const MAX_WEIGHT = 1000000;

  export let items: Items = {};

  export let weightsMode = true;
  export let weights: Weights = {};
  onMount(() => (weights = adjustWeights(weights)));

  export let isEditable = true;
  export let maxItems = 200;

  export let allowDripLists = true;
  export let allowProjects = true;
  export let allowAddresses = true;

  export let blockedAccountIds: string[] = [];

  export let addOnMount: string | undefined = undefined;

  export let outline = true;

  export let inputErrors: Array<AddItemError> = [];

  $: totalWeight = Object.values(weights).reduce((acc, weight) => acc + weight, 0);

  export let valid = false;
  $: valid = weightsMode
    ? totalWeight === MAX_WEIGHT && !Object.values(weights).some((v) => v === 0)
    : Object.keys(items).length > 0;

  let percentagesManuallyChanged = false;

  // If the component is initialized with existing weights, we don't want to auto-distribute equally on edit.
  onMount(() => {
    if (Object.keys(items).length > 0) {
      percentagesManuallyChanged = true;
    }
  });

  function adjustWeights(weights: Weights) {
    const result = { ...weights };

    const totalWeight = Object.values(weights).reduce((acc, weight) => acc + weight, 0);
    const remainder = MAX_WEIGHT - totalWeight;

    if (remainder > 0 && remainder < 5) {
      const keys = Object.keys(weights);
      const key = keys[0];
      result[key] += remainder;
    }

    return result;
  }

  function equallyDistributeWeights(keys: AccountId[]): Weights {
    const total = keys.length;
    const weight = Math.floor(MAX_WEIGHT / total);

    const result = keys.reduce<Weights>((acc, key) => {
      acc[key] = weight;
      return acc;
    }, {});

    return adjustWeights(result);
  }

  let itemsContainer: HTMLDivElement;
  let highlightedItemKey: AccountId | undefined = undefined;

  async function addItem(key: AccountId, item: ListEditorItem) {
    items = {
      [key]: item,
      ...items,
    };

    if (percentagesManuallyChanged) {
      weights[key] = 0;
    } else {
      weights = equallyDistributeWeights(Object.keys(items));
    }

    await tick();

    itemsContainer.scroll({ top: 0, behavior: 'smooth' });
    highlightedItemKey = key;
  }

  function handleAddAddress(accountId: AccountId, address: string) {
    if (allowAddresses) {
      addItem(accountId, {
        type: 'address',
        address,
      });
    }
  }

  function handleAddProject(accountId: AccountId, project: ListEditorProjectFragment) {
    if (allowProjects) {
      addItem(accountId, {
        type: 'project',
        project,
      });
    }
  }

  function handleAddDripList(accountId: AccountId, dripList: ListEditorDripListFragment) {
    if (allowDripLists) {
      addItem(accountId, {
        type: 'drip-list',
        dripList,
      });
    }
  }

  function handlePercentageEdit(key: AccountId, value: number) {
    percentagesManuallyChanged = true;

    const newWeights = { ...weights };
    newWeights[key] = Math.floor((Number(value) / 100) * 1000000);

    weights = adjustWeights(newWeights);
  }

  function handleItemDelete(key: AccountId) {
    delete items[key];
    delete weights[key];

    items = items;
    weights = weights;
  }

  $: distributeEquallyActionAvailable = Object.keys(items).length > 0;
  $: distributeRemainingActionAvailable = Object.values(weights).some((v) => v === 0);
  $: clearAllActionAvailable = Object.keys(items).length > 0;

  function handleDistributeEquallyAction() {
    weights = equallyDistributeWeights(Object.keys(items));
  }

  function handleDistributeRemainingAction() {
    // Take all weights where the value is 0, and distribute the remaining unassigned weight across them
    const zeroWeights = Object.entries(weights).filter((v) => v[1] === 0);
    const totalZeroWeights = zeroWeights.length;

    if (totalZeroWeights === 0) return;

    const remainder = MAX_WEIGHT - totalWeight;

    const newWeights = { ...weights };

    zeroWeights.forEach(([key]) => {
      newWeights[key] = Math.floor(remainder / totalZeroWeights);
    });

    weights = adjustWeights(newWeights);
  }

  function handleClearAllAction() {
    weights = Object.fromEntries(Object.keys(items).map((key) => [key, 0]));
  }
</script>

<div class="list-editor" class:with-outline={outline}>
  <div class="inner">
    {#if isEditable}
      <ListEditorInput
        existingKeys={Object.keys(items)}
        errors={inputErrors}
        {addOnMount}
        {weightsMode}
        {allowAddresses}
        {allowProjects}
        {allowDripLists}
        {blockedAccountIds}
        maxItemsReached={Object.keys(items).length >= maxItems}
        on:addAddress={(e) => handleAddAddress(e.detail.accountId, e.detail.address)}
        on:addProject={(e) => handleAddProject(e.detail.accountId, e.detail.project)}
        on:addDripList={(e) => handleAddDripList(e.detail.accountId, e.detail.dripList)}
        on:errorDismissed
      />
    {/if}

    {#if Object.keys(items).length > 0}
      <div class="items" bind:this={itemsContainer}>
        {#each Object.entries(items) as [key, item]}
          <ListEditorItemComponent
            {key}
            highlight={highlightedItemKey === key}
            {weightsMode}
            {isEditable}
            on:editPercentage={(e) => handlePercentageEdit(key, e.detail)}
            on:deleteItem={() => handleItemDelete(key)}
            {item}
            weight={weights[key]}
          />
        {/each}
      </div>
    {/if}
  </div>

  {#if weightsMode && isEditable}
    <div class="action-row">
      <div class="actions">
        <Button
          size="small"
          disabled={!distributeEquallyActionAvailable}
          on:click={handleDistributeEquallyAction}
        >
          <span class="typo-text-small">Split evenly</span>
        </Button>
        <Button
          size="small"
          disabled={!distributeRemainingActionAvailable}
          on:click={handleDistributeRemainingAction}
        >
          <span class="typo-text-small">Split remaining</span>
        </Button>
        <Button size="small" disabled={!clearAllActionAvailable} on:click={handleClearAllAction}>
          <span class="typo-text-small">Clear</span>
        </Button>
      </div>

      <ListEditorPie {totalWeight} hasEmptyInputs={Object.values(weights).some((v) => v === 0)} />
    </div>
  {/if}
</div>

<style>
  .list-editor {
    container-type: inline-size;
    position: relative;
  }

  .list-editor.with-outline .inner {
    border: 1px solid var(--color-foreground);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    overflow: hidden;
  }

  .action-row {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
  }

  .items {
    max-height: 24rem;
    overflow: scroll;
  }

  @container (max-width: 600px) {
    .action-row {
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
  }
</style>

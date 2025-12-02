<script lang="ts">
  import { run } from 'svelte/legacy';

  import type { Items, ListEditorItem, Weights } from './types';
  import ListEditorInput from './components/list-editor-input.svelte';
  import ListEditorItemComponent from './components/list-editor-item.svelte';
  import ListEditorPie from './components/list-editor-pie.svelte';
  import Button from '../button/button.svelte';
  import type {
    ListEditorDripListFragment,
    ListEditorProjectFragment,
    ListEditorOrcidFragment,
  } from './__generated__/gql.generated';
  import { onMount, tick } from 'svelte';
  import VirtualList from 'svelte-tiny-virtual-list';
  import type { AddItemError } from './errors';
  import { WEIGHT_FACTOR } from './types';
  import type { AccountId } from '$lib/utils/common-types';
  import network from '$lib/stores/wallet/network';

  const MAX_WEIGHT = 1000000;

  onMount(() => (weights = adjustWeights(weights)));

  interface Props {
    items?: Items;
    weightsMode?: boolean;
    weights?: Weights;
    isEditable?: boolean;
    canDeleteItems?: boolean;
    maxItems?: number;
    // These can't be deleted even if canDeleteItems is true
    protectedItems?: AccountId[];
    allowDripLists?: boolean;
    allowProjects?: boolean;
    allowAddresses?: boolean;
    allowOrcids?: boolean;
    allowEmptyPercentages?: boolean;
    blockedAccountIds?: string[];
    addOnMount?: string | undefined;
    outline?: boolean;
    forceBottomBorderOnItems?: boolean;
    inputErrors?: Array<AddItemError>;
    valid?: boolean;
  }

  let {
    items = $bindable({}),
    weightsMode = true,
    weights = $bindable({}),
    isEditable = true,
    canDeleteItems = true,
    maxItems = 200,
    protectedItems = [],
    allowDripLists = true,
    allowProjects = true,
    allowAddresses = true,
    allowOrcids = network.orcids,
    allowEmptyPercentages = false,
    blockedAccountIds = [],
    addOnMount = undefined,
    outline = true,
    forceBottomBorderOnItems = false,
    inputErrors = $bindable([]),
    valid = $bindable(false),
  }: Props = $props();

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

  let itemsContainer = $state<HTMLDivElement>();
  let highlightedItemKey: AccountId | undefined = $state(undefined);

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

    itemsContainer?.scroll({ top: 0, behavior: 'smooth' });
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

  function handleAddOrcid(accountId: AccountId, orcid: ListEditorOrcidFragment) {
    if (allowOrcids) {
      addItem(accountId, {
        type: 'orcid',
        orcid,
      });
    }
  }

  function handlePercentageEdit(key: AccountId, value: number) {
    percentagesManuallyChanged = true;

    const newWeights = { ...weights };
    newWeights[key] = Math.floor(Number(value) * WEIGHT_FACTOR);

    weights = adjustWeights(newWeights);
  }

  function handleItemDelete(key: AccountId) {
    delete items[key];
    delete weights[key];

    items = items;
    weights = weights;
  }

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
  let totalWeight = $derived(Object.values(weights).reduce((acc, weight) => acc + weight, 0));
  run(() => {
    valid = weightsMode
      ? totalWeight === MAX_WEIGHT &&
        (allowEmptyPercentages || !Object.values(weights).some((v) => v === 0))
      : Object.keys(items).length > 0;
  });
  let distributeEquallyActionAvailable = $derived(Object.keys(items).length > 0);
  let distributeRemainingActionAvailable = $derived(
    Object.values(weights).some((v) => v > 0) && Object.values(weights).some((v) => v === 0),
  );
  let clearAllActionAvailable = $derived(Object.keys(items).length > 0);
</script>

<div class="list-editor" class:with-outline={outline}>
  <div class="inner">
    {#if isEditable && (allowAddresses || allowProjects || allowDripLists || allowOrcids)}
      <ListEditorInput
        existingKeys={Object.keys(items)}
        errors={inputErrors}
        {addOnMount}
        {weightsMode}
        {allowAddresses}
        {allowProjects}
        {allowDripLists}
        {allowOrcids}
        {blockedAccountIds}
        maxItemsReached={Object.keys(items).length >= maxItems}
        on:addAddress={(e) => handleAddAddress(e.detail.accountId, e.detail.address)}
        on:addProject={(e) => handleAddProject(e.detail.accountId, e.detail.project)}
        on:addDripList={(e) => handleAddDripList(e.detail.accountId, e.detail.dripList)}
        on:addOrcid={(e) => handleAddOrcid(e.detail.accountId, e.detail.orcid)}
        on:errorDismissed
      />
    {/if}

    {#if Object.keys(items).length > 0}
      {@const itemArray = Object.entries(items)}
      <div class="items" bind:this={itemsContainer}>
        <VirtualList
          height={Math.min(itemArray.length * 56, 384)}
          width="100%"
          itemCount={itemArray.length}
          itemSize={56}
          getKey={(index) => itemArray[index][0]}
        >
          {#snippet item({ index, style })}
            {@const [key, item] = itemArray[index]}
            <div {style}>
              <ListEditorItemComponent
                hasBottomBorder={forceBottomBorderOnItems || index < itemArray.length - 1}
                allowEmptyPercentage={allowEmptyPercentages}
                canDeleteItems={canDeleteItems &&
                  (protectedItems ? !protectedItems.includes(key) : true)}
                {key}
                highlight={highlightedItemKey === key}
                {weightsMode}
                {isEditable}
                on:editPercentage={(e) => handlePercentageEdit(key, e.detail)}
                on:deleteItem={() => handleItemDelete(key)}
                {item}
                weight={weights[key]}
              />
            </div>
          {/snippet}
        </VirtualList>
      </div>
    {/if}
  </div>

  {#if weightsMode && isEditable}
    <div class="action-row">
      <div class="actions">
        <Button
          size="small"
          disabled={!distributeEquallyActionAvailable}
          onclick={handleDistributeEquallyAction}
        >
          <span class="typo-text-small">Split evenly</span>
        </Button>
        <Button
          size="small"
          disabled={!distributeRemainingActionAvailable}
          onclick={handleDistributeRemainingAction}
        >
          <span class="typo-text-small">Split remaining</span>
        </Button>
        <Button size="small" disabled={!clearAllActionAvailable} onclick={handleClearAllAction}>
          <span class="typo-text-small">Clear</span>
        </Button>
      </div>

      <ListEditorPie
        {totalWeight}
        hasEmptyInputs={allowEmptyPercentages ? false : Object.values(weights).some((v) => v === 0)}
      />
    </div>
  {/if}
</div>

<style>
  .list-editor {
    container-type: inline-size;
    position: relative;
  }

  .list-editor.with-outline .inner {
    border: 1px solid var(--color-foreground-level-3);
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

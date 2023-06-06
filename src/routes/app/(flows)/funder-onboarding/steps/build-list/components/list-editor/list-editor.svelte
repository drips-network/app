<script lang="ts" context="module">
  import type {
    InterstitialItem,
    SelectableItem,
  } from '$lib/components/list-select/list-select.types';

  interface ProjectItem extends SelectableItem {
    label: {
      component: typeof ProjectBadge;
      props: {
        project: GitProject;
      };
    };
  }

  interface EthAddressItem extends SelectableItem {
    label: {
      component: typeof IdentityBadge;
      props: {
        address: string;
      };
    };
  }

  export type ListItem = EthAddressItem | ProjectItem | InterstitialItem;
  export type Items = { [slug: string]: ListItem };

  export type Percentages = { [slug: string]: number };
</script>

<script lang="ts">
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import isValidUrl from '$lib/utils/is-valid-url';
  import CheckIcon from 'radicle-design-system/icons/Check.svelte';
  import ExclamationIcon from 'radicle-design-system/icons/Exclamation.svelte';
  import Git from 'radicle-design-system/icons/Git.svelte';
  import { fade, scale } from 'svelte/transition';
  import projectItem from './item-templates/project';
  import type { GitProject } from '$lib/utils/metadata/types';
  import Button from '$lib/components/button/button.svelte';
  import { tick } from 'svelte';
  import type ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import type IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import ethAddressItem from './item-templates/eth-address';
  import { isAddress } from 'ethers/lib/utils';

  // TOOD: Set to 200
  const MAX_ITEMS = 10;

  export let selected: string[] = ['svelte-stepper', 'svelte-stored-writable', 'foo-bar'];
  export let percentages: Percentages = {};
  export let blockInteraction = false;

  $: selectedPercentages = Object.fromEntries(
    Object.entries(percentages).filter(([slug]) => selected.includes(slug)),
  );

  export let items: Items;

  let listElem: HTMLDivElement;
  let inputElem: HTMLInputElement;

  let addInProgress = false;
  let inputValue = '';

  // TODO: Prevent duplicate entries

  async function addProject() {
    // TODO: Really fetch project
    addInProgress = true;

    const id = crypto.randomUUID();

    items[id] = projectItem({
      claimed: false,
      repoDriverAccount: {
        userId: '0',
        driver: 'repo',
      },
      source: {
        forge: 'github',
        repoName: 'svelte-stored-writable',
        ownerName: 'efstajas',
        url: 'https://github.com/efstajas/svelte-stepper.git',
      },
    } as GitProject);

    inputValue = '';

    if (selected.length < MAX_ITEMS) selected.push(id);
    percentages = { ...percentages, [id]: 0 };

    await tick();

    listElem.scroll({
      top: listElem.scrollHeight,
    });

    // It doesn't work without setTimeout for some reason 🤷‍♂️
    setTimeout(() => inputElem.focus(), 0);

    addInProgress = false;
  }

  function addEthAddress() {
    if (items[inputValue]) return;

    items[inputValue] = ethAddressItem(inputValue);

    if (selected.length < MAX_ITEMS) selected.push(inputValue);
    percentages = { ...percentages, [inputValue]: 0 };

    inputValue = '';
  }

  $: if (isValidUrl(inputValue)) {
    addProject();
  }

  $: if (isAddress(inputValue)) {
    addEthAddress();
  }

  $: totalPercentage = Object.values(selectedPercentages ?? {}).reduce<number>(
    (acc, v) => acc + v,
    0,
  );
  export let valid = false;
  $: valid = selected.length > 0 && Math.round(totalPercentage * 100) / 100 === 100;
  export let error = false;
  $: error = Math.round(totalPercentage * 100) / 100 > 100;

  $: canDistributeEvenly = selected.length > 0;

  function distributeEvenly() {
    const percentage = 100 / selected.length;

    selected.forEach((id) => {
      percentages[id] = percentage;
    });
  }

  $: canDistributeRemaining =
    Object.values(selectedPercentages).filter((v) => v === 0).length > 0 &&
    Object.values(selectedPercentages).find((v) => v !== 0);

  function distributeRemaining() {
    const remaining = 100 - totalPercentage;

    const remainingIds = Object.entries(selectedPercentages)
      .filter(([, v]) => v === 0)
      .map(([id]) => id);

    const percentage = remaining / remainingIds.length;

    remainingIds.forEach((id) => {
      percentages[id] = percentage;
    });
  }

  $: canClearPercentages = Object.values(selectedPercentages).filter((v) => v !== 0).length > 0;

  // Clears all selected percentages
  function clearPercentages() {
    selected.forEach((id) => {
      percentages[id] = 0;
    });
  }
</script>

<div class="list-editor">
  {#if !blockInteraction}
    <div class="add-project">
      <div class="icon">
        <Git style="fill: var(--color-foreground)" />
      </div>
      <input
        bind:this={inputElem}
        bind:value={inputValue}
        disabled={addInProgress}
        class="typo-text"
        type="text"
        placeholder="Paste GitHub/GitLab URL or Ethereum address"
      />
      {#if addInProgress}
        <Spinner />
      {/if}
    </div>
  {/if}
  {#if Object.keys(items).length > 0}
    <div class="list" bind:this={listElem}>
      <ListSelect
        hideUnselected={blockInteraction}
        {blockInteraction}
        bind:percentages
        bind:selected
        searchable={false}
        multiselect
        {items}
        showEmptyState={false}
      />
    </div>
  {/if}
  {#if !blockInteraction && Object.keys(items).length > 0}
    <div class="distribution-tools">
      <div class="actions">
        <Button size="small" on:click={distributeEvenly} disabled={!canDistributeEvenly}
          >Distribute evenly</Button
        >
        <Button size="small" on:click={distributeRemaining} disabled={!canDistributeRemaining}
          >Distribute remaining</Button
        >
        <Button size="small" on:click={clearPercentages} disabled={!canClearPercentages}
          >Clear distribution</Button
        >
      </div>
      <div class="remaining-percentage-indicator" class:error class:valid>
        <div class="typo-text-small-bold">
          {Math.round(totalPercentage * 100) / 100}% allocated
        </div>
        <div class="pie">
          <svg height="32" width="32" viewBox="0 0 32 32">
            {#if !error && !valid}
              <circle
                transition:fade={{ duration: 200 }}
                r="12"
                cx="16"
                cy="16"
                fill="var(--color-primary-level-1"
              />
            {/if}
            <circle
              class="pie-piece"
              r="6"
              cx="16"
              cy="16"
              fill="transparent"
              stroke-width="12"
              stroke-dasharray="calc({totalPercentage} * 37.6991118431 / 100) 37.6991118431"
              transform="rotate(-90) translate(-32)"
            /></svg
          >
          {#if error}
            <div
              class="icon"
              in:scale={{ duration: 300, start: 1.5 }}
              out:scale={{ duration: 300, start: 0.8 }}
            >
              <ExclamationIcon style="fill: var(--color-background);" />
            </div>
          {:else if valid}
            <div
              class="icon"
              in:scale={{ duration: 300, start: 1.5 }}
              out:scale={{ duration: 300, start: 0.8 }}
            >
              <CheckIcon style="fill: var(--color-background);" />
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .list {
    background-color: var(--color-background);
    box-shadow: var(--elevation-low);
    border-radius: 0 0 1.5rem 1.5rem;
    overflow: hidden;
    max-height: 32rem;
    overflow-y: scroll;
  }

  .list:first-child {
    border-radius: 1.5rem 0 1.5rem 1.5rem;
  }

  .add-project {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    background-color: var(--color-background);
    box-shadow: var(--elevation-low);
    border-radius: 1.5rem 0 0 0;
  }

  .add-project:only-child {
    border-radius: 2rem 0 2rem 2rem;
  }

  .add-project input {
    width: 100%;
  }

  .add-project input:disabled {
    color: var(--color-foreground-level-5);
  }

  .add-project input:focus {
    outline: none;
  }

  .distribution-tools {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    user-select: none;
  }

  .distribution-tools .actions {
    display: flex;
    gap: 0.5rem;
  }

  .remaining-percentage-indicator {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.25rem;
  }

  .remaining-percentage-indicator.error {
    color: var(--color-negative);
  }

  .remaining-percentage-indicator.valid {
    color: var(--color-positive-level-6);
  }

  .remaining-percentage-indicator .pie {
    overflow: visible;
    position: relative;
  }

  .remaining-percentage-indicator .pie .icon {
    position: absolute;
    top: 4px;
    left: 4px;
  }

  .remaining-percentage-indicator .pie .pie-piece {
    transition: all 0.2s;
  }

  .remaining-percentage-indicator .pie .pie-piece {
    stroke: var(--color-primary);
  }

  .remaining-percentage-indicator.error .pie .pie-piece {
    stroke: var(--color-negative);
  }

  .remaining-percentage-indicator.valid .pie .pie-piece {
    stroke: var(--color-positive-level-6);
  }
</style>

<script lang="ts" context="module">
  interface ProjectItem {
    type: 'project';
    project: GitProject;
  }

  interface EthAddressItem {
    type: 'address';
    address: string;
  }

  interface DripListItem {
    type: 'drip-list';
    list: {
      id: string;
      name: string;
      owner: string;
    };
  }

  export type ListItem = DripListItem | EthAddressItem | ProjectItem;
  export type Items = { [slug: string]: ListItem };

  export type Percentages = { [slug: string]: number };

  export interface ListEditorConfig {
    items: Items;
    percentages: Percentages;
  }
</script>

<script lang="ts">
  import CheckIcon from 'radicle-design-system/icons/Check.svelte';
  import ExclamationIcon from 'radicle-design-system/icons/Exclamation.svelte';
  import { fade, scale } from 'svelte/transition';
  import type { GitProject } from '$lib/utils/metadata/types';
  import Button from '$lib/components/button/button.svelte';
  import { onMount } from 'svelte';
  import { getAddress, isAddress } from 'ethers/lib/utils';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import ensStore from '$lib/stores/ens/ens.store';
  import assert from '$lib/utils/assert';
  import GitProjectService from '$lib/utils/project/GitProjectService';
  import { isSupportedGitUrl } from '$lib/utils/is-valid-git-url';
  import { verifyRepoExists } from '$lib/utils/github/github';
  import PercentageEditor from '$lib/components/percentage-editor/percentage-editor.svelte';
  import Trash from 'radicle-design-system/icons/Trash.svelte';
  import DripListIcon from 'radicle-design-system/icons/DripList.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import ethAddressItem from './item-templates/eth-address';
  import projectItem from './item-templates/project';
  import DripListService from '$lib/utils/driplist/DripListService';
  import dripListItem from './item-templates/drip-list';
  import unreachable from '$lib/utils/unreachable';
  import DripListBadge from '../drip-list-badge/drip-list-badge.svelte';
  import ExclamationCircle from 'radicle-design-system/icons/ExclamationCircle.svelte';
  import CheckCircle from 'radicle-design-system/icons/CheckCircle.svelte';

  export let maxItems = 200;

  export let percentages: Percentages = {};
  export let isEditable = true;
  export let addOnMount: string | undefined = undefined;

  /**
   * Pass an array of keys for items which the user will not be able to add to the list.
   */
  export let blockedKeys: string[] = [];

  export let allowedItems: ('eth-addresses' | 'projects' | 'drip-lists')[] = [
    'projects',
    'eth-addresses',
    'drip-lists',
  ];

  export let items: Items;

  $: itemsLength = Object.entries(items).length;

  let listElem: HTMLDivElement;
  let inputElem: HTMLInputElement;

  let isAddingItem = false;
  let inputValue = '';
  let inputMessage: { type: 'caution' | 'success'; message: string } | undefined = undefined;

  let gitProjectService: GitProjectService;

  async function addProject() {
    if (!gitProjectService) gitProjectService = await GitProjectService.new();

    if (!allowedItems.includes('projects')) return;

    try {
      isAddingItem = true;

      const { username, repoName } = GitProjectService.deconstructUrl(inputValue);

      // TODO: This only supports GitHub forge
      const repoExists = await verifyRepoExists(username, repoName);
      if (!repoExists) throw new Error("Couldn't find that Git project. Is it private?");

      let gitProject = await gitProjectService.getByUrl(inputValue);

      const id = gitProject.source.url;
      if (blockedKeys.includes(id)) throw new Error('Project ID is already used');

      if (items[id]) {
        inputMessage = { type: 'success', message: 'Already added' };
        setTimeout(() => inputElem.select());
        return;
      }

      items[id] = projectItem(gitProject);

      addItemToPercentages(id);

      afterInputAdded();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      const message = e instanceof Error ? e.message : 'Error adding project';
      inputMessage = { type: 'caution', message };
    } finally {
      isAddingItem = false;
    }
  }

  async function addDripList() {
    isAddingItem = true;

    if (!allowedItems.includes('drip-lists')) return;

    try {
      const dripListId = inputValue.substring(inputValue.lastIndexOf('/') + 1);
      if (!dripListId) throw new Error('Invalid drip list ID');

      const dripListService = await DripListService.new();

      const dripList = await dripListService.getByTokenId(dripListId);
      if (!dripList) throw new Error('Drip List not found');

      if (blockedKeys.includes(dripListId)) throw new Error('Drip List ID is already used');

      if (items[dripListId]) {
        inputMessage = { type: 'success', message: 'Already added' };
        setTimeout(() => inputElem.select());
        return;
      }

      items[dripListId] = dripListItem(
        dripList.name,
        dripList.account.accountId,
        dripList.account.owner.address,
      );

      addItemToPercentages(dripListId);

      afterInputAdded();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      const message = e instanceof Error ? e.message : 'Error adding Drip List';
      inputMessage = { type: 'caution', message };
    } finally {
      isAddingItem = false;
    }
  }

  async function addEthAddress() {
    isAddingItem = true;

    try {
      const address = isAddress(inputValue)
        ? getAddress(inputValue)
        : await ensStore.reverseLookup(inputValue);

      assert(
        address,
        inputValue.endsWith('.eth')
          ? `Couldn't resolve an Ethereum address for "${inputValue}"`
          : 'Invalid Ethereum address',
      );

      if (blockedKeys.includes(address)) throw new Error('This address is already used');

      if (items[address]) {
        inputMessage = { type: 'success', message: 'Already added' };
        setTimeout(() => inputElem.select());
        return;
      }

      items[address] = ethAddressItem(address);

      addItemToPercentages(address);

      afterInputAdded();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      const message = e instanceof Error ? e.message : 'Error adding Ethereum address';
      inputMessage = { type: 'caution', message };
    } finally {
      isAddingItem = false;
    }
  }

  let autoSplitEnabled = Object.keys(items).length === 0;

  function addItemToPercentages(key: string) {
    let pcts = { ...percentages, [key]: 0 };
    // auto split new entries unless they've manually edited percents
    if (autoSplitEnabled) {
      const amounts = Object.entries(pcts);
      pcts = Object.fromEntries(amounts.map(([key]) => [key, 100 / amounts.length]));
    }
    percentages = pcts;
  }

  function removeItem(slug: string) {
    delete items[slug];
    delete percentages[slug];
    items = items;
    percentages = percentages;
  }

  function handleSubmitInput() {
    if (itemsLength >= maxItems) {
      inputMessage = { type: 'caution', message: `You can't add anymore items to this list` };
      return;
    }

    if (isSupportedGitUrl(inputValue) && allowedItems.includes('projects')) {
      addProject();
    } else if (
      allowedItems.includes('drip-lists') &&
      inputValue.includes('drips.network/app/drip-lists/')
    ) {
      addDripList();
    } else if (
      allowedItems.includes('eth-addresses') &&
      (isAddress(inputValue) || inputValue.endsWith('.eth'))
    ) {
      addEthAddress();
    } else {
      inputMessage = { type: 'caution', message: "You can't add that to this list." };
    }
  }

  $: validInput =
    isSupportedGitUrl(inputValue) ||
    isAddress(inputValue) ||
    inputValue.endsWith('.eth') ||
    inputValue.includes('drips.network/app/drip-lists/');

  $: totalPercentage = Object.values(percentages ?? {}).reduce<number>((acc, v) => acc + v, 0);
  $: hasEmptyPercents = Object.values(percentages).filter((v) => v === 0).length > 0;
  export let valid = false;
  $: valid =
    itemsLength > 0 && Math.round(totalPercentage * 100) / 100 === 100 && !hasEmptyPercents;
  export let error = false;
  $: error = Math.round(totalPercentage * 100) / 100 > 100 || hasEmptyPercents;
  // TODO: error should check if items are 0% (can currently submit with 0% but it gets excluded on tx)

  $: canDistributeEvenly = itemsLength > 0;

  function setAllPercentagesTo(value: number) {
    Object.keys(percentages).forEach((key) => {
      percentages[key] = value;
    });
  }

  function distributeEvenly() {
    setAllPercentagesTo(100 / itemsLength);
  }

  $: canDistributeRemaining =
    hasEmptyPercents &&
    Object.values(percentages).find((v) => v !== 0) &&
    Object.values(percentages).reduce((acc, cur) => acc + cur, 0) < 100;

  function distributeRemaining() {
    const remaining = 100 - totalPercentage;

    const remainingIds = Object.entries(percentages)
      .filter(([, v]) => v === 0)
      .map(([id]) => id);

    const percentage = remaining / remainingIds.length;

    remainingIds.forEach((id) => {
      percentages[id] = percentage;
    });
  }

  $: canClearPercentages = Object.values(percentages).filter((v) => v !== 0).length > 0;

  function clearPercentages() {
    setAllPercentagesTo(0);
  }

  let highlightLastItemAdded = false;

  function afterInputAdded() {
    // It doesnʼt work without setTimeout for some reason 🤷‍♂️
    setTimeout(() => {
      // clear input
      inputValue = '';
      inputElem.focus();
      // highlight item added
      highlightLastItemAdded = true;
      setTimeout(() => {
        highlightLastItemAdded = false;
      }, 5000);
      // scroll to bottom of list
      listElem.scroll({ top: 999999, behavior: 'smooth' });
      // scroll window top to input if bottom is out of view
      const listBox = listElem.getBoundingClientRect();
      if (listBox.bottom > window.innerHeight) {
        window.scroll({
          top: window.scrollY + inputElem.getBoundingClientRect().top - 24,
          behavior: 'smooth',
        });
      }
    });
  }

  onMount(() => {
    if (addOnMount) {
      inputValue = addOnMount;
    }
  });

  let inputPlaceholder: string;
  $: {
    const allowed = [...allowedItems];

    const possibilities: Record<(typeof allowedItems)[number], string> = {
      projects: 'GitHub URL',
      'drip-lists': 'Drip List URL',
      'eth-addresses': 'Ethereum address',
    };

    const possibilityName = (key: (typeof allowedItems)[number]) => possibilities[key];

    if (allowed.length === 0) {
      inputPlaceholder = '';
    } else if (allowed.length === 1) {
      inputPlaceholder = possibilityName(allowed[0]);
    } else {
      inputPlaceholder = `${allowed
        .filter((_, i, a) => i !== a.length - 1)
        .map(possibilityName)
        .join(', ')}, or ${possibilityName(allowed.pop() ?? unreachable())}`;
    }
  }

  $: {
    inputValue, (inputMessage = undefined);
  }
</script>

<div class="list-editor">
  {#if isEditable}
    <div class="add-project flex items-center">
      <div class="icon">
        <DripListIcon style="fill: var(--color-foreground)" />
      </div>
      <input
        bind:this={inputElem}
        bind:value={inputValue}
        disabled={isAddingItem}
        on:keydown={(e) => e.key === 'Enter' && handleSubmitInput()}
        on:paste={() => setTimeout(() => handleSubmitInput())}
        class="typo-text"
        type="text"
        placeholder={inputPlaceholder}
      />
      <Button
        icon={Plus}
        disabled={!validInput}
        variant={validInput ? 'primary' : undefined}
        on:click={handleSubmitInput}
        loading={isAddingItem}>Add</Button
      >
    </div>
  {/if}
  {#if Object.keys(items).length > 0 || inputMessage}
    <div class="list" bind:this={listElem}>
      {#if inputMessage}
        <div
          class="sticky top-0 left-0 w-full z-10 border-t border-foreground flex flex-wrap py-4 gap-1 items-start justify-between {inputMessage.type ===
          'success'
            ? 'bg-primary-level-1 text-primary-level-6'
            : 'bg-caution-level-1 text-caution-level-6'}"
        >
          <div class="pl-4 pr-2">
            {#if inputMessage.type === 'success'}
              <CheckCircle style="fill:currentColor" />
            {:else}
              <ExclamationCircle style="fill: currentColor" />
            {/if}
          </div>
          <div class="flex-1 typo-text">
            {inputMessage.message}
          </div>
        </div>
      {/if}
      <ul>
        {#each Object.entries(items) as [slug, item], index}
          <li
            class="flex flex-wrap items-center py-4 gap-1 items-center justify-between"
            data-testid={`item-${slug}`}
            class:bg-primary-level-1={index === Object.entries(items).length - 1 &&
              highlightLastItemAdded}
          >
            <div class="flex-1 max-w-full">
              <div class="w-full px-3">
                {#if item.type === 'address'}
                  <IdentityBadge
                    address={item.address}
                    size="medium"
                    disableLink={true}
                    showFullAddress={true}
                  />
                {:else if item.type === 'project'}
                  <ProjectBadge project={item.project} linkTo="nothing" />
                {:else if item.type === 'drip-list'}
                  <DripListBadge
                    listName={item.list.name}
                    listId={item.list.id}
                    owner={item.list.owner}
                    isLinked={false}
                  />
                {/if}
              </div>
            </div>

            <div class="flex flex-1 flex-shrink-0 justify-end items-center gap-3 pr-3">
              {#if !isEditable}
                <div class="typo-text">{percentages[slug].toFixed(2).replace('.00', '')}%</div>
              {:else}
                <PercentageEditor
                  bind:percentage={percentages[slug]}
                  on:confirm={() => {
                    autoSplitEnabled = false;
                  }}
                />
                <Button
                  icon={Trash}
                  variant="ghost"
                  on:click={() => removeItem(slug)}
                  ariaLabel="Remove from list"
                  dataTestId={`remove-${slug}`}
                />
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
  {#if isEditable && Object.keys(items).length > 0}
    <div
      class="distribution-tools flex flex-col flex-wrap justify-center items-center sm:flex-row sm:justify-between gap-3 mt-4 select-none"
    >
      <div class="flex flex-wrap gap-0.5 flex-shrink-0 justify-center">
        <Button size="small" on:click={distributeEvenly} disabled={!canDistributeEvenly}
          >Split evenly</Button
        >
        <Button size="small" on:click={distributeRemaining} disabled={!canDistributeRemaining}
          >Split remaining</Button
        >
        <Button size="small" on:click={clearPercentages} disabled={!canClearPercentages}
          >Clear</Button
        >
      </div>
      <div class="remaining-percentage-indicator typo-text-small-bold" class:error class:valid>
        {#if hasEmptyPercents}
          Empty inputs
        {:else}
          {Math.round(totalPercentage * 100) / 100}% split
        {/if}
        <div class="pie">
          <svg height="32" width="32" viewBox="0 0 32 32">
            {#if !error && !valid}
              <circle
                transition:fade|local={{ duration: 200 }}
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
              stroke-dasharray="calc({hasEmptyPercents
                ? 100
                : totalPercentage} * 37.6991118431 / 100) 37.6991118431"
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
  .list-editor {
    text-align: left;
  }

  .list {
    background-color: var(--color-background);
    box-shadow: var(--elevation-low);
    border-radius: 0 0 1.5rem 1.5rem;
    overflow: hidden;
    max-height: 24rem;
    overflow-y: scroll;
  }

  .list:first-child {
    border-radius: 1.5rem 0 1.5rem 1.5rem;
  }

  .list ul li + li {
    border-top: 1px solid;
  }

  .add-project {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background-color: var(--color-background);
    box-shadow: var(--elevation-low);
    border-radius: 1.5rem 0 0 0;
    position: relative;
  }

  .add-project:only-child {
    border-radius: 2.5rem 0 2.5rem 2.5rem;
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

  .remaining-percentage-indicator {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
  }

  .remaining-percentage-indicator.error {
    color: var(--color-negative);
  }

  .remaining-percentage-indicator.valid {
    color: var(--color-positive);
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
    stroke: var(--color-positive);
  }
</style>

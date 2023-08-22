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
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import CheckIcon from 'radicle-design-system/icons/Check.svelte';
  import ExclamationIcon from 'radicle-design-system/icons/Exclamation.svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import type { GitProject } from '$lib/utils/metadata/types';
  import Button from '$lib/components/button/button.svelte';
  import { onMount, tick } from 'svelte';
  import { getAddress, isAddress } from 'ethers/lib/utils';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import ensStore from '$lib/stores/ens/ens.store';
  import assert from '$lib/utils/assert';
  import GitProjectService from '$lib/utils/project/GitProjectService';
  import { isSupportedGitUrl } from '$lib/utils/is-valid-git-url';
  import { verifyRepoExists } from '$lib/utils/github/github';
  import PercentageEditor from '$lib/components/percentage-editor/percentage-editor.svelte';
  import Trash from 'radicle-design-system/icons/Trash.svelte';
  import Ledger from 'radicle-design-system/icons/Ledger.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import ethAddressItem from './item-templates/eth-address';
  import projectItem from './item-templates/project';
  import DripListService from '$lib/utils/driplist/DripListService';
  import dripListItem from './item-templates/drip-list';
  import unreachable from '$lib/utils/unreachable';
  import DripListBadge from '../drip-list-badge/drip-list-badge.svelte';

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

  let gitProjectService: GitProjectService;

  async function addProject() {
    if (!gitProjectService) gitProjectService = await GitProjectService.new();

    if (!allowedItems.includes('projects')) return;

    try {
      isAddingItem = true;

      const { username, repoName } = GitProjectService.deconstructUrl(inputValue);

      // TODO: This only supports GitHub forge
      const repoExists = await verifyRepoExists(username, repoName);
      if (!repoExists) throw new Error("This project doesn't exist");

      let gitProject = await gitProjectService.getByUrl(inputValue);

      const id = gitProject.source.url;
      if (blockedKeys.includes(id)) throw new Error('Project ID is already used');

      // Prevent duplicates.
      if (!items[id]) {
        items[id] = projectItem(gitProject);

        percentages = { ...percentages, [id]: 0 };
      }
      // TODO: break + show warning to user

      await tick();

      listElem.scroll({
        top: listElem.scrollHeight,
      });

      // It doesn't work without setTimeout for some reason 🤷‍♂️
      setTimeout(() => inputElem.focus(), 0);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      inputValue = '';
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
      if (!dripList) throw new Error('Drip list not found');

      if (blockedKeys.includes(dripListId)) throw new Error('Drip List ID is already used');

      // Prevent duplicates.
      if (!items[dripListId]) {
        items[dripListId] = dripListItem(
          dripList.name,
          dripList.account.accountId,
          dripList.account.owner.address,
        );

        percentages = { ...percentages, [dripListId]: 0 };
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      inputValue = '';
      isAddingItem = false;
    }
  }

  async function addEthAddress() {
    isAddingItem = true;

    try {
      const address = isAddress(inputValue)
        ? getAddress(inputValue)
        : await ensStore.reverseLookup(inputValue);
      assert(address);

      if (blockedKeys.includes(address)) throw new Error('This address is already used');

      if (items[address]) {
        isAddingItem = false;
        return;
      }

      items[address] = ethAddressItem(address);

      percentages = { ...percentages, [address]: 0 };

      // It doesn't work without setTimeout for some reason 🤷‍♂️
      setTimeout(() => inputElem.focus(), 0);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      inputValue = '';
      isAddingItem = false;
    }
  }

  function removeItem(slug: string) {
    delete items[slug];
    delete percentages[slug];
    items = items;
    percentages = percentages;
  }

  function handleSubmitInput() {
    // TODO: show message to user
    if (itemsLength >= maxItems) return;

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
    }
  }

  $: validInput =
    isSupportedGitUrl(inputValue) ||
    isAddress(inputValue) ||
    inputValue.endsWith('.eth') ||
    inputValue.includes('drips.network/app/drip-lists/');

  $: totalPercentage = Object.values(percentages ?? {}).reduce<number>((acc, v) => acc + v, 0);
  export let valid = false;
  $: valid = itemsLength > 0 && Math.round(totalPercentage * 100) / 100 === 100;
  export let error = false;
  $: error = Math.round(totalPercentage * 100) / 100 > 100;
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
    Object.values(percentages).filter((v) => v === 0).length > 0 &&
    Object.values(percentages).find((v) => v !== 0);

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
</script>

<div class="list-editor">
  {#if isEditable}
    <div class="add-project">
      <div class="icon">
        <Ledger style="fill: var(--color-foreground)" />
      </div>
      <input
        bind:this={inputElem}
        bind:value={inputValue}
        disabled={isAddingItem}
        on:keydown={(e) => e.key === 'Enter' && handleSubmitInput()}
        class="list-editor__input typo-text"
        type="text"
        placeholder={inputPlaceholder}
      />
      {#if isAddingItem}
        <div in:fly={{ duration: 300, y: -4 }} out:fly={{ duration: 300, y: 4 }}>
          <Spinner />
        </div>
      {:else}
        <div
          in:fly={{ duration: 300, y: -4 }}
          out:fly={{ duration: 300, y: 4 }}
          class="submit-button"
        >
          <Button
            icon={Plus}
            disabled={!validInput}
            variant={validInput ? 'primary' : undefined}
            on:click={handleSubmitInput}>Add</Button
          >
        </div>
      {/if}
    </div>
  {/if}
  {#if Object.keys(items).length > 0}
    <div class="list" bind:this={listElem}>
      <ul>
        {#each Object.entries(items) as [slug, item]}
          <li class="flex items-center py-4 px-3" data-testid={`item-${slug}`}>
            <div class="flex-1 flex gap-4 items-center justify-between">
              {#if item.type === 'address'}
                <IdentityBadge address={item.address} size="medium" disableLink={true} />
              {:else if item.type === 'project'}
                <ProjectBadge project={item.project} linkTo="nothing" />
              {:else if item.type === 'drip-list'}
                <DripListBadge
                  listName={item.list.name}
                  listId={item.list.id}
                  owner={item.list.owner}
                />
              {/if}

              <div class="flex items-center gap-3">
                {#if !isEditable}
                  <div class="typo-text">{percentages[slug].toFixed(2).replace('.00', '')}%</div>
                {:else}
                  <PercentageEditor bind:percentage={percentages[slug]} />
                  <Button
                    id={`trashbtn-${slug}`}
                    icon={Trash}
                    variant="ghost"
                    on:click={() => removeItem(slug)}
                    ariaLabel="Remove from list"
                  />
                {/if}
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
  {#if isEditable && Object.keys(items).length > 0}
    <div class="distribution-tools">
      <div class="actions">
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
      <div class="remaining-percentage-indicator" class:error class:valid>
        <div class="typo-text-small-bold">
          {Math.round(totalPercentage * 100) / 100}% allocated
        </div>
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

  .add-project .submit-button {
    position: absolute;
    right: 0.75rem;
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
    gap: 0.125rem;
    flex-wrap: wrap;
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

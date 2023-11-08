<script lang="ts" context="module">
  export const DRIP_LIST_MEMBERS_EDITOR_PROJECT_FRAGMENT = gql`
    ${PROJECT_BADGE_FRAGMENT}
    fragment DripListMembersEditorProject on Project {
      ...ProjectBadge
    }
  `;

  export const DRIP_LIST_MEMBERS_EDITOR_DRIP_LIST_FRAGMENT = gql`
    ${DRIP_LIST_BADGE_FRAGMENT}
    fragment DripListMembersEditorDripList on DripList {
      ...DripListBadge
    }
  `;

  interface ProjectItem {
    type: 'project';
    project: DripListMembersEditorProjectFragment;
  }

  interface EthAddressItem {
    type: 'address';
    address: string;
  }

  interface DripListItem {
    type: 'drip-list';
    list: DripListMembersEditorDripListFragment;
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
  import Button from '$lib/components/button/button.svelte';
  import { onMount, tick } from 'svelte';
  import { getAddress, isAddress } from 'ethers/lib/utils';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import ensStore from '$lib/stores/ens/ens.store';
  import assert from '$lib/utils/assert';
  import { isSupportedGitUrl } from '$lib/utils/is-valid-git-url';
  import PercentageEditor from '$lib/components/percentage-editor/percentage-editor.svelte';
  import Trash from 'radicle-design-system/icons/Trash.svelte';
  import DripListIcon from 'radicle-design-system/icons/DripList.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import ProjectBadge, {
    PROJECT_BADGE_FRAGMENT,
  } from '$lib/components/project-badge/project-badge.svelte';
  import ethAddressItem from './item-templates/eth-address';
  import projectItem from './item-templates/project';
  import dripListItem from './item-templates/drip-list';
  import unreachable from '$lib/utils/unreachable';
  import DripListBadge, {
    DRIP_LIST_BADGE_FRAGMENT,
  } from '../drip-list-badge/drip-list-badge.svelte';
  import query from '$lib/graphql/dripsQL';
  import { gql } from 'graphql-request';
  import type {
    DripListMembersEditorDripListFragment,
    DripListMembersEditorProjectFragment,
    DripListToAddQuery,
    DripListToAddQueryVariables,
    ProjectToAddQuery,
    ProjectToAddQueryVariables,
  } from './__generated__/gql.generated';

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

  async function addProject() {
    if (!allowedItems.includes('projects')) return;

    try {
      isAddingItem = true;

      let url = inputValue;

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // If URL ends with /, remove it
      if (url.endsWith('/')) {
        url = url.slice(0, -1);
      }

      const projectToAddQuery = gql`
        ${DRIP_LIST_MEMBERS_EDITOR_PROJECT_FRAGMENT}
        query ProjectToAdd($url: String!) {
          projectByUrl(url: $url) {
            ...DripListMembersEditorProject
          }
        }
      `;

      const { projectByUrl: project } = await query<ProjectToAddQuery, ProjectToAddQueryVariables>(
        projectToAddQuery,
        {
          url,
        },
      );

      if (!project) throw new Error('This project doesnʼt exist');

      const id = project.source.url;
      if (blockedKeys.includes(id)) throw new Error('Project ID is already used');

      // Prevent duplicates.
      if (!items[id]) {
        items[id] = projectItem(project);

        percentages = { ...percentages, [id]: 0 };
      }
      // TODO: break + show warning to user

      await tick();

      listElem.scroll({
        top: listElem.scrollHeight,
      });

      // It doesnʼt work without setTimeout for some reason 🤷‍♂️
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

      const dripListToAddQuery = gql`
        query DripListToAdd($id: ID!) {
          dripList(id: $id) {
            name
            owner {
              address
            }
            account {
              accountId
            }
          }
        }
      `;

      const { dripList: dripListToAdd } = await query<
        DripListToAddQuery,
        DripListToAddQueryVariables
      >(dripListToAddQuery, {
        id: dripListId,
      });

      if (!dripListToAdd) throw new Error('Drip list not found');

      if (blockedKeys.includes(dripListToAdd.account.accountId)) {
        throw new Error('Drip List ID is already used');
      }

      // Prevent duplicates.
      if (!items[dripListId]) {
        items[dripListId] = dripListItem(dripListToAdd);

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

      // It doesnʼt work without setTimeout for some reason 🤷‍♂️
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
    <div class="add-project flex items-center">
      <div class="icon">
        <DripListIcon style="fill: var(--color-foreground)" />
      </div>
      <input
        bind:this={inputElem}
        bind:value={inputValue}
        disabled={isAddingItem}
        on:keydown={(e) => e.key === 'Enter' && handleSubmitInput()}
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
  {#if Object.keys(items).length > 0}
    <div class="list" bind:this={listElem}>
      <ul>
        {#each Object.entries(items) as [slug, item]}
          <li
            class="flex flex-wrap items-center py-4 gap-1 justify-between"
            data-testid={`item-${slug}`}
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
                  <DripListBadge dripList={item.list} isLinked={false} />
                {/if}
              </div>
            </div>

            <div class="flex flex-1 flex-shrink-0 justify-end items-center gap-3 pr-3">
              {#if !isEditable}
                <div class="typo-text">{percentages[slug].toFixed(2).replace('.00', '')}%</div>
              {:else}
                <PercentageEditor bind:percentage={percentages[slug]} />
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
  .list-editor {
    text-align: left;
  }

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

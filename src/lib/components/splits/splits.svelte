<script lang="ts" context="module">
  import type { GitProject } from '$lib/utils/metadata/types';

  export interface ProjectSplit {
    type: 'project-split';
    project: GitProject;
    weight: number;
  }

  export interface AddressSplit {
    type: 'address-split';
    address: string;
    weight: number;
  }

  /**
   * A split to a different Drip List.
   */
  export interface DripListSplit {
    type: 'drip-list-split';
    listId: string;
    listName: string;
    listOwner: string;
    weight: number;
  }

  interface DripsDonationSplit {
    type: 'drips-donation-split';
    weight: number;
  }

  export type Split = DripListSplit | ProjectSplit | AddressSplit | DripsDonationSplit;

  export interface SplitGroup {
    type: 'split-group';
    list: Splits;
    name?: string;
  }

  export type Splits = (SplitGroup | Split)[];
</script>

<script lang="ts">
  import SplitComponent from './components/split/split.svelte';

  export let list: Splits;

  // Sort splits by highest percentage first, with groups at the bottom always.
  $: sortedList = list.sort((a, b) => {
    if (a.type === 'split-group' && b.type === 'split-group') return 0;
    if (a.type === 'split-group') return 1;
    if (b.type === 'split-group') return -1;

    return b.weight - a.weight;
  });

  export let linkToNewTab = false;
  export let isGroup = false;
</script>

<div class="splits-list" class:group={isGroup}>
  {#each sortedList as listItem, index}
    <div class="split">
      <SplitComponent
        isFirst={index === 0}
        isLast={index === sortedList.length - 1}
        {linkToNewTab}
        isNested={isGroup}
        split={listItem}
      />
    </div>
  {/each}
</div>

<style>
  .splits-list {
    display: flex;
    flex-direction: column;
    position: relative;
    padding-top: 16px;
    width: fit-content;
  }
</style>

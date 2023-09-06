<script lang="ts" context="module">
  import type { GitProject } from '$lib/utils/metadata/types';
  import type {
    Items,
    Percentages,
  } from '$lib/components/drip-list-members-editor/drip-list-members-editor.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';

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

  export function mapSplitsFromListEditorData(
    items: Items,
    percentages: Percentages,
    groupPercentage: number,
  ): Split[] {
    return mapFilterUndefined(Object.keys(items), (slug) => {
      const item = items[slug];

      const percentage = (groupPercentage / 100) * (percentages[slug] / 100) * 1000000;

      if (!percentage) return;

      if (item.type === 'project') {
        return {
          type: 'project-split',
          project: item.project,
          weight: percentage,
        };
      } else if (item.type === 'drip-list') {
        return {
          type: 'drip-list-split',
          listId: item.list.id,
          listName: item.list.name,
          listOwner: item.list.owner,
          weight: percentage,
        };
      } else {
        return {
          type: 'address-split',
          address: slug,
          weight: percentage,
        };
      }
    });
  }
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

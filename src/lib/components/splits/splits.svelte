<script lang="ts">
  import SplitComponent from './components/split/split.svelte';
  import { type Splits, type SplitGroup } from './types';

  export let disableLinks = true;

  export let list: Splits;
  export let maxRows: number | undefined = undefined;

  /** Set to false to hide the chevron next to split groups. */
  export let groupsExpandable = true;

  export let draft = false;

  export let disableTooltips = false;

  // Sort splits by highest percentage first, with groups at the bottom always.
  const sortList = (list: Splits) =>
    list.sort((a, b) => {
      if (a.__typename === 'SplitGroup' && b.__typename === 'SplitGroup') return 0;
      if (a.__typename === 'SplitGroup') return 1;
      if (b.__typename === 'SplitGroup') return -1;

      return b.weight - a.weight;
    });

  function truncateList(list: Splits) {
    if (!maxRows || list.length <= maxRows) {
      return list;
    }
    const clipIndex = maxRows - 1;
    const truncatedGroup: SplitGroup = {
      __typename: 'SplitGroup',
      list: list.slice(clipIndex, list.length),
      name: '',
    };
    return list.slice(0, clipIndex).concat(truncatedGroup);
  }

  $: sortedList = truncateList(sortList(list));

  export let linkToNewTab = false;
  export let isGroup = false;
</script>

<ul class="splits-list" class:group={isGroup}>
  {#each sortedList as listItem, index}
    <li class="split">
      <SplitComponent
        disableTooltip={disableTooltips}
        disableLink={disableLinks}
        {groupsExpandable}
        isFirst={index === 0}
        isLast={index === sortedList.length - 1}
        {linkToNewTab}
        isNested={isGroup}
        split={listItem}
        {draft}
      />
    </li>
  {/each}
</ul>

<style>
  .splits-list {
    display: flex;
    flex-direction: column;
    position: relative;
    padding-top: 16px;
    width: fit-content;
    overflow: hidden;
  }
</style>
